/* Escena 3D: renderer, luces, terreno, cerramiento, torres, malacate, piso 4 y helpers */

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
// el mapa de sombras solo se recalcula cada 3 cuadros (ver animar en main.js):
// visualmente imperceptible y la GPU se ahorra 2 de cada 3 pasadas de sombra
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
document.body.appendChild(renderer.domElement);
// filtrado anisotrópico para los textos pintados en el piso y las fachadas:
// evita que se vean borrosos en ángulo, con costo despreciable en GPU
const ANISO = Math.min(ES_MOVIL ? 2 : 8, renderer.capabilities.getMaxAnisotropy());

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
// superficies del suelo (pasto, plataforma, vía…): la vista de sótanos las
// vuelve translúcidas para poder mirar la estructura bajo tierra
const superficiesTerreno = [];
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
  superficiesTerreno.push(m);
  return m;
}

/* Terreno totalmente plano (sin relieve): más rápido de renderizar y evita
   que edificios o camiones se entierren. Todo está a la misma cota (y=0). */
function alturaTerreno(x, z){ return 0; }
function alturaApoyo(x, z, w, d){ return 0; }

// base verde plana (2 triángulos); la plataforma gris del lote y la vía van
// encima con polígonos, así que aquí solo se pinta el pasto de alrededor
const terrenoGeo = new THREE.PlaneGeometry(420, 260);
terrenoGeo.rotateX(-Math.PI/2);
terrenoGeo.translate(10, 0, -5);
const terreno = new THREE.Mesh(terrenoGeo, new THREE.MeshLambertMaterial({ color:0x7d9a4e }));
terreno.position.y = -0.05;
terreno.receiveShadow = true;
scene.add(terreno);
superficiesTerreno.push(terreno);

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

/* ============ DISTRIBUCIÓN DEL TERRENO (según plano Via.JPG) ============
   La vía entra por el occidente, corre al NORTE del edificio (el edificio queda
   AL OTRO LADO, al sur de la vía) y sube al noreste hacia la autopista, en un
   solo trazado; alrededor, plataforma afirmada (gris) y pasto (verde). Toda la
   implantación de obra acompaña a la vía en ese costado. Límites: azul y rojo. */

/* Plataforma de obra afirmada (gris claro) — envuelve el edificio y la vía,
   que se prolonga como una península hacia la autopista (arriba a la derecha) */
poligonoPlano([
  [-80,-8],[-82,6],[-70,16],[-38,22],[2,23],[42,20],[62,16],[114,40],[112,24],
  [66,-2],[34,-13],[-6,-14],[-46,-13],[-72,-12]
], 0xa8a49a, 0.05);

/* Andén del edificio (más claro), bajo las dos torres */
poligonoPlano([[-27,-8],[52,-8],[52,8],[-27,8]], 0xb9bcc0, 0.12);

/* Vía (gris oscuro) — UN SOLO trazado: corre al NORTE del edificio (edificio al
   otro lado) y sale como un corredor diagonal largo hacia la derecha */
poligonoPlano([
  [-78,8],[52,8],[109,27],[102,36],[44,18],[-78,18]
], 0x55585e, 0.08);
poligonoPlano([[-75,12.5],[44,12.5],[44,13.5],[-75,13.5]], 0xd8d8d0, 0.10); // línea central

/* Marca de topografía (referencia del plano) al final de la vía */
lineaTerreno([[98,34],[112,42]], 0x2fbf5a, 0.6, false, false);
lineaTerreno([[104,30],[108,46]], 0x2fbf5a, 0.6, false, false);

/* ---- Límite de propiedad (AZUL, discontinuo) — contorno orgánico.
   Ampliado: abarca más terreno al sur, occidente y norte; la punta NE
   (portón / salida a la autopista) se mantiene en su lugar. ---- */
lineaTerreno([
  [-96,6],[-90,-28],[-52,-40],[-4,-42],[44,-38],[72,-18],[112,23],[104,39],
  [58,30],[30,36],[-10,38],[-50,34],[-76,26],[-94,14]
], 0x2f7fff, 0.7, true, true);

/* ---- Límite norte de la vía (ROJO) ---- */
lineaTerreno([[-78,18],[-28,18.5],[16,19],[54,18.5]], 0xc9302e, 0.7, false, false);

