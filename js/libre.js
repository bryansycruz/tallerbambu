/* ============================================================================
   CONSTRUCTOR DE OBRA LIBRE  (taller-libre.html)
   Escena 3D independiente del proyecto Bambú: el estudiante arma su propia obra
   desde cero agregando espacios, edificios, malacates, torres grúa y grúas pluma.
   No comparte estado ni globals con index.html; guarda en su propia clave de
   localStorage ('tallerLibre_v1'), así que NO interfiere con el proyecto Bambú.
   ========================================================================== */

/* ---------- iconos SVG mínimos (sin dependencias) ---------- */
const ICO = {
  mas:      '<path d="M12 5v14M5 12h14"/>',
  guardar:  '<path d="M5 3h11l3 3v15H5z M8 3v5h7V3M8 21v-7h8v7"/>',
  carpeta:  '<path d="M3 7V5h6l2 2h10v13H3z"/>',
  basura:   '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
  volver:   '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  ojo:      '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  girarIzq: '<path d="M4 11a8 8 0 11-.6 4.5M4 5v6h6"/>',
  girarDer: '<path d="M20 11a8 8 0 10.6 4.5M20 5v6h-6"/>',
  grua:     '<path d="M4 21V4h3l12 3-2 3M7 4l-2 3M9 7v14M5 21h8"/>',
  edificio: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8.5 7h2M13.5 7h2M8.5 11h2M13.5 11h2M10 21v-3h4v3"/>',
  caja:     '<path d="M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5M12 13v8"/>'
};
function ic(n){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICO[n] || '') + '</svg>';
}
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function avisar(msj){
  const a = document.getElementById('libreAvisoGuardado');
  a.textContent = msj; a.style.display = 'block';
  clearTimeout(a._t); a._t = setTimeout(() => { a.style.display = 'none'; }, 2400);
}

/* ---------- escena, cámara, luces ---------- */
const ES_MOVIL = Math.min(innerWidth, innerHeight) <= 820 || navigator.maxTouchPoints > 1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2030);
scene.fog = new THREE.Fog(0x1a2030, 400, 900);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.5, 1600);
const renderer = new THREE.WebGLRenderer({ antialias: !ES_MOVIL, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, ES_MOVIL ? 1.2 : 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const ANISO = Math.min(ES_MOVIL ? 2 : 8, renderer.capabilities.getMaxAnisotropy());

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x3a3428, 0.8));
const sol = new THREE.DirectionalLight(0xfff2dd, 1.0);
sol.position.set(-90, 140, 70);
sol.castShadow = true;
sol.shadow.mapSize.set(1024, 1024);
sol.shadow.camera.left = -160; sol.shadow.camera.right = 160;
sol.shadow.camera.top = 130; sol.shadow.camera.bottom = -110; sol.shadow.camera.far = 520;
scene.add(sol);

/* terreno plano + cuadrícula de referencia (sensación de "lienzo para construir") */
const terreno = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 400),
  new THREE.MeshLambertMaterial({ color:0x7d9a4e })
);
terreno.rotation.x = -Math.PI/2; terreno.position.y = -0.02; terreno.receiveShadow = true;
scene.add(terreno);
const grid = new THREE.GridHelper(300, 60, 0x50607a, 0x3a4658);
grid.material.transparent = true; grid.material.opacity = 0.5; grid.position.y = 0.01;
scene.add(grid);

/* ---------- helpers constructivos ---------- */
function caja(g, w, h, d, color, x, y, z, op){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(op !== undefined ? { color, transparent:true, opacity:op } : { color })
  );
  m.position.set(x, y, z);
  m.castShadow = (op === undefined); m.receiveShadow = true;
  g.add(m); return m;
}
function cilindro(g, r, h, color, x, y, z, op){
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, 12),
    new THREE.MeshLambertMaterial(op !== undefined ? { color, transparent:true, opacity:op } : { color })
  );
  m.position.set(x, y, z); m.castShadow = (op === undefined); g.add(m); return m;
}
function crearEtiqueta(texto, ancho){
  ancho = ancho || 12;
  const res = ES_MOVIL ? 1 : 2;
  const c = document.createElement('canvas'); c.width = 512*res; c.height = 128*res;
  const ctx = c.getContext('2d'); ctx.scale(res, res);
  ctx.fillStyle = 'rgba(15,20,30,0.82)'; ctx.beginPath(); ctx.rect(0,16,512,96); ctx.fill();
  ctx.font = '600 44px Inter, Arial';
  const at = ctx.measureText(texto).width;
  if (at > 492) ctx.font = '600 ' + Math.max(16, Math.floor(44*492/at)) + 'px Inter, Arial';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 66);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = ANISO;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, depthTest:false, transparent:true }));
  sp.scale.set(ancho, ancho/4, 1);
  return sp;
}
/* círculo punteado + disco translúcido en el suelo (radio de giro de las grúas) */
function circuloRadio(g, R, color){
  const pts = [];
  for (let i=0; i<=72; i++){ const a = i/72*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*R, 0.06, Math.sin(a)*R)); }
  const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({ color, dashSize:1.6, gapSize:1.1 }));
  linea.computeLineDistances(); g.add(linea);
  const disco = new THREE.Mesh(new THREE.CircleGeometry(R, 56),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.06, side:THREE.DoubleSide }));
  disco.rotation.x = -Math.PI/2; disco.position.y = 0.05; g.add(disco);
}

