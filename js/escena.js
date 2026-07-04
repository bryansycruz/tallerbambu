/* Escena 3D: renderer, luces, terreno, cerramiento, torres, montacargas, piso 4 y helpers */

/* ============ 2. ESCENA ============ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2030);
scene.fog = new THREE.Fog(0x1a2030, 400, 800);

// calidad gráfica según el dispositivo: en celular/tablet se reduce para que sea fluido
const ES_MOVIL = Math.min(innerWidth, innerHeight) <= 820 || navigator.maxTouchPoints > 1;

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.5, 1400);
const renderer = new THREE.WebGLRenderer({ antialias: !ES_MOVIL, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, ES_MOVIL ? 1.15 : 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = ES_MOVIL ? THREE.BasicShadowMap : THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x3a3428, 0.75);
scene.add(hemi);
const sol = new THREE.DirectionalLight(0xfff2dd, 1.0);
sol.position.set(-90, 130, 70);
sol.castShadow = true;
sol.shadow.mapSize.set(ES_MOVIL ? 512 : 1024, ES_MOVIL ? 512 : 1024);
sol.shadow.camera.left = -160; sol.shadow.camera.right = 160;
sol.shadow.camera.top = 120;  sol.shadow.camera.bottom = -100;
sol.shadow.camera.far = 500;
scene.add(sol);

/* ============ 3. TERRENO 3D ============ */
function poligonoPlano(puntos, color, y){
  const shape = new THREE.Shape();
  shape.moveTo(puntos[0][0], -puntos[0][1]);
  for (let i=1; i<puntos.length; i++) shape.lineTo(puntos[i][0], -puntos[i][1]);
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI/2);
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
  m.position.y = y;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

/* Relieve: el lote y la vía son una plataforma plana; alrededor el
   terreno natural sube al norte y cae al sur y al occidente. */
function alturaTerreno(x, z){
  let h = 0;
  const dSur = -42 - z;                        // talud bajo la vía de acceso
  if (dSur > 0) h -= Math.min(dSur * 0.4, 16);
  const dNorte = z - 30;                       // ladera que sube al norte
  if (dNorte > 0) h += Math.min(dNorte * 0.28, 9);
  const dOeste = -95 - x;                      // caída al occidente
  if (dOeste > 0) h -= Math.min(dOeste * 0.32, 11);
  if (dSur > 5 || dNorte > 5 || dOeste > 5)
    h += Math.sin(x*0.05)*0.8 + Math.cos(z*0.07)*0.6;  // ondulación natural
  return h;
}
const terrenoGeo = new THREE.PlaneGeometry(400, 240, 120, 80);
terrenoGeo.rotateX(-Math.PI/2);
terrenoGeo.translate(10, 0, -5);
{
  const posT = terrenoGeo.attributes.position;
  const arrCol = [];
  const cPlano = new THREE.Color(0x94979b);   // plataforma del lote (afirmado)
  const cTal1  = new THREE.Color(0x7d9a4e);   // talud verde (banda clara)
  const cTal2  = new THREE.Color(0x64803c);   // talud verde (banda oscura = curva de nivel)
  const cVerde = new THREE.Color(0x74884a);
  for (let i=0; i<posT.count; i++){
    const x = posT.getX(i), z = posT.getZ(i);
    const h = alturaTerreno(x, z);
    posT.setY(i, h - 0.18);
    let c = cPlano;
    if (h > 0.4) c = cVerde;                                          // ladera norte
    else if (h < -0.4) c = (Math.floor(-h / 2) % 2 === 0) ? cTal1 : cTal2;
    arrCol.push(c.r, c.g, c.b);
  }
  terrenoGeo.setAttribute('color', new THREE.Float32BufferAttribute(arrCol, 3));
  terrenoGeo.computeVertexNormals();
}
const terreno = new THREE.Mesh(terrenoGeo, new THREE.MeshLambertMaterial({ vertexColors:true }));
terreno.receiveShadow = true;
scene.add(terreno);

function lineaTerreno(puntos, color, offset, cerrar, punteada){
  const pts = [];
  const lista = cerrar ? [...puntos, puntos[0]] : puntos;
  for (let i=0; i<lista.length-1; i++){
    const x1 = lista[i][0], z1 = lista[i][1], x2 = lista[i+1][0], z2 = lista[i+1][1];
    for (let k=0; k<8; k++){
      const t = k/8, x = x1 + (x2-x1)*t, z = z1 + (z2-z1)*t;
      pts.push(new THREE.Vector3(x, alturaTerreno(x,z) + offset, z));
    }
  }
  const u = lista[lista.length-1];
  pts.push(new THREE.Vector3(u[0], alturaTerreno(u[0],u[1]) + offset, u[1]));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = punteada
    ? new THREE.LineDashedMaterial({ color, dashSize:3, gapSize:2.2 })
    : new THREE.LineBasicMaterial({ color });
  const l = new THREE.Line(geo, mat);
  if (punteada) l.computeLineDistances();
  scene.add(l);
  return l;
}