/* ---- Etiquetas flotantes (sprites); el botón Etiquetas las oculta/muestra ---- */
const etiquetasTodas = [];
function crearEtiqueta(texto, ancho, colorFondo){
  ancho = ancho || 14;
  // en escritorio el lienzo va al doble de resolución: letra nítida sin costo
  // por cuadro (solo algo más de memoria de textura, se genera una vez)
  const res = ES_MOVIL ? 1 : 2;
  const c = document.createElement('canvas'); c.width = 512*res; c.height = 128*res;
  const ctx = c.getContext('2d');
  ctx.scale(res, res);
  ctx.fillStyle = colorFondo || 'rgba(15,20,30,0.78)';
  ctx.beginPath(); ctx.rect(0,16,512,96); ctx.fill();
  ctx.font = '600 44px Inter, Arial';
  // si el texto no cabe en el lienzo, se reduce la fuente para no recortarlo
  const anchoTexto = ctx.measureText(texto).width;
  if (anchoTexto > 492) ctx.font = '600 ' + Math.max(16, Math.floor(44 * 492 / anchoTexto)) + 'px Inter, Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = ANISO;
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
etiquetaSuelo('ACCESO — VÍA', -70, 13, 14, 'rgba(50,55,60,0.85)');
etiquetaSuelo('SALIDA AUTOPISTA', 116, 37, 16, 'rgba(50,55,60,0.85)');
etiquetaSuelo('VÍA FUTURA (no utilizable)', 60, 44, 17, 'rgba(120,110,20,0.85)');

/* ---- Árboles (referencia de profundidad) — instanciados: 2 draw calls
   en total, en vez de 2 mallas por árbol ---- */
{
  const posArboles = [[-60,40],[-20,44],[10,48],[-90,30],[-110,10],[-105,-20],[-40,-52],[0,-56],
    [40,-52],[70,-50],[-120,-40],[-95,45],[35,52],[-70,-55]];
  const troncos = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6),
    new THREE.MeshLambertMaterial({ color:0x6a4a2a }),
    posArboles.length
  );
  const copas = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.1, 2.2, 8),
    new THREE.MeshLambertMaterial({ color:0x3f6f34 }),
    posArboles.length
  );
  copas.castShadow = true;
  const mtx = new THREE.Matrix4();
  posArboles.forEach(([x, z], i) => {
    const s = 1.6 + Math.random()*1.2;
    const y = alturaTerreno(x, z);
    mtx.makeScale(s, s, s);
    mtx.setPosition(x, y + 0.6*s, z);
    troncos.setMatrixAt(i, mtx);
    mtx.setPosition(x, y + 2.1*s, z);
    copas.setMatrixAt(i, mtx);
  });
  scene.add(troncos);
  scene.add(copas);
}