/* ============ FÁBRICAS DE ELEMENTOS ============
   Cada una recibe un "def" normalizado y devuelve un THREE.Group con
   userData.info (ficha) y userData.tipo. El grupo giratorio de las grúas se
   guarda en userData.giro para animarlo en el bucle. */
const MAT_AMARILLO = 0xd9a521, MAT_NARANJA = 0xc9581e;

function construirEspacio(def){
  const g = new THREE.Group();
  const W = def.w, D = def.d, H = def.h, cm = def.color;
  caja(g, W, 0.12, D, 0xb5b8bc, 0, 0.06, 0);              // placa de piso
  if (def.muros){
    const t = 0.12;
    caja(g, W, H, t, cm, 0, H/2, -D/2 + t/2, 0.92);
    caja(g, t, H, D, cm, -W/2 + t/2, H/2, 0, 0.92);
    caja(g, t, H, D, cm,  W/2 - t/2, H/2, 0, 0.92);
    const puerta = Math.min(1.2, W*0.4), seg = (W - puerta)/2;
    caja(g, seg, H, t, cm, -(puerta+seg)/2, H/2, D/2 - t/2, 0.92);
    caja(g, seg, H, t, cm,  (puerta+seg)/2, H/2, D/2 - t/2, 0.92);
  }
  if (def.techo) caja(g, W + 0.5, 0.1, D + 0.5, 0x8a8f96, 0, H + 0.1, 0, 0.35);
  const area = Math.round(W*D);
  g.userData.info = {
    dimensiones: W + ' × ' + D + ' m ≈ ' + area + ' m²',
    altura: H + ' m',
    detalle: def.muros ? ('Con muros' + (def.techo ? ' y techo' : '')) : (def.techo ? 'Cubierta abierta' : 'Área demarcada')
  };
  return g;
}

function construirEdificio(def){
  const g = new THREE.Group();
  const hP = def.hPiso, alto = def.pisos * hP;
  const colFach = 0x55575b, colVano = 0xb9d2de, colLosa = 0xcfd3d8;
  for (let i=0; i<def.pisos; i++){
    const y = i*hP;
    caja(g, def.w, hP, def.d, colFach, 0, y + hP/2, 0);                 // volumen del piso
    // franjas de ventana en las 4 caras
    caja(g, def.w*0.92, hP*0.5, 0.06, colVano, 0, y + hP*0.55, def.d/2 + 0.03, 0.85);
    caja(g, def.w*0.92, hP*0.5, 0.06, colVano, 0, y + hP*0.55, -def.d/2 - 0.03, 0.85);
    caja(g, 0.06, hP*0.5, def.d*0.9, colVano, def.w/2 + 0.03, y + hP*0.55, 0, 0.85);
    caja(g, 0.06, hP*0.5, def.d*0.9, colVano, -def.w/2 - 0.03, y + hP*0.55, 0, 0.85);
    caja(g, def.w + 0.4, 0.2, def.d + 0.3, colLosa, 0, (i+1)*hP, 0);    // losa
  }
  g.userData.info = {
    dimensiones: def.w + ' × ' + def.d + ' m',
    altura: (Math.round(alto*100)/100) + ' m (' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos') + ' de ' + hP + ' m)',
    detalle: 'Edificio de ' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos')
  };
  return g;
}

function torreCelosia(g, H, x, z, ancho, color){
  const half = ancho/2;
  [[-half,-half],[half,-half],[-half,half],[half,half]].forEach(([px,pz]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, H, 0.16), new THREE.MeshLambertMaterial({ color }));
    p.position.set(x+px, H/2, z+pz); p.castShadow = true; g.add(p);
  });
  for (let y=1.2; y<H; y+=2){
    caja(g, ancho, 0.12, 0.12, color, x, y, z-half);
    caja(g, ancho, 0.12, 0.12, color, x, y, z+half);
    caja(g, 0.12, 0.12, ancho, color, x-half, y, z);
    caja(g, 0.12, 0.12, ancho, color, x+half, y, z);
  }
}