/* ---- Lote utilizable 163×47 (afirmado) ---- */
poligonoPlano([[-81.5,-23.5],[81.5,-23.5],[81.5,23.5],[-81.5,23.5]], 0xa8a49a, 0.05);
// andén de la torre
poligonoPlano([[-25,-8.5],[25,-8.5],[25,8.5],[-25,8.5]], 0xb9bcc0, 0.12);

/* ---- Vía de acceso existente — 15.00 m (borde sur del lote) ---- */
poligonoPlano([[-90,-38.5],[100,-38.5],[100,-23.5],[-90,-23.5]], 0x55585e, 0.09);
poligonoPlano([[-88,-31.4],[98,-31.4],[98,-30.6],[-88,-30.6]], 0xd8d8d0, 0.11); // línea central
// salida de autopista (extremo oriental)
poligonoPlano([[95,-45],[118,-45],[118,35],[95,35]], 0x4a4d53, 0.08);
poligonoPlano([[106,-43],[107,-43],[107,33],[106,33]], 0xd8d8d0, 0.10);

/* ---- Vía futura diagonal (superior; NO utilizable en obra) ---- */
lineaTerreno([[20,42],[95,8]], 0xc9581e, 0.6, false, true);
lineaTerreno([[28,48],[100,14]], 0xc9581e, 0.6, false, true);

/* ---- Límites del plano base: azul (lote) y rojo (cerramiento) ---- */
lineaTerreno([[-81.5,-23.5],[81.5,-23.5],[81.5,23.5],[-81.5,23.5]], 0x2f7fff, 0.7, true, false);
lineaTerreno([[-83,-40],[100,-40],[100,25],[-83,25]], 0xc9302e, 0.7, true, true);

/* ---- Etiquetas flotantes (sprites); el botón Etiquetas las oculta/muestra ---- */
const etiquetasTodas = [];
function crearEtiqueta(texto, ancho, colorFondo){
  ancho = ancho || 14;
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = colorFondo || 'rgba(15,20,30,0.78)';
  ctx.beginPath(); ctx.rect(0,16,512,96); ctx.fill();
  ctx.font = 'bold 44px Arial'; ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 66);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, depthTest:false, transparent:true }));
  sp.scale.set(ancho, ancho/4, 1);
  etiquetasTodas.push(sp);
  return sp;
}
function etiquetaSuelo(texto, x, z, ancho, colorFondo){
  const e = crearEtiqueta(texto, ancho, colorFondo);
  e.position.set(x, alturaTerreno(x, z) + 3.2, z);
  scene.add(e);
}
etiquetaSuelo('VÍA DE ACCESO EXISTENTE — 15.00 m', -40, -31, 28, 'rgba(50,55,60,0.85)');
etiquetaSuelo('SALIDA AUTOPISTA', 107, -20, 16, 'rgba(50,55,60,0.85)');
etiquetaSuelo('VÍA FUTURA (posterior al proyecto — no utilizable)', 60, 30, 30, 'rgba(140,70,20,0.85)');
etiquetaSuelo('LADERA NORTE', -30, 45, 14, 'rgba(50,90,35,0.8)');
etiquetaSuelo('TALUD', -20, -55, 8, 'rgba(50,90,35,0.8)');

/* ---- Árboles (referencia de profundidad) ---- */
function arbol(x, z, s){
  const g = new THREE.Group();
  const tr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15*s, 0.2*s, 1.2*s, 6),
    new THREE.MeshLambertMaterial({ color:0x6a4a2a })
  );
  tr.position.y = 0.6*s; g.add(tr);
  const copa = new THREE.Mesh(
    new THREE.ConeGeometry(1.1*s, 2.2*s, 8),
    new THREE.MeshLambertMaterial({ color:0x3f6f34 })
  );
  copa.position.y = 2.1*s; copa.castShadow = true; g.add(copa);
  g.position.set(x, alturaTerreno(x, z), z);
  scene.add(g);
}
[[-60,40],[-20,44],[10,48],[-90,30],[-110,10],[-105,-20],[-40,-52],[0,-56],[40,-52],[70,-50],
 [-120,-40],[-95,45],[35,52],[-70,-55]].forEach(([x,z]) => arbol(x, z, 1.6 + Math.random()*1.2));