/* ---- Cerramiento provisional perimetral (sigue el lindero de propiedad, ~490 m) ---- */
const cerramiento = new THREE.Group();
cerramiento.userData.info = {
  nombre: 'Cerramiento provisional perimetral',
  aforo: 'No aplica (elemento perimetral)',
  dimensiones: 'Sigue el lindero de propiedad (azul): abarca todo el lote, la franja verde perimetral y la península de acceso hasta la autopista (~490 m de perímetro)',
  altura: '2.40 m sobre nivel de andén',
  material: 'Lámina prepintada Zn-Alum calibre 26, acanalada, sobre postes tubulares Ø3" cada 3.00 m, en dados de concreto de 3.000 PSI (Ø0.30 × 0.50 m)',
  cerramiento: 'Franja inferior antisalpicadura + señalización de obra cada 20 m',
  descripcion: 'Cerramiento continuo sobre todo el lindero de propiedad (límite azul del plano base), envolviendo el lote completo y la zona de obra hasta la salida a la autopista. Único acceso: 1 portón vehicular corredizo de 6.00 m + 1 puerta peatonal independiente de 1.00 m, en el extremo de la vía junto a la salida de la autopista.'
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
  // Perímetro = lindero de propiedad (mismo trazado del límite AZUL): abarca
  // todo el lote y la península de acceso, mucha más área que el lote base.
  const P = [
    [-96,6],[-90,-28],[-52,-40],[-4,-42],[44,-38],[72,-18],[112,23],
    [104,39],[58,30],[30,36],[-10,38],[-50,34],[-76,26],[-94,14]
  ];
  // el tramo P[6]→P[7] (punta NE, hacia la autopista) lleva el acceso:
  // portón vehicular 6 m + puerta peatonal 1 m; el resto va cerrado.
  const ACC = 6;
  let gate = null;
  for (let i=0; i<P.length; i++){
    const a = P[i], b = P[(i+1) % P.length];
    if (i === ACC){
      const dx = b[0]-a[0], dz = b[1]-a[1], len = Math.hypot(dx, dz);
      const ux = dx/len, uz = dz/len;
      const px = f => a[0] + ux*len*f, pz = f => a[1] + uz*len*f;
      tramoCerr(px(0),    pz(0),    px(0.30), pz(0.30));   // fence hasta el portón
      tramoCerr(px(0.68), pz(0.68), px(0.74), pz(0.74));   // machón portón / peatonal
      tramoCerr(px(0.80), pz(0.80), px(1),    pz(1));      // fence tras la puerta peatonal
      gate = { x: px(0.49), z: pz(0.49), rot: -Math.atan2(dz, dx) };
    } else {
      tramoCerr(a[0], a[1], b[0], b[1]);
    }
  }
  // postes de la cerca en un solo InstancedMesh
  const postesMesh = new THREE.InstancedMesh(geoPoste, matPoste, postes.length);
  const mtxPoste = new THREE.Matrix4();
  postes.forEach(([x, y, z], i) => {
    mtxPoste.makeTranslation(x, y, z);
    postesMesh.setMatrixAt(i, mtxPoste);
  });
  cerramiento.add(postesMesh);
  // portón corredizo de 6.00 m (semiabierto), alineado con la vía de acceso
  const porton = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 0.1),
    new THREE.MeshLambertMaterial({ color:0xc9581e }));
  porton.position.set(gate.x, 1.1, gate.z);
  porton.rotation.y = gate.rot;
  cerramiento.add(porton);
  const etCer = crearEtiqueta('PORTÓN + PUERTA PEATONAL', 15, 'rgba(70,120,45,0.9)');
  etCer.position.set(gate.x, 5, gate.z);
  cerramiento.add(etCer);
}

/* ============ 4. TORRE (estructura existente — fase acabados) ============ */
const edificio = new THREE.Group();
edificio.userData.info = {
  nombre: 'Bambú · Torres 01 y 02 — 10 pisos + cubierta + 3 sótanos',
  aforo: '305 trabajadores en pico de obra',
  dimensiones: 'Torre 01: 49.73 × 12.50 m (8 aptos/piso) · Torre 02: 24.30 × 12.50 m (4 aptos/piso), en línea',
  altura: '26.50 m (10 pisos de 2.65 m) + cubierta · Sótanos: S1 -3.40 · S2 -6.20 · S3 -9.00 m',
  material: 'Estructura existente en concreto, completamente construida (la fase actual es solo cerramientos y acabados)',
  cerramiento: 'En ejecución: mampostería de fachada, ventanería y acabados interiores · 80 + 40 apartamentos (tipos A-L)',
  descripcion: 'Proyecto Bambú (Marinilla, Antioquia). Edificio en posición intermedia del lote de 163.00 m: Torre 01 y Torre 02 en línea con junta entre ambas y retrocesos de fachada según planta. El flujo es de un solo sentido: ingreso → zona operativa (portería, maniobra, acopio, almacén) → torre → zona administrativa y de bienestar, con salida por el mismo portón pasando por el lavado de llantas. Usa "Ver Piso 4" y haz clic en cada sector para el detalle de los frentes de trabajo.'
};
edificio.userData.esEdificio = true;
scene.add(edificio);

// Fachada: estructura con vanos — módulos con cerramiento terminado, en ladrillo y vanos abiertos
function texturaFachada(){
  // alto 128 (potencia de 2): WebGL ya no reescala la textura y la fachada
  // se ve nítida; el dibujo original de 96 px se escala al nuevo alto
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.scale(1, 128/96);
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
  t.anisotropy = ANISO;
  return t;
}
const texFach = texturaFachada();

const matLado  = new THREE.MeshLambertMaterial({ color:0x64676c });
const matTecho = new THREE.MeshLambertMaterial({ color:0x74777c });