function construirMalacate(def){
  const g = new THREE.Group();
  const H = def.mastil || 30;
  torreCelosia(g, H, 0, 0, 2.0, MAT_AMARILLO);
  // cabina de la cremallera (sube y baja en el bucle de animación)
  const cabina = new THREE.Group();
  caja(cabina, 1.5, 0.12, 1.5, MAT_NARANJA, 0, 0, 0);
  [[0,-0.72,1.5,0.08],[0,0.72,1.5,0.08],[-0.72,0,0.08,1.4],[0.72,0,0.08,1.4]].forEach(([px,pz,w,d]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.1, d),
      new THREE.MeshLambertMaterial({ color:MAT_NARANJA, transparent:true, opacity:0.5 }));
    m.position.set(px, 1.1, pz); cabina.add(m);
  });
  cabina.position.y = 0.3; g.add(cabina);
  g.userData.cabina = cabina;
  g.userData.info = {
    dimensiones: 'Cabina 1.50 × 1.50 m',
    altura: H + ' m de recorrido',
    detalle: 'Elevador de obra tipo cremallera (personas + material)'
  };
  return g;
}

/* Torre grúa: mástil de celosía + conjunto giratorio (pluma horizontal de largo
   "brazo", contrapluma con contrapeso, carro y gancho al "radio" de trabajo).
   El radio de giro se dibuja como círculo punteado en el suelo. */
function construirGruaTorre(def){
  const g = new THREE.Group();
  const H = def.mastil, L = def.brazo, R = def.radio;
  torreCelosia(g, H, 0, 0, 2.4, MAT_AMARILLO);
  circuloRadio(g, R, 0xffd23e);

  const giro = new THREE.Group();
  giro.position.y = H;
  caja(giro, 2.6, 0.6, 2.6, 0x2e6db8, 0, 0.3, 0);                     // base giratoria
  caja(giro, 1.2, 1.3, 1.4, MAT_AMARILLO, 0, 1.25, 1.4);              // cabina del operador
  // pluma (brazo de trabajo) en +x, celosía sencilla
  const jib = new THREE.Group();
  caja(jib, L, 0.22, 0.6, MAT_AMARILLO, L/2, 0.95, 0);                // cordón superior
  caja(jib, L, 0.14, 0.5, MAT_AMARILLO, L/2, 0.2, 0);                 // cordón inferior
  for (let x=1; x<L; x+=2.4){                                         // diagonales
    const dgo = caja(jib, 0.08, 1.05, 0.08, MAT_AMARILLO, x, 0.6, 0);
    dgo.rotation.z = 0.5;
  }
  // carro + cable + gancho al radio de trabajo (acotado al largo de la pluma)
  const rr = Math.min(R, L);
  caja(jib, 0.6, 0.3, 0.7, 0x394150, rr, 0.4, 0);
  cilindro(jib, 0.03, H*0.45, 0x1b1e24, rr, 0.4 - H*0.22, 0);
  caja(jib, 0.28, 0.4, 0.28, 0x2b2f36, rr, 0.4 - H*0.45, 0);
  giro.add(jib);
  // contrapluma + contrapeso en -x
  const cj = Math.max(4, L*0.38);
  caja(giro, cj, 0.2, 0.5, MAT_AMARILLO, -cj/2, 0.95, 0);
  caja(giro, 1.6, 1.4, 1.6, 0x6d7075, -cj + 0.3, 1.0, 0);            // bloque de contrapeso
  // torreta / cúspide con tirantes a la punta y a la contrapluma
  const apexH = Math.min(7, L*0.28);
  caja(giro, 0.2, apexH, 0.2, MAT_AMARILLO, 0, 1 + apexH/2, 0);
  const tirante = (x1, x2) => {
    const dx = x2 - x1, len = Math.hypot(dx, apexH);
    const t = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.05),
      new THREE.MeshLambertMaterial({ color:0x9aa0a6 }));
    t.position.set((x1+x2)/2, 1 + apexH/2 + 0.5, 0);
    t.rotation.z = Math.atan2(-apexH, dx); giro.add(t);
  };
  tirante(0, L*0.9); tirante(0, -cj*0.9);
  g.add(giro);
  g.userData.giro = giro;

  g.userData.info = {
    dimensiones: 'Mástil ' + H + ' m · brazo ' + L + ' m',
    altura: 'Radio de giro ' + R + ' m',
    detalle: 'Torre grúa fija — el brazo gira sobre el mástil'
  };
  return g;
}

/* Grúa pluma / móvil: base + pluma inclinada de largo "brazo" a "angulo" grados,
   sobre una base giratoria; radio de giro en el suelo. */