/* ---- Cerramiento provisional perimetral (~420 m) ---- */
const cerramiento = new THREE.Group();
cerramiento.userData.info = {
  nombre: 'Cerramiento provisional perimetral',
  dimensiones: 'Envolvente 163.00 × 47.00 m (~420 m de perímetro)',
  altura: '2.40 m sobre nivel de andén',
  material: 'Lámina prepintada Zn-Alum calibre 26, acanalada, sobre postes tubulares Ø3" cada 3.00 m, en dados de concreto de 3.000 PSI (Ø0.30 × 0.50 m)',
  cerramiento: 'Franja inferior antisalpicadura + señalización de obra cada 20 m',
  descripcion: 'Cerramiento continuo en todo el perímetro del lote (límites azul y rojo del plano base). Accesos: 1 portón vehicular corredizo de 6.00 m + 1 puerta peatonal independiente de 1.00 m, ambos en el extremo de ingreso junto a la salida de la autopista.'
};
scene.add(cerramiento);
{
  const matLam = new THREE.MeshLambertMaterial({ color:0x9fb3a8, transparent:true, opacity:0.55 });
  const matPoste = new THREE.MeshLambertMaterial({ color:0x4a5560 });
  const geoPoste = new THREE.BoxGeometry(0.12, 2.5, 0.12);
  const postes = [];
  function tramoCerr(x1, z1, x2, z2){
    const dx = x2-x1, dz = z2-z1, len = Math.hypot(dx, dz);
    if (len < 0.3) return;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, 2.4, 0.08), matLam.clone());
    m.position.set((x1+x2)/2, 1.2, (z1+z2)/2);
    m.rotation.y = -Math.atan2(dz, dx);
    m.material.userData = { op0: 0.55 };
    cerramiento.add(m);
    const n = Math.max(1, Math.floor(len/3));
    for (let i=0; i<=n; i++){
      const t = i/n;
      postes.push([x1 + dx*t, 1.25, z1 + dz*t]);
    }
  }
  const L = CFG.lote;
  // costado sur con portón (x 70→76) y puerta peatonal (x 77→78)
  tramoCerr(L.x0, L.z0, 70, L.z0);
  tramoCerr(76, L.z0, 77, L.z0);
  tramoCerr(78, L.z0, L.x1, L.z0);
  tramoCerr(L.x0, L.z1, L.x1, L.z1);       // norte
  tramoCerr(L.x0, L.z0, L.x0, L.z1);       // occidente
  tramoCerr(L.x1, L.z0, L.x1, L.z1);       // oriente
  // ~140 postes de la cerca en un solo InstancedMesh (antes: un Mesh c/u)
  const postesMesh = new THREE.InstancedMesh(geoPoste, matPoste, postes.length);
  const mtxPoste = new THREE.Matrix4();
  postes.forEach(([x, y, z], i) => {
    mtxPoste.makeTranslation(x, y, z);
    postesMesh.setMatrixAt(i, mtxPoste);
  });
  cerramiento.add(postesMesh);
  // portón corredizo de 6.00 m (semiabierto)
  const porton = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 0.1),
    new THREE.MeshLambertMaterial({ color:0xc9581e }));
  porton.position.set(66.8, 1.1, L.z0 - 0.25);
  cerramiento.add(porton);
  const etCer = crearEtiqueta('PORTÓN 6.00 m + PUERTA PEATONAL 1.00 m', 22, 'rgba(140,70,20,0.85)');
  etCer.position.set(74, 5, L.z0 - 1);
  cerramiento.add(etCer);
}

/* ============ 4. TORRE (estructura existente — fase acabados) ============ */
const edificio = new THREE.Group();
edificio.userData.info = {
  nombre: 'Torres 01 y 02 — 10 pisos + cubierta + 3 sótanos',
  dimensiones: 'Torre 01: 49.73 × 12.50 m (8 aptos/piso) · Torre 02: 24.30 × 12.50 m (4 aptos/piso), en línea',
  altura: '26.50 m (10 pisos de 2.65 m) + cubierta · Sótanos: S1 -3.40 · S2 -6.20 · S3 -9.00 m',
  material: 'Estructura existente en concreto, completamente construida (la fase actual es solo cerramientos y acabados)',
  cerramiento: 'En ejecución: mampostería de fachada, ventanería y acabados interiores · 80 + 40 apartamentos (tipos A-L)',
  descripcion: 'Edificio en posición intermedia del lote de 163.00 m: Torre 01 y Torre 02 en línea con junta entre ambas y retrocesos de fachada según planta. El flujo es de un solo sentido: ingreso → zona operativa (portería, maniobra, paletizado, almacén) → torre → zona administrativa y de bienestar, con salida por el mismo portón pasando por el lavado de llantas. Usa "Ver Piso 4" y haz clic en cada sector para el detalle de los frentes de trabajo.'
};
edificio.userData.esEdificio = true;
scene.add(edificio);