const pisosMesh = [];
const T2 = CFG.torre2;
// losa clara: contrasta con la fachada oscura para que la división de cada piso se lea
const matLosaT = new THREE.MeshLambertMaterial({ color:0xcfd3d8 });

/* Placa con el número de piso, pegada a la fachada (P1…P10) */
function nivelTag(texto){
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = 'rgba(16,22,30,0.88)'; ctx.fillRect(0,0,128,64);
  ctx.strokeStyle = '#f2d21f'; ctx.lineWidth = 4; ctx.strokeRect(2,2,124,60);
  ctx.font = '700 36px Inter, Arial'; ctx.fillStyle = '#ffd23e';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 64, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = ANISO;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.2),
    new THREE.MeshBasicMaterial({ map:tex })
  );
}
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
  // número de nivel en ambas fachadas (extremo occidental de la Torre 01)
  const etNa = nivelTag('P' + (i+1));
  etNa.position.set(-CFG.largo/2 + 1.9, y + CFG.hPiso/2, CFG.fondo/2 + 0.13);
  g.add(etNa);
  const etNb = nivelTag('P' + (i+1));
  etNb.position.set(-CFG.largo/2 + 1.9, y + CFG.hPiso/2, -CFG.fondo/2 - 0.13);
  etNb.rotation.y = Math.PI;
  g.add(etNb);
  edificio.add(g);
  pisosMesh.push(g);
}
// retrocesos de fachada (muescas de la planta, en ambas torres);
// van en su propio grupo para atenuarlos en la vista del piso 4
const retrocesosG = new THREE.Group();
[[-10.9, 1],[5.9, 1],[-9.9, -1],[7.4, -1]].forEach(([x, lado]) => {
  const r = new THREE.Mesh(new THREE.BoxGeometry(2.4, CFG.alto, 1.4),
    new THREE.MeshLambertMaterial({ color:0x22262e }));
  r.position.set(x, CFG.alto/2, lado*(CFG.fondo/2 - 0.5));
  retrocesosG.add(r);
});
[[T2.cx-2.4, 1],[T2.cx+4.9, -1]].forEach(([x, lado]) => {
  const r = new THREE.Mesh(new THREE.BoxGeometry(2.4, CFG.alto, 1.4),
    new THREE.MeshLambertMaterial({ color:0x22262e }));
  r.position.set(x, CFG.alto/2, T2.dz + lado*(T2.fondo/2 - 0.5));
  retrocesosG.add(r);
});
edificio.add(retrocesosG);
// cubierta: cuarto de máquinas (T1, 19.70 m²) + escaleras/circulación (T2, 20.68 m²)
const techoG = new THREE.Group();
const cMaq = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 4), new THREE.MeshLambertMaterial({ color:0x6d7075 }));
cMaq.position.set(-8, CFG.alto + 1.1, 0); cMaq.castShadow = true;
techoG.add(cMaq);
const cEsc2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.9, 3), new THREE.MeshLambertMaterial({ color:0x6d7075 }));
cEsc2.position.set(T2.cx, CFG.alto + 0.95, T2.dz); cEsc2.castShadow = true;
techoG.add(cEsc2);
edificio.add(techoG);

const etT1 = crearEtiqueta('TORRES 01+02', 12, 'rgba(10,110,40,0.85)');
etT1.position.set(6, CFG.alto + 4.5, 0);
edificio.add(etT1);