function construirGruaPluma(def){
  const g = new THREE.Group();
  const L = def.brazo, ang = (def.angulo || 45) * Math.PI/180, R = def.radio;
  circuloRadio(g, R, 0x53d0ff);
  // chasis / base
  caja(g, 5, 1.0, 3, 0x394150, 0, 0.6, 0);
  cilindro(g, 0.6, 0.5, 0x2b2f36, -1.6, 1.2, 0.9);
  cilindro(g, 0.6, 0.5, 0x2b2f36, 1.6, 1.2, 0.9);
  const giro = new THREE.Group();
  giro.position.y = 1.1;
  caja(giro, 2.4, 1.2, 2.6, MAT_NARANJA, 0, 0.6, 0);                  // cabina/torreta
  // pluma inclinada
  const pluma = new THREE.Group();
  pluma.position.set(0.6, 1.1, 0);
  const brazo = caja(pluma, L, 0.4, 0.5, MAT_AMARILLO, L/2, 0, 0);
  brazo.castShadow = true;
  // cable + gancho desde la punta
  const px = L, py = 0, alturaGancho = Math.max(2, Math.sin(ang)*L*0.5);
  cilindro(pluma, 0.03, alturaGancho, 0x1b1e24, px, -alturaGancho/2, 0);
  caja(pluma, 0.3, 0.4, 0.3, 0x2b2f36, px, -alturaGancho, 0);
  pluma.rotation.z = ang;
  giro.add(pluma);
  g.add(giro);
  g.userData.giro = giro;

  const alcance = Math.round(Math.cos(ang)*L * 10)/10;
  g.userData.info = {
    dimensiones: 'Pluma ' + L + ' m a ' + (def.angulo || 45) + '°',
    altura: 'Radio de giro ' + R + ' m · alcance ≈ ' + alcance + ' m',
    detalle: 'Grúa pluma (móvil) — la pluma gira sobre la base'
  };
  return g;
}

const FABRICAS = {
  espacio: construirEspacio, edificio: construirEdificio, malacate: construirMalacate,
  gruaTorre: construirGruaTorre, gruaPluma: construirGruaPluma
};
const NOMBRE_TIPO = {
  espacio:'Espacio', edificio:'Edificio', malacate:'Malacate',
  gruaTorre:'Torre grúa', gruaPluma:'Grúa pluma'
};

/* ============ ELEMENTOS DE LA OBRA ============ */
const elementos = [];   // THREE.Group[]
let seleccionado = null;
let nivelMalacate = 0;  // altura compartida de las cabinas de malacate (0..1 del recorrido)

function numLim(v, def, min, max){
  v = parseFloat(v); if (!isFinite(v)) v = def;
  return Math.min(max, Math.max(min, v));
}
function nombreDisponible(base){
  base = String(base || '').trim().slice(0, 40) || 'Elemento';
  let nombre = base, n = 2;
  while (elementos.some(g => g.userData.def.nombre === nombre)) nombre = base + ' ' + (n++);
  return nombre;
}
function posicionLibre(){
  const n = elementos.length;
  return [ -30 + (n % 6) * 22, -20 - Math.floor(n / 6) * 20 ];
}
/* normaliza cualquier def (nuevo o cargado) con límites sanos */
function normalizarDef(raw){
  const tipo = FABRICAS[raw.tipo] ? raw.tipo : 'espacio';
  const d = {
    tipo,
    nombre: String(raw.nombre || NOMBRE_TIPO[tipo]).slice(0, 40),
    descripcion: String(raw.descripcion || '').slice(0, 400),
    x: numLim(raw.x, 0, -260, 260),
    z: numLim(raw.z, 0, -180, 180),
    rot: numLim(raw.rot, 0, -Math.PI*4, Math.PI*4)
  };
  if (tipo === 'espacio'){
    d.w = numLim(raw.w, 10, 2, 90); d.d = numLim(raw.d, 8, 2, 70); d.h = numLim(raw.h, 2.5, 1, 14);
    d.color = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : '#3f7fbf';
    d.muros = raw.muros !== false; d.techo = raw.techo !== false;
  } else if (tipo === 'edificio'){
    d.w = numLim(raw.w, 20, 3, 90); d.d = numLim(raw.d, 12, 3, 70);
    d.pisos = Math.round(numLim(raw.pisos, 5, 1, 40)); d.hPiso = numLim(raw.hPiso, 2.65, 2, 5);
  } else if (tipo === 'malacate'){
    d.mastil = numLim(raw.mastil, 30, 6, 80);
  } else if (tipo === 'gruaTorre'){
    d.mastil = numLim(raw.mastil, 30, 8, 90); d.brazo = numLim(raw.brazo, 40, 8, 90); d.radio = numLim(raw.radio, 35, 4, 90);
  } else if (tipo === 'gruaPluma'){
    d.brazo = numLim(raw.brazo, 30, 6, 80); d.angulo = numLim(raw.angulo, 45, 10, 80); d.radio = numLim(raw.radio, 25, 4, 80);
  }
  return d;
}
function crearElemento(raw){
  const def = normalizarDef(raw);
  const g = FABRICAS[def.tipo](def);
  g.userData.def = def;
  g.userData.tipo = def.tipo;
  g.userData.info.nombre = def.nombre;
  const et = crearEtiqueta(def.nombre, 12);
  et.position.y = (def.tipo === 'gruaTorre' ? def.mastil : def.tipo === 'edificio' ? def.pisos*def.hPiso :
                   def.tipo === 'malacate' ? def.mastil : def.tipo === 'gruaPluma' ? 6 : (def.h + 2)) + 3;
  g.add(et); g.userData.etiqueta = et;
  g.position.set(def.x, 0, def.z);
  g.rotation.y = def.rot;
  scene.add(g);
  elementos.push(g);
  return g;
}
function eliminarElemento(g){
  const i = elementos.indexOf(g);
  if (i < 0) return;
  if (seleccionado === g){ seleccionado = null; mostrarPanelVacio(); }
  g.traverse(n => { if (n.geometry) n.geometry.dispose(); });
  scene.remove(g);
  elementos.splice(i, 1);
  guardar();
  avisar('"' + g.userData.def.nombre + '" eliminado');
  if (document.getElementById('libreOverlay').style.display === 'flex') renderVentana();
}
function actualizarTinte(g){
  if (!g) return;
  const emi = (g === seleccionado) ? 0x554400 : 0x000000;
  g.traverse(n => { if (n.isMesh && n.material && n.material.emissive !== undefined) n.material.emissive.setHex(emi); });
}