// Fachada: estructura con vanos — módulos con cerramiento terminado, en ladrillo y vanos abiertos
function texturaFachada(){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#55575b'; ctx.fillRect(0,0,1024,96);
  for (let m=0; m<8; m++){
    const x = m*128;
    ctx.fillStyle = '#463f3b'; ctx.fillRect(x,0,52,96);            // machón de ladrillo
    ctx.strokeStyle = '#37312d'; ctx.lineWidth = 1;
    for (let y=6; y<96; y+=8){ ctx.beginPath(); ctx.moveTo(x,y+0.5); ctx.lineTo(x+52,y+0.5); ctx.stroke(); }
    const vx = x+58, vw = 64;
    if (m % 3 === 2){
      ctx.fillStyle = '#23262b'; ctx.fillRect(vx,10,vw,72);        // vano abierto (sin cerramiento aún)
      ctx.strokeStyle = '#e0a030'; ctx.lineWidth = 2;
      ctx.strokeRect(vx+2,12,vw-4,68);                             // baranda provisional
    } else {
      ctx.fillStyle = '#dfe3e6'; ctx.fillRect(vx,10,vw,72);        // ventanería instalada
      ctx.fillStyle = '#b9d2de'; ctx.fillRect(vx+3,13,vw-6,66);
      ctx.strokeStyle = '#dfe3e6'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(vx+vw/2,13); ctx.lineTo(vx+vw/2,79); ctx.stroke();
    }
  }
  ctx.fillStyle = '#7d8085'; ctx.fillRect(0,88,1024,8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
const texFach = texturaFachada();

const matLado  = new THREE.MeshLambertMaterial({ color:0x64676c });
const matTecho = new THREE.MeshLambertMaterial({ color:0x74777c });

const pisosMesh = [];
const T2 = CFG.torre2;
const matLosaT = new THREE.MeshLambertMaterial({ color:0x8a8d92 });
for (let i=0; i<CFG.pisos; i++){
  const g = new THREE.Group();
  const y = i*CFG.hPiso;
  // Torre 01 (49.73 m)
  const matFrente = new THREE.MeshLambertMaterial({ map: texFach.clone() });
  matFrente.map.needsUpdate = true;
  matFrente.map.repeat.set(8,1);
  const mats = [matLado.clone(), matLado.clone(), matTecho.clone(), matTecho.clone(), matFrente, matFrente.clone()];
  const caja0 = new THREE.Mesh(new THREE.BoxGeometry(CFG.largo, CFG.hPiso, CFG.fondo), mats);
  caja0.position.y = y + CFG.hPiso/2;
  caja0.castShadow = true; caja0.receiveShadow = true;
  g.add(caja0);
  const losa = new THREE.Mesh(new THREE.BoxGeometry(CFG.largo+0.6, 0.22, CFG.fondo+0.4), matLosaT.clone());
  losa.position.y = (i+1)*CFG.hPiso;
  g.add(losa);
  // Torre 02 (24.30 m), en línea con junta y leve desfase según planta
  const matFrente2 = new THREE.MeshLambertMaterial({ map: texFach.clone() });
  matFrente2.map.needsUpdate = true;
  matFrente2.map.repeat.set(4,1);
  const mats2 = [matLado.clone(), matLado.clone(), matTecho.clone(), matTecho.clone(), matFrente2, matFrente2.clone()];
  const caja2 = new THREE.Mesh(new THREE.BoxGeometry(T2.largo, CFG.hPiso, T2.fondo), mats2);
  caja2.position.set(T2.cx, y + CFG.hPiso/2, T2.dz);
  caja2.castShadow = true; caja2.receiveShadow = true;
  g.add(caja2);
  const losa2 = new THREE.Mesh(new THREE.BoxGeometry(T2.largo+0.6, 0.22, T2.fondo+0.4), matLosaT.clone());
  losa2.position.set(T2.cx, (i+1)*CFG.hPiso, T2.dz);
  g.add(losa2);
  edificio.add(g);
  pisosMesh.push(g);
}
// retrocesos de fachada (muescas de la planta, en ambas torres)
const matRetro = new THREE.MeshLambertMaterial({ color:0x22262e });
[[-10.9, 1],[5.9, 1],[-9.9, -1],[7.4, -1]].forEach(([x, lado]) => {
  const r = new THREE.Mesh(new THREE.BoxGeometry(2.4, CFG.alto, 1.4), matRetro);
  r.position.set(x, CFG.alto/2, lado*(CFG.fondo/2 - 0.5));
  edificio.add(r);
});
[[T2.cx-2.4, 1],[T2.cx+4.9, -1]].forEach(([x, lado]) => {
  const r = new THREE.Mesh(new THREE.BoxGeometry(2.4, CFG.alto, 1.4), matRetro);
  r.position.set(x, CFG.alto/2, T2.dz + lado*(T2.fondo/2 - 0.5));
  edificio.add(r);
});
// cubierta: cuarto de máquinas (T1, 19.70 m²) + escaleras/circulación (T2, 20.68 m²)
const techoG = new THREE.Group();
const cMaq = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 4), new THREE.MeshLambertMaterial({ color:0x6d7075 }));
cMaq.position.set(-8, CFG.alto + 1.1, 0); cMaq.castShadow = true;
techoG.add(cMaq);
const cEsc2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.9, 3), new THREE.MeshLambertMaterial({ color:0x6d7075 }));
cEsc2.position.set(T2.cx, CFG.alto + 0.95, T2.dz); cEsc2.castShadow = true;
techoG.add(cEsc2);
edificio.add(techoG);