// Sótanos S1 -3.40 · S2 -6.20 · S3 -9.00: estructura detallada (losas, columnas,
// parqueaderos, carros y rampa). Se muestra con el botón "Sótanos" de la barra:
// el terreno se vuelve translúcido para poder ver el corte bajo tierra.
const sotLargo = CFG.largo + T2.gap + T2.largo;
const sotanosG = new THREE.Group();
sotanosG.visible = false;
edificio.add(sotanosG);
{
  const cxS = (T2.gap + T2.largo)/2, czS = 0.6;
  const wS = sotLargo + 6, dS = CFG.fondo + 8;
  const NIVELES_SOT = [-3.4, -6.2, -9.0];
  const matColS = new THREE.MeshLambertMaterial({ color:0xa4a9af });
  // muro pantalla perimetral, muy translúcido para mirar el interior
  const pantalla = new THREE.Mesh(
    new THREE.BoxGeometry(wS, 9.4, dS),
    new THREE.MeshLambertMaterial({ color:0x7a6748, transparent:true, opacity:0.12, depthWrite:false })
  );
  pantalla.position.set(cxS, -4.75, czS);
  sotanosG.add(pantalla);
  NIVELES_SOT.forEach((yN, i) => {
    const losaS = new THREE.Mesh(
      new THREE.BoxGeometry(wS, 0.25, dS),
      new THREE.MeshLambertMaterial({ color:0x93979c })
    );
    losaS.position.set(cxS, yN - 0.13, czS);
    sotanosG.add(losaS);
    // columnas del pórtico
    for (let px = -wS/2 + 3; px <= wS/2 - 3; px += 8){
      [-dS/2 + 1.2, 0, dS/2 - 1.2].forEach(pz => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.6, 0.45), matColS);
        col.position.set(cxS + px, yN + 1.3, czS + pz);
        sotanosG.add(col);
      });
    }
    // demarcación de parqueaderos a ambos costados
    for (let px = -wS/2 + 5; px <= wS/2 - 7; px += 2.6){
      [-1, 1].forEach(lado => {
        const raya = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 4.6),
          new THREE.MeshBasicMaterial({ color:0xe8e6da }));
        raya.position.set(cxS + px, yN + 0.05, czS + lado*(dS/2 - 2.6));
        sotanosG.add(raya);
      });
    }
    const etS = crearEtiqueta('SÓTANO ' + (i+1) + ' · ' + yN.toFixed(2) + ' m', 15, 'rgba(90,70,35,0.92)');
    etS.position.set(cxS - wS/2 - 9, yN + 1.7, czS);
    etiquetasTodas.splice(etiquetasTodas.indexOf(etS), 1);   // siempre visible en la vista de sótanos
    sotanosG.add(etS);
  });
  // carros parqueados (referencia de uso) en S1 y S2
  [[-24, -1, 0xb8371f, -3.4], [-18, -1, 0x2e6db8, -3.4], [6, 1, 0x5fae4a, -3.4],
   [18, 1, 0x8a8f96, -6.2], [-10, 1, 0xd9a521, -6.2]].forEach(([px, lado, colC, yN]) => {
    caja(sotanosG, 1.7, 1.15, 4.2, colC, cxS + px, yN + 0.7, czS + lado*(dS/2 - 2.6));
  });
  // rampa vehicular: baja de la superficie al Sótano 1 por el costado oriental
  const rampa = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.22, 3.4),
    new THREE.MeshLambertMaterial({ color:0x777c82 }));
  rampa.position.set(cxS + wS/2 - 6.2, -1.7, czS - dS/2 + 2.6);
  rampa.rotation.z = Math.atan2(3.4, 12);
  sotanosG.add(rampa);
}

/* ============ 5. MALACATE DE OBRA (cremallera) ============ */
const malacate = new THREE.Group();
malacate.position.set(CFG.malacateX, 0, -(CFG.fondo/2) - 2.2); // punto medio, fachada hacia patio/almacén
malacate.userData.info = {
  nombre: 'Malacate de obra tipo cremallera',
  aforo: '8-10 personas o 1.000 kg por viaje',
  dimensiones: 'Cabina 1.50 × 1.50 × 2.10 m aprox.',
  altura: 'Recorrido requerido ≈ 35.5 m (sótano 3 a -9.00 m + 10 pisos de 2.65 m + cubierta)',
  material: 'Elevador mixto (personas + material) · 1.000 kg / 8-10 personas · 30-40 m/min · alimentación trifásica 220/440 V con tablero propio y parada de emergencia',
  cerramiento: 'Cabina con malla + puertas por nivel · arriostrado a la estructura cada 2 niveles (máx. 6 m) · Resolución 1409 de 2012',
  descripcion: 'Ubicado en la fachada que da hacia el patio y el almacén, en el punto medio de los 49.73 m de la Torre 01 para repartir de forma equilibrada el recorrido horizontal hacia ambos extremos del edificio. Complemento horizontal: 4-6 carretillas tipo buggy (80-100 kg c/u), recorrido almacén → pie del malacate ≈15-25 m. ARRÁSTRALO alrededor de la torre: se ancla a la fachada más cercana.'
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
const etMal = crearEtiqueta('Malacate 1.000 kg', 12, 'rgba(70,120,45,0.9)');
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

// circulación central (105,55 m² según la planta)
const circ1 = new THREE.Mesh(new THREE.BoxGeometry(44.6, 0.06, 2.4),
  new THREE.MeshLambertMaterial({ color:0xf0e6c8 }));
circ1.position.set(2.3, y4 + 0.16, 0);
piso4.add(circ1);

// punto fijo: escalas y ascensores en el extremo occidental (según la planta)
const matNucleo = new THREE.MeshLambertMaterial({ color:0x98a2ad });
const nucleoO = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.3, 11.9), matNucleo);
nucleoO.position.set(-22.4, y4 + 1.25, 0);
piso4.add(nucleoO);