/* ============ CÁMARA ORBITAL ============ */
const camCtrl = { target: new THREE.Vector3(0, 4, 0), radius: 110, theta: 0.7, phi: 1.12 };
let animCam = null;
function actualizarCamara(){
  const s = Math.sin(camCtrl.phi);
  camera.position.set(
    camCtrl.target.x + camCtrl.radius * s * Math.sin(camCtrl.theta),
    camCtrl.target.y + camCtrl.radius * Math.cos(camCtrl.phi),
    camCtrl.target.z + camCtrl.radius * s * Math.cos(camCtrl.theta)
  );
  camera.lookAt(camCtrl.target);
}
function irA(tx, tz, radius){
  animCam = { t0: performance.now(), dur: 800,
    de: { x:camCtrl.target.x, z:camCtrl.target.z, r:camCtrl.radius },
    a:  { x:tx, z:tz, r:radius } };
}

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();
const planoSuelo = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
let arrastrando = null, rotando = false, paneando = false;
let x0 = 0, y0 = 0, movido = 0;
const punterosTactiles = new Map();
let pinza = null;

function rayo(e){
  puntero.x = (e.clientX / innerWidth) * 2 - 1;
  puntero.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(puntero, camera);
}
function puntoSuelo(){
  const hits = raycaster.intersectObject(terreno);
  if (hits.length) return hits[0].point;
  const p = new THREE.Vector3();
  return raycaster.ray.intersectPlane(planoSuelo, p) ? p : null;
}
function raizElemento(o){
  while (o && o.parent && o.parent !== scene) o = o.parent;
  return elementos.includes(o) ? o : null;
}
function moverCamaraPantalla(dx, dy){
  const derecha = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
  const frente = new THREE.Vector3().subVectors(camCtrl.target, camera.position);
  frente.y = 0; frente.normalize();
  camCtrl.target.addScaledVector(derecha, -dx * camCtrl.radius * 0.0013);
  camCtrl.target.addScaledVector(frente,  dy * camCtrl.radius * 0.0013);
}

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch'){
    punterosTactiles.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (punterosTactiles.size === 2){
      arrastrando = null; rotando = false; paneando = false; movido = 999;
      const [a, b] = [...punterosTactiles.values()];
      pinza = { dist0: Math.hypot(a.x-b.x, a.y-b.y), radio0: camCtrl.radius, cx:(a.x+b.x)/2, cy:(a.y+b.y)/2 };
      return;
    }
  }
  x0 = e.clientX; y0 = e.clientY; movido = 0;
  rayo(e);
  if (e.button === 2 || e.shiftKey){ paneando = true; return; }
  if (e.button !== 0) return;
  const hits = raycaster.intersectObjects(elementos, true);
  if (hits.length){
    const raiz = raizElemento(hits[0].object);
    if (raiz) { arrastrando = raiz; return; }
  }
  rotando = true;
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' && punterosTactiles.has(e.pointerId)){
    punterosTactiles.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pinza && punterosTactiles.size >= 2){
      const [a, b] = [...punterosTactiles.values()];
      const dist = Math.hypot(a.x-b.x, a.y-b.y);
      camCtrl.radius = Math.min(560, Math.max(12, pinza.radio0 * (pinza.dist0 / Math.max(dist,1))));
      const cx = (a.x+b.x)/2, cy = (a.y+b.y)/2;
      moverCamaraPantalla(cx - pinza.cx, cy - pinza.cy);
      pinza.cx = cx; pinza.cy = cy; return;
    }
  }
  const dx = e.clientX - x0, dy = e.clientY - y0;
  movido += Math.abs(dx) + Math.abs(dy);
  x0 = e.clientX; y0 = e.clientY;
  if (arrastrando){
    rayo(e);
    const p = puntoSuelo();
    if (p){
      arrastrando.position.set(p.x, 0, p.z);
      arrastrando.userData.def.x = Math.round(p.x*100)/100;
      arrastrando.userData.def.z = Math.round(p.z*100)/100;
      if (seleccionado === arrastrando) refrescarUbic();
    }
    return;
  }
  if (rotando){
    camCtrl.theta -= dx * 0.0055;
    camCtrl.phi = Math.min(1.52, Math.max(0.12, camCtrl.phi - dy * 0.0045));
  } else if (paneando){
    moverCamaraPantalla(dx, dy);
  }
});
function finPointer(e){
  if (e.pointerType === 'touch'){
    punterosTactiles.delete(e.pointerId);
    if (punterosTactiles.size < 2) pinza = null;
  }
  const eraArrastre = arrastrando;
  arrastrando = null; rotando = false; paneando = false;
  if (movido < 6 && e.button === 0){
    rayo(e);
    const hits = raycaster.intersectObjects(elementos, true);
    if (hits.length){ seleccionar(raizElemento(hits[0].object)); }
    else { seleccionado = null; actualizarTinte(null); mostrarPanelVacio(); elementos.forEach(actualizarTinte); }
  } else if (eraArrastre){
    guardar();
  }
}
renderer.domElement.addEventListener('pointerup', finPointer);
renderer.domElement.addEventListener('pointercancel', e => { punterosTactiles.delete(e.pointerId); if (punterosTactiles.size < 2) pinza = null; });
renderer.domElement.addEventListener('wheel', e => {
  camCtrl.radius = Math.min(560, Math.max(12, camCtrl.radius * (1 + e.deltaY * 0.001)));
}, { passive:true });