const etT1 = crearEtiqueta('TORRES 01+02 — 10 PISOS + CUBIERTA + 3 SÓTANOS', 30, 'rgba(10,110,40,0.85)');
etT1.position.set(6, CFG.alto + 4.5, 0);
edificio.add(etT1);

// Sótanos (S1 -3.40 · S2 -6.20 · S3 -9.00 — el montacargas también los recorre)
const sotLargo = CFG.largo + T2.gap + T2.largo;
const sotano = new THREE.Mesh(
  new THREE.BoxGeometry(sotLargo+6, CFG.sotanos*CFG.hSotano, CFG.fondo+8),
  new THREE.MeshLambertMaterial({ color:0x7a6748, transparent:true, opacity:0.35 })
);
sotano.position.set((T2.gap + T2.largo)/2, -(CFG.sotanos*CFG.hSotano)/2 - 0.1, 0.6);
edificio.add(sotano);
const etSot = crearEtiqueta('Sótanos: S1 -3.40 · S2 -6.20 · S3 -9.00 m (recorrido del montacargas)', 30);
etSot.position.set(-15, -1.5, CFG.fondo/2 + 5);
edificio.add(etSot);

/* ============ 5. MONTACARGAS DE OBRA (cremallera) ============ */
const malacate = new THREE.Group();
malacate.position.set(CFG.malacateX, 0, -(CFG.fondo/2) - 2.2); // punto medio, fachada hacia patio/almacén
malacate.userData.info = {
  nombre: 'Montacargas de obra tipo cremallera',
  dimensiones: 'Cabina 1.50 × 1.50 × 2.10 m aprox.',
  altura: 'Recorrido requerido ≈ 35.5 m (sótano 3 a -9.00 m + 10 pisos de 2.65 m + cubierta)',
  material: 'Elevador mixto (personas + material) · 1.000 kg / 8-10 personas · 30-40 m/min · alimentación trifásica 220/440 V con tablero propio y parada de emergencia',
  cerramiento: 'Cabina con malla + puertas por nivel · arriostrado a la estructura cada 2 niveles (máx. 6 m) · Resolución 1409 de 2012',
  descripcion: 'Ubicado en la fachada que da hacia el patio y el almacén, en el punto medio de los 49.73 m de la Torre 01 para repartir de forma equilibrada el recorrido horizontal hacia ambos extremos del edificio. Complemento horizontal: 4-6 carretillas tipo buggy (80-100 kg c/u), recorrido almacén → pie del montacargas ≈15-25 m. ARRÁSTRALO alrededor de la torre: se ancla a la fachada más cercana.'
};
malacate.userData.esMalacate = true;
scene.add(malacate);

const matTorreM = new THREE.MeshLambertMaterial({ color:0xd9a521 });
const hTorre = CFG.alto + 3;
[[-1.0,-1.0],[1.0,-1.0],[-1.0,1.0],[1.0,1.0]].forEach(([px,pz]) => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, hTorre, 0.22), matTorreM);
  p.position.set(px, hTorre/2, pz); p.castShadow = true;
  malacate.add(p);
});
for (let i=0; i<=CFG.pisos+1; i++){
  const y = i*CFG.hPiso + 1.2;
  if (y > hTorre) break;
  [[0,-1.0],[0,1.0]].forEach(([px,pz]) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.16), matTorreM);
    t.position.set(px, y, pz); malacate.add(t);
  });
  [[-1.0,0],[1.0,0]].forEach(([px,pz]) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.0), matTorreM);
    t.position.set(px, y, pz); malacate.add(t);
  });
}
const cabina = new THREE.Group();
const pisoCab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), new THREE.MeshLambertMaterial({ color:0xc9581e }));
pisoCab.castShadow = true;
cabina.add(pisoCab);
const mallaCab = new THREE.MeshLambertMaterial({ color:0xc9581e, transparent:true, opacity:0.45 });
mallaCab.userData.op0 = 0.45;
[[0,-0.72,1.5,0.08],[0,0.72,1.5,0.08],[-0.72,0,0.08,1.4],[0.72,0,0.08,1.4]].forEach(([px,pz,w,d]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.1, d), mallaCab.clone());
  m.position.set(px, 1.1, pz);
  cabina.add(m);
});
cabina.position.y = 0.2;
malacate.add(cabina);
const etMal = crearEtiqueta('Montacargas 1.000 kg → Piso 4', 17, 'rgba(160,80,10,0.85)');
etMal.position.set(0, hTorre + 2, 0);
malacate.add(etMal);