/* Apartamentos del piso según la planta arquitectónica:
   norte (arriba): L · K · J · I — sur (abajo): A · B · C · D.
   Cada uno conserva además su frente de trabajo (fase de acabados). */
const SECTORES = [
  { nom:'Apto L', area:'61,92 m²', tipo:'2 alcobas + estudio', act:'Cerramientos de fachada (mampostería)', x0:-20,   x1:-8.85, lado: 1 },
  { nom:'Apto K', area:'59,52 m²', tipo:'2 alcobas + estudio', act:'Mampostería y muros divisorios',        x0:-8.85, x1:2.3,   lado: 1 },
  { nom:'Apto J', area:'67,05 m²', tipo:'3 alcobas',           act:'Enchapes de baños y cocinas',           x0:2.3,   x1:13.45, lado: 1 },
  { nom:'Apto I', area:'67,05 m²', tipo:'3 alcobas',           act:'Pintura y estuco',                      x0:13.45, x1:24.6,  lado: 1 },
  { nom:'Apto A', area:'59,52 m²', tipo:'2 alcobas + estudio', act:'Pisos y acabados de piso',              x0:-20,   x1:-8.85, lado:-1 },
  { nom:'Apto B', area:'61,92 m²', tipo:'2 alcobas + estudio', act:'Carpintería, puertas y marcos',         x0:-8.85, x1:2.3,   lado:-1 },
  { nom:'Apto C', area:'67,05 m²', tipo:'3 alcobas',           act:'Aparatos sanitarios y grifería',        x0:2.3,   x1:13.45, lado:-1 },
  { nom:'Apto D', area:'72,30 m²', tipo:'3 alcobas',           act:'Ventanería y vidrios',                  x0:13.45, x1:24.6,  lado:-1 }
];

/* Texto pintado sobre la losa — lienzo en potencia de 2 (WebGL no lo
   reescala) y filtrado anisotrópico: legible incluso mirado en ángulo */