/* ============ PANEL DE SELECCIÓN ============ */
const pTitulo = document.getElementById('librePTitulo');
const pBody = document.getElementById('librePBody');
function mostrarPanelVacio(){
  pTitulo.textContent = 'Constructor de obra';
  pBody.className = 'desc';
  pBody.innerHTML = 'Pulsa <b style="color:#a0cf52">Agregar</b> para crear un elemento: espacio, edificio, ' +
    'malacate, torre grúa o grúa pluma. Luego haz clic sobre él para su ficha, arrástralo, gíralo o elimínalo.';
}
function seleccionar(g){
  if (!g) return;
  const anterior = seleccionado;
  seleccionado = g;
  actualizarTinte(anterior); actualizarTinte(g);
  const d = g.userData.def, info = g.userData.info;
  pTitulo.textContent = d.nombre;
  pBody.className = '';
  pBody.innerHTML =
    '<table>' +
    '<tr><td>Tipo</td><td>' + NOMBRE_TIPO[d.tipo] + '</td></tr>' +
    '<tr><td>Dimensiones</td><td>' + info.dimensiones + '</td></tr>' +
    '<tr><td>' + (d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma' ? 'Giro' : 'Altura') + '</td><td>' + info.altura + '</td></tr>' +
    '<tr><td>Detalle</td><td>' + info.detalle + '</td></tr>' +
    '<tr id="libreUbic"><td>Ubicación</td><td>' + ubicTexto(g) + '</td></tr>' +
    '</table>' +
    (d.descripcion ? '<div class="desc">' + esc(d.descripcion).replace(/\n/g, '<br>') + '</div>' : '') +
    '<div style="display:flex; gap:6px">' +
      '<button style="flex:1" onclick="girarSel(-1)">' + ic('girarIzq') + 'Girar 45°</button>' +
      '<button style="flex:1" onclick="girarSel(1)">' + ic('girarDer') + 'Girar 45°</button>' +
    '</div>' +
    '<button class="btnEliminar" onclick="eliminarSel()">' + ic('basura') + 'Eliminar de la obra</button>';
}
function ubicTexto(g){ return 'x: ' + Math.round(g.position.x) + ' m · z: ' + Math.round(g.position.z) + ' m'; }
function refrescarUbic(){ const u = document.getElementById('libreUbic'); if (u) u.lastElementChild.textContent = ubicTexto(seleccionado); }
function girarSel(dir){
  if (!seleccionado) return;
  seleccionado.rotation.y += dir * Math.PI/4;
  seleccionado.userData.def.rot = seleccionado.rotation.y;
  guardar();
  avisar(seleccionado.userData.def.nombre + ' girado');
}
function eliminarSel(){ if (seleccionado) eliminarElemento(seleccionado); }

/* ============ VENTANA DE CREACIÓN + LISTA ============ */
function renderVentana(){
  const filas = elementos.length
    ? elementos.map((g, i) => {
        const d = g.userData.def;
        return '<div class="planoFila">' +
          '<span class="planoNom">' + ic(d.tipo === 'edificio' ? 'edificio' : (d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma') ? 'grua' : 'caja') +
            ' <b style="color:#e8ecf2">' + esc(d.nombre) + '</b> <small>· ' + NOMBRE_TIPO[d.tipo] + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Ir a este elemento" onclick="irAElemIdx(' + i + ')">' + ic('ojo') + '</button> ' +
            '<button class="planoBtn peligro" title="Eliminar" onclick="eliminarElemIdx(' + i + ')">' + ic('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no has agregado elementos. Crea el primero abajo.</div>';
  document.getElementById('libreBody').innerHTML =
    '<b>En tu obra</b>' + filas +
    '<div style="margin-top:14px; display:flex; flex-direction:column; gap:8px">' +
      '<b>Agregar nuevo</b>' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<select id="libTipo" onchange="cambiarTipo()">' +
          '<option value="espacio">Espacio</option>' +
          '<option value="edificio">Edificio</option>' +
          '<option value="malacate">Malacate</option>' +
          '<option value="gruaTorre">Torre grúa</option>' +
          '<option value="gruaPluma">Grúa pluma</option>' +
        '</select>' +
        '<input id="libNombre" maxlength="40" placeholder="Nombre" style="flex:1; min-width:150px">' +
      '</div>' +
      '<div id="libCampos" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center"></div>' +
      '<textarea id="libDesc" maxlength="400" rows="2" placeholder="Descripción (opcional)"></textarea>' +
      '<button class="orgAccion primario" style="margin:0; align-self:flex-start" onclick="agregarElemento()">' +
        ic('mas') + 'Crear y ubicar en la obra</button>' +
    '</div>';
  cambiarTipo();
}
function cambiarTipo(){
  const t = document.getElementById('libTipo').value;
  const campos = document.getElementById('libCampos');
  const num = (id, lbl, val, min, max, step) =>
    '<label>' + lbl + ' <input type="number" id="' + id + '" value="' + val + '" min="' + min + '" max="' + max + '" step="' + (step||1) + '" style="width:66px"></label>';
  let html = '';
  if (t === 'espacio'){
    html = num('libAncho','Ancho (m)',10,2,90,0.1) + num('libFondo','Fondo (m)',8,2,70,0.1) + num('libAlto','Altura (m)',2.5,1,14,0.1) +
      '<label>Color <input type="color" id="libColor" value="#3f7fbf"></label>' +
      '<label><input type="checkbox" id="libMuros" checked> Muros</label>' +
      '<label><input type="checkbox" id="libTecho" checked> Techo</label>';
  } else if (t === 'edificio'){
    html = num('libAncho','Ancho (m)',20,3,90,0.1) + num('libFondo','Fondo (m)',12,3,70,0.1) +
      num('libPisos','Pisos',5,1,40,1) + num('libHPiso','Entrepiso (m)',2.65,2,5,0.05);
  } else if (t === 'malacate'){
    html = num('libMastil','Altura (m)',30,6,80,0.5);
  } else if (t === 'gruaTorre'){
    html = num('libMastil','Altura mástil (m)',30,8,90,0.5) + num('libBrazo','Largo del brazo (m)',40,8,90,0.5) +
      num('libRadio','Radio de giro (m)',35,4,90,0.5);
  } else if (t === 'gruaPluma'){
    html = num('libBrazo','Largo de la pluma (m)',30,6,80,0.5) + num('libAngulo','Inclinación (°)',45,10,80,1) +
      num('libRadio','Radio de giro (m)',25,4,80,0.5);
  }
  campos.innerHTML = html;
  const ph = { espacio:'Espacio', edificio:'Edificio', malacate:'Malacate', gruaTorre:'Torre grúa', gruaPluma:'Grúa pluma' };
  document.getElementById('libNombre').placeholder = 'Nombre (ej: ' + ph[t] + ')';
}
function valNum(id){ const el = document.getElementById(id); return el ? el.value : undefined; }
function agregarElemento(){
  const tipo = document.getElementById('libTipo').value;
  const raw = {
    tipo,
    nombre: nombreDisponible(document.getElementById('libNombre').value || NOMBRE_TIPO[tipo]),
    descripcion: (document.getElementById('libDesc').value || '').trim().slice(0, 400)
  };
  const [x, z] = posicionLibre(); raw.x = x; raw.z = z;
  if (tipo === 'espacio'){
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.h = valNum('libAlto');
    raw.color = valNum('libColor'); raw.muros = document.getElementById('libMuros').checked; raw.techo = document.getElementById('libTecho').checked;
  } else if (tipo === 'edificio'){
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.pisos = valNum('libPisos'); raw.hPiso = valNum('libHPiso');
  } else if (tipo === 'malacate'){
    raw.mastil = valNum('libMastil');
  } else if (tipo === 'gruaTorre'){
    raw.mastil = valNum('libMastil'); raw.brazo = valNum('libBrazo'); raw.radio = valNum('libRadio');
  } else if (tipo === 'gruaPluma'){
    raw.brazo = valNum('libBrazo'); raw.angulo = valNum('libAngulo'); raw.radio = valNum('libRadio');
  }
  const g = crearElemento(raw);
  guardar();
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, g.position.z, 70);
  avisar(NOMBRE_TIPO[tipo] + ' "' + g.userData.def.nombre + '" creado — arrástralo para ubicarlo');
}
function irAElemIdx(i){
  const g = elementos[i]; if (!g) return;
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(g); irA(g.position.x, g.position.z, 70);
}
function eliminarElemIdx(i){ if (elementos[i]) eliminarElemento(elementos[i]); }

/* ============ GUARDAR / CARGAR (localStorage propio + respaldo JSON) ============ */
const CLAVE = 'tallerLibre_v1';
function estadoActual(){
  return { version:1, proyecto:'Proyecto libre — Taller II', fecha:new Date().toISOString(),
    elementos: elementos.map(g => g.userData.def) };
}
function guardar(){
  try { localStorage.setItem(CLAVE, JSON.stringify(estadoActual())); } catch (e) {}
}
function reconstruir(defs){
  elementos.slice().forEach(g => { g.traverse(n => { if (n.geometry) n.geometry.dispose(); }); scene.remove(g); });
  elementos.length = 0;
  seleccionado = null; mostrarPanelVacio();
  (Array.isArray(defs) ? defs : []).forEach(d => crearElemento(d));
}
function cargarLocal(){
  let txt = null;
  try { txt = localStorage.getItem(CLAVE); } catch (e) {}
  if (!txt) return;
  try { reconstruir(JSON.parse(txt).elementos); } catch (e) {}
}

document.getElementById('libreBtnAgregar').innerHTML = ic('mas') + 'Agregar';
document.getElementById('libreBtnGuardar').innerHTML = ic('guardar') + 'Guardar';
document.getElementById('libreBtnCargar').innerHTML = ic('carpeta') + 'Cargar';
document.getElementById('libreBtnVaciar').innerHTML = ic('basura') + 'Vaciar';
document.querySelector('#libreUI a.btn').innerHTML = ic('volver') + 'Bambú';

document.getElementById('libreBtnAgregar').onclick = () => { renderVentana(); document.getElementById('libreOverlay').style.display = 'flex'; };
document.getElementById('libreCerrar').onclick = () => { document.getElementById('libreOverlay').style.display = 'none'; };
document.getElementById('libreOverlay').addEventListener('click', e => { if (e.target.id === 'libreOverlay') e.target.style.display = 'none'; });
document.getElementById('libreBtnGuardar').onclick = () => {
  guardar();
  const blob = new Blob([JSON.stringify(estadoActual(), null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'proyecto_libre.json'; a.click();
  URL.revokeObjectURL(a.href);
  avisar('Guardado (+ respaldo proyecto_libre.json)');
};
document.getElementById('libreBtnCargar').onclick = () => document.getElementById('libreArchivo').click();
document.getElementById('libreArchivo').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try { reconstruir(JSON.parse(lector.result).elementos); guardar(); avisar('Proyecto cargado'); }
    catch (err) { avisar('Archivo no válido'); }
  };
  lector.readAsText(f); e.target.value = '';
};
document.getElementById('libreBtnVaciar').onclick = () => {
  if (!elementos.length){ avisar('La obra ya está vacía'); return; }
  if (confirm('¿Vaciar toda la obra? Esto elimina todos los elementos creados.')){
    reconstruir([]); guardar(); avisar('Obra vaciada');
  }
};

/* pantalla de bienvenida */
document.getElementById('libreComenzar').onclick = () => {
  const el = document.getElementById('libreInicio');
  el.classList.add('oculto');
  setTimeout(() => { el.style.display = 'none'; }, 400);
};

/* ============ BUCLE DE ANIMACIÓN ============ */
addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
const reloj = new THREE.Clock();
let tiempo = 0;
function animar(){
  requestAnimationFrame(animar);
  const dt = Math.min(reloj.getDelta(), 0.05);
  tiempo += dt;
  if (animCam){
    let k = (performance.now() - animCam.t0) / animCam.dur; if (k >= 1) k = 1;
    const e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
    camCtrl.target.x = animCam.de.x + (animCam.a.x - animCam.de.x)*e;
    camCtrl.target.z = animCam.de.z + (animCam.a.z - animCam.de.z)*e;
    camCtrl.radius   = animCam.de.r + (animCam.a.r - animCam.de.r)*e;
    if (k === 1) animCam = null;
  }
  // brazos de grúa girando + cabinas de malacate subiendo/bajando
  nivelMalacate = (Math.sin(tiempo*0.35)*0.5 + 0.5);
  elementos.forEach(g => {
    if (g.userData.giro) g.userData.giro.rotation.y += dt * 0.18;
    if (g.userData.cabina) g.userData.cabina.position.y = 0.3 + nivelMalacate * (g.userData.def.mastil - 2.5);
  });
  actualizarCamara();
  renderer.render(scene, camera);
}

/* arranque */
mostrarPanelVacio();
cargarLocal();
actualizarCamara();
animar();