/* ============ 6. PISO 4 — SECTORES / FRENTES DE TRABAJO ============ */
const piso4 = new THREE.Group();
piso4.visible = false;
scene.add(piso4);
const y4 = 3 * CFG.hPiso; // 8.70 m

const losa4 = new THREE.Mesh(
  new THREE.BoxGeometry(CFG.largo, 0.12, CFG.fondo),
  new THREE.MeshLambertMaterial({ color:0xd8cdb0 })
);
losa4.position.y = y4 + 0.06;
piso4.add(losa4);

// circulación central
const circ1 = new THREE.Mesh(new THREE.BoxGeometry(CFG.largo-8, 0.06, 2.4),
  new THREE.MeshLambertMaterial({ color:0xf0e6c8 }));
circ1.position.set(0, y4 + 0.16, 0);
piso4.add(circ1);

// puntos fijos: ascensor + escalera (occidente) y escalera (oriente)
const matNucleo = new THREE.MeshLambertMaterial({ color:0x98a2ad });
const nucleoO = new THREE.Mesh(new THREE.BoxGeometry(4, 2.3, 11.9), matNucleo);
nucleoO.position.set(-21, y4 + 1.25, 0);
piso4.add(nucleoO);
const nucleoE = new THREE.Mesh(new THREE.BoxGeometry(4, 2.3, 11.9), matNucleo);
nucleoE.position.set(21, y4 + 1.25, 0);
piso4.add(nucleoE);

/* Sectores de trabajo del piso (fase cerramientos y acabados) */
const SECTORES = [
  { nom:'Sector N1', act:'Cerramientos de fachada (mampostería)', x0:-19, x1:-9.5, lado: 1 },
  { nom:'Sector N2', act:'Mampostería y muros divisorios',        x0:-9.5, x1:0,   lado: 1 },
  { nom:'Sector N3', act:'Enchapes de baños y cocinas',           x0:0,    x1:9.5, lado: 1 },
  { nom:'Sector N4', act:'Pintura y estuco',                      x0:9.5,  x1:19,  lado: 1 },
  { nom:'Sector S1', act:'Pisos y acabados de piso',              x0:-19, x1:-9.5, lado:-1 },
  { nom:'Sector S2', act:'Carpintería, puertas y marcos',         x0:-9.5, x1:0,   lado:-1 },
  { nom:'Sector S3', act:'Aparatos sanitarios y grifería',        x0:0,    x1:9.5, lado:-1 },
  { nom:'Sector S4', act:'Ventanería y vidrios',                  x0:9.5,  x1:19,  lado:-1 }
];

/* Texto pintado sobre la losa */
function textoPiso(texto, w, x, z, color, rot){
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = color || '#1a6e2e';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w/4),
    new THREE.MeshBasicMaterial({ map:tex, transparent:true })
  );
  m.rotation.x = -Math.PI/2;
  if (rot) m.rotation.z = rot;
  m.position.set(x, y4 + 0.22, z);
  piso4.add(m);
  return m;
}
function textoSobre(texto, w, x, z, altura, rot){
  const t = textoPiso(texto, w, x, z, '#ffffff', rot);
  t.position.y = altura;
  return t;
}

const matMuro = new THREE.MeshLambertMaterial({ color:0xb8b2a4 });
const aptosClick = [];
SECTORES.forEach(a => {
  const cx = (a.x0 + a.x1) / 2, ancho = a.x1 - a.x0;
  [a.x0, a.x1].forEach(x => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.3, 4.9), matMuro);
    m.position.set(x, y4 + 1.25, a.lado * 3.65);
    piso4.add(m);
  });
  const mc = new THREE.Mesh(new THREE.BoxGeometry(ancho - 1.2, 2.3, 0.12), matMuro);
  mc.position.set(cx - 0.6, y4 + 1.25, a.lado * 1.2);
  piso4.add(mc);
  textoPiso(a.nom, 5.5, cx, a.lado * 3.2, '#166e2a');
  textoPiso('60-72 m²', 3.6, cx, a.lado * 5.2, '#555049');
  const zona = new THREE.Mesh(
    new THREE.BoxGeometry(ancho - 0.4, 2.2, 4.8),
    new THREE.MeshLambertMaterial({ color:0xffffff, transparent:true, opacity:0.04 })
  );
  zona.position.set(cx, y4 + 1.2, a.lado * 3.7);
  zona.userData.apto = a;
  piso4.add(zona);
  aptosClick.push(zona);
});