function textoPiso(texto, w, x, z, color, rot){
  const c = document.createElement('canvas');
  c.width = ES_MOVIL ? 512 : 1024; c.height = ES_MOVIL ? 128 : 256;
  const ctx = c.getContext('2d');
  ctx.scale(c.width/640, c.height/160);
  ctx.font = '700 66px Inter, Arial';
  ctx.fillStyle = color || '#1a6e2e';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 320, 84);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = ANISO;
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
// muros divisorios: uno por posición. (Antes cada apto creaba sus dos muros
// laterales y los vecinos quedaban duplicados en el mismo sitio, titilando
// por z-fighting: eran los "cuadros" defectuosos dentro de los aptos.)
const xsMuros = [...new Set(SECTORES.flatMap(a => [a.x0, a.x1]))];
[1, -1].forEach(lado => xsMuros.forEach(x => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.3, 4.9), matMuro);
  m.position.set(x, y4 + 1.25, lado * 3.65);
  piso4.add(m);
}));
SECTORES.forEach(a => {
  const cx = (a.x0 + a.x1) / 2, ancho = a.x1 - a.x0;
  const mc = new THREE.Mesh(new THREE.BoxGeometry(ancho - 1.2, 2.3, 0.12), matMuro);
  mc.position.set(cx - 0.6, y4 + 1.25, a.lado * 1.2);
  piso4.add(mc);
  textoPiso(a.nom, 3.4, cx, a.lado * 3.0, '#1a6e2a');
  textoPiso(a.area, 2.4, cx, a.lado * 4.6, '#5a6470');
  // zona de clic totalmente invisible (opacidad 0): sigue respondiendo al
  // raycast pero ya no se ve como una caja blanca dentro del apartamento
  const zona = new THREE.Mesh(
    new THREE.BoxGeometry(ancho - 0.4, 2.2, 4.8),
    new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })
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
    '<tr><td>Área</td><td>' + a.area + '</td></tr>' +
    '<tr><td>Tipología</td><td>' + a.tipo + '</td></tr>' +
    '<tr><td>Frente de trabajo</td><td>' + a.act + '</td></tr>' +
    '<tr><td>Costado</td><td>' + (a.lado > 0 ? 'Norte' : 'Sur') + ' de la circulación central (105,55 m²), con balcón a fachada</td></tr>' +
    '<tr><td>Suministro</td><td>Materiales por malacate (1.000 kg) + distribución interna en carretillas buggy</td></tr>' +
    '</table>' +
    '<div><b style="color:#6fb3c9">Actividades típicas:</b><br>' +
    ['Replanteo', 'Mampostería', 'Instalaciones embebidas', 'Pañete / estuco', 'Enchapes', 'Pintura', 'Carpintería', 'Aparatos y remates']
      .map(s => '<span class="chipEspacio">' + s + '</span>').join('') +
    '</div>' +
    '<button onclick="abrirPlanos(\'Piso 4 · ' + a.nom + '\')">' + icono('plano') + 'Ficha técnica y planos del ' + a.nom + '</button>' +
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

// balcones de los apartamentos en ambas fachadas (según la planta)
const matBalcon = new THREE.MeshLambertMaterial({ color:0xcfd6dc });
[1, -1].forEach(lado => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(44.6, 0.12, 1.0), matBalcon);
  b.position.set(2.3, y4 + 0.12, lado * (CFG.fondo/2 + 0.5));
  piso4.add(b);
  textoPiso('BALCONES', 3.2, 2.3, lado * (CFG.fondo/2 + 0.5), '#4a5560');
});

// cerramiento provisional perimetral (baranda naranja de seguridad,
// por fuera del borde de los balcones)
const matBar = new THREE.MeshLambertMaterial({ color:0xe07820, transparent:true, opacity:0.6 });
matBar.userData.op0 = 0.6;
[[0, CFG.fondo/2+1.15, CFG.largo+0.4, 0.1],[0,-CFG.fondo/2-1.15, CFG.largo+0.4, 0.1],
 [-CFG.largo/2-0.15, 0, 0.1, CFG.fondo+2.4],[CFG.largo/2+0.15, 0, 0.1, CFG.fondo+2.4]].forEach(([px,pz,w,d]) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), matBar.clone());
  b.position.set(px, y4 + 1.75, pz);
  piso4.add(b);
});

// zona de descargue del malacate + acopio en losa
const zDesc = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.08, 3.5),
  new THREE.MeshLambertMaterial({ color:0xc9581e, transparent:true, opacity:0.65 })
);
zDesc.position.set(CFG.malacateX, y4 + 0.2, -CFG.fondo/2 + 2);
piso4.add(zDesc);

const et4a = crearEtiqueta('PISO 4', 9, 'rgba(70,120,45,0.9)');
et4a.position.set(0, y4 + 7, 0);
piso4.add(et4a);
textoPiso('CIRCULACIÓN · 105,55 m²', 8.5, 2.3, 0, '#7a5210');
const txtDesc = textoPiso('DESCARGUE MALACATE', 5.5, CFG.malacateX, -CFG.fondo/2 + 2, '#7a2e00');
textoSobre('ESCALAS Y ASCENSORES', 6, -22.4, 0, y4 + 2.62, Math.PI/2);

/* ---- Malacate móvil: se ancla al perímetro de la torre ---- */
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
  const c = document.createElement('canvas');
  c.width = ES_MOVIL ? 512 : 1024; c.height = ES_MOVIL ? 128 : 256;
  const ctx = c.getContext('2d');
  ctx.scale(c.width/640, c.height/160);
  ctx.font = '700 58px Inter, Arial';
  ctx.fillStyle = color || '#2c3342';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 320, 84);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = ANISO;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w/4),
    new THREE.MeshBasicMaterial({ map:tex, transparent:true })
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