/* ---- Pestaña de detalle del sector ---- */
function abrirApto(a){
  document.getElementById('aptoTitulo').textContent = a.nom + ' · Piso 4';
  document.getElementById('aptoBody').innerHTML =
    '<table>' +
    '<tr><td>Proyecto</td><td>Taller II — Obras Provisionales · Torres 01+02, 10 pisos + 3 sótanos</td></tr>' +
    '<tr><td>Fase</td><td>Cerramientos y acabados (estructura existente)</td></tr>' +
    '<tr><td>Frente de trabajo</td><td>' + a.act + '</td></tr>' +
    '<tr><td>Área aprox.</td><td>60–72 m² según tipo (A-L del cuadro de áreas)</td></tr>' +
    '<tr><td>Costado</td><td>' + (a.lado > 0 ? 'Norte' : 'Sur') + ' de la circulación central</td></tr>' +
    '<tr><td>Suministro</td><td>Materiales por montacargas (1.000 kg) + distribución interna en carretillas buggy</td></tr>' +
    '</table>' +
    '<div><b style="color:#f0a340">Actividades típicas:</b><br>' +
    ['Replanteo', 'Mampostería', 'Instalaciones embebidas', 'Pañete / estuco', 'Enchapes', 'Pintura', 'Carpintería', 'Aparatos y remates']
      .map(s => '<span class="chipEspacio">' + s + '</span>').join('') +
    '</div>' +
    '<button onclick="abrirPlanos(\'Piso 4 · ' + a.nom + '\')">' + icono('plano') + 'Planos AutoCAD del ' + a.nom + '</button>' +
    '<div class="zonaImg">Zona reservada para imágenes / detalles del ' + a.nom +
    '<br><small>Aquí se integrarán las imágenes y los detalles adicionales que me envíes.</small></div>';
  document.getElementById('aptoOverlay').style.display = 'flex';
}
document.getElementById('aptoCerrar').onclick = () => {
  document.getElementById('aptoOverlay').style.display = 'none';
};
document.getElementById('aptoOverlay').addEventListener('click', e => {
  if (e.target.id === 'aptoOverlay') e.target.style.display = 'none';
});

// muros de fachada bajos (para ver el interior)
[[CFG.fondo/2],[-CFG.fondo/2]].forEach(([zc]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(CFG.largo, 1.0, 0.18), matMuro);
  m.position.set(0, y4 + 0.55, zc);
  piso4.add(m);
});

// cerramiento provisional perimetral (baranda naranja de seguridad)
const matBar = new THREE.MeshLambertMaterial({ color:0xe07820, transparent:true, opacity:0.6 });
matBar.userData.op0 = 0.6;
[[0, CFG.fondo/2+0.15, CFG.largo+0.4, 0.1],[0,-CFG.fondo/2-0.15, CFG.largo+0.4, 0.1],
 [-CFG.largo/2-0.15, 0, 0.1, CFG.fondo+0.4],[CFG.largo/2+0.15, 0, 0.1, CFG.fondo+0.4]].forEach(([px,pz,w,d]) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), matBar.clone());
  b.position.set(px, y4 + 1.75, pz);
  piso4.add(b);
});

// zona de descargue del montacargas + acopio en losa
const zDesc = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.08, 3.5),
  new THREE.MeshLambertMaterial({ color:0xc9581e, transparent:true, opacity:0.65 })
);
zDesc.position.set(CFG.malacateX, y4 + 0.2, -CFG.fondo/2 + 2);
piso4.add(zDesc);
[[CFG.malacateX-5, 1.1],[CFG.malacateX+4.5, 0.9],[-13, 0.8]].forEach(([x,h]) => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(2.2, h, 1.5), new THREE.MeshLambertMaterial({ color:0x9a6a3a }));
  p.position.set(x, y4 + h/2 + 0.15, -3.4);
  p.castShadow = true;
  piso4.add(p);
});

const et4a = crearEtiqueta('PISO 4 — Frentes de cerramientos y acabados', 32, 'rgba(160,80,10,0.85)');
et4a.position.set(0, y4 + 7, 0);
piso4.add(et4a);
textoPiso('CIRCULACIÓN CENTRAL', 12, 0, 0, '#8a2020');
const txtDesc = textoPiso('DESCARGUE MONTACARGAS', 8, CFG.malacateX, -CFG.fondo/2 + 2, '#7a2e00');
textoSobre('ASC + ESC 1', 4.5, -21, 0, y4 + 2.62, Math.PI/2);
textoSobre('ESC 2', 3, 21, 0, y4 + 2.62, Math.PI/2);

/* ---- Montacargas móvil: se ancla al perímetro de la torre ---- */
function ajustarMalacate(px, pz){
  const hx = CFG.largo/2 + 2.2, hz = CFG.fondo/2 + 2.2;
  const cx = Math.max(-CFG.largo/2 + 3, Math.min(CFG.largo/2 - 3, px));
  const cz = Math.max(-CFG.fondo/2 + 2, Math.min(CFG.fondo/2 - 2, pz));
  const candidatos = [
    { x: cx,  z: -hz }, { x: cx,  z: hz },
    { x: hx,  z: cz  }, { x: -hx, z: cz }
  ];
  let mejor = candidatos[0], dm = Infinity;
  candidatos.forEach(c => {
    const d = (c.x - px)*(c.x - px) + (c.z - pz)*(c.z - pz);
    if (d < dm){ dm = d; mejor = c; }
  });
  return mejor;
}
function actualizarDescargue(){
  const mx = Math.max(-CFG.largo/2 + 3, Math.min(CFG.largo/2 - 3, malacate.position.x));
  const mz = Math.max(-CFG.fondo/2 + 2, Math.min(CFG.fondo/2 - 2, malacate.position.z));
  zDesc.position.x = mx;    zDesc.position.z = mz;
  txtDesc.position.x = mx;  txtDesc.position.z = mz;
}

/* ============ 7. HELPERS CONSTRUCTIVOS ============ */
function caja(g, w, h, d, color, x, y, z, op){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(op !== undefined ? { color, transparent:true, opacity:op } : { color })
  );
  m.position.set(x, y, z);
  m.castShadow = (op === undefined);
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function cilindro(g, r, h, color, x, y, z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
}
function cono(g, r, h, color, x, z){
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 14), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, h/2, z); m.castShadow = true; g.add(m); return m;
}
function textoLocal(g, texto, w, x, z, color){
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = color || '#2c3342';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 64);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w/4),
    new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(c), transparent:true })
  );
  m.rotation.x = -Math.PI/2;
  m.position.set(x, 0.17, z);
  g.add(m);
  return m;
}
function sanitarioFig(g, x, z, rotY){
  const s = new THREE.Group();
  caja(s, 0.38, 0.42, 0.55, 0xf4f6f7, 0, 0.21, 0.05);
  caja(s, 0.42, 0.55, 0.18, 0xe9ebed, 0, 0.62, -0.22);
  s.position.set(x, 0.12, z); s.rotation.y = rotY || 0;
  g.add(s); return s;
}
function lavamanosFig(g, x, z){
  cilindro(g, 0.07, 0.5, 0xd5d8da, x, 0.37, z);
  cilindro(g, 0.21, 0.1, 0xf4f6f7, x, 0.66, z);
}
function orinalFig(g, x, z){ caja(g, 0.32, 0.5, 0.22, 0xf4f6f7, x, 0.85, z); }
function divisionFig(g, x, z, d){ caja(g, 0.05, 1.6, d, 0xaab2b8, x, 0.92, z); }
function mesaFig(g, x, z, w, d){
  caja(g, w, 0.06, d, 0xc9a36a, x, 0.75, z);
  caja(g, 0.12, 0.72, 0.12, 0x6a6d70, x, 0.36, z);
}
function sillaFig(g, x, z){ caja(g, 0.42, 0.45, 0.42, 0x54606c, x, 0.24, z); }
function bancaFig(g, x, z, w){ caja(g, w, 0.42, 0.35, 0x8a6a3a, x, 0.22, z); }
function estanteriaFig(g, x, z, w, rotY){
  const e = new THREE.Group();
  for (let i=0; i<4; i++) caja(e, w, 0.05, 0.5, 0xb8935a, 0, 0.25 + i*0.55, 0);
  caja(e, 0.05, 2, 0.5, 0x9a7a48, -w/2, 1, 0);
  caja(e, 0.05, 2, 0.5, 0x9a7a48, w/2, 1, 0);
  const colores = [0xc9581e, 0x4f66c9, 0x5fae4a];
  for (let i=0; i<3; i++)
    caja(e, 0.5, 0.35, 0.4, colores[i%3], -w/3 + i*(w/3), 0.48 + (i%2)*0.55, 0);
  e.position.set(x, 0, z); e.rotation.y = rotY || 0;
  g.add(e); return e;
}
function estibaFig(g, x, z){ caja(g, 1.3, 0.14, 1.1, 0x8a6a3a, x, 0.19, z); }
function arrumeFig(g, x, z, w, d, capas, color){
  estibaFig(g, x, z);
  for (let i=0; i<capas; i++)
    caja(g, w - i*0.08, 0.3, d - i*0.08, color, x, 0.41 + i*0.3, z);
}
function baldesFig(g, x, z){
  estibaFig(g, x, z);
  [[-0.35,-0.25],[0.05,-0.25],[-0.15,0.15],[0.3,0.2]].forEach(([dx,dz]) =>
    cilindro(g, 0.18, 0.4, 0xd9d2c0, x+dx, 0.48, z+dz));
}
