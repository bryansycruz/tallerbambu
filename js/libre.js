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
  caja:     '<path d="M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5M12 13v8"/>',
  editar:   '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z M13.5 6.5l3 3"/>',
  silla:    '<path d="M6 4v9h12V4M6 13v3h12v-3M7 16v4M17 16v4"/>',
  via:      '<path d="M5 21L10 3M19 21L14 3M12 6v2.5M12 11v2.5M12 16v2.5"/>',
  ruta:     '<path d="M4 19c5 0 4-7 9-7h5M15 8l4 4-4 4M5 19v.01"/>',
  ficha:    '<path d="M6 3h9l4 4v14H6z M15 3v4h4M9 12h7M9 16h7"/>',
  org:      '<path d="M9 3h6v4H9zM3 17h6v4H3zM15 17h6v4h-6zM12 7v5M6 17v-2.5h12V17"/>',
  camion:   '<path d="M2 16V7h11v9M13 10h5l3 3v3h-3M2 16h3M8 16h5"/><circle cx="6" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
  play:     '<path d="M6 4l14 8-14 8z"/>',
  stop:     '<path d="M6 6h12v12H6z"/>',
  mas2:     '<path d="M12 5v14M5 12h14"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  candado:  '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  candadoAbierto: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 017.5-1.6"/>',
  plano:    '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h9v12M12 9h9M9 3v6"/>',
  etiqueta: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="8" cy="8" r="1.6"/>',
  regla:    '<path d="M3 17L17 3l4 4L7 21zM7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',
  caminar:  '<circle cx="13" cy="4.2" r="1.7"/><path d="M12.6 7.5l-2.1 5 2.5 3.2V21M10.5 12.3l-2.6 1.2V17M13 9.4l2.6 2 2.6.6M10.4 15.8L8 21"/>',
  sol:      '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/>',
  luna:     '<path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z"/>',
  areas:    '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 15h18M9 15V3"/><path d="M13 19h6M13 15.5v7"/>',
  /* icónos que reproducen exactamente el trazo de js/config.js (mismo panel del proyecto Bambú) */
  menu:     '<path d="M4 6h16M4 12h16M4 18h16"/>',
  menos:    '<path d="M5 12h14"/>',
  refrescar:'<path d="M20 11a8 8 0 10.6 4.5M20 5v6h-6"/>',
  flechaArriba: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  flechaAbajo:  '<path d="M12 5v14M6 13l6 6 6-6"/>',
  flechaIzq:    '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  flechaDer:    '<path d="M5 12h14M13 6l6 6-6 6"/>',
  mando:    '<rect x="2.5" y="6.5" width="19" height="11" rx="4.5"/><path d="M6.5 10v4M4.5 12h4"/><circle cx="15.5" cy="10.5" r="1.1"/><circle cx="18" cy="13" r="1.1"/>',
  reloj:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  cota:     '<path d="M4 12h16M4 8v8M20 8v8M9 12v-2M13 12v2"/>',
  herramienta: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.7 2.7-2-2z"/>',
  abrir:    '<path d="M14 4h6v6M20 4l-9 9M20 13.5V20H4V4h6.5"/>',
  equipo:   '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.2 2.3-5.2 5.5-5.2s5.5 2 5.5 5.2"/><circle cx="17.5" cy="9" r="2.4"/><path d="M16 14.6c2.8 0 4.5 1.8 4.5 4.6"/>',
  historial: '<path d="M3 12a9 9 0 109-9M3 12V6M3 12h6"/><path d="M12 7v5l3.5 2"/>',
  volante:  '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 5.5V9.5M6.4 15.2l3.5-2M17.6 15.2l-3.5-2"/>'
};
function ic(n){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICO[n] || '') + '</svg>';
}
/* llena cualquier <span class="ic" data-ic="nombre"> con su SVG — mismo
   mecanismo que aplicarIconos() de js/config.js (Bambú), reutilizando
   nuestro propio catálogo ICO en vez de duplicar config.js entero aquí */
function aplicarIconosLibre(){
  document.querySelectorAll('.ic[data-ic]').forEach(el => { el.innerHTML = ic(el.dataset.ic); });
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
const renderer = new THREE.WebGLRenderer({ antialias: !ES_MOVIL, powerPreference:'high-performance', preserveDrawingBuffer:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, ES_MOVIL ? 1.2 : 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const ANISO = Math.min(ES_MOVIL ? 2 : 8, renderer.capabilities.getMaxAnisotropy());

const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x3a3428, 0.8);
scene.add(hemi);
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
/* cono truncado: r1 = radio inferior, r2 = radio superior */
function cono(g, r1, r2, h, color, x, y, z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, h, 14), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
}
/* rueda de vehículo (cilindro acostado sobre el eje x) */
function rueda(g, x, y, z, r, ancho){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, ancho || 0.35, 12), new THREE.MeshLambertMaterial({ color: 0x15181c }));
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
}
function crearEtiqueta(texto, ancho, color){
  ancho = ancho || 12;
  const res = ES_MOVIL ? 1 : 2;
  const c = document.createElement('canvas'); c.width = 512*res; c.height = 128*res;
  const ctx = c.getContext('2d'); ctx.scale(res, res);
  ctx.fillStyle = color || 'rgba(15,20,30,0.82)'; ctx.beginPath(); ctx.rect(0,16,512,96); ctx.fill();
  ctx.font = '600 44px IBM Plex Sans, Arial';
  const at = ctx.measureText(texto).width;
  if (at > 492) ctx.font = '600 ' + Math.max(16, Math.floor(44*492/at)) + 'px IBM Plex Sans, Arial';
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
  (def.muebles || []).forEach((m, i) => agregarMuebleInteriorAGrupo(g, m, i));
  const area = Math.round(W*D);
  g.userData.info = {
    dimensiones: W + ' × ' + D + ' m ≈ ' + area + ' m²',
    altura: H + ' m',
    detalle: def.muros ? ('Con muros' + (def.techo ? ' y techo' : '')) : (def.techo ? 'Cubierta abierta' : 'Área demarcada')
  };
  return g;
}

/* Sistemas estructurales del edificio: nombre + descripción + dibujo distinto */
const SISTEMAS = {
  aporticado: { nombre:'Aporticado (pórticos)',
    desc:'Sistema Aporticado: red de vigas y columnas de concreto armado o acero conectadas rígidamente. Es flexible, ideal para distribución libre de espacios.' },
  muros: { nombre:'Muros estructurales / Mampostería',
    desc:'Sistema de Muros Estructurales (o Mampostería): muros o placas de concreto o ladrillo que soportan el peso y resisten fuerzas laterales. Alta rigidez, pero limita las modificaciones espaciales.' },
  dual: { nombre:'Dual / Combinado',
    desc:'Sistema Dual / Combinado: mezcla ambos. Las columnas soportan la gravedad y los muros de concreto absorben las fuerzas de sismos o vientos. Muy común en edificios de mediana y gran altura.' },
  acero: { nombre:'Acero',
    desc:'Sistema de Acero: usa perfiles metálicos. Más ligero y rápido de construir; frecuente en naves industriales y rascacielos.' },
  madera: { nombre:'Madera',
    desc:'Sistema de Madera: ecológico y flexible; usado sobre todo en construcciones de baja altura y viviendas residenciales.' },
  muroPantalla: { nombre:'Muro pantalla',
    desc:'Sistema de Muro Pantalla: muros de contención perimetral vaciados en el terreno antes de excavar. Se usa en sótanos profundos y contención de tierras; actúa como muro definitivo y como apoyo temporal durante la excavación.' }
};
function opcionesSistema(sel){
  return Object.keys(SISTEMAS).map(k =>
    '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(SISTEMAS[k].nombre) + '</option>').join('');
}
/* dibuja UN piso del edificio según el sistema estructural */
function pisoSistema(g, sis, w, d, hP, y){
  const t = 0.12;
  const grid = len => { const step = 6.5, n = Math.max(1, Math.round(len / step)), a = []; for (let i = 0; i <= n; i++) a.push(-len/2 + i*len/n); return a; };
  if (sis === 'muros'){
    const cm = 0xb0a99c, vent = 0x23262b;
    caja(g, w, hP, t, cm, 0, y + hP/2, -d/2, 0.99);
    caja(g, w, hP, t, cm, 0, y + hP/2,  d/2, 0.99);
    caja(g, t, hP, d, cm, -w/2, y + hP/2, 0, 0.99);
    caja(g, t, hP, d, cm,  w/2, y + hP/2, 0, 0.99);
    const nx = Math.max(2, Math.round(w / 4.5));
    for (let k = 0; k < nx; k++){ const x = -w/2 + (k + 0.5) * (w/nx);
      caja(g, Math.min(1.1, w/nx*0.45), hP*0.4, 0.06, vent, x, y + hP*0.58,  d/2 + 0.02, 0.9);
      caja(g, Math.min(1.1, w/nx*0.45), hP*0.4, 0.06, vent, x, y + hP*0.58, -d/2 - 0.02, 0.9);
    }
    const nz = Math.max(1, Math.round(d / 4.5));
    for (let k = 0; k < nz; k++){ const z = -d/2 + (k + 0.5) * (d/nz);
      caja(g, 0.06, hP*0.4, Math.min(1.1, d/nz*0.45), vent,  w/2 + 0.02, y + hP*0.58, z, 0.9);
      caja(g, 0.06, hP*0.4, Math.min(1.1, d/nz*0.45), vent, -w/2 - 0.02, y + hP*0.58, z, 0.9);
    }
    return;
  }
  if (sis === 'muroPantalla'){
    const cm = 0x6d7075;   // concreto gris oscuro, muro sólido sin ventanas (contención)
    caja(g, w, hP, t, cm, 0, y + hP/2, -d/2, 0.99);
    caja(g, w, hP, t, cm, 0, y + hP/2,  d/2, 0.99);
    caja(g, t, hP, d, cm, -w/2, y + hP/2, 0, 0.99);
    caja(g, t, hP, d, cm,  w/2, y + hP/2, 0, 0.99);
    return;
  }
  let colC, vidC, vidO, cw;
  if (sis === 'acero'){ colC = 0x7f8c9a; vidC = 0x9fc4e8; vidO = 0.42; cw = 0.18; }
  else if (sis === 'madera'){ colC = 0xa97a4d; vidC = 0xd8c8a8; vidO = 0.9; cw = 0.26; }
  else { colC = 0x9a9d9c; vidC = 0xbdd6e2; vidO = 0.5; cw = 0.32; }
  const xs = grid(w);
  xs.forEach(x => [-d/2, d/2].forEach(z => caja(g, cw, hP, cw, colC, x, y + hP/2, z)));
  grid(d).filter(z => Math.abs(z) < d/2 - 0.01).forEach(z => [-w/2, w/2].forEach(x => caja(g, cw, hP, cw, colC, x, y + hP/2, z)));
  caja(g, w - cw, hP*0.86, 0.05, vidC, 0, y + hP*0.52,  d/2, vidO);
  caja(g, w - cw, hP*0.86, 0.05, vidC, 0, y + hP*0.52, -d/2, vidO);
  caja(g, 0.05, hP*0.86, d - cw, vidC,  w/2, y + hP*0.52, 0, vidO);
  caja(g, 0.05, hP*0.86, d - cw, vidC, -w/2, y + hP*0.52, 0, vidO);
  if (sis === 'dual'){
    const cm = 0xb6b2a8;
    caja(g, t, hP, d*0.86, cm, -w/2 + 0.06, y + hP/2, 0, 0.99);
    caja(g, t, hP, d*0.86, cm,  w/2 - 0.06, y + hP/2, 0, 0.99);
  }
  if (sis === 'acero'){
    [-w/2, w/2].forEach(x => {
      const len = Math.hypot(d, hP);
      const a = caja(g, 0.09, 0.09, len, colC, x, y + hP/2, 0); a.rotation.x = Math.atan2(hP, d); a.castShadow = false;
      const b = caja(g, 0.09, 0.09, len, colC, x, y + hP/2, 0); b.rotation.x = -Math.atan2(hP, d); b.castShadow = false;
    });
  }
}
function construirEdificio(def){
  const g = new THREE.Group();
  const hP = def.hPiso, alto = def.pisos * hP;
  const sis = SISTEMAS[def.sistema] ? def.sistema : 'aporticado';
  const S = SISTEMAS[sis];
  const colLosa = (sis === 'madera') ? 0xcaa06a : (sis === 'acero') ? 0xbfc6cd : 0xcfd3d8;
  for (let i = 0; i < def.pisos; i++){
    const y = i * hP;
    pisoSistema(g, sis, def.w, def.d, hP, y);
    caja(g, def.w + 0.4, 0.2, def.d + 0.3, colLosa, 0, (i + 1) * hP, 0);   // losa
  }
  g.userData.info = {
    dimensiones: def.w + ' × ' + def.d + ' m',
    altura: (Math.round(alto*100)/100) + ' m (' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos') + ' de ' + hP + ' m)',
    detalle: S.nombre + ' — ' + S.desc
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

/* ============ CATÁLOGO DE MUEBLES ============
   Piezas curadas por categoría; cada "dibujar" es una composición paramétrica
   corta con caja()/cilindro() (igual que construirEspacio/pisoSistema) para
   que cambiar ancho/fondo/alto al editar reproporcione la pieza de verdad,
   no solo escale un modelo fijo. "color" tiñe la superficie principal; los
   acabados secundarios quedan fijos (mismo criterio que MAT_AMARILLO/NARANJA
   en las grúas). */
const CATALOGO_MUEBLES = [
  // ---- Sala ----
  { id:'sofa', nombre:'Sofá', categoria:'Sala', w:2.0, d:0.9, h:0.85, color:'#5c7290',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.42, d, color, 0, h*0.21, 0);
      caja(g, w, h*0.58, d*0.18, color, 0, h*0.5, -d/2 + d*0.09);
      caja(g, w*0.14, h*0.65, d, color, -w/2 + w*0.07, h*0.32, 0);
      caja(g, w*0.14, h*0.65, d, color,  w/2 - w*0.07, h*0.32, 0);
    } },
  { id:'mesaCentro', nombre:'Mesa de centro', categoria:'Sala', w:1.1, d:0.55, h:0.42, color:'#8a6642',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.12, d, color, 0, h - h*0.06, 0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz]) => {
        caja(g, 0.06, h*0.88, 0.06, 0x2b2f36, sx*(w/2-0.08), h*0.44, sz*(d/2-0.08));
      });
    } },
  { id:'tv', nombre:'Mueble de TV', categoria:'Sala', w:1.3, d:0.4, h:0.9, color:'#23262b',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.32, d, color, 0, h*0.16, 0);
      caja(g, w*0.85, h*0.55, 0.06, 0x111318, 0, h*0.32 + h*0.28, -d/2 + 0.1);
    } },
  // ---- Comedor ----
  { id:'mesaComedor', nombre:'Mesa de comedor', categoria:'Comedor', w:1.6, d:0.9, h:0.75, color:'#a97a4d',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.08, d, color, 0, h - h*0.04, 0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz]) => {
        caja(g, 0.07, h*0.92, 0.07, color, sx*(w/2-0.1), h*0.46, sz*(d/2-0.1));
      });
    } },
  { id:'sillaComedor', nombre:'Silla de comedor', categoria:'Comedor', w:0.45, d:0.45, h:0.9, color:'#a97a4d',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.06, d, color, 0, h*0.45, 0);
      caja(g, w, h*0.5, 0.05, color, 0, h*0.75, -d/2 + 0.03);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz]) => {
        caja(g, 0.04, h*0.45, 0.04, 0x3a2c1e, sx*(w/2-0.03), h*0.225, sz*(d/2-0.03));
      });
    } },
  // ---- Dormitorio ----
  { id:'camaDoble', nombre:'Cama doble', categoria:'Dormitorio', w:1.6, d:2.0, h:0.55, color:'#eef1f5',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.35, d, 0x8a6642, 0, h*0.175, 0);
      caja(g, w*0.96, h*0.45, d*0.94, color, 0, h*0.35 + h*0.225, 0.02);
      caja(g, w, h*1.2, 0.1, 0x8a6642, 0, h*0.6, -d/2);
    } },
  { id:'mesaNoche', nombre:'Mesa de noche', categoria:'Dormitorio', w:0.45, d:0.4, h:0.55, color:'#a97a4d',
    dibujar(g, w, d, h, color){ caja(g, w, h, d, color, 0, h/2, 0); } },
  { id:'closet', nombre:'Closet', categoria:'Dormitorio', w:1.2, d:0.6, h:2.0, color:'#d8c8a8',
    dibujar(g, w, d, h, color){
      caja(g, w, h, d, color, 0, h/2, 0);
      caja(g, 0.03, h*0.9, 0.02, 0x6b5b3d, -0.02, h*0.5, d/2);
    } },
  // ---- Cocina ----
  { id:'nevera', nombre:'Nevera', categoria:'Cocina', w:0.7, d:0.7, h:1.8, color:'#d9dde0',
    dibujar(g, w, d, h, color){
      caja(g, w, h, d, color, 0, h/2, 0);
      caja(g, w*0.06, h*0.55, 0.02, 0x8b9096, -w/2 + w*0.12, h*0.62, d/2);
    } },
  { id:'estufa', nombre:'Estufa', categoria:'Cocina', w:0.6, d:0.6, h:0.9, color:'#2b2f36',
    dibujar(g, w, d, h, color){
      caja(g, w, h, d, color, 0, h/2, 0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz]) => {
        cilindro(g, w*0.13, 0.02, 0x111318, sx*w*0.22, h + 0.01, sz*d*0.22);
      });
    } },
  { id:'meson', nombre:'Mesón de cocina', categoria:'Cocina', w:2.0, d:0.65, h:0.9, color:'#cfd3d8',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.9, d, 0xece7dc, 0, h*0.45, 0);
      caja(g, w + 0.06, h*0.1, d + 0.06, color, 0, h - h*0.05, 0);
    } },
  // ---- Baño ----
  { id:'inodoro', nombre:'Inodoro', categoria:'Baño', w:0.4, d:0.6, h:0.75, color:'#f2f2f2',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.3, d*0.6, color, 0, h*0.15, d*0.2);
      caja(g, w*0.85, h*0.45, d*0.35, color, 0, h*0.55, -d*0.28);
    } },
  { id:'lavamanos', nombre:'Lavamanos', categoria:'Baño', w:0.55, d:0.45, h:0.85, color:'#f2f2f2',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.1, d, color, 0, h - h*0.05, 0);
      cilindro(g, 0.04, h*0.85, 0xb7bcc2, 0, h*0.425, 0);
    } },
  { id:'ducha', nombre:'Ducha', categoria:'Baño', w:0.9, d:0.9, h:2.0, color:'#bcd6e0',
    dibujar(g, w, d, h, color){
      caja(g, w, 0.05, d, 0xe4e4e0, 0, 0.03, 0);
      caja(g, 0.02, h, d, color, -w/2, h/2, 0, 0.35);
      caja(g, w, h, 0.02, color, 0, h/2, -d/2, 0.35);
    } },
  // ---- Oficina ----
  { id:'escritorio', nombre:'Escritorio', categoria:'Oficina', w:1.4, d:0.7, h:0.75, color:'#a97a4d',
    dibujar(g, w, d, h, color){
      caja(g, w, h*0.08, d, color, 0, h - h*0.04, 0);
      [[-1],[1]].forEach(([sx]) => caja(g, 0.05, h*0.92, d*0.9, color, sx*(w/2-0.05), h*0.46, 0));
    } },
  { id:'sillaOficina', nombre:'Silla de oficina', categoria:'Oficina', w:0.55, d:0.55, h:1.0, color:'#2e6db8',
    dibujar(g, w, d, h, color){
      caja(g, w*0.85, h*0.08, d*0.85, color, 0, h*0.5, 0);
      caja(g, w*0.85, h*0.45, 0.06, color, 0, h*0.75, -d/2 + 0.05);
      cilindro(g, 0.04, h*0.45, 0x2b2f36, 0, h*0.27, 0);
    } },
  { id:'estanteria', nombre:'Estantería', categoria:'Oficina', w:0.9, d:0.35, h:1.9, color:'#a97a4d',
    dibujar(g, w, d, h, color){
      caja(g, w, h, 0.03, color, 0, h/2, -d/2 + 0.015);
      [0.15, 0.4, 0.65, 0.9].forEach(f => caja(g, w, 0.03, d, color, 0, h*f, 0));
      [[-1],[1]].forEach(([sx]) => caja(g, 0.03, h, 0.03, color, sx*(w/2-0.015), h/2, 0));
    } }
];
function opcionesCatalogoMueble(sel){
  const cats = {};
  CATALOGO_MUEBLES.forEach(m => { (cats[m.categoria] = cats[m.categoria] || []).push(m); });
  return Object.keys(cats).map(cat =>
    '<optgroup label="' + esc(cat) + '">' +
      cats[cat].map(m => '<option value="' + m.id + '"' + (m.id === sel ? ' selected' : '') + '>' + esc(m.nombre) + '</option>').join('') +
    '</optgroup>'
  ).join('');
}
function construirMueble(def){
  const g = new THREE.Group();
  const item = CATALOGO_MUEBLES.find(m => m.id === def.catalogoId) || CATALOGO_MUEBLES[0];
  item.dibujar(g, def.w, def.d, def.h, def.color);
  g.userData.info = {
    dimensiones: def.w + ' × ' + def.d + ' m',
    altura: def.h + ' m',
    detalle: item.nombre + ' — categoría ' + item.categoria
  };
  return g;
}

/* ============ AMOBLAR ESPACIOS POR DENTRO (muebles del catálogo dentro de
   un "espacio" creado) ============
   Cada espacio guarda su propia lista def.muebles en coordenadas LOCALES
   (relativas al centro y giro del espacio, como cualquier hijo de un
   THREE.Group rotado): así la habitación se puede mover/girar en la obra sin
   que sus muebles se desordenen. Se editan desde el modo "Amoblar" (2D,
   zoom sobre ese espacio) — ver más abajo, junto al resto de herramientas. */
function catalogoMuebleInterior(id){ return CATALOGO_MUEBLES.find(m => m.id === id) || CATALOGO_MUEBLES[0]; }
function normalizarMueblesInterior(lista, w, d){
  if (!Array.isArray(lista)) return [];
  const hw = w / 2 - 0.1, hd = d / 2 - 0.1;
  return lista.filter(m => m && typeof m === 'object').slice(0, 60).map(raw => {
    const item = catalogoMuebleInterior(raw.catalogoId);
    return {
      id: isFinite(Number(raw.id)) ? Number(raw.id) : idSec++,
      catalogoId: item.id,
      x: numLim(raw.x, 0, -hw, hw),
      z: numLim(raw.z, 0, -hd, hd),
      rot: numLim(raw.rot, 0, -Math.PI * 4, Math.PI * 4),
      w: numLim(raw.w, item.w, 0.2, 6), d: numLim(raw.d, item.d, 0.2, 6), h: numLim(raw.h, item.h, 0.1, 3.5),
      color: /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : item.color
    };
  });
}
/* construye UNA pieza y la agrega como hija del grupo del espacio (se usa
   tanto al construir el espacio completo como al agregar una pieza nueva
   sin reconstruir todo lo demás) */
function agregarMuebleInteriorAGrupo(roomGroup, m, idx){
  const item = catalogoMuebleInterior(m.catalogoId);
  const sub = new THREE.Group();
  item.dibujar(sub, m.w, m.d, m.h, m.color);
  sub.position.set(m.x, 0, m.z);
  sub.rotation.y = m.rot;
  sub.userData.esMuebleInterior = true;
  sub.userData.muebleIdx = idx;
  roomGroup.add(sub);
  return sub;
}
/* convierte un punto del MUNDO a coordenadas locales del espacio (inversa de
   la rotación+posición del grupo) — necesario porque los muebles son hijos
   de un grupo que puede estar girado, a diferencia de los elementos de nivel
   superior que viven directo en coordenadas del mundo */
function mundoALocalRoom(p, d){
  const dx = p.x - d.x, dz = p.z - d.z;
  const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
  return { x: dx * cos - dz * sin, z: dx * sin + dz * cos };
}

/* ============ CATÁLOGO DE MAQUINARIA Y TRANSPORTE ============
   Equipos reales de la obra, agrupados como en el proyecto Bambú (transporte
   horizontal / vertical / planta e instalaciones). Cada pieza se dibuja a su
   tamaño nominal y luego se ESCALA al ancho/largo/alto que el usuario escriba,
   así "colocar el tamaño y las dimensiones" funciona para todas. Los equipos
   con movil:true se pueden asignar a una RUTA para verlos recorrer la obra;
   los fijos (planta, silo) son instalaciones. El frente de todos apunta a +z
   (mismo criterio que el camión de camiones.js) para que giren bien al rodar. */
const TASA_CONCRETO_DIA = 240;   // 30 m³/h × 8 h/día — ritmo de la planta DOMAT del catálogo
const CATALOGO_MAQUINAS = [
  { id:'volquetaDobletroque', nombre:'Volqueta dobletroque', grupo:'Transporte horizontal', w:2.6, d:9, h:3, color:'#d9a521', movil:true,
    desc:'Volqueta de dos ejes traseros (dobletroque) para retiro de excavación y suministro de granulares.',
    dibujar(g, c){
      caja(g, 2.3, 0.5, 8.4, 0x2b2f36, 0, 0.85, -0.2);
      caja(g, 2.4, 1.9, 2.0, 0xc0392b, 0, 2.0, 3.1);
      caja(g, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 4.12);
      caja(g, 2.55, 0.25, 5.4, 0x8a8f96, 0, 1.35, -1.5);
      caja(g, 0.1, 1.5, 5.4, c, -1.22, 2.2, -1.5);
      caja(g, 0.1, 1.5, 5.4, c, 1.22, 2.2, -1.5);
      caja(g, 2.55, 1.5, 0.12, c, 0, 2.2, -4.14);
      caja(g, 2.55, 1.5, 0.12, c, 0, 2.2, 1.14);
      caja(g, 2.55, 0.12, 5.4, c, 0, 1.5, -1.5);
      [3.0, -2.2, -3.6].forEach(z => [-1.1, 1.1].forEach(x => rueda(g, x, 0.62, z, 0.62, 0.5)));
    } },
  { id:'excavadoraCat320', nombre:'Excavadora CAT 320', grupo:'Transporte horizontal', w:3.4, d:10, h:4, color:'#f0b429', movil:true,
    desc:'Excavadora de orugas CAT 320 para excavación y cargue de volquetas.',
    dibujar(g, c){
      [-1.25, 1.25].forEach(x => {
        caja(g, 0.85, 1.0, 4.6, 0x2b2f36, x, 0.55, 0);
        caja(g, 0.9, 0.3, 4.8, 0x3a3f46, x, 0.2, 0);
      });
      cilindro(g, 0.9, 0.4, 0x3a3f46, 0, 1.25, 0);
      caja(g, 2.6, 0.5, 3.4, c, 0, 1.6, -0.2);
      caja(g, 1.2, 1.3, 1.6, c, -0.7, 2.5, 0.6);
      caja(g, 1.1, 0.9, 0.06, 0x23262b, -0.7, 2.6, 1.42);
      caja(g, 2.4, 1.1, 1.6, c, 0, 2.35, -1.5);
      const b1 = caja(g, 0.45, 0.6, 3.8, c, 0.55, 3.0, 1.9); b1.rotation.x = -0.55;
      const b2 = caja(g, 0.35, 0.45, 2.6, c, 0.55, 3.3, 4.3); b2.rotation.x = 0.85;
      caja(g, 0.95, 0.9, 0.95, 0x6d7075, 0.55, 1.7, 5.3);
    } },
  { id:'minicargadorCat262', nombre:'Minicargador CAT 262D3', grupo:'Transporte horizontal', w:1.8, d:3.6, h:2.2, color:'#f0b429', movil:true,
    desc:'Minicargador (skid steer) CAT 262D3 para mover material dentro de la obra.',
    dibujar(g, c){
      caja(g, 1.4, 1.0, 2.0, c, 0, 0.95, -0.1);
      caja(g, 1.0, 0.9, 1.1, 0x23262b, 0, 1.75, -0.25);
      caja(g, 0.94, 0.7, 0.05, 0x9fc4e8, 0, 1.78, 0.32);
      [-0.66, 0.66].forEach(z => [-0.82, 0.82].forEach(x => rueda(g, x, 0.38, z, 0.38, 0.28)));
      [-0.78, 0.78].forEach(x => {
        const br = caja(g, 0.14, 0.2, 2.4, 0x6d7075, x, 1.35, 0.5); br.rotation.x = -0.35;
      });
      caja(g, 1.75, 0.55, 0.5, 0x6d7075, 0, 0.55, 1.55);
      caja(g, 1.75, 0.1, 0.6, 0x6d7075, 0, 0.3, 1.7);
    } },
  { id:'carretillaBuggy', nombre:'Carretilla buggy', grupo:'Transporte horizontal', w:0.7, d:1.6, h:1, color:'#2e6db8', movil:true,
    desc:'Carretilla de obra (buggy) para mezcla, escombro o material suelto.',
    dibujar(g, c){
      const tina = caja(g, 0.6, 0.3, 0.7, c, 0, 0.45, 0.05); tina.rotation.x = 0.2;
      caja(g, 0.66, 0.04, 0.76, c, 0, 0.6, 0.12);
      rueda(g, 0, 0.22, 0.62, 0.22, 0.1);
      caja(g, 0.04, 0.5, 0.04, 0x23262b, 0, 0.24, 0.5);
      [[-0.22, 0.35], [0.22, 0.35]].forEach(([x, z]) => { const p = caja(g, 0.05, 0.5, 0.05, 0x23262b, x, 0.22, -z); p.rotation.x = -0.4; });
      [-0.26, 0.26].forEach(x => { const asa = caja(g, 0.05, 0.95, 0.05, 0x23262b, x, 0.42, -0.52); asa.rotation.x = -0.55; });
    } },
  { id:'camionPlanchon', nombre:'Camión planchón', grupo:'Transporte horizontal', w:2.6, d:12, h:3, color:'#2e6db8', movil:true,
    desc:'Camión de plataforma plana (planchón) para acero, formaleta y maquinaria menor.',
    dibujar(g, c){
      caja(g, 2.3, 0.5, 11.4, 0x2b2f36, 0, 0.85, 0);
      caja(g, 2.4, 1.9, 2.1, c, 0, 2.0, 4.55);
      caja(g, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 5.62);
      caja(g, 2.55, 0.22, 8.8, 0xa97a4d, 0, 1.25, -1.1);
      [-1.22, 1.22].forEach(x => caja(g, 0.08, 0.35, 8.8, 0x6d7075, x, 1.5, -1.1));
      [4.5, 3.3, -2.6, -3.9].forEach(z => [-1.1, 1.1].forEach(x => rueda(g, x, 0.6, z, 0.6, 0.45)));
    } },
  { id:'pipaCementera', nombre:'Pipa cementera', grupo:'Transporte horizontal', w:2.6, d:10, h:4, color:'#d9dde0', movil:true,
    desc:'Camión cisterna (pipa) que transporta cemento a granel hasta el silo.',
    dibujar(g, c){
      caja(g, 2.3, 0.5, 9.4, 0x2b2f36, 0, 0.85, 0);
      caja(g, 2.4, 1.9, 2.0, 0xc9581e, 0, 2.0, 3.6);
      caja(g, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 4.62);
      const tanque = cilindro(g, 1.25, 6.2, c, 0, 2.45, -0.9); tanque.rotation.x = Math.PI / 2;
      const c1 = cono(g, 1.25, 0.35, 0.9, c, 0, 2.45, 2.6); c1.rotation.x = Math.PI / 2;
      const c2 = cono(g, 1.25, 0.35, 0.9, c, 0, 2.45, -4.4); c2.rotation.x = -Math.PI / 2;
      [0.4, -2.2].forEach(z => cilindro(g, 0.28, 0.35, 0x8a8f96, 0, 3.8, z));
      cilindro(g, 0.12, 2.2, 0x8a8f96, 0.95, 1.5, -4.4);
      [3.4, -2.4, -3.7].forEach(z => [-1.1, 1.1].forEach(x => rueda(g, x, 0.6, z, 0.6, 0.45)));
    } },
  { id:'pilotadoraRotativa', nombre:'Pilotadora rotativa', grupo:'Transporte vertical', w:3.5, d:8, h:16, color:'#d9821b', movil:true,
    desc:'Pilotadora rotativa sobre orugas para pilotes de cimentación (perfora con barra kelly y hélice).',
    dibujar(g, c){
      [-1.4, 1.4].forEach(x => caja(g, 0.9, 1.1, 5.4, 0x2b2f36, x, 0.6, -0.4));
      caja(g, 2.8, 0.5, 3.6, c, 0, 1.5, -0.8);
      caja(g, 1.3, 1.4, 1.8, c, -0.75, 2.6, 0.2);
      caja(g, 1.05, 0.9, 0.06, 0x23262b, -0.75, 2.7, 1.12);
      caja(g, 2.4, 1.3, 2.4, c, 0, 2.4, -2.2);
      caja(g, 0.7, 14.5, 0.7, c, 0.7, 8.6, 1.6);
      caja(g, 0.9, 0.5, 0.9, 0x6d7075, 0.7, 15.9, 1.6);
      caja(g, 1.3, 1.2, 1.1, 0x6d7075, 0.7, 9.0, 2.3);
      cilindro(g, 0.26, 7.5, 0x3a3f46, 0.7, 4.4, 2.6);
      for (let y = 1.2; y <= 4.4; y += 0.8) cilindro(g, 0.62, 0.1, 0x565b62, 0.7, y, 2.6);
      cono(g, 0.32, 0.05, 0.8, 0x3a3f46, 0.7, 0.5, 2.6);
    } },
  { id:'bombaEstacionaria', nombre:'Bomba estacionaria de concreto DOMAT', grupo:'Transporte vertical', w:1.8, d:5, h:2, color:'#2e6db8', movil:false,
    desc:'Bomba estacionaria DOMAT: impulsa el concreto por tubería hasta los pisos superiores.',
    dibujar(g, c){
      caja(g, 1.5, 0.35, 4.2, 0x2b2f36, 0, 0.55, 0);
      caja(g, 1.4, 0.9, 2.2, c, 0, 1.2, 0.5);
      const tolva = caja(g, 1.5, 0.8, 1.2, 0x8a8f96, 0, 1.15, -1.6); tolva.rotation.x = 0.25;
      caja(g, 1.3, 0.35, 0.1, 0x565b62, 0, 1.55, -2.2);
      const tubo = cilindro(g, 0.09, 2.4, 0x565b62, 0.45, 1.1, 2.0); tubo.rotation.x = Math.PI / 2;
      rueda(g, -0.85, 0.35, -1.2, 0.35, 0.2); rueda(g, 0.85, 0.35, -1.2, 0.35, 0.2);
      caja(g, 0.12, 0.55, 0.12, 0x565b62, 0, 0.3, 1.9);
      caja(g, 0.5, 0.3, 0.6, 0xffd23e, 0, 1.8, 0.9);
      caja(g, 0.1, 0.1, 1.1, 0x565b62, 0, 0.55, 2.5);
    } },
  { id:'plantaConcreto', nombre:'Planta de concreto DOMAT 30 m³/h D-200L', grupo:'Planta e instalaciones', w:9, d:13, h:7, color:'#d9a521', movil:false,
    desc:'Planta dosificadora DOMAT de 30 m³/h con mezclador D-200L. Instálala junto al silo de cemento.',
    dibujar(g, c){
      [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([x, z]) => caja(g, 0.25, 4.6, 0.25, 0x6d7075, x, 2.3, z));
      caja(g, 4.0, 0.25, 4.0, 0x6d7075, 0, 4.7, 0);
      cilindro(g, 1.35, 1.8, c, 0, 5.8, 0);
      caja(g, 1.0, 0.7, 1.0, 0x565b62, 1.6, 5.4, 1.3);
      cono(g, 0.5, 0.18, 1.2, 0x8a8f96, 0, 4.0, 0);
      const banda = caja(g, 1.2, 0.18, 9.0, 0x3a3f46, -0.2, 3.4, -4.6); banda.rotation.x = 0.42;
      [-2.6, 0, 2.6].forEach(x => {
        cono(g, 0.35, 1.5, 1.8, 0x8a8f96, x, 2.6, -6.0);
        caja(g, 2.9, 0.9, 2.9, 0x9aa0a5, x, 3.9, -6.0);
        [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([px, pz]) => caja(g, 0.14, 3.4, 0.14, 0x6d7075, x + px, 1.7, -6.0 + pz));
      });
      caja(g, 2.2, 2.2, 1.8, 0xe6e2d8, 3.4, 1.2, 2.6);
      caja(g, 2.0, 0.7, 0.05, 0x23262b, 3.4, 1.6, 3.52);
    } },
  { id:'torreIluminacion', nombre:'Torre de iluminación', grupo:'Planta e instalaciones', w:2.2, d:2.2, h:9, color:'#f0b429', movil:false,
    desc:'Torre con reflectores para la iluminación nocturna de la obra: se encienden solas con el botón "Noche".',
    dibujar(g, c){
      caja(g, 1.8, 0.35, 1.8, 0x2b2f36, 0, 0.2, 0);
      caja(g, 0.28, 8.2, 0.28, c, 0, 4.4, 0);
      caja(g, 0.55, 0.55, 0.4, 0x565b62, 0, 1.1, 0.5);               // generador
      caja(g, 1.9, 0.14, 0.14, 0x565b62, 0, 8.4, 0);                 // travesaño
      [-0.7, -0.25, 0.25, 0.7].forEach(x => {
        const f = caja(g, 0.34, 0.28, 0.2, 0xfff3c4, x, 8.62, 0.14);
        f.rotation.x = 0.5;
        f.userData.esFocoReflector = true;
      });
      const luz = new THREE.PointLight(0xffe9b0, 0, 55, 1.4);        // apagada de día
      luz.position.set(0, 8.2, 1.4);
      luz.userData.esReflector = true;
      g.add(luz);
    } },
  { id:'transporteHorizontalLibre', nombre:'Transporte personalizado (horizontal)', grupo:'Transporte horizontal', w:2.2, d:5, h:2.4, color:'#4cae5b', movil:true,
    desc:'Vehículo horizontal genérico: ponle tu propio nombre, dimensiones y color, y asígnale rutas.',
    dibujar(g, c){
      caja(g, 2.0, 0.5, 4.6, 0x2b2f36, 0, 0.75, 0);
      caja(g, 2.0, 1.5, 1.5, c, 0, 1.7, 1.5);
      caja(g, 1.85, 0.7, 0.06, 0x9fc4e8, 0, 2.05, 2.28);
      caja(g, 2.1, 0.9, 2.6, c, 0, 1.4, -0.9);
      caja(g, 2.1, 0.12, 2.8, 0x8a8f96, 0, 1.05, -0.9);
      [1.5, -1.5].forEach(z => [-0.95, 0.95].forEach(x => rueda(g, x, 0.5, z, 0.5, 0.4)));
    } },
  { id:'transporteVerticalLibre', nombre:'Transporte personalizado (vertical)', grupo:'Transporte vertical', w:2.6, d:2.6, h:9, color:'#d9821b', movil:false,
    desc:'Elevador / plataforma vertical genérica: ponle tu propio nombre, dimensiones y color.',
    dibujar(g, c){
      caja(g, 2.4, 0.4, 2.4, 0x2b2f36, 0, 0.2, 0);
      [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(([x, z]) => caja(g, 0.14, 8.4, 0.14, c, x, 4.4, z));
      for (let y = 1.4; y < 8.4; y += 1.75){
        caja(g, 1.9, 0.1, 0.1, c, 0, y, -0.9); caja(g, 1.9, 0.1, 0.1, c, 0, y, 0.9);
        caja(g, 0.1, 0.1, 1.9, c, -0.9, y, 0); caja(g, 0.1, 0.1, 1.9, c, 0.9, y, 0);
      }
      caja(g, 1.7, 0.12, 1.7, 0xffd23e, 0, 3.6, 0);                  // plataforma
      [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]].forEach(([x, z]) => caja(g, 0.05, 1.0, 0.05, 0x23262b, x, 4.15, z));
      caja(g, 1.6, 0.05, 0.05, 0x23262b, 0, 4.6, -0.75); caja(g, 1.6, 0.05, 0.05, 0x23262b, 0, 4.6, 0.75);
      caja(g, 0.9, 0.6, 0.5, 0x565b62, 0, 8.7, 0);                   // motor superior
    } },
  { id:'siloCemento', nombre:'Silo de cemento', grupo:'Planta e instalaciones', w:3.2, d:3.2, h:11, color:'#d9dde0', movil:false,
    desc:'Silo vertical de cemento a granel: lo llena la pipa cementera y alimenta la planta de concreto.',
    dibujar(g, c){
      [[-1.05, -1.05], [1.05, -1.05], [-1.05, 1.05], [1.05, 1.05]].forEach(([x, z]) => caja(g, 0.18, 3.2, 0.18, 0x6d7075, x, 1.6, z));
      cilindro(g, 1.5, 6.0, c, 0, 7.0, 0);
      cono(g, 0.3, 1.5, 1.9, 0x8a8f96, 0, 3.05, 0);
      cono(g, 1.5, 0.2, 0.8, c, 0, 10.4, 0);
      caja(g, 0.12, 9.6, 0.35, 0x565b62, 1.62, 5.4, 0);
      cilindro(g, 0.11, 8.5, 0x8a8f96, -1.35, 5.2, -0.9);
    } }
];
function catalogoMaquina(id){ return CATALOGO_MAQUINAS.find(m => m.id === id) || CATALOGO_MAQUINAS[0]; }
function opcionesCatalogoMaquina(sel){
  const grupos = {};
  CATALOGO_MAQUINAS.forEach(m => { (grupos[m.grupo] = grupos[m.grupo] || []).push(m); });
  return Object.keys(grupos).map(gr =>
    '<optgroup label="' + esc(gr) + '">' +
      grupos[gr].map(m => '<option value="' + m.id + '"' + (m.id === sel ? ' selected' : '') + '>' + esc(m.nombre) + '</option>').join('') +
    '</optgroup>'
  ).join('');
}
function construirMaquina(def){
  const g = new THREE.Group();
  const item = catalogoMaquina(def.catalogoId);
  const inner = new THREE.Group();
  item.dibujar(inner, new THREE.Color(def.color).getHex());
  inner.scale.set(def.w / item.w, def.h / item.h, def.d / item.d);
  g.add(inner);
  g.userData.info = {
    dimensiones: def.w + ' × ' + def.d + ' m',
    altura: def.h + ' m',
    detalle: item.nombre + ' (' + item.grupo + ') — ' + item.desc +
      (def.movil ? ' · Equipo MÓVIL: créale una ruta con el botón "Rutas" para verlo recorrer la obra por las vías.'
                 : ' · Instalación fija: no se asigna a rutas.')
  };
  return g;
}

const FABRICAS = {
  espacio: construirEspacio, edificio: construirEdificio, malacate: construirMalacate,
  gruaTorre: construirGruaTorre, gruaPluma: construirGruaPluma, mueble: construirMueble,
  maquina: construirMaquina
};
const NOMBRE_TIPO = {
  espacio:'Espacio', edificio:'Edificio', malacate:'Malacate',
  gruaTorre:'Torre grúa', gruaPluma:'Grúa pluma', mueble:'Mueble', maquina:'Maquinaria'
};

/* ============ ELEMENTOS DE LA OBRA ============ */
const elementos = [];   // THREE.Group[]
let seleccionado = null;
let nivelMalacate = 0;  // altura compartida de las cabinas de malacate (0..1 del recorrido)

function numLim(v, def, min, max){
  v = parseFloat(String(v).replace(',', '.')); if (!isFinite(v)) v = def;
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
    rot: numLim(raw.rot, 0, -Math.PI*4, Math.PI*4),
    bloqueado: !!raw.bloqueado,
    colorPersonalizado: /^#[0-9a-f]{6}$/i.test(raw.colorPersonalizado || '') ? raw.colorPersonalizado : null
  };
  if (tipo === 'espacio'){
    d.w = numLim(raw.w, 10, 2, 90); d.d = numLim(raw.d, 8, 2, 70); d.h = numLim(raw.h, 2.5, 1, 14);
    d.color = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : '#3f7fbf';
    d.muros = raw.muros !== false; d.techo = raw.techo !== false;
    d.sistema = SISTEMAS[raw.sistema] ? raw.sistema : 'muros';
    d.muebles = normalizarMueblesInterior(raw.muebles, d.w, d.d);
  } else if (tipo === 'edificio'){
    d.w = numLim(raw.w, 20, 3, 90); d.d = numLim(raw.d, 12, 3, 70);
    d.pisos = Math.round(numLim(raw.pisos, 5, 1, 40)); d.hPiso = numLim(raw.hPiso, 2.65, 2, 5);
    d.sistema = SISTEMAS[raw.sistema] ? raw.sistema : 'aporticado';
  } else if (tipo === 'malacate'){
    d.mastil = numLim(raw.mastil, 30, 6, 80);
  } else if (tipo === 'gruaTorre'){
    d.mastil = numLim(raw.mastil, 30, 8, 90); d.brazo = numLim(raw.brazo, 40, 8, 90); d.radio = numLim(raw.radio, 35, 4, 90);
  } else if (tipo === 'gruaPluma'){
    d.brazo = numLim(raw.brazo, 30, 6, 80); d.angulo = numLim(raw.angulo, 45, 10, 80); d.radio = numLim(raw.radio, 25, 4, 80);
  } else if (tipo === 'mueble'){
    const item = CATALOGO_MUEBLES.find(m => m.id === raw.catalogoId) || CATALOGO_MUEBLES[0];
    d.catalogoId = item.id;
    d.w = numLim(raw.w, item.w, 0.2, 6); d.d = numLim(raw.d, item.d, 0.2, 6); d.h = numLim(raw.h, item.h, 0.1, 3.5);
    d.color = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : item.color;
  } else if (tipo === 'maquina'){
    const item = catalogoMaquina(raw.catalogoId);
    d.catalogoId = item.id;
    d.w = numLim(raw.w, item.w, 0.4, 30); d.d = numLim(raw.d, item.d, 0.4, 40); d.h = numLim(raw.h, item.h, 0.4, 30);
    d.color = /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : item.color;
    d.movil = raw.movil === undefined ? item.movil : !!raw.movil;
    if (item.id === 'plantaConcreto') d.metaM3 = numLim(raw.metaM3, 0, 0, 100000);
  }
  return d;
}
function crearElemento(raw){
  const def = normalizarDef(raw);
  const g = FABRICAS[def.tipo](def);
  g.userData.def = def;
  g.userData.tipo = def.tipo;
  g.userData.info.nombre = def.nombre;
  if (def.colorPersonalizado) aplicarColorLibre(g, def.colorPersonalizado);
  const et = crearEtiqueta(textoEtiqueta(def), anchoEtiquetaLibre());
  et.visible = etiquetasVisibles;
  et.position.y = (def.tipo === 'gruaTorre' ? def.mastil : def.tipo === 'edificio' ? def.pisos*def.hPiso :
                   def.tipo === 'malacate' ? def.mastil : def.tipo === 'gruaPluma' ? 6 :
                   def.tipo === 'mueble' ? def.h + 0.6 :
                   def.tipo === 'maquina' ? def.h + 1 : (def.h + 2)) + 3;
  g.add(et); g.userData.etiqueta = et;
  g.position.set(def.x, 0, def.z);
  g.rotation.y = def.rot;
  scene.add(g);
  elementos.push(g);
  refrescarSelectorUbicar();
  return g;
}
function eliminarElemento(g){
  const i = elementos.indexOf(g);
  if (i < 0) return;
  if (amueblando === g) cerrarAmoblar();
  if (manejando === g) manejando = null;   // no se guarda posición: el vehículo ya no existe
  // si estaba recorriendo una ruta, se baja de ella
  for (let k = rutasActivas.length - 1; k >= 0; k--){
    if (rutasActivas[k].g === g) rutasActivas.splice(k, 1);
  }
  if (seleccionado === g){ seleccionado = null; mostrarPanelVacio(); }
  g.traverse(n => { if (n.geometry) n.geometry.dispose(); });
  scene.remove(g);
  elementos.splice(i, 1);
  guardar('Eliminado: ' + g.userData.def.nombre);
  if (mostrarCotas) redibujarCotas2D();
  refrescarSelectorUbicar();
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
  raycaster.setFromCamera(puntero, camActiva());
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
  if (modo2D){
    // plano cenital con norte arriba: derecha = +x, abajo = +z
    const mpp = (2 * zoom2D) / innerHeight;   // metros por píxel
    camCtrl.target.x -= dx * mpp;
    camCtrl.target.z -= dy * mpp;
    return;
  }
  const derecha = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
  const frente = new THREE.Vector3().subVectors(camCtrl.target, camera.position);
  frente.y = 0; frente.normalize();
  camCtrl.target.addScaledVector(derecha, -dx * camCtrl.radius * 0.0013);
  camCtrl.target.addScaledVector(frente,  dy * camCtrl.radius * 0.0013);
}

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('pointerdown', e => {
  if (caminando) return;   // en modo caminar el mouse solo mira alrededor
  if (e.pointerType === 'touch'){
    punterosTactiles.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (punterosTactiles.size === 2){
      arrastrando = null; rotando = false; paneando = false; movido = 999;
      const [a, b] = [...punterosTactiles.values()];
      pinza = { dist0: Math.hypot(a.x-b.x, a.y-b.y), radio0: modo2D ? zoom2D : camCtrl.radius, cx:(a.x+b.x)/2, cy:(a.y+b.y)/2 };
      return;
    }
  }
  x0 = e.clientX; y0 = e.clientY; movido = 0;
  rayo(e);
  if (e.button === 2 || e.shiftKey){ paneando = true; return; }
  if (e.button !== 0) return;
  // con la herramienta Vía/Ruta/Regla activa, el clic izquierdo marca puntos en el terreno
  if (herramienta){
    movido = 999;
    const p = puntoSuelo();
    if (p) clicHerramienta(p);
    return;
  }
  // amoblando un espacio: el clic izquierdo coloca o arrastra muebles DENTRO de él
  if (amueblando){
    const piezas = amueblando.children.filter(c => c.userData.esMuebleInterior);
    const hitsM = raycaster.intersectObjects(piezas, true);
    if (hitsM.length){
      let obj = hitsM[0].object;
      while (obj && !obj.userData.esMuebleInterior) obj = obj.parent;
      arrastrandoInterior = obj;
    } else {
      arrastrandoInterior = null;
    }
    return;
  }
  const hits = raycaster.intersectObjects(elementos, true);
  if (hits.length){
    const raiz = raizElemento(hits[0].object);
    // bloqueado: no se arrastra, pero el clic corto sí lo selecciona (pointerup)
    if (raiz && !raiz.userData.def.bloqueado){ arrastrando = raiz; return; }
    if (raiz) return;
  }
  if (modo2D) paneando = true;   // en el plano 2D arrastrar en vacío desplaza el plano
  else rotando = true;
});
renderer.domElement.addEventListener('pointermove', e => {
  if (caminando) return;
  if (e.pointerType === 'touch' && punterosTactiles.has(e.pointerId)){
    punterosTactiles.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pinza && punterosTactiles.size >= 2){
      const [a, b] = [...punterosTactiles.values()];
      const dist = Math.hypot(a.x-b.x, a.y-b.y);
      if (modo2D) zoom2D = Math.min(400, Math.max(12, pinza.radio0 * (pinza.dist0 / Math.max(dist,1))));
      else camCtrl.radius = Math.min(560, Math.max(12, pinza.radio0 * (pinza.dist0 / Math.max(dist,1))));
      const cx = (a.x+b.x)/2, cy = (a.y+b.y)/2;
      moverCamaraPantalla(cx - pinza.cx, cy - pinza.cy);
      pinza.cx = cx; pinza.cy = cy; return;
    }
  }
  const dx = e.clientX - x0, dy = e.clientY - y0;
  movido += Math.abs(dx) + Math.abs(dy);
  x0 = e.clientX; y0 = e.clientY;
  if (herramienta && !arrastrando && !paneando && punterosTactiles.size < 2){
    rayo(e);
    const p = puntoSuelo();
    if (p) actualizarPreviewHerramienta(p);
  }
  if (arrastrandoInterior){
    rayo(e);
    const p = puntoSuelo();
    if (p){
      const d = amueblando.userData.def;
      const loc = mundoALocalRoom(p, d);
      const hw = d.w / 2 - 0.15, hd = d.d / 2 - 0.15;
      loc.x = Math.min(hw, Math.max(-hw, loc.x));
      loc.z = Math.min(hd, Math.max(-hd, loc.z));
      arrastrandoInterior.position.set(loc.x, arrastrandoInterior.position.y, loc.z);
      const idx = arrastrandoInterior.userData.muebleIdx;
      if (d.muebles && d.muebles[idx]){ d.muebles[idx].x = red2(loc.x); d.muebles[idx].z = red2(loc.z); }
    }
    return;
  }
  if (arrastrando){
    rayo(e);
    const p = puntoSuelo();
    if (p){
      arrastrando.position.set(p.x, 0, p.z);
      arrastrando.userData.def.x = Math.round(p.x*100)/100;
      arrastrando.userData.def.z = Math.round(p.z*100)/100;
      if (seleccionado === arrastrando) refrescarUbic();
      if (mostrarCotas && performance.now() - ultimaActualizacionCotas > 120){
        ultimaActualizacionCotas = performance.now();
        redibujarCotas2D();
      }
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
  if (caminando) return;
  if (e.pointerType === 'touch'){
    punterosTactiles.delete(e.pointerId);
    if (punterosTactiles.size < 2) pinza = null;
  }
  if (amueblando){
    const eraInterior = arrastrandoInterior;
    arrastrandoInterior = null;
    if (eraInterior){
      guardar();
    } else if (movido < 6 && e.button === 0){
      rayo(e);
      const piezas = amueblando.children.filter(c => c.userData.esMuebleInterior);
      const hitsM = raycaster.intersectObjects(piezas, true);
      if (hitsM.length){
        let obj = hitsM[0].object;
        while (obj && !obj.userData.esMuebleInterior) obj = obj.parent;
        seleccionarMuebleInterior(obj);
      } else {
        const p = puntoSuelo();
        if (p) clicAmoblar(p);
      }
    }
    return;
  }
  const eraArrastre = arrastrando;
  arrastrando = null; rotando = false; paneando = false;
  if (movido < 6 && e.button === 0 && !herramienta){
    rayo(e);
    const hits = raycaster.intersectObjects(elementos, true);
    if (hits.length){ seleccionar(raizElemento(hits[0].object)); }
    else if (!seleccionarViaORuta()){
      seleccionado = null; actualizarTinte(null); mostrarPanelVacio(); elementos.forEach(actualizarTinte);
    }
  } else if (eraArrastre){
    guardar('Movido: ' + eraArrastre.userData.def.nombre);
    // aviso si el elemento quedó atravesado sobre una vía
    const d = eraArrastre.userData.def;
    if (typeof elementoSobreVia === 'function' && elementoSobreVia(eraArrastre)){
      avisar('Ojo: "' + d.nombre + '" quedó sobre una vía — los vehículos no podrán pasar por ahí');
    }
    if (mostrarCotas) redibujarCotas2D();
  }
}
renderer.domElement.addEventListener('pointerup', finPointer);
renderer.domElement.addEventListener('pointercancel', e => { punterosTactiles.delete(e.pointerId); if (punterosTactiles.size < 2) pinza = null; });
renderer.domElement.addEventListener('wheel', e => {
  if (caminando) return;
  if (modo2D){ zoom2D = Math.min(400, Math.max(12, zoom2D * (1 + e.deltaY * 0.001))); return; }
  camCtrl.radius = Math.min(560, Math.max(12, camCtrl.radius * (1 + e.deltaY * 0.001)));
}, { passive:true });

/* ============ PANEL DE OBRA (3 pestañas: Selección / Modificar / Ficha técnica,
   la misma estructura del panel del proyecto Bambú) ============ */
const pTitulo = document.getElementById('pTitulo');
const pBody = document.getElementById('pInfoGeneral');   // pestaña Selección
const pMod = document.getElementById('pModificar');      // pestaña Modificar
const pFic = document.getElementById('pFichaTecnica');      // pestaña Ficha técnica
function mostrarTabLibre(nombre){
  document.querySelectorAll('#panelTabs .tabBtn').forEach(b => b.classList.toggle('activo', b.dataset.tab === nombre));
  document.querySelectorAll('#panel .panelTab').forEach(t => t.classList.toggle('activo', t.dataset.tab === nombre));
}
/* escribe las 3 pestañas de una vez (mod/fic opcionales) y vuelve a "Selección" */
function panelSel(titulo, selHtml, modHtml, ficHtml){
  pTitulo.textContent = titulo;
  pBody.className = '';
  pBody.innerHTML = selHtml;
  pMod.innerHTML = modHtml || '<div class="desc">Selecciona un elemento en la obra para bloquearlo, girarlo, renombrarlo, cambiar su color o eliminarlo.</div>';
  pFic.innerHTML = ficHtml || '<div class="desc">Selecciona un elemento en la obra para ver su ficha técnica: dimensiones, material, cerramiento y aforo.</div>';
  mostrarTabLibre('sel');
}
function mostrarPanelVacio(){
  const habiaSel = selVia !== null || selRuta !== null;
  selVia = null; selRuta = null;
  if (habiaSel){ redibujarVias(); redibujarRutas(); }
  const card = (k, v) => v ? '<div class="bimCard"><span>' + k + '</span><b>' + esc(v) + '</b></div>' : '';
  let selHtml;
  if (fichaCompleta){
    const m2 = Math.round(loteAreaM2());
    selHtml =
      '<div class="bimGrid">' +
        card('Ubicación', ficha.ubicacion) +
        card('Torres', ficha.torres) +
        card('Apartamentos', ficha.apartamentos) +
        card('Niveles', ficha.niveles) +
        card('Altura', ficha.alturaTxt) +
        card('Lote', (loteEsLibre() ? 'Perímetro libre' : ficha.loteLargo + ' × ' + ficha.loteAncho + ' m') + ' ≈ ' + m2.toLocaleString('es-CO') + ' m²') +
        card('Fase actual', ficha.fase) +
        card('Personal en pico', ficha.personal) +
        card('Cerramiento', cerrCfg.activo
          ? ((MATERIALES_CERR[cerrCfg.material] || {}).nombre || '') + ' · ' + cerrCfg.altura + ' m'
          : 'Sin cerramiento') +
      '</div>' +
      '<button onclick="abrirFicha()">' + ic('ficha') + 'Modificar ficha técnica</button>' +
      '<div class="desc">Usa <b class="txtAcento">Agregar</b> para zonas, edificios y maquinaria; ' +
      '<b class="txtAcento">Vías</b> y <b class="txtAcento">Rutas</b> para el tránsito de los vehículos.</div>';
  } else {
    selHtml = '<div class="desc">Empieza <b class="txtAcento">diligenciando la ficha técnica</b> con los m² de tu terreno ' +
      'y los datos generales; luego usa <b class="txtAcento">Agregar</b> para crear espacios, edificios y maquinaria, ' +
      'y las herramientas <b class="txtAcento">Vías</b> y <b class="txtAcento">Rutas</b> para el tránsito de los vehículos.</div>' +
      '<button onclick="abrirFicha()">' + ic('ficha') + 'Diligenciar ficha técnica</button>';
  }
  panelSel(fichaCompleta ? (ficha.nombre || 'Panel de obra') : 'Panel de obra', selHtml);
}
/* pestaña "Selección": qué es el elemento */
function renderSeleccionLibre(g){
  const d = g.userData.def, info = g.userData.info;
  return '<table>' +
    '<tr><td>Tipo</td><td>' + NOMBRE_TIPO[d.tipo] + (d.bloqueado ? ' · bloqueado' : '') + '</td></tr>' +
    '<tr><td>Dimensiones</td><td>' + info.dimensiones + '</td></tr>' +
    '<tr><td>' + (d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma' ? 'Giro' : 'Altura') + '</td><td>' + info.altura + '</td></tr>' +
    '<tr id="libreUbic"><td>Ubicación</td><td>' + ubicTexto(g) + '</td></tr>' +
    '</table>' +
    '<div class="desc">' + (d.descripcion ? esc(d.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') + info.detalle + '</div>';
}
/* pestaña "Modificar": bloquear, girar, renombrar, recolorear, editar, eliminar */
function renderModificarLibre(g){
  const d = g.userData.def;
  return '<button class="btnBloqueo ' + (d.bloqueado ? 'bloqueado' : 'libre') + '" onclick="toggleBloqueoLibre()">' +
      ic(d.bloqueado ? 'candadoAbierto' : 'candado') +
      (d.bloqueado ? 'Bloqueado — toca para desbloquear' : 'Libre — toca para bloquear') + '</button>' +
    '<div style="display:flex; gap:6px; margin-top:8px">' +
      '<button style="flex:1; margin:0" onclick="girarSel(-1)">' + ic('girarIzq') + 'Girar 45°</button>' +
      '<button style="flex:1; margin:0" onclick="girarSel(1)">' + ic('girarDer') + 'Girar 45°</button>' +
    '</div>' +
    '<div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--borde)">' +
      '<label style="margin-top:0">Nombre' +
        '<div style="display:flex; gap:6px; margin-top:3px">' +
          '<input id="modNombreLibre" maxlength="40" value="' + esc(d.nombre) + '" style="flex:1; margin:0">' +
          '<button style="width:auto; margin:0" title="Aplicar" onclick="renombrarSelLibre()">' + ic('check') + '</button>' +
        '</div>' +
      '</label>' +
      '<label>Color' +
        '<div style="display:flex; gap:6px; margin-top:3px; align-items:center">' +
          '<input type="color" id="modColorLibre" style="width:42px; margin:0" value="' + (colorActualHexLibre(g) || '#3f7fbf') + '">' +
          '<button style="width:auto; margin:0" title="Aplicar" onclick="recolorearSelLibre()">' + ic('check') + ' Aplicar</button>' +
        '</div>' +
      '</label>' +
      (d.catalogoId === 'plantaConcreto'
        ? '<label>Cantidad a producir (m³)' +
            '<div style="display:flex; gap:6px; margin-top:3px">' +
              '<input type="number" id="modMetaM3Libre" min="0" max="100000" step="1" value="' + (d.metaM3 || 0) + '" style="flex:1; margin:0">' +
              '<button style="width:auto; margin:0" title="Aplicar" onclick="cambiarMetaM3Libre()">' + ic('check') + '</button>' +
            '</div>' +
            '<small class="txtSuave">A ' + TASA_CONCRETO_DIA + ' m³/día (30 m³/h × 8 h)' +
              (d.metaM3 > 0 ? ' → ' + Math.ceil(d.metaM3 / TASA_CONCRETO_DIA) + ' día(s)' : '') + '</small>' +
          '</label>'
        : '') +
    '</div>' +
    '<button onclick="editarSel()">' + ic('editar') + 'Editar dimensiones</button>' +
    (d.tipo === 'espacio'
      ? '<button onclick="abrirAmoblar()">' + ic('silla') + 'Amoblar por dentro' + ((d.muebles || []).length ? ' (' + d.muebles.length + ')' : '') + '</button>'
      : '') +
    '<button onclick="programarCamionZonaLibre(seleccionado.userData.def.nombre)">' + ic('camion') + 'Programar camión a esta zona</button>' +
    '<button class="btnEliminar" onclick="eliminarSel()">' + ic('basura') + 'Eliminar de la obra</button>';
}
/* pestaña "Ficha técnica": dimensiones, material, cerramiento, aforo (mismas
   filas del panel del proyecto Bambú, con datos según el tipo de elemento) */
const AFORO_MAQ = {
  volquetaDobletroque: 'Conductor: 1 persona · capacidad ≈ 14 m³',
  excavadoraCat320: 'Operador: 1 persona en cabina',
  minicargadorCat262: 'Operador: 1 persona',
  carretillaBuggy: 'Operario: 1 persona · carga ≈ 90 kg',
  camionPlanchon: 'Conductor: 1 persona · carga ≈ 12 t',
  pipaCementera: 'Conductor: 1 persona · ≈ 30 t de cemento',
  pilotadoraRotativa: 'Operador: 1 persona',
  bombaEstacionaria: 'Operarios: 2 personas',
  plantaConcreto: 'Operarios: 2-3 personas en planta',
  siloCemento: 'No aplica (almacenamiento)',
  torreIluminacion: 'No aplica (iluminación nocturna)',
  transporteHorizontalLibre: 'Operario: 1 persona',
  transporteVerticalLibre: 'Según la plataforma'
};
function renderFichaTecnicaLibre(g){
  const d = g.userData.def, info = g.userData.info;
  let material = info.detalle, cerr = '—', aforo = '—', extra = '';
  if (d.tipo === 'espacio'){
    const area = Math.round(d.w * d.d);
    const sis = SISTEMAS[d.sistema] || SISTEMAS.muros;
    material = d.muros ? ('Sistema ' + sis.nombre + ' — ' + sis.desc) : ('Espacio creado por el equipo — ' + d.w + ' × ' + d.d + ' m ≈ ' + area + ' m²');
    cerr = d.muros ? ('Con muros' + (d.techo ? ' y techo' : ', sin techo')) : (d.techo ? 'Cubierta abierta' : 'Área demarcada, sin cerramiento');
    aforo = d.muros ? (Math.max(1, Math.floor(area / 2)) + ' personas (estimado: 2 m²/persona)') : '—';
  } else if (d.tipo === 'edificio'){
    cerr = 'Fachada según sistema: ' + ((SISTEMAS[d.sistema] || {}).nombre || d.sistema);
  } else if (d.tipo === 'maquina'){
    const item = catalogoMaquina(d.catalogoId);
    material = item.desc;
    cerr = 'Equipo de obra ' + (d.movil ? 'móvil' : 'fijo') + ' — ' + item.grupo;
    aforo = AFORO_MAQ[d.catalogoId] || 'Operario: 1 persona';
    extra = '<tr><td>Movilidad</td><td>' + (d.movil
      ? 'Móvil — asígnale una ruta con el botón "Rutas"'
      : 'Instalación fija (no se asigna a rutas)') + '</td></tr>';
    if (item.id === 'plantaConcreto'){
      const dias = d.metaM3 > 0 ? Math.ceil(d.metaM3 / TASA_CONCRETO_DIA) : 0;
      extra += '<tr><td>Producción</td><td>' + (d.metaM3 > 0
        ? d.metaM3 + ' m³ a ' + TASA_CONCRETO_DIA + ' m³/día (30 m³/h × 8 h) → ' + dias + ' día(s)'
        : 'Sin cantidad definida — ponla en la pestaña "Modificar"') + '</td></tr>';
    }
  } else if (d.tipo === 'malacate' || d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma'){
    aforo = 'Operador: 1 persona';
    cerr = 'Equipo de izaje — señaliza su zona de influencia';
  }
  return '<table>' +
    '<tr><td>Dimensiones</td><td>' + info.dimensiones + '</td></tr>' +
    '<tr><td>Altura</td><td>' + info.altura + '</td></tr>' +
    '<tr><td>Material</td><td>' + material + '</td></tr>' +
    '<tr><td>Cerramiento</td><td>' + cerr + '</td></tr>' +
    '<tr><td>Aforo máximo</td><td>' + aforo + '</td></tr>' + extra +
    '</table>';
}
function seleccionar(g){
  if (!g) return;
  const habiaSel = selVia !== null || selRuta !== null;
  selVia = null; selRuta = null;
  if (habiaSel){ redibujarVias(); redibujarRutas(); }
  const anterior = seleccionado;
  seleccionado = g;
  actualizarTinte(anterior); actualizarTinte(g);
  pTitulo.textContent = g.userData.def.nombre;
  pBody.className = '';
  pBody.innerHTML = renderSeleccionLibre(g);
  pMod.innerHTML = renderModificarLibre(g);
  pFic.innerHTML = renderFichaTecnicaLibre(g);
  // salta a "Selección" SOLO cuando cambia el objeto elegido, nunca al
  // refrescar las pestañas tras bloquear/renombrar (igual que en el Bambú)
  if (g !== anterior) mostrarTabLibre('sel');
}
/* ---- acciones de la pestaña Modificar ---- */
function toggleBloqueoLibre(){
  if (!seleccionado) return;
  const d = seleccionado.userData.def;
  d.bloqueado = !d.bloqueado;
  guardar((d.bloqueado ? 'Bloqueado: ' : 'Desbloqueado: ') + d.nombre);
  seleccionar(seleccionado);
  mostrarTabLibre('mod');
  avisar(d.bloqueado ? '"' + d.nombre + '" bloqueado: ya no se puede arrastrar' : '"' + d.nombre + '" desbloqueado');
}
function colorActualHexLibre(g){
  let hex = null;
  g.traverse(n => { if (!hex && n.isMesh && !n.isSprite && n.material && n.material.color) hex = '#' + n.material.color.getHexString(); });
  return hex;
}
/* repinta TODO el grupo con un único color (menos etiquetas), como
   aplicarColorATraves() del proyecto Bambú */
function aplicarColorLibre(g, hex){
  let color;
  try { color = new THREE.Color(hex); } catch (e) { return; }
  g.traverse(n => {
    if (n.isMesh && !n.isSprite && n.material){
      (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => { if (m.color) m.color.copy(color); });
    }
  });
}
function renombrarSelLibre(){
  if (!seleccionado) return;
  const input = document.getElementById('modNombreLibre');
  if (!input) return;
  const actual = seleccionado.userData.def.nombre;
  let nuevo = String(input.value || '').trim().slice(0, 40);
  if (!nuevo || nuevo === actual) return;
  const base = nuevo;
  let n = 2;
  while (elementos.some(g => g !== seleccionado && g.userData.def.nombre === nuevo)) nuevo = base + ' ' + (n++);
  seleccionado.userData.def.nombre = nuevo;
  seleccionado.userData.info.nombre = nuevo;
  regenerarEtiquetaLibre(seleccionado);
  // las rutas y camiones que usaban/apuntaban a este nombre siguen apuntando al mismo
  rutas.forEach(r => { if (r.vehiculo === actual) r.vehiculo = nuevo; });
  camionesLibre.forEach(c => { if (c.zona === actual) c.zona = nuevo; });
  guardar('Renombrado: ' + actual + ' → ' + nuevo);
  seleccionar(seleccionado);
  mostrarTabLibre('mod');
  refrescarSelectorUbicar();
  avisar('Renombrado a "' + nuevo + '"');
}
function recolorearSelLibre(){
  if (!seleccionado) return;
  const input = document.getElementById('modColorLibre');
  if (!input) return;
  const d = seleccionado.userData.def;
  aplicarColorLibre(seleccionado, input.value);
  d.colorPersonalizado = input.value;
  if (d.color !== undefined) d.color = input.value;
  guardar('Color cambiado: ' + d.nombre);
  avisar('Color actualizado');
}
/* cantidad de m³ a producir en la planta de concreto: calcula los días
   necesarios a la tasa fija de la planta (30 m³/h × 8 h = 240 m³/día) */
function cambiarMetaM3Libre(){
  if (!seleccionado || seleccionado.userData.def.catalogoId !== 'plantaConcreto') return;
  const input = document.getElementById('modMetaM3Libre');
  if (!input) return;
  const d = seleccionado.userData.def;
  d.metaM3 = numLim(input.value, d.metaM3 || 0, 0, 100000);
  guardar('Producción de concreto: ' + d.metaM3 + ' m³');
  seleccionar(seleccionado);
  mostrarTabLibre('mod');
  const dias = d.metaM3 > 0 ? Math.ceil(d.metaM3 / TASA_CONCRETO_DIA) : 0;
  avisar(d.metaM3 > 0 ? d.metaM3 + ' m³ programados — tomará ' + dias + ' día(s) a este ritmo' : 'Cantidad borrada');
}
/* reconstruye la etiqueta flotante conservando posición y visibilidad */
/* en el Plano 2D el texto se ve más pequeño en pantalla (la cámara ortho
   suele abarcar todo el lote), así que las etiquetas y las cotas crecen un
   poco para seguir siendo legibles desde arriba */
function anchoEtiquetaLibre(){ return modo2D ? 18 : 12; }
function regenerarEtiquetaLibre(g){
  const vieja = g.userData.etiqueta;
  const nueva = crearEtiqueta(textoEtiqueta(g.userData.def), anchoEtiquetaLibre());
  if (vieja){
    nueva.position.copy(vieja.position);
    nueva.visible = vieja.visible;
    g.remove(vieja);
    if (vieja.material.map) vieja.material.map.dispose();
    vieja.material.dispose();
  }
  g.add(nueva);
  g.userData.etiqueta = nueva;
}
function ubicTexto(g){ return 'x: ' + Math.round(g.position.x) + ' m · z: ' + Math.round(g.position.z) + ' m'; }
function refrescarUbic(){ const u = document.getElementById('libreUbic'); if (u) u.lastElementChild.textContent = ubicTexto(seleccionado); }
function girarSel(dir){
  if (!seleccionado) return;
  if (seleccionado.userData.def.bloqueado){ avisar('Elemento bloqueado: desbloquéalo para girarlo'); return; }
  seleccionado.rotation.y += dir * Math.PI/4;
  seleccionado.userData.def.rot = seleccionado.rotation.y;
  guardar('Girado: ' + seleccionado.userData.def.nombre);
  if (mostrarCotas) redibujarCotas2D();
  avisar(seleccionado.userData.def.nombre + ' girado');
}
function eliminarSel(){ if (seleccionado) eliminarElemento(seleccionado); }

/* ============ VENTANA DE CREACIÓN + LISTA ============
   Dos puertas de entrada, como en el proyecto Bambú: "Espacios" (espacio /
   edificio, con su sistema estructural) y "Equipos" (maquinaria de
   transporte vertical/horizontal, grúas, malacate y mobiliario). Ambas
   abren la MISMA ventana; solo cambia qué tipos ofrece el selector. */
let modoVentana = 'espacios';   // 'espacios' | 'equipos' — filtra el <select id="libTipo">
function opcionesTipoVentana(){
  if (modoVentana === 'equipos'){
    return '<optgroup label="Maquinaria y grúas">' +
        '<option value="maquina">Maquinaria / transporte</option>' +
        '<option value="malacate">Malacate</option>' +
        '<option value="gruaTorre">Torre grúa</option>' +
        '<option value="gruaPluma">Grúa pluma</option>' +
      '</optgroup>' +
      '<optgroup label="Mobiliario">' +
        '<option value="mueble">Mueble</option>' +
      '</optgroup>';
  }
  return '<option value="espacio">Espacio</option><option value="edificio">Edificio</option>';
}
function abrirVentanaEspacios(){
  modoVentana = 'espacios';
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Crear espacios y edificios';
  renderVentana();
  document.getElementById('libreOverlay').style.display = 'flex';
}
function abrirVentanaEquipos(){
  modoVentana = 'equipos';
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Crear equipos y maquinaria';
  renderVentana();
  document.getElementById('libreOverlay').style.display = 'flex';
}
function renderVentana(){
  const filas = elementos.length
    ? elementos.map((g, i) => {
        const d = g.userData.def;
        return '<div class="planoFila">' +
          '<span class="planoNom">' + ic(d.tipo === 'edificio' ? 'edificio' : (d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma') ? 'grua' : d.tipo === 'mueble' ? 'silla' : d.tipo === 'maquina' ? 'camion' : 'caja') +
            ' <b class="txtFuerte">' + esc(d.nombre) + '</b> <small>· ' + NOMBRE_TIPO[d.tipo] + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Editar dimensiones" onclick="editarLibreIdx(' + i + ')">' + ic('editar') + '</button> ' +
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
        '<select id="libTipo" onchange="cambiarTipo()">' + opcionesTipoVentana() + '</select>' +
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
      '<label><input type="checkbox" id="libTecho" checked> Techo</label>' +
      '<label style="width:100%">Sistema estructural <select id="libSistemaEsp" style="flex:1">' + opcionesSistema('muros') + '</select></label>';
  } else if (t === 'edificio'){
    html = num('libAncho','Ancho (m)',20,3,90,0.1) + num('libFondo','Fondo (m)',12,3,70,0.1) +
      num('libPisos','Pisos',5,1,40,1) + num('libHPiso','Entrepiso (m)',2.65,2,5,0.05) +
      '<label style="width:100%">Sistema estructural <select id="libSistema" style="flex:1">' + opcionesSistema('aporticado') + '</select></label>';
  } else if (t === 'malacate'){
    html = num('libMastil','Altura (m)',30,6,80,0.5);
  } else if (t === 'gruaTorre'){
    html = num('libMastil','Altura mástil (m)',30,8,90,0.5) + num('libBrazo','Largo del brazo (m)',40,8,90,0.5) +
      num('libRadio','Radio de giro (m)',35,4,90,0.5);
  } else if (t === 'gruaPluma'){
    html = num('libBrazo','Largo de la pluma (m)',30,6,80,0.5) + num('libAngulo','Inclinación (°)',45,10,80,1) +
      num('libRadio','Radio de giro (m)',25,4,80,0.5);
  } else if (t === 'mueble'){
    const it0 = CATALOGO_MUEBLES[0];
    html = '<label style="width:100%">Pieza <select id="libMuebleId" style="flex:1" onchange="rellenarCamposMueble()">' + opcionesCatalogoMueble(it0.id) + '</select></label>' +
      num('libAncho','Ancho (m)',it0.w,0.2,6,0.05) + num('libFondo','Fondo (m)',it0.d,0.2,6,0.05) + num('libAlto','Altura (m)',it0.h,0.1,3.5,0.05) +
      '<label>Color <input type="color" id="libColor" value="' + it0.color + '"></label>';
  } else if (t === 'maquina'){
    const it0 = CATALOGO_MAQUINAS[0];
    html = '<label style="width:100%">Equipo <select id="libMaqId" style="flex:1" onchange="rellenarCamposMaquina()">' + opcionesCatalogoMaquina(it0.id) + '</select></label>' +
      num('libAncho','Ancho (m)',it0.w,0.4,30,0.1) + num('libFondo','Largo (m)',it0.d,0.4,40,0.1) + num('libAlto','Altura (m)',it0.h,0.4,30,0.1) +
      '<label>Color <input type="color" id="libColor" value="' + it0.color + '"></label>' +
      '<label><input type="checkbox" id="libMovil"' + (it0.movil ? ' checked' : '') + '> Móvil (se le puede asignar una ruta)</label>';
  }
  campos.innerHTML = html;
  const ph = { espacio:'Espacio', edificio:'Edificio', malacate:'Malacate', gruaTorre:'Torre grúa', gruaPluma:'Grúa pluma', mueble:'Mueble', maquina:'Maquinaria' };
  document.getElementById('libNombre').placeholder = 'Nombre (ej: ' + ph[t] + ')';
}
function rellenarCamposMueble(){
  const item = CATALOGO_MUEBLES.find(m => m.id === document.getElementById('libMuebleId').value) || CATALOGO_MUEBLES[0];
  document.getElementById('libAncho').value = item.w;
  document.getElementById('libFondo').value = item.d;
  document.getElementById('libAlto').value = item.h;
  document.getElementById('libColor').value = item.color;
}
function rellenarCamposMaquina(){
  const item = catalogoMaquina(document.getElementById('libMaqId').value);
  document.getElementById('libAncho').value = item.w;
  document.getElementById('libFondo').value = item.d;
  document.getElementById('libAlto').value = item.h;
  document.getElementById('libColor').value = item.color;
  document.getElementById('libMovil').checked = item.movil;
  document.getElementById('libNombre').placeholder = 'Nombre (ej: ' + item.nombre + ')';
}
function valNum(id){ const el = document.getElementById(id); return el ? el.value : undefined; }
function agregarElemento(){
  const tipo = document.getElementById('libTipo').value;
  // las máquinas heredan el nombre del catálogo ("Volqueta dobletroque"…)
  // si el usuario no escribe uno — mucho más claro que "Maquinaria 2"
  const nombreBase = document.getElementById('libNombre').value ||
    (tipo === 'maquina' ? catalogoMaquina((document.getElementById('libMaqId') || {}).value).nombre : NOMBRE_TIPO[tipo]);
  const raw = {
    tipo,
    nombre: nombreDisponible(nombreBase),
    descripcion: (document.getElementById('libDesc').value || '').trim().slice(0, 400)
  };
  const [x, z] = posicionLibre(); raw.x = x; raw.z = z;
  if (tipo === 'espacio'){
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.h = valNum('libAlto');
    raw.color = valNum('libColor'); raw.muros = document.getElementById('libMuros').checked; raw.techo = document.getElementById('libTecho').checked;
    raw.sistema = (document.getElementById('libSistemaEsp') || {}).value;
  } else if (tipo === 'edificio'){
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.pisos = valNum('libPisos'); raw.hPiso = valNum('libHPiso');
    raw.sistema = (document.getElementById('libSistema') || {}).value;
  } else if (tipo === 'malacate'){
    raw.mastil = valNum('libMastil');
  } else if (tipo === 'gruaTorre'){
    raw.mastil = valNum('libMastil'); raw.brazo = valNum('libBrazo'); raw.radio = valNum('libRadio');
  } else if (tipo === 'gruaPluma'){
    raw.brazo = valNum('libBrazo'); raw.angulo = valNum('libAngulo'); raw.radio = valNum('libRadio');
  } else if (tipo === 'mueble'){
    raw.catalogoId = (document.getElementById('libMuebleId') || {}).value;
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.h = valNum('libAlto'); raw.color = valNum('libColor');
  } else if (tipo === 'maquina'){
    raw.catalogoId = (document.getElementById('libMaqId') || {}).value;
    raw.w = valNum('libAncho'); raw.d = valNum('libFondo'); raw.h = valNum('libAlto'); raw.color = valNum('libColor');
    raw.movil = !!(document.getElementById('libMovil') || {}).checked;
  }
  const g = crearElemento(raw);
  guardar('Creado: ' + g.userData.def.nombre);
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, g.position.z, 70);
  if (mostrarCotas) redibujarCotas2D();
  avisar(NOMBRE_TIPO[tipo] + ' "' + g.userData.def.nombre + '" creado — arrástralo para ubicarlo');
}
function irAElemIdx(i){
  const g = elementos[i]; if (!g) return;
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(g); irA(g.position.x, g.position.z, 70);
}
function eliminarElemIdx(i){ if (elementos[i]) eliminarElemento(elementos[i]); }

/* ---- editar dimensiones (y nombre/descripción) de un elemento creado ----
   Reconstruye el elemento con las medidas nuevas. La posición y la rotación se
   conservan porque el def las mantiene actualizadas (arrastre y giro). */
let editandoLibre = null;
function editarSel(){ if (seleccionado) abrirEditorLibre(seleccionado); }
function editarLibreIdx(i){ if (elementos[i]) abrirEditorLibre(elementos[i]); }
function abrirEditorLibre(g){
  editandoLibre = g;
  document.getElementById('libreVentTitulo').textContent = 'Editar dimensiones';
  renderEditorLibre(g.userData.def);
  document.getElementById('libreOverlay').style.display = 'flex';
}
function renderEditorLibre(d){
  const num = (id, lbl, val, min, max, step) =>
    '<label>' + lbl + ' <input type="number" id="' + id + '" value="' + val + '" min="' + min + '" max="' + max + '" step="' + step + '" style="width:70px"></label>';
  let campos = '';
  if (d.tipo === 'espacio'){
    campos = num('edAncho','Ancho (m)',d.w,2,90,0.1) + num('edFondo','Fondo (m)',d.d,2,70,0.1) + num('edAlto','Altura (m)',d.h,1,14,0.1) +
      '<label>Color <input type="color" id="edColor" value="' + (d.color || '#3f7fbf') + '"></label>' +
      '<label><input type="checkbox" id="edMuros"' + (d.muros ? ' checked' : '') + '> Muros</label>' +
      '<label><input type="checkbox" id="edTecho"' + (d.techo ? ' checked' : '') + '> Techo</label>' +
      '<label style="width:100%">Sistema estructural <select id="edSistemaEsp" style="flex:1">' + opcionesSistema(d.sistema || 'muros') + '</select></label>';
  } else if (d.tipo === 'edificio'){
    campos = num('edAncho','Ancho (m)',d.w,3,90,0.1) + num('edFondo','Fondo (m)',d.d,3,70,0.1) +
      num('edPisos','Pisos',d.pisos,1,40,1) + num('edHPiso','Entrepiso (m)',d.hPiso,2,5,0.05) +
      '<label style="width:100%">Sistema estructural <select id="edSistema" style="flex:1">' + opcionesSistema(d.sistema || 'aporticado') + '</select></label>';
  } else if (d.tipo === 'malacate'){
    campos = num('edMastil','Altura (m)',d.mastil,6,80,0.5);
  } else if (d.tipo === 'gruaTorre'){
    campos = num('edMastil','Altura mástil (m)',d.mastil,8,90,0.5) + num('edBrazo','Largo del brazo (m)',d.brazo,8,90,0.5) +
      num('edRadio','Radio de giro (m)',d.radio,4,90,0.5);
  } else if (d.tipo === 'gruaPluma'){
    campos = num('edBrazo','Largo de la pluma (m)',d.brazo,6,80,0.5) + num('edAngulo','Inclinación (°)',d.angulo,10,80,1) +
      num('edRadio','Radio de giro (m)',d.radio,4,80,0.5);
  } else if (d.tipo === 'mueble'){
    campos = '<label style="width:100%">Pieza <select id="edMuebleId" style="flex:1">' + opcionesCatalogoMueble(d.catalogoId) + '</select></label>' +
      num('edAncho','Ancho (m)',d.w,0.2,6,0.05) + num('edFondo','Fondo (m)',d.d,0.2,6,0.05) + num('edAlto','Altura (m)',d.h,0.1,3.5,0.05) +
      '<label>Color <input type="color" id="edColor" value="' + (d.color || '#5c7290') + '"></label>';
  } else if (d.tipo === 'maquina'){
    campos = '<label style="width:100%">Equipo <select id="edMaqId" style="flex:1">' + opcionesCatalogoMaquina(d.catalogoId) + '</select></label>' +
      num('edAncho','Ancho (m)',d.w,0.4,30,0.1) + num('edFondo','Largo (m)',d.d,0.4,40,0.1) + num('edAlto','Altura (m)',d.h,0.4,30,0.1) +
      '<label>Color <input type="color" id="edColor" value="' + (d.color || '#d9a521') + '"></label>' +
      '<label><input type="checkbox" id="edMovil"' + (d.movil ? ' checked' : '') + '> Móvil (se le puede asignar una ruta)</label>';
  }
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Editando <b class="txtAcento">' + esc(d.nombre) + '</b> (' + NOMBRE_TIPO[d.tipo] + '). ' +
      'Cambia sus medidas y guarda; conserva su posición en la obra.</div>' +
    '<div style="margin-top:10px; display:flex; flex-direction:column; gap:8px">' +
      '<input id="edNombre" maxlength="40" value="' + esc(d.nombre) + '" placeholder="Nombre">' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">' + campos + '</div>' +
      '<textarea id="edDesc" maxlength="400" rows="2" placeholder="Descripción (opcional)">' + esc(d.descripcion || '') + '</textarea>' +
      '<div style="display:flex; gap:6px">' +
        '<button class="orgAccion primario" style="margin:0" onclick="guardarEdicionLibre()">Guardar cambios</button>' +
        '<button class="orgAccion" style="margin:0" onclick="cancelarEdicionLibre()">Cancelar</button>' +
      '</div>' +
    '</div>';
}
function cancelarEdicionLibre(){ editandoLibre = null; renderVentana(); }
function guardarEdicionLibre(){
  const g = editandoLibre;
  if (!g){ renderVentana(); return; }
  const d = g.userData.def;
  const raw = Object.assign({}, d);   // conserva tipo, x, z, rot
  raw.nombre = (document.getElementById('edNombre').value || '').trim().slice(0, 40) || d.nombre;
  raw.descripcion = (document.getElementById('edDesc').value || '').trim().slice(0, 400);
  if (d.tipo === 'espacio'){
    raw.w = valNum('edAncho'); raw.d = valNum('edFondo'); raw.h = valNum('edAlto');
    raw.color = valNum('edColor'); raw.muros = document.getElementById('edMuros').checked; raw.techo = document.getElementById('edTecho').checked;
    raw.sistema = (document.getElementById('edSistemaEsp') || {}).value;
  } else if (d.tipo === 'edificio'){
    raw.w = valNum('edAncho'); raw.d = valNum('edFondo'); raw.pisos = valNum('edPisos'); raw.hPiso = valNum('edHPiso');
    raw.sistema = (document.getElementById('edSistema') || {}).value;
  } else if (d.tipo === 'malacate'){
    raw.mastil = valNum('edMastil');
  } else if (d.tipo === 'gruaTorre'){
    raw.mastil = valNum('edMastil'); raw.brazo = valNum('edBrazo'); raw.radio = valNum('edRadio');
  } else if (d.tipo === 'gruaPluma'){
    raw.brazo = valNum('edBrazo'); raw.angulo = valNum('edAngulo'); raw.radio = valNum('edRadio');
  } else if (d.tipo === 'mueble'){
    raw.catalogoId = (document.getElementById('edMuebleId') || {}).value;
    raw.w = valNum('edAncho'); raw.d = valNum('edFondo'); raw.h = valNum('edAlto'); raw.color = valNum('edColor');
  } else if (d.tipo === 'maquina'){
    raw.catalogoId = (document.getElementById('edMaqId') || {}).value;
    raw.w = valNum('edAncho'); raw.d = valNum('edFondo'); raw.h = valNum('edAlto'); raw.color = valNum('edColor');
    raw.movil = !!(document.getElementById('edMovil') || {}).checked;
  }
  if (amueblando === g) cerrarAmoblar();   // se editó el espacio que se estaba amoblando: se sale primero
  const i = elementos.indexOf(g);
  g.traverse(n => { if (n.geometry) n.geometry.dispose(); });
  scene.remove(g);
  elementos.splice(i, 1);
  const ng = crearElemento(raw);
  editandoLibre = null;
  guardar('Editado: ' + ng.userData.def.nombre);
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(ng);
  if (mostrarCotas) redibujarCotas2D();
  avisar('Dimensiones actualizadas: ' + ng.userData.def.nombre);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  HERRAMIENTAS DE OBRA (mismas del proyecto Bambú, adaptadas al        ║
   ║  proyecto libre): ficha técnica + lote, cerramiento perimetral,       ║
   ║  vías con borrado POR TRAMO, rutas de vehículos con borrado POR       ║
   ║  PUNTO/POR RUTA, y organigrama con plantilla editable.                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

let idSec = 1;                    // ids únicos de vías, rutas y roles (persisten)
function red2(n){ return Math.round((n || 0) * 100) / 100; }
function vaciarGrupo(grupo){
  grupo.children.slice().forEach(n => {
    grupo.remove(n);
    n.traverse(m => {
      if (m.geometry) m.geometry.dispose();
      if (m.material){
        if (m.material.map) m.material.map.dispose();
        if (m.material.dispose) m.material.dispose();
      }
    });
  });
}

/* ============ FICHA TÉCNICA + LOTE ============
   Antes de empezar, el usuario escribe los m² del terreno y los datos
   generales (como el "Panel de obra" del proyecto Bambú). El lote se dibuja
   a esas medidas y el cerramiento perimetral lo envuelve. */
/* ---- Fase de obra (selector del sidebar, como el "Fase de obra" de Bambú):
   excavación / estructura / acabados. Fija el texto de "Fase actual" en la
   ficha técnica; si quieres una descripción más específica, edítala luego
   desde "Ficha técnica". */
const FASES_OBRA = { excavacion: 'Excavación', estructura: 'Estructura', acabados: 'Acabados' };
function cambiarFaseObra(v){
  if (!FASES_OBRA[v]) return;
  ficha.faseObra = v;
  ficha.fase = FASES_OBRA[v];
  guardar();
  if (fichaCompleta && !amueblando && !herramienta) mostrarPanelVacio();
  avisar('Fase de la obra: ' + FASES_OBRA[v]);
}
let ficha = normalizarFicha(null);
let fichaCompleta = false;
let cerrCfg = { activo: true, material: 'lona', altura: 2.4 };
const loteGrupo = new THREE.Group(); scene.add(loteGrupo);
const cerrGrupo = new THREE.Group(); scene.add(cerrGrupo);

function normalizarFicha(raw){
  raw = raw || {};
  return {
    nombre: String(raw.nombre || 'Mi obra').slice(0, 60),
    ubicacion: String(raw.ubicacion || '').slice(0, 90),
    torres: String(raw.torres || '').slice(0, 90),
    apartamentos: String(raw.apartamentos || '').slice(0, 90),
    niveles: String(raw.niveles || '').slice(0, 90),
    alturaTxt: String(raw.alturaTxt || '').slice(0, 90),
    fase: String(raw.fase || '').slice(0, 90),
    faseObra: FASES_OBRA[raw.faseObra] ? raw.faseObra : 'acabados',
    personal: String(raw.personal || '').slice(0, 90),
    loteLargo: numLim(raw.loteLargo, 120, 20, 400),
    loteAncho: numLim(raw.loteAncho, 60, 20, 300),
    loteModo: raw.loteModo === 'libre' ? 'libre' : 'rectangulo',
    lotePoligono: (Array.isArray(raw.lotePoligono) ? raw.lotePoligono : [])
      .filter(p => Array.isArray(p) && p.length === 2 && isFinite(p[0]) && isFinite(p[1]))
      .map(p => [red2(p[0]), red2(p[1])]).slice(0, 60),
    // lado del cerramiento donde va el portón; null = automático (el lado más al sur)
    idxPorton: Number.isInteger(raw.idxPorton) && raw.idxPorton >= 0 ? raw.idxPorton : null,
    taller: String(raw.taller || 'Taller II').slice(0, 40),
    equipo: (Array.isArray(raw.equipo) ? raw.equipo : []).map(n => String(n).slice(0, 40)).filter(Boolean).slice(0, 12)
  };
}
/* ============ LOTE GENÉRICO (rectángulo ancho×largo, o perímetro libre
   dibujado a mano) ============ Toda el área/geometría del terreno pasa por
   estas funciones, así el resto de la app (cotas, cámara 2D, camiones,
   exportar, cuadro de áreas…) no necesita saber si el lote es un rectángulo
   o un polígono irregular — muchos terrenos reales no son planos ni
   rectangulares, tienen quiebres. */
function areaPoligono(pts){
  let a = 0;
  for (let i = 0; i < pts.length; i++){
    const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
    a += x1 * z2 - x2 * z1;
  }
  return Math.abs(a) / 2;
}
function loteEsLibre(){ return ficha.loteModo === 'libre' && ficha.lotePoligono && ficha.lotePoligono.length >= 3; }
function loteEsquinas(){
  if (loteEsLibre()) return ficha.lotePoligono;
  const L = ficha.loteLargo, A = ficha.loteAncho;
  return [[-L / 2, -A / 2], [L / 2, -A / 2], [L / 2, A / 2], [-L / 2, A / 2]];
}
function loteAreaM2(){
  return loteEsLibre() ? areaPoligono(ficha.lotePoligono) : ficha.loteLargo * ficha.loteAncho;
}
function loteCentro(){
  const pts = loteEsquinas();
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [cx, cz];
}
/* tamaño de la "caja" que envuelve el lote (para encuadrar cámara/zoom
   igual sea rectángulo o polígono libre) */
function loteBoundingSize(){
  const pts = loteEsquinas();
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
  return { largo: Math.max(...xs) - Math.min(...xs), ancho: Math.max(...zs) - Math.min(...zs) };
}
/* nivel de zoom del Plano 2D que encuadra el lote completo, sea rectángulo o polígono libre */
function zoomAjustadoLote(){
  const b = loteBoundingSize();
  return Math.max(b.ancho * 0.72, b.largo * 0.42, 55);
}
/* pie del sidebar: nombre del taller + integrantes definidos en la ficha
   técnica (reemplaza el equipo fijo de la plantilla original) */
function actualizarPieEquipo(){
  const titulo = document.getElementById('uiPieTitulo');
  const nombres = document.getElementById('uiPieNombres');
  if (titulo) titulo.textContent = 'Equipo · ' + (ficha.taller || 'Taller II');
  if (nombres){
    nombres.innerHTML = (ficha.equipo && ficha.equipo.length)
      ? ficha.equipo.map(n => '<span class="pieNom">' + esc(n) + '</span>').join('')
      : '<span class="pieNom" style="opacity:.6">Agrega tu equipo en Ficha técnica</span>';
  }
}
function construirLote(){
  vaciarGrupo(loteGrupo);
  const m2 = Math.round(loteAreaM2());
  const centro = loteCentro();
  if (loteEsLibre()){
    const pts = ficha.lotePoligono;
    // Shape vive en XY; al rotar -90° en X, Y termina siendo -Z del mundo —
    // por eso se le pasa -z para que el polígono quede orientado igual que
    // como se dibujó en el plano 2D (norte arriba, Z positivo hacia el sur)
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const piso = new THREE.Mesh(new THREE.ShapeGeometry(shape),
      new THREE.MeshLambertMaterial({ color: 0x8a9a55, side: THREE.DoubleSide }));
    piso.rotation.x = -Math.PI / 2; piso.position.y = 0.02; piso.receiveShadow = true;
    loteGrupo.add(piso);
    for (let i = 0; i < pts.length; i++){
      const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length];
      const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
      if (len < 0.1) continue;
      const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: 0xe8e4d8 }));
      b.position.set((x1 + x2) / 2, 0.045, (z1 + z2) / 2);
      b.rotation.y = -Math.atan2(dz, dx);
      loteGrupo.add(b);
    }
  } else {
    const L = ficha.loteLargo, A = ficha.loteAncho;
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(L, A), new THREE.MeshLambertMaterial({ color: 0x8a9a55 }));
    piso.rotation.x = -Math.PI / 2; piso.position.y = 0.02; piso.receiveShadow = true;
    loteGrupo.add(piso);
    [[0, -A/2, L, 0.3], [0, A/2, L, 0.3], [-L/2, 0, 0.3, A], [L/2, 0, 0.3, A]].forEach(([x, z, w, d]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), new THREE.MeshBasicMaterial({ color: 0xe8e4d8 }));
      b.position.set(x, 0.045, z);
      loteGrupo.add(b);
    });
  }
  const et = crearEtiqueta((loteEsLibre() ? 'Lote (perímetro libre) ' : 'Lote ' + ficha.loteLargo + ' × ' + ficha.loteAncho + ' m ') +
    '≈ ' + m2.toLocaleString('es-CO') + ' m²', 26, 'rgba(60,80,30,0.85)');
  et.position.set(centro[0], 3, centro[1] - (loteEsLibre() ? loteBoundingSize().ancho / 2 + 2 : ficha.loteAncho / 2 + 2));
  loteGrupo.add(et);
  aplicarVisibilidadEtiquetas(loteGrupo);
}

/* ============ CERRAMIENTO PERIMETRAL (material elegible) ============ */
const MATERIALES_CERR = {
  lona:       { nombre: 'Lona verde de obra',        color: 0x2e7d4f, op: 0.96 },
  zinc:       { nombre: 'Teja de zinc acanalada',    color: 0x9fb3a8, op: 1 },
  malla:      { nombre: 'Malla eslabonada',          color: 0x9fb6c9, op: 0.32 },
  polisombra: { nombre: 'Polisombra (malla verde)',  color: 0x1f4d33, op: 0.62 },
  madera:     { nombre: 'Tablado de madera',         color: 0x8a6642, op: 1 }
};
function opcionesMaterialCerr(sel){
  return Object.keys(MATERIALES_CERR).map(k =>
    '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(MATERIALES_CERR[k].nombre) + '</option>').join('');
}
/* punto donde entran/salen camiones y el modo Caminar — se recalcula cada
   vez que se reconstruye el cerramiento, siempre justo afuera del portón
   (funciona igual para el lote rectangular y para el perímetro libre) */
let puertaObraXZ = [0, 30];
function construirCerramiento(){
  vaciarGrupo(cerrGrupo);
  const esquinas = loteEsquinas();
  const n = esquinas.length;
  const centro = loteCentro();
  if (!cerrCfg.activo){
    // sin cerca, la entrada de referencia queda en el borde más al sur del lote
    let mejorZ = -Infinity, pref = [centro[0], centro[1] + 30];
    for (let i = 0; i < n; i++){ if (esquinas[i][1] > mejorZ){ mejorZ = esquinas[i][1]; pref = [esquinas[i][0], esquinas[i][1] + 8]; } }
    puertaObraXZ = pref;
    return;
  }
  const H = cerrCfg.altura;
  const mat = MATERIALES_CERR[cerrCfg.material] || MATERIALES_CERR.lona;
  // elige el lado del portón: si el usuario ya lo escogió a mano (herramienta
  // "Elegir portón") se respeta ese lado; si no, en rectángulo va siempre en
  // el costado sur (índice 2) y en el perímetro libre en el lado más al sur
  // (mayor z promedio) que sea lo bastante largo para el portón
  let idxGate = 2 % n;
  const ladoValido = i => {
    const a = esquinas[i], b = esquinas[(i + 1) % n];
    return Math.hypot(b[0] - a[0], b[1] - a[1]) >= 7;
  };
  if (Number.isInteger(ficha.idxPorton) && ficha.idxPorton < n && ladoValido(ficha.idxPorton)){
    idxGate = ficha.idxPorton;
  } else if (loteEsLibre()){
    let mejorZ = -Infinity;
    for (let i = 0; i < n; i++){
      const a = esquinas[i], b = esquinas[(i + 1) % n];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 8) continue;
      const zProm = (a[1] + b[1]) / 2;
      if (zProm > mejorZ){ mejorZ = zProm; idxGate = i; }
    }
  }
  const postes = [];
  function tramoCerrLibre(x1, z1, x2, z2){
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    if (len < 0.3) return;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, H, 0.08),
      new THREE.MeshLambertMaterial({ color: mat.color, transparent: mat.op < 1, opacity: mat.op }));
    m.position.set((x1 + x2) / 2, H / 2, (z1 + z2) / 2);
    m.rotation.y = -Math.atan2(dz, dx);
    m.castShadow = mat.op >= 0.9;
    cerrGrupo.add(m);
    const cant = Math.max(1, Math.floor(len / 3));
    for (let i = 0; i <= cant; i++) postes.push([x1 + dx * i / cant, z1 + dz * i / cant]);
  }
  for (let i = 0; i < n; i++){
    const a = esquinas[i], b = esquinas[(i + 1) % n];
    if (i === idxGate){
      // acceso con portón vehicular de 7 m centrado en este lado
      const len = Math.max(8, Math.hypot(b[0] - a[0], b[1] - a[1]));
      const f1 = Math.max(0.05, (len / 2 - 3.5) / len), f2 = Math.min(0.95, (len / 2 + 3.5) / len);
      const px = f => a[0] + (b[0] - a[0]) * f, pz = f => a[1] + (b[1] - a[1]) * f;
      tramoCerrLibre(a[0], a[1], px(f1), pz(f1));
      tramoCerrLibre(px(f2), pz(f2), b[0], b[1]);
      const hP = Math.min(H, 2.2);
      // normal exterior del lado (perpendicular, apuntando lejos del centro
      // del lote) — así el portón y la puerta de entrada quedan bien
      // orientados sin importar hacia dónde mire este tramo del perímetro
      const dx = b[0] - a[0], dz = b[1] - a[1];
      let nx = -dz, nz = dx; const nlen = Math.hypot(nx, nz) || 1; nx /= nlen; nz /= nlen;
      const mx = px(0.5), mz = pz(0.5);
      if ((centro[0] - mx) * nx + (centro[1] - mz) * nz > 0){ nx = -nx; nz = -nz; }
      const porton = new THREE.Mesh(new THREE.BoxGeometry(6.4, hP, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xc9581e }));
      const fPorton = Math.max(0.05, 0.5 - 3.2 / len);   // corrido: se ve semiabierto
      porton.position.set(px(fPorton) + nx * 0.35, hP / 2, pz(fPorton) + nz * 0.35);
      porton.rotation.y = -Math.atan2(dz, dx);
      cerrGrupo.add(porton);
      const et = crearEtiqueta('PORTÓN DE ACCESO', 13, 'rgba(120,60,15,0.88)');
      et.position.set(mx, H + 2, mz);
      cerrGrupo.add(et);
      puertaObraXZ = [mx + nx * 8, mz + nz * 8];
    } else {
      tramoCerrLibre(a[0], a[1], b[0], b[1]);
    }
  }
  const geoPoste = new THREE.BoxGeometry(0.12, H + 0.15, 0.12);
  const matPoste = new THREE.MeshLambertMaterial({ color: 0x4a5560 });
  const im = new THREE.InstancedMesh(geoPoste, matPoste, postes.length);
  const mtx = new THREE.Matrix4();
  postes.forEach(([x, z], i) => { mtx.makeTranslation(x, (H + 0.15) / 2, z); im.setMatrixAt(i, mtx); });
  cerrGrupo.add(im);
  aplicarVisibilidadEtiquetas(cerrGrupo);
}
/* ============ ELEGIR DÓNDE VA EL PORTÓN (herramienta "Elegir portón") ============
   Por defecto el portón se ubica automáticamente en el costado sur del
   lote; esta herramienta deja que el usuario haga clic sobre cualquier lado
   del cerramiento (mejor visto en el Plano 2D) para ponerlo ahí. */
function clicPorton(pRaw){
  if (!cerrCfg.activo){
    avisar('Activa el cerramiento en la Ficha técnica para poder ubicar el portón');
    setHerramienta(null);
    return;
  }
  const esquinas = loteEsquinas();
  const n = esquinas.length;
  let mejorI = -1, mejorD = Infinity;
  for (let i = 0; i < n; i++){
    const a = esquinas[i], b = esquinas[(i + 1) % n];
    const dx = b[0] - a[0], dz = b[1] - a[1], len2 = dx * dx + dz * dz;
    let t = len2 > 0 ? ((pRaw.x - a[0]) * dx + (pRaw.z - a[1]) * dz) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(pRaw.x - (a[0] + dx * t), pRaw.z - (a[1] + dz * t));
    if (d < mejorD){ mejorD = d; mejorI = i; }
  }
  if (mejorI < 0) return;
  const a = esquinas[mejorI], b = esquinas[(mejorI + 1) % n];
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 7){
    avisar('Ese lado es muy corto para el portón (mínimo ~7 m) — elige otro lado');
    return;
  }
  ficha.idxPorton = mejorI;
  construirCerramiento();
  guardar('Portón reubicado');
  setHerramienta(null);
  avisar('Portón ubicado en el lado elegido');
}
function panelHerramientaPorton(){
  panelSel('Elegir dónde va el portón',
    '<div class="desc">Haz <b class="txtAcento">clic sobre uno de los lados del cerramiento</b> (se ve mejor en el Plano 2D) ' +
    'para poner ahí el portón de acceso. El lado debe tener al menos 7 m.</div>' +
    (cerrCfg.activo ? '' : '<div class="desc" style="color:var(--rojo-texto)">Activa el cerramiento en la Ficha técnica primero.</div>'));
}

/* ============ IMAGEN DE FONDO PARA CALCAR (plano de AutoCAD u otro) ============
   Sube una foto/captura del plano (PNG/JPG) y se acuesta sobre el terreno,
   justo debajo de las líneas que dibujas, para poder guiarte y calcar
   encima en el Plano 2D. Se ajusta tamaño/posición/rotación/opacidad a mano
   porque cada imagen trae su propia escala; NO se guarda con el proyecto
   (solo dura mientras la pestaña esté abierta). */
const fondoGrupo = new THREE.Group(); scene.add(fondoGrupo);
let fondoImg = null;   // { mesh, anchoM, altoM, opacidad, rotDeg }
function cargarFondoPlanoArchivo(file){
  if (!file) return;
  const lector = new FileReader();
  lector.onload = () => {
    const img = new Image();
    img.onload = () => {
      vaciarGrupo(fondoGrupo);
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      const aspecto = img.width / img.height;
      const anchoM = Math.round(loteBoundingSize().largo) || 100;
      const altoM = Math.round(anchoM / aspecto);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(anchoM, altoM, 1);
      fondoGrupo.add(mesh);
      const centro = loteCentro();
      fondoGrupo.position.set(centro[0], 0.03, centro[1]);
      fondoGrupo.rotation.y = 0;
      fondoImg = { mesh, anchoM, altoM, opacidad: 0.6, rotDeg: 0 };
      panelHerramientaFondo();
      avisar('Imagen de fondo cargada — ajusta tamaño, posición y rotación para calzarla con el lote');
    };
    img.src = lector.result;
  };
  lector.readAsDataURL(file);
}
function actualizarFondoPlano(){
  if (!fondoImg) return;
  fondoImg.mesh.scale.set(fondoImg.anchoM, fondoImg.altoM, 1);
  fondoImg.mesh.material.opacity = fondoImg.opacidad;
  fondoGrupo.rotation.y = fondoImg.rotDeg * Math.PI / 180;
}
function quitarFondoPlano(){
  vaciarGrupo(fondoGrupo);
  fondoImg = null;
  avisar('Imagen de fondo quitada');
  abrirFondoPlano();
}
function abrirFondoPlano(){
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Imagen de fondo (calcar plano)';
  if (!fondoImg){
    document.getElementById('libreBody').innerHTML =
      '<div class="desc">Sube una foto o captura de tu plano (por ejemplo, exportado desde AutoCAD como PNG o JPG) para calcarlo ' +
      'en el <b class="txtAcento">Plano 2D</b>. Después de cargarla podrás ajustar tamaño, posición, rotación y opacidad para que ' +
      'calce con tu lote. <b>No se guarda con el proyecto</b> — solo dura mientras tengas esta pestaña abierta.</div>' +
      '<label style="display:block; margin-top:10px">Imagen (PNG/JPG)<input type="file" id="fondoArchivo" accept="image/png,image/jpeg" style="width:100%; margin-top:4px"></label>';
    document.getElementById('libreOverlay').style.display = 'flex';
    document.getElementById('fondoArchivo').onchange = e => { const f = e.target.files[0]; if (f) cargarFondoPlanoArchivo(f); };
    return;
  }
  panelHerramientaFondo();
  document.getElementById('libreOverlay').style.display = 'flex';
}
function panelHerramientaFondo(){
  document.getElementById('libreVentTitulo').textContent = 'Imagen de fondo (calcar plano)';
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Ajusta tamaño, posición y rotación hasta que la imagen calce con tu lote — ve al ' +
    '<b class="txtAcento">Plano 2D</b> para verla desde arriba mientras ajustas. No se guarda con el proyecto.</div>' +
    '<div style="display:flex; gap:8px; margin-top:10px">' +
      '<label style="flex:1">Ancho (m)<input type="number" id="fdAncho" value="' + fondoImg.anchoM + '" min="1" max="1000" step="0.5" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
      '<label style="flex:1">Alto (m)<input type="number" id="fdAlto" value="' + fondoImg.altoM + '" min="1" max="1000" step="0.5" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '</div>' +
    '<div style="display:flex; gap:8px; margin-top:8px">' +
      '<label style="flex:1">Centro X (m)<input type="number" id="fdX" value="' + Math.round(fondoGrupo.position.x) + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
      '<label style="flex:1">Centro Z (m)<input type="number" id="fdZ" value="' + Math.round(fondoGrupo.position.z) + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '</div>' +
    '<label style="display:block; margin-top:8px">Rotación (°)<input type="number" id="fdRot" value="' + fondoImg.rotDeg + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '<label style="display:block; margin-top:8px">Opacidad<input type="range" id="fdOp" min="10" max="100" value="' + Math.round(fondoImg.opacidad * 100) + '" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '<div style="margin-top:14px; display:flex; gap:6px; flex-wrap:wrap">' +
      '<label class="orgAccion" style="margin:0; cursor:pointer">' + ic('carpeta') + 'Cambiar imagen<input type="file" id="fondoArchivo2" accept="image/png,image/jpeg" style="display:none"></label>' +
      '<button class="btnEliminar" onclick="quitarFondoPlano()">' + ic('basura') + 'Quitar imagen</button>' +
    '</div>';
  document.getElementById('fondoArchivo2').onchange = e => { const f = e.target.files[0]; if (f) cargarFondoPlanoArchivo(f); };
}
function cambiarFondoPlano(){
  if (!fondoImg) return;
  fondoImg.anchoM = numLim((document.getElementById('fdAncho') || {}).value, fondoImg.anchoM, 1, 1000);
  fondoImg.altoM = numLim((document.getElementById('fdAlto') || {}).value, fondoImg.altoM, 1, 1000);
  fondoImg.rotDeg = numLim((document.getElementById('fdRot') || {}).value, fondoImg.rotDeg, -360, 360);
  fondoImg.opacidad = numLim((document.getElementById('fdOp') || {}).value, fondoImg.opacidad * 100, 10, 100) / 100;
  const x = numLim((document.getElementById('fdX') || {}).value, fondoGrupo.position.x, -100000, 100000);
  const z = numLim((document.getElementById('fdZ') || {}).value, fondoGrupo.position.z, -100000, 100000);
  fondoGrupo.position.set(x, 0.03, z);
  actualizarFondoPlano();
}

function abrirFicha(){
  document.getElementById('libreVentTitulo').textContent = 'Ficha técnica de la obra';
  const campo = (id, lbl, val, ph) =>
    '<label style="display:block; margin-top:8px">' + lbl +
    '<input id="' + id + '" maxlength="90" value="' + esc(val || '') + '" placeholder="' + esc(ph || '') + '" style="width:100%; margin-top:3px"></label>';
  const m2 = Math.round(loteAreaM2());
  const esLibreAhora = ficha.loteModo === 'libre';
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Estos datos son los mismos del <b>Panel de obra</b> del proyecto Bambú, pero de <b class="txtAcento">tu propia obra</b>. ' +
    'El lote se dibuja en el terreno con las medidas que escribas y el cerramiento perimetral lo envuelve.</div>' +
    campo('fxNombre', 'Nombre del proyecto', ficha.nombre === 'Mi obra' ? '' : ficha.nombre, 'ej: Proyecto Bambú') +
    campo('fxUbicacion', 'Ubicación', ficha.ubicacion, 'ej: Marinilla, Antioquia') +
    '<div style="margin-top:14px; border-top:1px solid var(--linea); padding-top:10px">' +
      '<b>Taller y equipo</b>' +
      '<div class="desc">Estos datos reemplazan el pie del sidebar ("Equipo · …") por los tuyos.</div>' +
      campo('fxTaller', 'Nombre del taller', ficha.taller, 'ej: Taller II') +
      '<label style="display:block; margin-top:8px">Integrantes del equipo (uno por línea)' +
        '<textarea id="fxEquipo" rows="3" style="width:100%; margin-top:3px; resize:vertical; font-family:inherit; background:var(--campo); border:1px solid var(--borde); color:var(--texto); border-radius:var(--radio-campo); padding:7px 9px; font-size:13px" placeholder="Nombre 1' + String.fromCharCode(10) + 'Nombre 2">' + esc((ficha.equipo || []).join('\n')) + '</textarea>' +
      '</label>' +
    '</div>' +
    '<div style="margin-top:14px; border-top:1px solid var(--linea); padding-top:10px">' +
      '<b>Forma del lote</b>' +
      '<div class="desc">Muchos terrenos reales no son rectangulares — dibuja el perímetro a mano si el tuyo tiene quiebres.</div>' +
      '<div style="display:flex; gap:16px; margin-top:8px">' +
        '<label style="display:flex; align-items:center; gap:5px"><input type="radio" name="fxLoteModo" value="rectangulo"' + (!esLibreAhora ? ' checked' : '') + ' onchange="cambiarModoLoteFicha()"> Ancho × Largo</label>' +
        '<label style="display:flex; align-items:center; gap:5px"><input type="radio" name="fxLoteModo" value="libre"' + (esLibreAhora ? ' checked' : '') + ' onchange="cambiarModoLoteFicha()"> Libre (dibujado)</label>' +
      '</div>' +
      '<div id="fxLoteRectangulo" style="display:' + (esLibreAhora ? 'none' : 'flex') + '; gap:8px; margin-top:8px; align-items:flex-end">' +
        '<label style="flex:1">Largo del lote (m)<input type="number" id="fxLoteLargo" value="' + ficha.loteLargo + '" min="20" max="400" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Ficha()"></label>' +
        '<label style="flex:1">Ancho del lote (m)<input type="number" id="fxLoteAncho" value="' + ficha.loteAncho + '" min="20" max="300" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Ficha()"></label>' +
        '<b id="fichaM2" style="white-space:nowrap; padding-bottom:8px">≈ ' + m2.toLocaleString('es-CO') + ' m²</b>' +
      '</div>' +
      '<div id="fxLoteLibre" style="display:' + (esLibreAhora ? 'block' : 'none') + '; margin-top:8px">' +
        '<div class="desc">' + (loteEsLibre()
          ? ('Perímetro dibujado: ' + ficha.lotePoligono.length + ' puntos ≈ ' + Math.round(areaPoligono(ficha.lotePoligono)).toLocaleString('es-CO') + ' m².')
          : 'Aún no has dibujado el perímetro.') + '</div>' +
        '<button onclick="guardarFicha(); abrirHerramientaLoteLibre();">' + ic('regla') + (loteEsLibre() ? 'Rehacer el perímetro en el Plano 2D' : 'Dibujar el perímetro en el Plano 2D') + '</button>' +
      '</div>' +
    '</div>' +
    campo('fxTorres', 'Torres', ficha.torres, 'ej: 2 (01 y 02), en línea') +
    campo('fxApartamentos', 'Apartamentos', ficha.apartamentos, 'ej: 120 (80 + 40) · A–L') +
    campo('fxNiveles', 'Niveles', ficha.niveles, 'ej: 10 pisos + cubierta · 3 sótanos') +
    campo('fxAltura', 'Altura', ficha.alturaTxt, 'ej: 26,50 m · entrepiso 2,65 m') +
    campo('fxFase', 'Fase actual', ficha.fase, 'ej: Cerramientos y acabados') +
    campo('fxPersonal', 'Personal en pico', ficha.personal, 'ej: 305 trabajadores') +
    '<div style="margin-top:14px; border-top:1px solid var(--linea); padding-top:10px">' +
      '<b>Cerramiento perimetral</b>' +
      '<div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; align-items:center">' +
        '<label><input type="checkbox" id="fxCerrActivo"' + (cerrCfg.activo ? ' checked' : '') + '> Con cerramiento</label>' +
        '<label>Material <select id="fxCerrMaterial">' + opcionesMaterialCerr(cerrCfg.material) + '</select></label>' +
        '<label>Altura (m) <input type="number" id="fxCerrAltura" value="' + cerrCfg.altura + '" min="1.8" max="4" step="0.1" style="width:66px"></label>' +
      '</div>' +
      '<div class="desc">El cerramiento sigue el perímetro del lote, con un portón de acceso de 6 m en el costado sur.</div>' +
    '</div>' +
    '<div style="margin-top:14px; display:flex; gap:6px">' +
      '<button class="orgAccion primario" style="margin:0" onclick="guardarFicha()">' + ic('check') + 'Guardar ficha técnica</button>' +
      '<button class="orgAccion" style="margin:0" onclick="cerrarVentanaLibre()">Cancelar</button>' +
    '</div>';
  document.getElementById('libreOverlay').style.display = 'flex';
}
function refrescarM2Ficha(){
  const campoL = document.getElementById('fxLoteLargo'), campoA = document.getElementById('fxLoteAncho');
  if (!campoL || !campoA) return;
  const L = numLim(campoL.value, ficha.loteLargo, 20, 400);
  const A = numLim(campoA.value, ficha.loteAncho, 20, 300);
  document.getElementById('fichaM2').textContent = '≈ ' + Math.round(L * A).toLocaleString('es-CO') + ' m²';
}
/* alterna entre los campos de "Ancho × Largo" y el aviso de "Libre (dibujado)" */
function cambiarModoLoteFicha(){
  const modo = (document.querySelector('input[name="fxLoteModo"]:checked') || {}).value || 'rectangulo';
  const rec = document.getElementById('fxLoteRectangulo'), lib = document.getElementById('fxLoteLibre');
  if (rec) rec.style.display = modo === 'libre' ? 'none' : 'flex';
  if (lib) lib.style.display = modo === 'libre' ? 'block' : 'none';
}
function guardarFicha(){
  const v = id => (document.getElementById(id) || {}).value || '';
  const modoRadio = (document.querySelector('input[name="fxLoteModo"]:checked') || {}).value;
  ficha = normalizarFicha({
    nombre: v('fxNombre') || 'Mi obra',
    ubicacion: v('fxUbicacion'), torres: v('fxTorres'), apartamentos: v('fxApartamentos'),
    niveles: v('fxNiveles'), alturaTxt: v('fxAltura'), fase: v('fxFase'), personal: v('fxPersonal'),
    loteLargo: v('fxLoteLargo') || ficha.loteLargo, loteAncho: v('fxLoteAncho') || ficha.loteAncho,
    loteModo: modoRadio || ficha.loteModo, lotePoligono: ficha.lotePoligono,
    taller: v('fxTaller'), equipo: v('fxEquipo').split('\n').map(s => s.trim()).filter(Boolean)
  });
  cerrCfg = {
    activo: !!document.getElementById('fxCerrActivo').checked,
    material: MATERIALES_CERR[v('fxCerrMaterial')] ? v('fxCerrMaterial') : 'lona',
    altura: numLim(v('fxCerrAltura'), 2.4, 1.8, 4)
  };
  fichaCompleta = true;
  construirLote();
  construirCerramiento();
  actualizarPieEquipo();
  guardar('Ficha técnica guardada');
  cerrarVentanaLibre();
  mostrarPanelVacio();
  avisar('Ficha técnica guardada — lote de ' + Math.round(loteAreaM2()).toLocaleString('es-CO') + ' m²');
}
function cerrarVentanaLibre(){ document.getElementById('libreOverlay').style.display = 'none'; }

/* ============ OBSTÁCULOS: los vehículos NUNCA atraviesan zonas/edificios ============ */
function esObstaculo(g){
  const d = g.userData.def;
  if (d.tipo === 'espacio' || d.tipo === 'edificio') return true;
  if (d.tipo === 'maquina' && !d.movil) return true;
  if (d.tipo === 'malacate' || d.tipo === 'gruaTorre' || d.tipo === 'gruaPluma') return true;
  return false;
}
function huellaElemento(g){
  const d = g.userData.def;
  if (d.tipo === 'malacate' || d.tipo === 'gruaTorre') return { w: 3, d: 3 };
  if (d.tipo === 'gruaPluma') return { w: 5, d: 3 };
  return { w: d.w || 3, d: d.d || 3 };
}
/* Liang-Barsky: ¿el segmento cruza el rectángulo [-hw,hw]×[-hd,hd]? */
function segCruzaCaja(ax, az, bx, bz, hw, hd){
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dz = bz - az;
  const lados = [[-dx, ax + hw], [dx, hw - ax], [-dz, az + hd], [dz, hd - az]];
  for (const [p, q] of lados){
    if (p === 0){ if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0){ if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return t0 <= t1;
}
/* devuelve el NOMBRE del primer elemento que el segmento atravesaría, o null */
function segmentoCruzaObstaculo(x1, z1, x2, z2){
  for (const g of elementos){
    if (!esObstaculo(g)) continue;
    const d = g.userData.def, fp = huellaElemento(g);
    const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
    const loc = (x, z) => {
      const dx = x - d.x, dz = z - d.z;
      return [dx * cos - dz * sin, dx * sin + dz * cos];
    };
    const [ax, az] = loc(x1, z1), [bx, bz] = loc(x2, z2);
    if (segCruzaCaja(ax, az, bx, bz, fp.w / 2 + 0.6, fp.d / 2 + 0.6)) return d.nombre;
  }
  return null;
}
/* ¿el elemento quedó parado encima de alguna vía? (aviso al soltarlo) */
function elementoSobreVia(g){
  if (!esObstaculo(g)) return false;
  const d = g.userData.def, fp = huellaElemento(g);
  const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
  return vias.some(v => {
    const loc = (x, z) => { const dx = x - d.x, dz = z - d.z; return [dx * cos - dz * sin, dx * sin + dz * cos]; };
    const [ax, az] = loc(v.x1, v.z1), [bx, bz] = loc(v.x2, v.z2);
    return segCruzaCaja(ax, az, bx, bz, fp.w / 2, fp.d / 2);
  });
}

/* ============ VÍAS DE OBRA (borrado POR TRAMO, empalmes sin vacíos) ============
   Igual que js/vias.js del proyecto Bambú, pero cada tramo tiene id propio:
   se puede borrar UN tramo, la vía conectada completa, o todas — nunca se
   borra más de lo que el usuario elige. En cada nodo se dibuja un disco del
   ancho de la vía para que las curvas no queden con vacíos. */
let vias = [];                  // [{id, x1,z1, x2,z2, ancho}]
let viaAnchoNuevo = 6;
let verMedidasVias = false;
let trazoVia = null;            // { puntos:[{x,z}], ids:[] } mientras se dibuja
let selVia = null;              // id del tramo seleccionado
const viasGrupo = new THREE.Group(); scene.add(viasGrupo);
const viaMeshes = [];           // pisos raycasteables (userData.viaId)
const VIA_SNAP_LIBRE = 2.5;     // m — fusión de extremos en un mismo nodo
const VIA_CONEXION_LIBRE = 22;  // m — radio para "subirse" a la vía desde un punto

function redibujarVias(){
  vaciarGrupo(viasGrupo);
  viaMeshes.length = 0;
  const COLOR_VIA = 0x55585e, COLOR_VIA_SEL = 0x7c8894;
  vias.forEach(v => {
    const dx = v.x2 - v.x1, dz = v.z2 - v.z1, len = Math.hypot(dx, dz);
    if (len < 0.2) return;
    const sel = v.id === selVia;
    const piso = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, v.ancho),
      new THREE.MeshLambertMaterial({ color: sel ? COLOR_VIA_SEL : COLOR_VIA }));
    piso.position.set((v.x1 + v.x2) / 2, 0.065, (v.z1 + v.z2) / 2);
    piso.rotation.y = -Math.atan2(dz, dx);
    piso.receiveShadow = true;
    piso.userData.viaId = v.id;
    viasGrupo.add(piso);
    viaMeshes.push(piso);
    if (len > 1.5){
      const linea = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.3, len - 1.2), 0.012, 0.2),
        new THREE.MeshBasicMaterial({ color: sel ? 0xffd23e : 0xd8d8d0 }));
      linea.position.set((v.x1 + v.x2) / 2, 0.108, (v.z1 + v.z2) / 2);
      linea.rotation.y = -Math.atan2(dz, dx);
      viasGrupo.add(linea);
    }
    if (verMedidasVias){
      const et = crearEtiqueta(Math.round(len * 10) / 10 + ' m · ancho ' + v.ancho + ' m', 13, 'rgba(45,50,58,0.85)');
      et.position.set((v.x1 + v.x2) / 2, 1.6, (v.z1 + v.z2) / 2);
      viasGrupo.add(et);
    }
  });
  // discos de empalme en cada nodo: rellenan el hueco que dejaban las curvas
  const nodos = [];
  vias.forEach(v => {
    [[v.x1, v.z1], [v.x2, v.z2]].forEach(([x, z]) => {
      const n = nodos.find(nn => Math.hypot(nn.x - x, nn.z - z) <= 1.2);
      if (n) n.r = Math.max(n.r, v.ancho / 2);
      else nodos.push({ x, z, r: v.ancho / 2 });
    });
  });
  nodos.forEach(n => {
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(n.r, n.r, 0.07, 20),
      new THREE.MeshLambertMaterial({ color: COLOR_VIA }));
    disco.position.set(n.x, 0.06, n.z);
    disco.receiveShadow = true;
    viasGrupo.add(disco);
  });
  aplicarVisibilidadEtiquetas(viasGrupo);
}

/* ---- grafo + Dijkstra (mismo enfoque de js/vias.js) ---- */
function grafoViasLibre(){
  const nodos = [], aristas = [];
  const idx = (x, z) => {
    for (let i = 0; i < nodos.length; i++){
      if (Math.hypot(nodos[i].x - x, nodos[i].z - z) <= VIA_SNAP_LIBRE) return i;
    }
    nodos.push({ x, z });
    return nodos.length - 1;
  };
  vias.forEach(v => {
    const a = idx(v.x1, v.z1), b = idx(v.x2, v.z2);
    if (a !== b) aristas.push({ a, b, dist: Math.hypot(v.x2 - v.x1, v.z2 - v.z1), id: v.id });
  });
  return { nodos, aristas };
}
function rutaPorViasLibre(desde, hasta){
  const { nodos, aristas } = grafoViasLibre();
  if (!nodos.length) return null;
  const cercano = p => {
    let mejor = -1, mejorD = VIA_CONEXION_LIBRE;
    for (let i = 0; i < nodos.length; i++){
      const d = Math.hypot(nodos[i].x - p[0], nodos[i].z - p[1]);
      if (d <= mejorD){ mejorD = d; mejor = i; }
    }
    return mejor;
  };
  const iD = cercano(desde), iH = cercano(hasta);
  if (iD === -1 || iH === -1) return null;
  const n = nodos.length;
  const dist = new Array(n).fill(Infinity), prev = new Array(n).fill(-1), visto = new Array(n).fill(false);
  const adj = nodos.map(() => []);
  aristas.forEach(ar => { adj[ar.a].push([ar.b, ar.dist]); adj[ar.b].push([ar.a, ar.dist]); });
  dist[iD] = 0;
  for (let it = 0; it < n; it++){
    let u = -1, mejorD = Infinity;
    for (let i = 0; i < n; i++) if (!visto[i] && dist[i] < mejorD){ mejorD = dist[i]; u = i; }
    if (u === -1 || u === iH) break;
    visto[u] = true;
    adj[u].forEach(([v, w]) => { if (dist[u] + w < dist[v]){ dist[v] = dist[u] + w; prev[v] = u; } });
  }
  if (dist[iH] === Infinity) return null;
  const camino = [];
  for (let cur = iH; cur !== -1; cur = prev[cur]) camino.unshift(cur);
  return [desde, ...camino.map(i => [nodos[i].x, nodos[i].z]), hasta];
}
/* tramos conectados con el tramo dado (misma "vía"): BFS por nodos compartidos */
function componenteVia(id){
  const { aristas } = grafoViasLibre();
  const porNodo = {};
  aristas.forEach(ar => {
    (porNodo[ar.a] = porNodo[ar.a] || []).push(ar);
    (porNodo[ar.b] = porNodo[ar.b] || []).push(ar);
  });
  const inicio = aristas.find(ar => ar.id === id);
  if (!inicio) return [id];
  const vistos = new Set([id]);
  const cola = [inicio];
  while (cola.length){
    const ar = cola.pop();
    [ar.a, ar.b].forEach(nd => (porNodo[nd] || []).forEach(o => {
      if (!vistos.has(o.id)){ vistos.add(o.id); cola.push(o); }
    }));
  }
  return [...vistos];
}
function imantarNodoVia(p){
  let mejor = null, mejorD = VIA_SNAP_LIBRE;
  vias.forEach(v => {
    [[v.x1, v.z1], [v.x2, v.z2]].forEach(([x, z]) => {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d <= mejorD){ mejorD = d; mejor = { x, z }; }
    });
  });
  return mejor || { x: p.x, z: p.z };
}

function clicVia(pRaw){
  const p = imantarNodoVia(pRaw);
  if (!trazoVia){
    trazoVia = { puntos: [p], ids: [] };
    panelHerramientaVia();
    avisar('Punto inicial marcado — sigue haciendo clic para trazar la vía');
    return;
  }
  const ult = trazoVia.puntos[trazoVia.puntos.length - 1];
  if (Math.hypot(p.x - ult.x, p.z - ult.z) < 1){ avisar('Marca el siguiente punto un poco más lejos'); return; }
  const choque = segmentoCruzaObstaculo(ult.x, ult.z, p.x, p.z);
  if (choque){ avisar('La vía cruzaría "' + choque + '" — rodéala o muévelo primero'); return; }
  vias.push({ id: idSec++, x1: red2(ult.x), z1: red2(ult.z), x2: red2(p.x), z2: red2(p.z), ancho: viaAnchoNuevo });
  trazoVia.puntos.push(p);
  trazoVia.ids.push(vias[vias.length - 1].id);
  redibujarVias(); redibujarRutas(); guardar(); panelHerramientaVia();
}
function statsVias(){
  const total = vias.reduce((s, v) => s + Math.hypot(v.x2 - v.x1, v.z2 - v.z1), 0);
  return { total: Math.round(total * 10) / 10, tramos: vias.length };
}
function panelHerramientaVia(){
  const st = statsVias();
  panelSel('Dibujar vías',
    '<div class="desc">Haz <b class="txtAcento">clic sobre el terreno</b> para marcar los puntos de la vía: cada clic agrega un tramo ' +
    '(los empalmes de las curvas se rellenan solos, sin vacíos). Para borrar POR PARTES: apaga esta herramienta y haz clic sobre un tramo.</div>' +
    '<label>Ancho de los tramos nuevos (m)' +
      '<input type="number" value="' + viaAnchoNuevo + '" min="3" max="12" step="0.5" onchange="cambiarAnchoNuevo(this.value)"></label>' +
    '<label class="chk"><input type="checkbox"' + (verMedidasVias ? ' checked' : '') + ' onchange="toggleMedidasVias(this.checked)"> Ver medidas sobre las vías</label>' +
    (trazoVia ? '<div class="desc"><b class="txtAcento">Trazando…</b> ' + trazoVia.ids.length + ' tramo(s) en esta vía.</div>' : '') +
    '<button onclick="deshacerPuntoHerramienta()">' + ic('girarIzq') + 'Deshacer último punto</button>' +
    '<button onclick="terminarTrazo()">' + ic('check') + 'Terminar esta vía (empezar otra)</button>' +
    '<div class="desc">Red actual: <b>' + st.tramos + '</b> tramo(s) · <b>' + st.total + ' m</b> en total.</div>' +
    (vias.length ? '<button class="btnEliminar" onclick="borrarTodasLasVias()">' + ic('basura') + 'Eliminar TODAS las vías</button>' : ''));
}
function cambiarAnchoNuevo(v){ viaAnchoNuevo = numLim(v, 6, 3, 12); }
function toggleMedidasVias(v){ verMedidasVias = !!v; redibujarVias(); }
function terminarTrazo(){
  trazoVia = null; trazoRuta = null; trazoRegla = null;
  redibujarMediciones();
  quitarPreviewHerramienta();
  if (herramienta === 'via') panelHerramientaVia();
  else if (herramienta === 'ruta') panelHerramientaRuta();
  else if (herramienta === 'regla') panelHerramientaRegla();
  avisar('Trazo terminado — un nuevo clic empieza otro');
}
function seleccionarVia(id){
  seleccionado = null; elementos.forEach(actualizarTinte);
  selRuta = null; selVia = id;
  redibujarVias(); redibujarRutas();
  const v = vias.find(x => x.id === id);
  if (!v){ mostrarPanelVacio(); return; }
  const largo = Math.round(Math.hypot(v.x2 - v.x1, v.z2 - v.z1) * 10) / 10;
  const comp = componenteVia(id);
  const largoComp = Math.round(comp.reduce((s, cid) => {
    const c = vias.find(x => x.id === cid);
    return c ? s + Math.hypot(c.x2 - c.x1, c.z2 - c.z1) : s;
  }, 0) * 10) / 10;
  panelSel('Vía — tramo seleccionado',
    '<table>' +
      '<tr><td>Largo del tramo</td><td>' + largo + ' m</td></tr>' +
      '<tr><td>Ancho del tramo</td><td><input type="number" value="' + v.ancho + '" min="3" max="12" step="0.5" style="width:76px" onchange="cambiarAnchoVia(' + id + ', this.value)"> m</td></tr>' +
      '<tr><td>Vía completa</td><td>' + comp.length + ' tramo(s) · ' + largoComp + ' m</td></tr>' +
    '</table>' +
    '<label class="chk"><input type="checkbox"' + (verMedidasVias ? ' checked' : '') + ' onchange="toggleMedidasVias(this.checked)"> Ver medidas sobre las vías</label>' +
    '<button class="btnEliminar" onclick="eliminarTramoVia(' + id + ')">' + ic('basura') + 'Eliminar SOLO este tramo</button>' +
    '<button class="btnEliminar" onclick="eliminarViaCompleta(' + id + ')">' + ic('basura') + 'Eliminar toda esta vía (' + comp.length + ' tramos)</button>' +
    '<div class="desc">Se borra únicamente lo que elijas: los demás tramos y las otras vías no se tocan.</div>');
}
function cambiarAnchoVia(id, val){
  const v = vias.find(x => x.id === id);
  if (!v) return;
  v.ancho = numLim(val, v.ancho, 3, 12);
  redibujarVias(); guardar();
}
function eliminarTramoVia(id){
  vias = vias.filter(v => v.id !== id);
  selVia = null;
  redibujarVias(); redibujarRutas(); guardar('Tramo de vía eliminado'); mostrarPanelVacio();
  avisar('Tramo eliminado — el resto de la vía sigue intacto');
}
function eliminarViaCompleta(id){
  const comp = new Set(componenteVia(id));
  vias = vias.filter(v => !comp.has(v.id));
  selVia = null;
  redibujarVias(); redibujarRutas(); guardar('Vía eliminada (' + comp.size + ' tramos)'); mostrarPanelVacio();
  avisar('Vía eliminada (' + comp.size + ' tramos) — las demás vías no se tocaron');
}
function borrarTodasLasVias(){
  if (!vias.length) return;
  if (!confirm('¿Eliminar TODAS las vías dibujadas (' + vias.length + ' tramos)? Para borrar solo una parte, haz clic sobre ese tramo.')) return;
  vias = []; trazoVia = null; selVia = null;
  redibujarVias(); redibujarRutas(); guardar();
  if (herramienta === 'via') panelHerramientaVia(); else mostrarPanelVacio();
  avisar('Vías eliminadas');
}

/* ============ RUTAS DE VEHÍCULOS (borrado POR PUNTO y POR RUTA) ============
   El usuario marca por dónde pasa cada vehículo. Entre punto y punto el
   recorrido SIGUE LAS VÍAS (Dijkstra); si no hay vía que conecte y la línea
   recta cruzaría una zona o edificio, el punto NO se acepta — así los carros
   nunca atraviesan nada construido. */
let rutas = [];                 // [{id, nombre, color, vehiculo, vel, puntos:[[x,z],...]}]
let trazoRuta = null;           // ruta que se está dibujando (referencia)
let selRuta = null;             // id de la ruta seleccionada
const rutasGrupo = new THREE.Group(); scene.add(rutasGrupo);
const rutasActivas = [];        // vehículos recorriendo su ruta ahora mismo
const PALETA_RUTAS = ['#2e9bff', '#ff8c42', '#4cd97b', '#e05fc4', '#ffd23e', '#7a6ff0', '#ff5f5f', '#53d0c9'];

function nombreRutaLibre(){
  let n = rutas.length + 1, nombre = 'Ruta ' + n;
  while (rutas.some(r => r.nombre === nombre)) nombre = 'Ruta ' + (++n);
  return nombre;
}
/* tramo entre dos puntos: por las vías si se puede; recto solo si no cruza nada */
function tramoRutaLibre(a, b){
  const porVia = rutaPorViasLibre(a, b);
  if (porVia) return porVia;
  return segmentoCruzaObstaculo(a[0], a[1], b[0], b[1]) ? null : [a, b];
}
function trazadoRuta(r){
  if (!r.puntos.length) return [];
  let out = [r.puntos[0]];
  for (let i = 0; i < r.puntos.length - 1; i++){
    const t = tramoRutaLibre(r.puntos[i], r.puntos[i + 1]) || [r.puntos[i], r.puntos[i + 1]];
    out = out.concat(t.slice(1));
  }
  return out;
}
function redibujarRutas(){
  vaciarGrupo(rutasGrupo);
  rutas.forEach(r => {
    const sel = r.id === selRuta;
    const tz = trazadoRuta(r);
    if (tz.length >= 2){
      const pts = tz.map(p => new THREE.Vector3(p[0], 0.18, p[1]));
      const mat = sel
        ? new THREE.LineBasicMaterial({ color: new THREE.Color(r.color) })
        : new THREE.LineDashedMaterial({ color: new THREE.Color(r.color), dashSize: 2.2, gapSize: 1.4 });
      const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
      if (!sel) linea.computeLineDistances();
      rutasGrupo.add(linea);
    }
    r.puntos.forEach((p, i) => {
      const marca = new THREE.Mesh(new THREE.CylinderGeometry(sel ? 0.85 : 0.55, sel ? 0.85 : 0.55, 0.1, 14),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(r.color) }));
      marca.position.set(p[0], 0.13, p[1]);
      rutasGrupo.add(marca);
      if (sel){
        const et = crearEtiqueta(String(i + 1), 3.2, 'rgba(20,25,35,0.85)');
        et.position.set(p[0], 2.2, p[1]);
        rutasGrupo.add(et);
      }
    });
  });
  aplicarVisibilidadEtiquetas(rutasGrupo);
}
function clicRuta(pRaw){
  const p = [red2(pRaw.x), red2(pRaw.z)];
  if (!trazoRuta){
    trazoRuta = { id: idSec++, nombre: nombreRutaLibre(), color: PALETA_RUTAS[rutas.length % PALETA_RUTAS.length], vehiculo: '', vel: 3, sentido: 'vaiven', puntos: [p] };
    rutas.push(trazoRuta);
    redibujarRutas(); guardar(); panelHerramientaRuta();
    avisar('"' + trazoRuta.nombre + '" creada — sigue marcando por dónde pasa el vehículo');
    return;
  }
  const ult = trazoRuta.puntos[trazoRuta.puntos.length - 1];
  if (Math.hypot(p[0] - ult[0], p[1] - ult[1]) < 1){ avisar('Marca el siguiente punto un poco más lejos'); return; }
  const tramo = tramoRutaLibre(ult, p);
  if (!tramo){
    avisar('Ese tramo cruzaría una zona o edificio y no hay vía que lo conecte — dibuja primero la vía o rodea la zona');
    return;
  }
  trazoRuta.puntos.push(p);
  redibujarRutas(); guardar(); panelHerramientaRuta();
}
function opcionesVehiculos(sel){
  const moviles = elementos
    .filter(g => g.userData.def.tipo === 'maquina' && g.userData.def.movil)
    .map(g => g.userData.def.nombre);
  return '<option value=""' + (!sel ? ' selected' : '') + '>— elige un vehículo —</option>' +
    moviles.map(n => '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>').join('') +
    (moviles.length ? '' : '<option value="" disabled>(crea primero una maquinaria móvil en "Agregar")</option>');
}
function panelHerramientaRuta(){
  const lista = rutas.map(r =>
    '<div class="planoFila"><span class="planoNom"><span style="display:inline-block; width:11px; height:11px; border-radius:50%; background:' + r.color + '"></span> ' +
      '<b class="txtFuerte">' + esc(r.nombre) + '</b> <small>· ' + r.puntos.length + ' punto(s)' + (r.vehiculo ? ' · ' + esc(r.vehiculo) : '') + '</small></span>' +
    '<span style="white-space:nowrap">' +
      '<button class="planoBtn" style="width:auto; margin:0" title="Ver la ficha de esta ruta" onclick="setHerramienta(null); seleccionarRuta(' + r.id + ')">' + ic('ojo') + '</button> ' +
      '<button class="planoBtn peligro" style="width:auto; margin:0" title="Eliminar SOLO esta ruta" onclick="eliminarRuta(' + r.id + ')">' + ic('basura') + '</button>' +
    '</span></div>').join('');
  panelSel('Marcar ruta de vehículo',
    '<div class="desc">Haz <b class="txtAcento">clic sobre el terreno</b> para marcar por dónde pasa el vehículo. ' +
    'Entre punto y punto el recorrido <b>sigue las vías</b>; si un tramo cruzaría un edificio o zona, no se acepta. ' +
    'El primer clic crea una ruta nueva.</div>' +
    (trazoRuta ? '<div class="desc"><b class="txtAcento">Editando:</b> ' + esc(trazoRuta.nombre) + ' · ' + trazoRuta.puntos.length + ' punto(s).</div>' : '') +
    '<button onclick="deshacerPuntoHerramienta()">' + ic('girarIzq') + 'Deshacer último punto</button>' +
    '<button onclick="terminarTrazo()">' + ic('check') + 'Terminar esta ruta (empezar otra)</button>' +
    (rutas.length ? '<b style="display:block; margin-top:10px">Rutas creadas</b>' + lista : ''));
}
function seleccionarRuta(id){
  seleccionado = null; elementos.forEach(actualizarTinte);
  selVia = null; selRuta = id;
  redibujarVias(); redibujarRutas();
  renderPanelRuta();
}
function renderPanelRuta(){
  const r = rutas.find(x => x.id === selRuta);
  if (!r){ mostrarPanelVacio(); return; }
  const tz = trazadoRuta(r);
  let largo = 0;
  for (let i = 1; i < tz.length; i++) largo += Math.hypot(tz[i][0] - tz[i - 1][0], tz[i][1] - tz[i - 1][1]);
  largo = Math.round(largo * 10) / 10;
  const enMarcha = rutasActivas.some(a => a.rutaId === r.id);
  const listaPts = r.puntos.map((p, i) =>
    '<div class="planoFila"><span class="planoNom">Punto ' + (i + 1) + ' <small>(' + Math.round(p[0]) + ', ' + Math.round(p[1]) + ')</small></span>' +
    '<button class="planoBtn peligro" style="width:auto; margin:0" title="Quitar SOLO este punto" onclick="quitarPuntoRuta(' + r.id + ',' + i + ')">✕</button></div>').join('');
  panelSel('Ruta: ' + r.nombre,
    '<label>Nombre<input maxlength="30" value="' + esc(r.nombre) + '" onchange="cambiarRuta(' + r.id + ', \'nombre\', this.value)"></label>' +
    '<table style="margin-top:8px">' +
      '<tr><td>Recorrido</td><td>' + largo + ' m (siguiendo las vías)</td></tr>' +
      '<tr><td>Puntos marcados</td><td>' + r.puntos.length + '</td></tr>' +
    '</table>' +
    '<label>Vehículo que la recorre<select onchange="cambiarRuta(' + r.id + ', \'vehiculo\', this.value)">' + opcionesVehiculos(r.vehiculo) + '</select></label>' +
    '<label>Dirección del recorrido<select onchange="cambiarRuta(' + r.id + ', \'sentido\', this.value)">' +
      '<option value="vaiven"' + (r.sentido === 'vaiven' ? ' selected' : '') + '>Vaivén (ida y vuelta)</option>' +
      '<option value="ida"' + (r.sentido === 'ida' ? ' selected' : '') + '>Solo ida (punto 1 → último)</option>' +
      '<option value="vuelta"' + (r.sentido === 'vuelta' ? ' selected' : '') + '>Solo vuelta (último → punto 1)</option>' +
    '</select></label>' +
    '<div style="display:flex; gap:6px">' +
      '<label style="flex:1">Velocidad (m/s)<input type="number" value="' + r.vel + '" min="0.5" max="20" step="0.5" onchange="cambiarRuta(' + r.id + ', \'vel\', this.value)"></label>' +
      '<label style="flex:1">Color<input type="color" value="' + r.color + '" onchange="cambiarRuta(' + r.id + ', \'color\', this.value)"></label>' +
    '</div>' +
    '<button onclick="toggleRecorrido(' + r.id + ')">' + ic(enMarcha ? 'stop' : 'play') + (enMarcha ? 'Detener el vehículo' : 'Recorrer la ruta') + '</button>' +
    '<button onclick="continuarRuta(' + r.id + ')">' + ic('mas') + 'Seguir agregando puntos</button>' +
    '<b style="display:block; margin-top:10px">Puntos de la ruta</b>' + listaPts +
    '<button class="btnEliminar" onclick="eliminarRuta(' + r.id + ')">' + ic('basura') + 'Eliminar SOLO esta ruta</button>' +
    '<div class="desc">El recorrido sigue las vías dibujadas y nunca atraviesa zonas ni edificios. ' +
    'Con ✕ quitas un punto que te quedó mal — las demás rutas no se tocan.</div>');
}
function cambiarRuta(id, campo, val){
  const r = rutas.find(x => x.id === id);
  if (!r) return;
  if (campo === 'nombre') r.nombre = String(val || '').trim().slice(0, 30) || r.nombre;
  else if (campo === 'vehiculo') r.vehiculo = String(val || '');
  else if (campo === 'vel') r.vel = numLim(val, r.vel, 0.5, 20);
  else if (campo === 'color' && /^#[0-9a-f]{6}$/i.test(val)) r.color = val;
  else if (campo === 'sentido' && ['vaiven', 'ida', 'vuelta'].includes(val)){
    r.sentido = val;
    detenerRecorrido(id);   // el cambio de sentido aplica desde el próximo "Recorrer"
  }
  guardar(); redibujarRutas();
  if (selRuta === id) renderPanelRuta();
}
function quitarPuntoRuta(id, i){
  const r = rutas.find(x => x.id === id);
  if (!r) return;
  r.puntos.splice(i, 1);
  if (!r.puntos.length){ eliminarRuta(id); return; }
  detenerRecorrido(id);
  guardar(); redibujarRutas();
  if (selRuta === id) renderPanelRuta();
  avisar('Punto quitado — solo ese; el resto de la ruta sigue igual');
}
function eliminarRuta(id){
  detenerRecorrido(id);
  const r = rutas.find(x => x.id === id);
  rutas = rutas.filter(x => x.id !== id);
  if (trazoRuta && trazoRuta.id === id) trazoRuta = null;
  if (selRuta === id) selRuta = null;
  guardar('Ruta eliminada: ' + (r ? r.nombre : id)); redibujarRutas();
  if (herramienta === 'ruta') panelHerramientaRuta(); else mostrarPanelVacio();
  avisar((r ? '"' + r.nombre + '" eliminada' : 'Ruta eliminada') + ' — las demás rutas no se tocaron');
}
function continuarRuta(id){
  const r = rutas.find(x => x.id === id);
  if (!r) return;
  setHerramienta('ruta');
  trazoRuta = r;
  panelHerramientaRuta();
}
/* ---- vehículo recorriendo la ruta (ida y vuelta, pegado a la polilínea) ---- */
function toggleRecorrido(id){
  if (rutasActivas.some(a => a.rutaId === id)) detenerRecorrido(id);
  else iniciarRecorrido(id);
  if (selRuta === id) renderPanelRuta();
}
function iniciarRecorrido(id){
  const r = rutas.find(x => x.id === id);
  if (!r) return;
  const g = elementos.find(el => el.userData.def.nombre === r.vehiculo);
  if (!g){ avisar('Elige primero el vehículo que recorre esta ruta'); return; }
  const tz = trazadoRuta(r);
  if (tz.length < 2){ avisar('Agrega al menos 2 puntos a la ruta'); return; }
  const pts = tz.map(p => ({ x: p[0], z: p[1] }));
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  const len = acum[acum.length - 1];
  const vuelta = r.sentido === 'vuelta';
  rutasActivas.push({ rutaId: id, g, pts, acum, len, s: vuelta ? len : 0, dir: vuelta ? -1 : 1 });
  avisar('"' + r.vehiculo + '" recorriendo "' + r.nombre + '"');
}
function detenerRecorrido(id){
  const i = rutasActivas.findIndex(a => a.rutaId === id);
  if (i < 0) return;
  const a = rutasActivas[i];
  const d = a.g.userData.def;
  a.g.position.set(d.x, 0, d.z);
  a.g.rotation.y = d.rot;
  rutasActivas.splice(i, 1);
}
function moverVehiculoRuta(a, dt){
  const r = rutas.find(rr => rr.id === a.rutaId);
  if (!r || a.len < 0.5) return;
  a.s += (r.vel || 3) * dt * a.dir;
  const vaiven = r.sentido !== 'ida' && r.sentido !== 'vuelta';
  if (a.s >= a.len){
    a.s = a.len;
    if (vaiven) a.dir = -1; else { detenerRecorrido(a.rutaId); if (selRuta === a.rutaId) renderPanelRuta(); return; }
  }
  if (a.s <= 0){
    a.s = 0;
    if (vaiven) a.dir = 1; else { detenerRecorrido(a.rutaId); if (selRuta === a.rutaId) renderPanelRuta(); return; }
  }
  let i = 1;
  while (i < a.acum.length - 1 && a.acum[i] < a.s) i++;
  const t = (a.s - a.acum[i - 1]) / Math.max(0.001, a.acum[i] - a.acum[i - 1]);
  const p0 = a.pts[i - 1], p1 = a.pts[i];
  a.g.position.set(p0.x + (p1.x - p0.x) * t, 0, p0.z + (p1.z - p0.z) * t);
  const hx = (p1.x - p0.x) * a.dir, hz = (p1.z - p0.z) * a.dir;
  if (Math.hypot(hx, hz) > 0.001) a.g.rotation.y = Math.atan2(hx, hz);
}
function detenerTodosLosRecorridos(){
  rutasActivas.slice().forEach(a => detenerRecorrido(a.rutaId));
}

/* ============ RELOJ DE OBRA + CAMIONES DE MATERIALES (mismo sistema del
   proyecto Bambú, adaptado a las zonas creadas en el proyecto libre) ============
   Programas el día y la hora en que entra cada camión y a qué zona lleva el
   material; al llegar ese momento en el reloj de la obra, el camión entra
   por el portón sur, recorre la obra SIGUIENDO LAS VÍAS hasta esa zona
   (dibuja su recorrido), descarga y vuelve a salir. */
let camionesLibre = [];             // [{fecha, hora, material, zona}]
let horaObraLibre = 6 * 60;         // minutos desde medianoche
let relojCorriendoLibre = true;
let velRelojLibre = 12;             // minutos de obra por segundo real
const camionesActivosLibre = [];
const colaCamionesLibre = [];
let ultimoDespachoLibre = -Infinity;
const SEPARACION_CAMIONES_LIBRE = 8;
let zonaCamionSelLibre = '';
let elHoraObraTxtLibre = null;

function minutosAHoraLibre(m){
  m = ((Math.floor(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function horaAMinutosLibre(h){
  const p = String(h || '').split(':');
  return ((parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0)) % 1440;
}
function fechaISOLibre(d){
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function sumarDiaISOLibre(iso){
  const p = String(iso || '').split('-').map(Number);
  const d = new Date(p[0] || 1970, (p[1] || 1) - 1, p[2] || 1);
  d.setDate(d.getDate() + 1);
  return fechaISOLibre(d);
}
let fechaObraLibre = fechaISOLibre();

/* camión de materiales a escala 1:1, reutilizando los mismos helpers caja()/cilindro()/rueda() */
function crearCamion3DLibre(){
  const cam = new THREE.Group();
  caja(cam, 2.3, 0.5, 8.4, 0x2b2f36, 0, 0.75, -0.2);
  caja(cam, 2.4, 1.9, 2.0, 0x2e6db8, 0, 2.0, 3.1);
  caja(cam, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 4.1);
  caja(cam, 2.5, 1.9, 5.4, 0xe6e2d8, 0, 1.75, -1.4);
  [3.0, -2.2, -3.6].forEach(z => [-1.1, 1.1].forEach(x => rueda(cam, x, 0.6, z, 0.6, 0.5)));
  return cam;
}
/* ubicación de cualquier zona por su nombre — el destino del camión */
function posicionZonaLibre(nombre){
  const g = elementos.find(el => el.userData.def.nombre === nombre);
  if (g) return { x: g.position.x, z: g.position.z, w: g.userData.def.w || 3, d: g.userData.def.d || 3 };
  return { x: 0, z: 0, w: 6, d: 6 };
}
/* entrada/salida de la obra: el mismo portón sur que usa el modo Caminar */
function entradaObraLibre(){ return puertaObraXZ; }
function tramoConViasLibre(desde, hasta){
  return rutaPorViasLibre(desde, hasta) || [desde, hasta];
}
function encadenarConViasLibre(puntos){
  let out = [puntos[0]];
  for (let i = 0; i < puntos.length - 1; i++){
    out = out.concat(tramoConViasLibre(puntos[i], puntos[i + 1]).slice(1));
  }
  return out;
}
function recorridoCamionLibre(nombreZona){
  const zona = posicionZonaLibre(nombreZona);
  const entrada = entradaObraLibre();
  const aprox = [zona.x, zona.z - zona.d / 2 - 3];
  const ida = encadenarConViasLibre([entrada, aprox]);
  const vuelta = encadenarConViasLibre([aprox, entrada]);
  return { ida, vuelta, descarga: aprox };
}
function curvaTerrenoLibre(paresXZ, altura){
  return new THREE.CatmullRomCurve3(paresXZ.map(([x, z]) => new THREE.Vector3(x, altura || 0.05, z)));
}
function dibujarRecorridoCamionLibre(grupo, paresXZ){
  const curva = curvaTerrenoLibre(paresXZ, 0.25);
  const pts = curva.getPoints(160);
  const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({ color: 0x2e9bff, dashSize: 2.4, gapSize: 1.6 }));
  linea.computeLineDistances();
  grupo.add(linea);
}

/* ---- fila de acceso: los camiones nunca se chocan entre sí ---- */
function zonaOcupadaLibre(nombreZona){
  return camionesActivosLibre.some(a => a.zona === nombreZona);
}
function lanzarCamionLibre(c){ colaCamionesLibre.push(c); }
function procesarColaCamionesLibre(){
  if (!colaCamionesLibre.length) return;
  if (performance.now() - ultimoDespachoLibre < SEPARACION_CAMIONES_LIBRE * 1000) return;
  const idx = colaCamionesLibre.findIndex(c => !zonaOcupadaLibre((c && c.zona) || ''));
  if (idx === -1) return;
  const c = colaCamionesLibre.splice(idx, 1)[0];
  ultimoDespachoLibre = performance.now();
  despacharCamionLibre(c);
}
function despacharCamionLibre(c){
  const nombreZona = (c && c.zona) || '';
  const material = (c && c.material) || 'materiales';
  const rec = recorridoCamionLibre(nombreZona);
  const grupo = crearCamion3DLibre();
  scene.add(grupo);
  const rutaG = new THREE.Group();
  dibujarRecorridoCamionLibre(rutaG, [...rec.ida, ...rec.vuelta.slice(1)]);
  scene.add(rutaG);
  camionesActivosLibre.push({
    grupo, rutaG, material, zona: nombreZona,
    curva: curvaTerrenoLibre(rec.ida, 0.05), rec,
    t: 0, dur: 26, fase: 'entrando', espera: 0
  });
  avisar('Camión ingresando con ' + material + ' → ' + (nombreZona || '(zona no encontrada)'));
}
const camTmpPLibre = new THREE.Vector3(), camTmpTLibre = new THREE.Vector3();
function moverCamionLibre(a, dt){
  if (a.fase === 'descargando'){
    a.espera -= dt;
    if (a.espera <= 0){ a.fase = 'saliendo'; a.curva = curvaTerrenoLibre(a.rec.vuelta, 0.05); a.t = 0; a.dur = 24; }
    return;
  }
  a.t += dt / a.dur;
  if (a.t >= 1){
    if (a.fase === 'entrando'){
      a.fase = 'descargando'; a.espera = 6;
      avisar('Camión descargando ' + a.material + ' en ' + a.zona);
    } else {
      scene.remove(a.grupo); scene.remove(a.rutaG);
      a.grupo.traverse(n => { if (n.geometry) n.geometry.dispose(); });
      a.terminado = true;
    }
    return;
  }
  const u = Math.min(a.t, 0.9999);
  a.curva.getPointAt(u, camTmpPLibre);
  a.curva.getTangentAt(u, camTmpTLibre);
  a.grupo.position.set(camTmpPLibre.x, 0.05, camTmpPLibre.z);
  a.grupo.rotation.y = Math.atan2(camTmpTLibre.x, camTmpTLibre.z);
}
/* avance del reloj + disparo de camiones programados (llamado desde el bucle de animación) */
function actualizarCamionesLibre(dt){
  if (relojCorriendoLibre && dt > 0){
    let restante = dt * velRelojLibre;
    while (restante > 0){
      const antes = horaObraLibre;
      const paso = Math.min(restante, 1440 - antes);
      horaObraLibre = antes + paso;
      camionesLibre.forEach(c => {
        const m = horaAMinutosLibre(c.hora);
        if (c.fecha === fechaObraLibre && m > antes && m <= horaObraLibre) lanzarCamionLibre(c);
      });
      restante -= paso;
      if (horaObraLibre >= 1440){ horaObraLibre -= 1440; fechaObraLibre = sumarDiaISOLibre(fechaObraLibre); }
    }
    const hh = minutosAHoraLibre(horaObraLibre);
    const txt = elHoraObraTxtLibre || (elHoraObraTxtLibre = document.getElementById('horaObraTxtLibre'));
    if (txt && txt.textContent !== hh){
      txt.textContent = hh;
      txt.parentElement.title = fechaObraLibre;
      const enOverlay = document.getElementById('camHoraActualLibre');
      if (enOverlay) enOverlay.textContent = hh;
      const fechaOverlay = document.getElementById('camFechaActualLibre');
      if (fechaOverlay) fechaOverlay.textContent = fechaObraLibre;
    }
  }
  for (let i = camionesActivosLibre.length - 1; i >= 0; i--){
    moverCamionLibre(camionesActivosLibre[i], dt);
    if (camionesActivosLibre[i].terminado) camionesActivosLibre.splice(i, 1);
  }
  procesarColaCamionesLibre();
}

/* ---- ventana de programación (reutiliza #libreOverlay) ---- */
function opcionesZonasCamionLibre(sel){
  return elementos.map(g => g.userData.def.nombre).map(n =>
    '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>').join('');
}
const VELOCIDADES_LIBRE = [4, 12, 30, 60, 120];
function opcionesVelocidadLibre(){
  return VELOCIDADES_LIBRE.map(v => '<option value="' + v + '"' + (v === velRelojLibre ? ' selected' : '') + '>' + v + ' min/s</option>').join('');
}
function resumenCamionesLibre(){
  if (!camionesLibre.length) return '';
  const porFecha = {}, porZona = {};
  camionesLibre.forEach(c => {
    const f = c.fecha || fechaObraLibre, z = c.zona || '(sin zona)';
    porFecha[f] = (porFecha[f] || 0) + 1;
    porZona[z] = (porZona[z] || 0) + 1;
  });
  const chips = obj => Object.entries(obj).sort((a, b) => a[0] < b[0] ? -1 : 1)
    .map(([k, n]) => '<span class="chipEspacio">' + esc(k) + ' · ' + n + '</span>').join('');
  return '<div class="desc" style="margin:6px 0 12px"><b class="txtAcento">Resumen:</b> ' + camionesLibre.length +
    ' camión(es) programado(s).<br><div style="margin-top:5px; display:flex; flex-wrap:wrap; gap:5px">' + chips(porFecha) + '</div>' +
    '<div style="margin-top:5px; display:flex; flex-wrap:wrap; gap:5px">' + chips(porZona) + '</div></div>';
}
function renderCamionesLibre(){
  document.getElementById('libreVentTitulo').textContent = 'Camiones de materiales';
  const lista = [...camionesLibre].sort((a, b) =>
    (a.fecha || '') !== (b.fecha || '') ? ((a.fecha || '') < (b.fecha || '') ? -1 : 1) : horaAMinutosLibre(a.hora) - horaAMinutosLibre(b.hora));
  const filas = lista.length
    ? lista.map(c => {
        const i = camionesLibre.indexOf(c);
        return '<div class="planoFila"><span class="planoNom">' + ic('camion') + ' <b class="txtFuerte">' + esc(c.fecha || fechaObraLibre) + ' ' + esc(c.hora) + '</b> · ' +
            esc(c.material) + ' <small>→ ' + esc(c.zona || '(sin zona)') + '</small></span>' +
          '<span style="white-space:nowrap">' +
            '<button class="planoBtn" style="width:auto; margin:0" title="Enviar el camión ya" onclick="lanzarCamionLibre(camionesLibre[' + i + '])">' + ic('ruta') + '</button> ' +
            '<button class="planoBtn peligro" style="width:auto; margin:0" title="Quitar de la programación" onclick="quitarCamionLibre(' + i + ')">' + ic('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no hay camiones programados.</div>';
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Programa el día y la hora en que entra cada camión y a qué zona lleva el material. Al llegar ese momento en el reloj de la obra, ' +
      'el camión entra por el portón sur, recorre la obra hasta esa zona SIGUIENDO LAS VÍAS que dibujaste (se ve su recorrido) y descarga. ' +
      'Si dos camiones coinciden, esperan su turno: nunca se cruzan ni se encima uno con otro.</div>' +
    '<div style="display:flex; align-items:center; gap:8px; margin:12px 0; flex-wrap:wrap">' +
      '<b>Reloj de obra:</b> <span id="camFechaActualLibre" class="txtSuave">' + fechaObraLibre + '</span>' +
      '<span id="camHoraActualLibre" style="font-variant-numeric:tabular-nums">' + minutosAHoraLibre(horaObraLibre) + '</span>' +
      '<button class="orgAccion" style="margin:0" onclick="toggleRelojLibre()">' + (relojCorriendoLibre ? 'Pausar' : 'Reanudar') + '</button>' +
      '<label class="txtSuave" style="font-size:12.5px">Velocidad <select onchange="cambiarVelocidadLibre(this.value)">' + opcionesVelocidadLibre() + '</select></label>' +
    '</div>' +
    '<div style="display:flex; align-items:center; gap:6px; margin:0 0 14px; flex-wrap:wrap">' +
      '<input type="date" id="camFechaSetLibre" value="' + fechaObraLibre + '">' +
      '<input type="time" id="camHoraSetLibre" value="' + minutosAHoraLibre(horaObraLibre) + '">' +
      '<button class="orgAccion" style="margin:0" onclick="fijarHoraObraLibre()">Fijar día y hora</button>' +
    '</div>' +
    resumenCamionesLibre() +
    '<b>Camiones programados</b>' + filas +
    '<div style="margin-top:12px; display:flex; flex-direction:column; gap:6px">' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<input type="date" id="camFechaLibre" value="' + fechaObraLibre + '">' +
        '<input type="time" id="camHoraLibre" value="08:00">' +
        '<input id="camMaterialLibre" maxlength="60" placeholder="Material (ej: Cemento)" style="flex:1; min-width:140px">' +
      '</div>' +
      '<div style="display:flex; gap:6px; align-items:center">' +
        '<span class="txtSuave">Destino:</span>' +
        '<select id="camZonaLibre" style="flex:1">' + opcionesZonasCamionLibre(zonaCamionSelLibre) + '</select>' +
        '<button class="orgAccion primario" style="margin:0" onclick="agregarCamionLibre()">' + ic('mas') + 'Agregar</button>' +
      '</div>' +
    '</div>';
}
function cambiarVelocidadLibre(v){ velRelojLibre = parseFloat(v) || 12; guardar(); }
function agregarCamionLibre(){
  const fecha = document.getElementById('camFechaLibre').value || fechaObraLibre;
  const hora = document.getElementById('camHoraLibre').value;
  const material = (document.getElementById('camMaterialLibre').value || '').trim().slice(0, 60) || 'Materiales';
  const zona = document.getElementById('camZonaLibre').value || '';
  if (!hora){ avisar('Elige la hora del camión'); return; }
  if (!zona){ avisar('Crea al menos una zona primero (Espacios o Equipos)'); return; }
  camionesLibre.push({ fecha, hora, material, zona });
  zonaCamionSelLibre = zona;
  guardar('Camión programado: ' + material + ' → ' + zona);
  renderCamionesLibre();
  avisar('Camión programado: ' + material + ' el ' + fecha + ' ' + hora + ' → ' + zona);
}
function quitarCamionLibre(i){ const c = camionesLibre[i]; camionesLibre.splice(i, 1); guardar('Camión quitado de la programación' + (c ? ': ' + c.material : '')); renderCamionesLibre(); }
function toggleRelojLibre(){ relojCorriendoLibre = !relojCorriendoLibre; renderCamionesLibre(); }
function fijarHoraObraLibre(){
  const v = document.getElementById('camHoraSetLibre').value;
  const f = document.getElementById('camFechaSetLibre').value;
  if (!v) return;
  horaObraLibre = horaAMinutosLibre(v);
  if (f) fechaObraLibre = f;
  guardar();
  renderCamionesLibre();
  avisar('Reloj de obra fijado en ' + fechaObraLibre + ' ' + v);
}
function abrirCamionesLibre(){
  setHerramienta(null);
  zonaCamionSelLibre = zonaCamionSelLibre || (elementos[0] ? elementos[0].userData.def.nombre : '');
  renderCamionesLibre();
  document.getElementById('libreOverlay').style.display = 'flex';
}
/* llamada desde la ficha de un elemento: preselecciona ese destino */
function programarCamionZonaLibre(nombreZona){
  zonaCamionSelLibre = nombreZona;
  abrirCamionesLibre();
}

/* ============ HERRAMIENTAS VÍA / RUTA / REGLA: modo, clics y previsualización ============ */
let herramienta = null;   // null | 'via' | 'ruta' | 'regla'
let previewMesh = null;
function setHerramienta(h){
  salirDeAmoblarSiActivo();
  if (herramienta === h) h = null;
  herramienta = h;
  trazoVia = null; trazoRuta = null; trazoRegla = null;
  if (h !== 'lote'){ trazoLote = null; vaciarGrupo(loteTrazoGrupo); }
  redibujarMediciones();
  quitarPreviewHerramienta();
  document.getElementById('btnVia').classList.toggle('activo', herramienta === 'via');
  document.getElementById('btnRuta').classList.toggle('activo', herramienta === 'ruta');
  document.getElementById('btnRegla').classList.toggle('activo', herramienta === 'regla');
  const btnLote = document.getElementById('btnLote');
  if (btnLote) btnLote.classList.toggle('activo', herramienta === 'lote');
  const btnPorton = document.getElementById('btnPorton');
  if (btnPorton) btnPorton.classList.toggle('activo', herramienta === 'porton');
  if (herramienta === 'via') panelHerramientaVia();
  else if (herramienta === 'ruta') panelHerramientaRuta();
  else if (herramienta === 'regla') panelHerramientaRegla();
  else if (herramienta === 'lote'){ if (!trazoLote) mostrarPuntosEditablesLote(); panelHerramientaLote(); }
  else if (herramienta === 'porton') panelHerramientaPorton();
  else mostrarPanelVacio();
}
function clicHerramienta(p){
  if (herramienta === 'via') clicVia(p);
  else if (herramienta === 'ruta') clicRuta(p);
  else if (herramienta === 'regla') clicRegla(p);
  else if (herramienta === 'lote') clicLote(p);
  else if (herramienta === 'porton') clicPorton(p);
}
function deshacerPuntoHerramienta(){
  if (herramienta === 'via' && trazoVia){
    if (trazoVia.ids.length){
      const id = trazoVia.ids.pop();
      vias = vias.filter(v => v.id !== id);
      trazoVia.puntos.pop();
      redibujarVias(); redibujarRutas(); guardar();
    } else {
      trazoVia = null;
    }
    panelHerramientaVia();
    avisar('Último punto deshecho');
  } else if (herramienta === 'ruta' && trazoRuta){
    trazoRuta.puntos.pop();
    if (!trazoRuta.puntos.length){
      const id = trazoRuta.id;
      trazoRuta = null;
      rutas = rutas.filter(x => x.id !== id);
    }
    redibujarRutas(); guardar(); panelHerramientaRuta();
    avisar('Último punto deshecho');
  } else if (herramienta === 'regla'){
    if (mediciones.length){
      const ult = mediciones.pop();
      trazoRegla = { x: ult.x1, z: ult.z1 };
    } else {
      trazoRegla = null;
    }
    redibujarMediciones(); panelHerramientaRegla();
    avisar('Última medición deshecha');
  } else if (herramienta === 'lote'){
    escLote();
  }
}
function puntoAnclaHerramienta(){
  if (herramienta === 'via' && trazoVia && trazoVia.puntos.length){
    return trazoVia.puntos[trazoVia.puntos.length - 1];
  }
  if (herramienta === 'ruta' && trazoRuta && trazoRuta.puntos.length){
    const p = trazoRuta.puntos[trazoRuta.puntos.length - 1];
    return { x: p[0], z: p[1] };
  }
  if (herramienta === 'regla' && trazoRegla) return trazoRegla;
  if (herramienta === 'lote' && trazoLote && trazoLote.length) return trazoLote[trazoLote.length - 1];
  return null;
}
function quitarPreviewHerramienta(){
  if (previewMesh){
    scene.remove(previewMesh);
    previewMesh.geometry.dispose();
    previewMesh.material.dispose();
    previewMesh = null;
  }
}
function actualizarPreviewHerramienta(p){
  const ancla = puntoAnclaHerramienta();
  if (!ancla){ quitarPreviewHerramienta(); return; }
  const dx = p.x - ancla.x, dz = p.z - ancla.z, len = Math.hypot(dx, dz);
  if (len < 0.2){ quitarPreviewHerramienta(); return; }
  if (!previewMesh){
    previewMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.45, depthWrite: false }));
    scene.add(previewMesh);
  }
  previewMesh.material.color.setHex(herramienta === 'via' ? 0x8a8f96 : herramienta === 'regla' ? 0xffd23e : herramienta === 'lote' ? 0xe0303d : 0x2e9bff);
  previewMesh.scale.set(len, 1, herramienta === 'via' ? viaAnchoNuevo : (herramienta === 'regla' || herramienta === 'lote') ? 0.25 : 0.5);
  previewMesh.position.set((p.x + ancla.x) / 2, 0.14, (p.z + ancla.z) / 2);
  previewMesh.rotation.y = -Math.atan2(dz, dx);
}
/* clic en tramo de vía, ruta o cerramiento (se llama desde finPointer con el rayo ya lanzado) */
function seleccionarViaORuta(){
  // primero las rutas (líneas delgadas que suelen ir ENCIMA de una vía ancha:
  // si la vía se probara primero, la ruta nunca se podría seleccionar)
  const p = puntoSuelo();
  if (p){
    for (const r of rutas){
      const tz = trazadoRuta(r);
      for (let i = 1; i < tz.length; i++){
        const dx = tz[i][0] - tz[i - 1][0], dz = tz[i][1] - tz[i - 1][1];
        const len2 = dx * dx + dz * dz;
        let t = len2 > 0 ? ((p.x - tz[i - 1][0]) * dx + (p.z - tz[i - 1][1]) * dz) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        if (Math.hypot(p.x - (tz[i - 1][0] + dx * t), p.z - (tz[i - 1][1] + dz * t)) < 2.2){
          seleccionarRuta(r.id);
          return true;
        }
      }
    }
  }
  const hv = raycaster.intersectObjects(viaMeshes);
  if (hv.length){ seleccionarVia(hv[0].object.userData.viaId); return true; }
  if (cerrCfg.activo){
    const hc = raycaster.intersectObject(cerrGrupo, true);
    if (hc.length){ abrirFicha(); return true; }
  }
  return false;
}

/* ============ REGLA / MEDIR DISTANCIAS ============
   Herramienta de medición: cada clic marca un punto y cada par consecutivo
   dibuja una línea amarilla con su distancia en metros. Las mediciones se
   quedan en pantalla como cotas hasta que las borres — pero NO se guardan
   con el proyecto (son de la sesión). */
const reglaGrupo = new THREE.Group(); scene.add(reglaGrupo);
let mediciones = [];      // [{x1,z1,x2,z2}]
let trazoRegla = null;    // {x,z} último punto marcado (encadena mediciones)
function clicRegla(pRaw){
  const p = { x: red2(pRaw.x), z: red2(pRaw.z) };
  if (!trazoRegla){
    trazoRegla = p;
    redibujarMediciones(); panelHerramientaRegla();
    avisar('Punto inicial marcado — haz clic en el otro extremo para medir');
    return;
  }
  if (Math.hypot(p.x - trazoRegla.x, p.z - trazoRegla.z) < 0.3) return;
  mediciones.push({ x1: trazoRegla.x, z1: trazoRegla.z, x2: p.x, z2: p.z });
  trazoRegla = p;    // el final queda como inicio de la siguiente medición
  redibujarMediciones(); panelHerramientaRegla();
}
function redibujarMediciones(){
  vaciarGrupo(reglaGrupo);
  const AMARILLO = 0xffd23e;
  const disco = (x, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: AMARILLO }));
    m.position.set(x, 0.16, z);
    reglaGrupo.add(m);
  };
  mediciones.forEach(me => {
    const dx = me.x2 - me.x1, dz = me.z2 - me.z1, len = Math.hypot(dx, dz);
    if (len < 0.2) return;
    const linea = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.18),
      new THREE.MeshBasicMaterial({ color: AMARILLO }));
    linea.position.set((me.x1 + me.x2) / 2, 0.2, (me.z1 + me.z2) / 2);
    linea.rotation.y = -Math.atan2(dz, dx);
    reglaGrupo.add(linea);
    disco(me.x1, me.z1); disco(me.x2, me.z2);
    const et = crearEtiqueta(Math.round(len * 100) / 100 + ' m', modo2D ? 13 : 9, 'rgba(120,85,10,0.88)');
    et.position.set((me.x1 + me.x2) / 2, modo2D ? 2.2 : 1.8, (me.z1 + me.z2) / 2);
    reglaGrupo.add(et);
  });
  if (trazoRegla) disco(trazoRegla.x, trazoRegla.z);
  aplicarVisibilidadEtiquetas(reglaGrupo);
}
function panelHerramientaRegla(){
  const total = Math.round(mediciones.reduce((s, m) => s + Math.hypot(m.x2 - m.x1, m.z2 - m.z1), 0) * 100) / 100;
  const filas = mediciones.map((m, i) =>
    '<div class="planoFila"><span class="planoNom">Medición ' + (i + 1) + ' <small>· ' + (Math.round(Math.hypot(m.x2 - m.x1, m.z2 - m.z1) * 100) / 100) + ' m</small></span>' +
    '<button class="planoBtn peligro" style="width:auto; margin:0" title="Eliminar SOLO esta medición" onclick="quitarMedicionLibre(' + i + ')">✕</button></div>').join('');
  panelSel('Regla — medir distancias',
    '<div class="desc">Haz <b class="txtAcento">clic sobre el terreno</b> en dos puntos para medir la distancia entre ellos; ' +
    'cada clic siguiente encadena otra medición. <b class="txtAcento">Esc</b> quita la última medición (o sal de la herramienta si ya no queda ninguna). ' +
    'Las cotas quedan en pantalla hasta que las borres (no se guardan con el proyecto).</div>' +
    (mediciones.length ? filas + '<div class="desc" style="margin-top:6px"><b class="txtFuerte">Total: ' + total + ' m</b></div>' : '') +
    (trazoRegla ? '<div class="desc"><b class="txtAcento">Midiendo…</b> haz clic en el siguiente punto.</div>' : '') +
    '<button onclick="deshacerPuntoHerramienta()">' + ic('girarIzq') + 'Deshacer última medición</button>' +
    '<button onclick="terminarTrazo()">' + ic('check') + 'Terminar (empezar otra medición)</button>' +
    (mediciones.length ? '<button class="btnEliminar" onclick="borrarMediciones()">' + ic('basura') + 'Borrar todas las mediciones</button>' : ''));
}
function quitarMedicionLibre(i){
  if (!mediciones[i]) return;
  mediciones.splice(i, 1);
  redibujarMediciones();
  if (herramienta === 'regla') panelHerramientaRegla();
  avisar('Medición eliminada');
}
/* Esc con la regla activa: quita la ÚLTIMA medición (o el punto en curso);
   con todo limpio, un Esc más sale de la herramienta (lo maneja el keydown) */
function escRegla(){
  if (trazoRegla){ trazoRegla = null; redibujarMediciones(); panelHerramientaRegla(); avisar('Punto en curso cancelado'); return true; }
  if (mediciones.length){ mediciones.pop(); redibujarMediciones(); panelHerramientaRegla(); avisar('Última medición eliminada'); return true; }
  return false;
}
function borrarMediciones(){
  mediciones = []; trazoRegla = null;
  redibujarMediciones();
  if (herramienta === 'regla') panelHerramientaRegla();
  avisar('Mediciones borradas');
}

/* ============ HERRAMIENTA "TERRENO LIBRE": dibujar el perímetro del lote
   por clics, con el área en vivo — para terrenos que no son rectangulares.
   Se recomienda hacerlo en el Plano 2D (norte arriba) porque ahí se ve el
   contorno completo, pero funciona igual en 3D. ============ */
let trazoLote = null;   // array de {x,z} mientras se dibuja el perímetro
const loteTrazoGrupo = new THREE.Group(); scene.add(loteTrazoGrupo);
const DIST_CIERRE_LOTE = 2;   // metros: qué tan cerca del primer punto para cerrar el lote
function clicLote(pRaw){
  const p = { x: red2(pRaw.x), z: red2(pRaw.z) };
  if (!trazoLote){
    // sin un trazo nuevo en curso: si el clic cae cerca de un vértice del
    // perímetro YA guardado, ese clic BORRA ese punto en vez de empezar un
    // dibujo nuevo (así se puede corregir solo una esquina sin rehacer todo)
    if (loteEsLibre()){
      const pts = ficha.lotePoligono;
      for (let i = 0; i < pts.length; i++){
        if (Math.hypot(p.x - pts[i][0], p.z - pts[i][1]) < 2){
          quitarPuntoLoteLibre(i);
          return;
        }
      }
    }
    trazoLote = [];
  }
  if (trazoLote.length >= 3){
    const primero = trazoLote[0];
    if (Math.hypot(p.x - primero.x, p.z - primero.z) < DIST_CIERRE_LOTE){
      finalizarLoteLibre();
      return;
    }
  }
  if (trazoLote.length && Math.hypot(p.x - trazoLote[trazoLote.length - 1].x, p.z - trazoLote[trazoLote.length - 1].z) < 0.3) return;
  trazoLote.push(p);
  redibujarTrazoLote();
  panelHerramientaLote();
}
function redibujarTrazoLote(){
  vaciarGrupo(loteTrazoGrupo);
  if (!trazoLote || !trazoLote.length) return;
  const ROJO = 0xe0303d;   // rojo: sobre el terreno verde se distingue mucho mejor que el verde
  const disco = (x, z, radio) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: ROJO }));
    m.position.set(x, 0.17, z);
    loteTrazoGrupo.add(m);
  };
  for (let i = 0; i < trazoLote.length - 1; i++){
    const a = trazoLote[i], b = trazoLote[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    if (len < 0.05) continue;
    const linea = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.22),
      new THREE.MeshBasicMaterial({ color: ROJO }));
    linea.position.set((a.x + b.x) / 2, 0.2, (a.z + b.z) / 2);
    linea.rotation.y = -Math.atan2(dz, dx);
    loteTrazoGrupo.add(linea);
  }
  trazoLote.forEach((pt, i) => disco(pt.x, pt.z, i === 0 ? 0.5 : 0.32));
  if (trazoLote.length >= 3){
    const areaViva = Math.round(areaPoligono(trazoLote.map(pt => [pt.x, pt.z])));
    const et = crearEtiqueta('≈ ' + areaViva.toLocaleString('es-CO') + ' m² si cierras aquí', modo2D ? 14 : 10, 'rgba(150,25,30,0.88)');
    const cx = trazoLote.reduce((s, pt) => s + pt.x, 0) / trazoLote.length;
    const cz = trazoLote.reduce((s, pt) => s + pt.z, 0) / trazoLote.length;
    et.position.set(cx, modo2D ? 2.4 : 2, cz);
    loteTrazoGrupo.add(et);
  }
  aplicarVisibilidadEtiquetas(loteTrazoGrupo);
}
/* puntos del perímetro YA guardado, resaltados en azul mientras la
   herramienta está activa pero no hay un trazo nuevo en curso — un clic
   sobre cualquiera de ellos lo borra (ver clicLote) */
function mostrarPuntosEditablesLote(){
  vaciarGrupo(loteTrazoGrupo);
  if (!loteEsLibre()) return;
  const AZUL = 0x2e9bff;
  ficha.lotePoligono.forEach(([x, z]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: AZUL }));
    m.position.set(x, 0.17, z);
    loteTrazoGrupo.add(m);
  });
}
function quitarPuntoLoteLibre(i){
  if (!loteEsLibre() || ficha.lotePoligono.length <= 3){
    avisar('El perímetro necesita al menos 3 puntos — bórralo completo o dibuja uno nuevo');
    return;
  }
  ficha.lotePoligono.splice(i, 1);
  construirLote();
  construirCerramiento();
  guardar('Punto del terreno eliminado');
  mostrarPuntosEditablesLote();
  panelHerramientaLote();
  avisar('Punto del perímetro eliminado — ' + Math.round(loteAreaM2()).toLocaleString('es-CO') + ' m²');
}
function borrarPerimetroLibre(){
  if (!loteEsLibre()){ avisar('No hay un perímetro libre dibujado'); return; }
  ficha.lotePoligono = [];
  ficha.loteModo = 'rectangulo';
  construirLote();
  construirCerramiento();
  guardar('Perímetro libre borrado (vuelve a rectángulo)');
  vaciarGrupo(loteTrazoGrupo);
  setHerramienta(null);
  avisar('Perímetro borrado — el lote volvió a ser rectangular (' + ficha.loteLargo + ' × ' + ficha.loteAncho + ' m)');
}
function panelHerramientaLote(){
  const n = trazoLote ? trazoLote.length : 0;
  const areaViva = n >= 3 ? Math.round(areaPoligono(trazoLote.map(pt => [pt.x, pt.z]))) : null;
  if (!trazoLote && loteEsLibre()){
    const pts = ficha.lotePoligono;
    const filas = pts.map((pt, i) =>
      '<div class="planoFila"><span class="planoNom">Punto ' + (i + 1) + ' <small>· (' + pt[0] + ', ' + pt[1] + ')</small></span>' +
      '<button class="planoBtn peligro" style="width:auto; margin:0" title="Eliminar SOLO este punto" onclick="quitarPuntoLoteLibre(' + i + ')">✕</button></div>').join('');
    panelSel('Terreno libre — editar el perímetro',
      '<div class="desc">Perímetro actual: <b class="txtFuerte">' + pts.length + ' puntos</b> · ≈ <b class="txtAcento">' + Math.round(loteAreaM2()).toLocaleString('es-CO') + ' m²</b>. ' +
      'Borra un punto suelto con ✕ (los puntos en azul sobre el terreno también se borran con un clic), o haz ' +
      '<b class="txtAcento">clic sobre un punto vacío del terreno</b> para empezar a dibujar un perímetro nuevo (reemplaza este).</div>' +
      filas +
      '<button class="btnEliminar" style="margin-top:10px" onclick="borrarPerimetroLibre()">' + ic('basura') + 'Borrar todo el perímetro (volver a rectángulo)</button>');
    return;
  }
  panelSel('Terreno libre — dibujar el perímetro',
    '<div class="desc">Haz <b class="txtAcento">clic sobre el terreno</b> marcando cada esquina del lote, en orden, ' +
    'siguiendo el contorno real (no tiene que ser rectangular). Con 3 puntos o más, haz clic cerca del ' +
    '<b class="txtAcento">primer punto</b> para cerrar el terreno.</div>' +
    (n ? '<div class="desc"><b class="txtFuerte">' + n + ' punto(s)</b>' + (areaViva !== null ? ' · ≈ <b class="txtAcento">' + areaViva.toLocaleString('es-CO') + ' m²</b> si cierras ahora' : ' · faltan al menos ' + (3 - n) + ' punto(s) para poder cerrar') + '</div>' : '<div class="desc">Aún no hay puntos marcados.</div>') +
    (n ? '<button onclick="deshacerPuntoHerramienta()">' + ic('girarIzq') + 'Deshacer último punto</button>' : '') +
    (n >= 3 ? '<button class="orgAccion primario" onclick="finalizarLoteLibre()">' + ic('check') + 'Cerrar terreno (' + (areaViva || 0).toLocaleString('es-CO') + ' m²)</button>' : '') +
    (n ? '<button class="btnEliminar" onclick="cancelarLoteLibre()">' + ic('basura') + 'Cancelar dibujo</button>' : ''));
}
function finalizarLoteLibre(){
  if (!trazoLote || trazoLote.length < 3){ avisar('Marca al menos 3 puntos para cerrar el terreno'); return; }
  ficha.loteModo = 'libre';
  ficha.lotePoligono = trazoLote.map(pt => [pt.x, pt.z]);
  trazoLote = null;
  vaciarGrupo(loteTrazoGrupo);
  construirLote();
  construirCerramiento();
  guardar('Terreno dibujado');
  setHerramienta(null);
  avisar('Terreno cerrado — ' + Math.round(loteAreaM2()).toLocaleString('es-CO') + ' m²');
  if (disenoInicialPendiente) abrirDisenoTerrenoInicial();
}
function cancelarLoteLibre(){
  trazoLote = null;
  if (herramienta === 'lote') mostrarPuntosEditablesLote(); else vaciarGrupo(loteTrazoGrupo);
  if (herramienta === 'lote') panelHerramientaLote();
  avisar('Dibujo del terreno cancelado');
}
/* Esc con la herramienta de lote activa: primero quita el último punto; con
   el trazo vacío, un Esc más sale de la herramienta (lo maneja el keydown) */
function escLote(){
  if (trazoLote && trazoLote.length){
    trazoLote.pop();
    if (!trazoLote.length){ trazoLote = null; mostrarPuntosEditablesLote(); }
    else redibujarTrazoLote();
    panelHerramientaLote();
    avisar('Último punto quitado');
    return true;
  }
  return false;
}
/* abre el Plano 2D y activa la herramienta — se llama desde el botón de la
   Ficha técnica ("Dibujar/Rehacer el perímetro en el Plano 2D") */
function abrirHerramientaLoteLibre(){
  cerrarVentanaLibre();
  if (!modo2D) toggleVista2D();
  trazoLote = null;
  setHerramienta('lote');
}

/* ============ DISEÑAR EL TERRENO ANTES QUE LA FICHA TÉCNICA ============
   Al comenzar una obra nueva, primero se define el lote (rectángulo o
   perímetro libre dibujado) y solo cuando ya quedó cerrado se pasa a pedir
   el nombre del proyecto, el taller y el equipo. */
let disenoInicialPendiente = false;
function abrirDisenoTerrenoInicial(){
  disenoInicialPendiente = true;
  setHerramienta(null);
  const esLibreAhora = ficha.loteModo === 'libre';
  document.getElementById('libreVentTitulo').textContent = 'Diseña el terreno';
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Antes de ponerle nombre a la obra, define el terreno. Escribe el ancho y el largo, ' +
    'o dibuja el perímetro a mano si tu lote no es rectangular (muchos terrenos reales no lo son).</div>' +
    '<div style="display:flex; gap:16px; margin-top:10px">' +
      '<label style="display:flex; align-items:center; gap:5px"><input type="radio" name="iniLoteModo" value="rectangulo"' + (!esLibreAhora ? ' checked' : '') + ' onchange="cambiarModoLoteInicial()"> Ancho × Largo</label>' +
      '<label style="display:flex; align-items:center; gap:5px"><input type="radio" name="iniLoteModo" value="libre"' + (esLibreAhora ? ' checked' : '') + ' onchange="cambiarModoLoteInicial()"> Libre (dibujado)</label>' +
    '</div>' +
    '<div id="iniLoteRectangulo" style="display:' + (esLibreAhora ? 'none' : 'flex') + '; gap:8px; margin-top:10px; align-items:flex-end">' +
      '<label style="flex:1">Largo del lote (m)<input type="number" id="iniLoteLargo" value="' + ficha.loteLargo + '" min="20" max="400" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Inicial()"></label>' +
      '<label style="flex:1">Ancho del lote (m)<input type="number" id="iniLoteAncho" value="' + ficha.loteAncho + '" min="20" max="300" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Inicial()"></label>' +
      '<b id="iniLoteM2" style="white-space:nowrap; padding-bottom:8px">≈ ' + Math.round(ficha.loteLargo * ficha.loteAncho).toLocaleString('es-CO') + ' m²</b>' +
    '</div>' +
    '<div id="iniLoteLibre" style="display:' + (esLibreAhora ? 'block' : 'none') + '; margin-top:10px">' +
      '<div class="desc">' + (loteEsLibre()
        ? ('Perímetro dibujado: ' + ficha.lotePoligono.length + ' puntos ≈ ' + Math.round(areaPoligono(ficha.lotePoligono)).toLocaleString('es-CO') + ' m².')
        : 'Aún no has dibujado el perímetro.') + '</div>' +
      '<button onclick="iniciarDibujoLoteInicial()">' + ic('regla') + (loteEsLibre() ? 'Rehacer el perímetro' : 'Dibujar el perímetro en el Plano 2D') + '</button>' +
    '</div>' +
    '<div style="margin-top:16px; display:flex; gap:6px">' +
      '<button class="orgAccion primario" style="margin:0" onclick="continuarConNombresInicial()">' + ic('check') + 'Continuar → Datos de la obra</button>' +
    '</div>';
  document.getElementById('libreOverlay').style.display = 'flex';
}
function cambiarModoLoteInicial(){
  const modo = (document.querySelector('input[name="iniLoteModo"]:checked') || {}).value || 'rectangulo';
  const rec = document.getElementById('iniLoteRectangulo'), lib = document.getElementById('iniLoteLibre');
  if (rec) rec.style.display = modo === 'libre' ? 'none' : 'flex';
  if (lib) lib.style.display = modo === 'libre' ? 'block' : 'none';
}
function refrescarM2Inicial(){
  const campoL = document.getElementById('iniLoteLargo'), campoA = document.getElementById('iniLoteAncho');
  if (!campoL || !campoA) return;
  const L = numLim(campoL.value, ficha.loteLargo, 20, 400);
  const A = numLim(campoA.value, ficha.loteAncho, 20, 300);
  const el = document.getElementById('iniLoteM2');
  if (el) el.textContent = '≈ ' + Math.round(L * A).toLocaleString('es-CO') + ' m²';
}
function iniciarDibujoLoteInicial(){
  cerrarVentanaLibre();
  if (!modo2D) toggleVista2D();
  trazoLote = null;
  setHerramienta('lote');
}
function continuarConNombresInicial(){
  const modoRadio = (document.querySelector('input[name="iniLoteModo"]:checked') || {}).value || 'rectangulo';
  if (modoRadio === 'rectangulo'){
    const L = numLim((document.getElementById('iniLoteLargo') || {}).value, ficha.loteLargo, 20, 400);
    const A = numLim((document.getElementById('iniLoteAncho') || {}).value, ficha.loteAncho, 20, 300);
    ficha.loteLargo = L; ficha.loteAncho = A; ficha.loteModo = 'rectangulo';
    construirLote();
    construirCerramiento();
  } else if (!loteEsLibre()){
    avisar('Dibuja el perímetro del terreno antes de continuar');
    return;
  }
  disenoInicialPendiente = false;
  abrirFicha();
}

/* ============ DÍA / NOCHE (iluminación de la obra) ============
   El botón "Noche" oscurece el cielo, baja el sol a luz de luna y ENCIENDE
   los reflectores de las "Torres de iluminación" que el usuario haya
   instalado (Agregar → Maquinaria → Planta e instalaciones). */
let esNoche = false;
function aplicarCielo(){
  scene.background.setHex(esNoche ? 0x070b14 : 0x1a2030);
  scene.fog.color.setHex(esNoche ? 0x070b14 : 0x1a2030);
  hemi.intensity = esNoche ? 0.22 : 0.8;
  sol.intensity = esNoche ? 0.12 : 1.0;
  sol.color.setHex(esNoche ? 0x93a7d1 : 0xfff2dd);
  scene.traverse(n => {
    if (n.isLight && n.userData.esReflector) n.intensity = esNoche ? 1.8 : 0;
    if (n.isMesh && n.userData.esFocoReflector && n.material.emissive) n.material.emissive.setHex(esNoche ? 0xffdd88 : 0x000000);
  });
  const btn = document.getElementById('btnNoche');
  if (btn){
    btn.classList.toggle('activo', esNoche);
    btn.innerHTML = esNoche ? ic('sol') + 'Día' : ic('luna') + 'Noche';
  }
}
function toggleNoche(){
  esNoche = !esNoche;
  aplicarCielo();
  guardar();
  const hayTorres = elementos.some(g => g.userData.def.catalogoId === 'torreIluminacion');
  avisar(esNoche
    ? (hayTorres ? 'Modo noche: reflectores encendidos' : 'Modo noche — instala "Torres de iluminación" (Agregar → Maquinaria) para alumbrar la obra')
    : 'Modo día');
}

/* ============ MODO CAMINAR (primera persona por la obra) ============
   W A S D o flechas para moverse (Shift = correr), el mouse mira alrededor
   (pointer lock) y Esc sale. La cámara va a 1,70 m de altura, como una
   persona recorriendo la obra. */
let caminando = false;
const camWalk = { x: 0, z: 30, yaw: Math.PI, pitch: 0 };
const teclasCaminar = {};
let portapapeles = null;   // def copiada con Ctrl+C
function toggleCaminar(){
  if (manejando) bajarDeVehiculo();   // no se puede alternar caminar mientras se maneja
  if (!caminando && modo2D) toggleVista2D();   // caminar es en 3D
  caminando = !caminando;
  const btn = document.getElementById('btnCaminar');
  btn.classList.toggle('activo', caminando);
  btn.innerHTML = caminando ? ic('volver') + 'Salir' : ic('caminar') + 'Caminar';
  if (caminando){
    setHerramienta(null);
    // entra por el portón de acceso, mirando hacia el centro del lote
    const centro = loteCentro();
    camWalk.x = puertaObraXZ[0]; camWalk.z = puertaObraXZ[1];
    camWalk.yaw = Math.atan2(centro[0] - camWalk.x, centro[1] - camWalk.z); camWalk.pitch = 0;
    animCam = null;
    try { renderer.domElement.requestPointerLock(); } catch (e) {}
    avisar('Caminando por la obra: W A S D o flechas · Shift corre · mueve el mouse para mirar · Esc sale');
  } else {
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    Object.keys(teclasCaminar).forEach(k => delete teclasCaminar[k]);
    actualizarCamara();
    avisar('Saliste del modo caminar');
  }
}
/* si el navegador suelta el puntero (Esc estando bloqueado), se sale solo */
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && caminando) toggleCaminar();
});
document.addEventListener('mousemove', e => {
  if (!caminando || document.pointerLockElement !== renderer.domElement) return;
  camWalk.yaw -= (e.movementX || 0) * 0.0024;
  camWalk.pitch = Math.min(1.25, Math.max(-1.25, camWalk.pitch - (e.movementY || 0) * 0.0022));
});
/* mantener presionada una tecla de movimiento ACELERA progresivamente hasta
   el tope (caminando o corriendo con Shift); soltarla frena rápido —
   se siente como acelerar un personaje, no un interruptor de dos posiciones */
let velCaminarActual = 0;
function moverCaminante(dt){
  const t = teclasCaminar;
  const adelante = ((t.KeyW || t.ArrowUp) ? 1 : 0) - ((t.KeyS || t.ArrowDown) ? 1 : 0);
  const lado = ((t.KeyD || t.ArrowRight) ? 1 : 0) - ((t.KeyA || t.ArrowLeft) ? 1 : 0);
  const activo = adelante || lado;
  const velMax = (t.ShiftLeft || t.ShiftRight) ? 9 : 4.5;
  velCaminarActual = activo
    ? Math.min(velMax, velCaminarActual + dt * velMax * 2.2)
    : Math.max(0, velCaminarActual - dt * velMax * 3.5);
  if (activo && velCaminarActual > 0.01){
    const fx = Math.sin(camWalk.yaw), fz = Math.cos(camWalk.yaw);
    camWalk.x = Math.min(290, Math.max(-290, camWalk.x + (fx * adelante - fz * lado) * velCaminarActual * dt));
    camWalk.z = Math.min(190, Math.max(-190, camWalk.z + (fz * adelante + fx * lado) * velCaminarActual * dt));
  }
  camera.position.set(camWalk.x, 1.7, camWalk.z);
  camera.lookAt(
    camWalk.x + Math.sin(camWalk.yaw) * Math.cos(camWalk.pitch),
    1.7 + Math.sin(camWalk.pitch),
    camWalk.z + Math.cos(camWalk.yaw) * Math.cos(camWalk.pitch)
  );
}

/* ============ MODO MANEJAR (subirse a un carro, malacate o torre grúa) ============
   Presiona E cerca de un vehículo móvil, un malacate o una torre grúa para
   "subirte": la cámara pasa a tercera persona detrás de él y W A S D /
   flechas lo mueven de verdad (los vehículos avanzan y giran; el malacate y
   la torre grúa son estructuras fijas, así que solo sirven de mirador
   elevado). Mantener la tecla también acelera progresivamente. E o Esc para
   bajarte — la posición nueva del vehículo queda guardada. */
let manejando = null;
let velManejarActual = 0;
const RADIO_SUBIR = 7;   // metros de cercanía para poder subirse con E
function esVehiculoManejable(d){
  return (d.tipo === 'maquina' && d.movil) || d.tipo === 'malacate' || d.tipo === 'gruaTorre';
}
function elementoCercanoParaSubir(){
  const px = caminando ? camWalk.x : camCtrl.target.x;
  const pz = caminando ? camWalk.z : camCtrl.target.z;
  let mejor = null, mejorD = RADIO_SUBIR;
  elementos.forEach(g => {
    if (!esVehiculoManejable(g.userData.def)) return;
    const dist = Math.hypot(g.position.x - px, g.position.z - pz);
    if (dist < mejorD){ mejorD = dist; mejor = g; }
  });
  return mejor;
}
function toggleManejar(){
  if (manejando){ bajarDeVehiculo(); return; }
  if (modo2D || amueblando || herramienta) return;
  const g = elementoCercanoParaSubir();
  if (!g){ avisar('Acércate a un vehículo móvil, un malacate o una torre grúa y presiona E'); return; }
  if (g.userData.def.bloqueado){ avisar('"' + g.userData.def.nombre + '" está bloqueado — desbloquéalo para manejarlo'); return; }
  manejando = g;
  velManejarActual = 0;
  seleccionar(g);
  if (!caminando){
    caminando = true;
    document.getElementById('btnCaminar').classList.add('activo');
    try { renderer.domElement.requestPointerLock(); } catch (e) {}
  }
  const esFijo = g.userData.def.tipo === 'malacate' || g.userData.def.tipo === 'gruaTorre';
  avisar('Subido a "' + g.userData.def.nombre + '"' + (esFijo
    ? ' (mirador fijo) — E o Esc para bajarte'
    : ': W A S D / flechas para manejar, mantén para acelerar — E o Esc para bajarte'));
}
function bajarDeVehiculo(){
  if (!manejando) return;
  const nombre = manejando.userData.def.nombre;
  // el jugador queda parado justo al lado de donde se bajó, no donde
  // hubiera quedado camWalk por un mousemove perdido mientras manejaba
  camWalk.x = manejando.position.x + Math.sin(manejando.rotation.y + Math.PI / 2) * 3;
  camWalk.z = manejando.position.z + Math.cos(manejando.rotation.y + Math.PI / 2) * 3;
  camWalk.yaw = manejando.rotation.y; camWalk.pitch = 0;
  guardar('Movido: ' + nombre);
  manejando = null;
  avisar('Bajaste de "' + nombre + '"');
}
function moverVehiculoManejado(dt){
  if (!manejando || !elementos.includes(manejando)){ manejando = null; return; }
  const d = manejando.userData.def;
  const t = teclasCaminar;
  const puedeAvanzar = d.tipo === 'maquina' && d.movil && !d.bloqueado;
  if (puedeAvanzar){
    const adelante = ((t.KeyW || t.ArrowUp) ? 1 : 0) - ((t.KeyS || t.ArrowDown) ? 1 : 0);
    const girar = ((t.KeyA || t.ArrowLeft) ? 1 : 0) - ((t.KeyD || t.ArrowRight) ? 1 : 0);
    const velMax = (t.ShiftLeft || t.ShiftRight || t.KeyT) ? 16 : 8;   // T = turbo, igual que mantener Shift
    velManejarActual = adelante
      ? Math.min(velMax, velManejarActual + dt * velMax * 1.8)
      : Math.max(0, velManejarActual - dt * velMax * 2.5);
    if (velManejarActual > 0.05){
      d.rot += girar * dt * 1.1 * Math.sign(adelante || 1);
      manejando.rotation.y = d.rot;
      const fx = Math.sin(d.rot), fz = Math.cos(d.rot);
      d.x = Math.min(260, Math.max(-260, d.x + fx * velManejarActual * dt * adelante));
      d.z = Math.min(180, Math.max(-180, d.z + fz * velManejarActual * dt * adelante));
      manejando.position.set(d.x, manejando.position.y, d.z);
      if (mostrarCotas) redibujarCotas2D();
    }
  }
  // cámara en tercera persona, siguiendo detrás y arriba del vehículo
  const alto = (d.h || 3) + 3.5, dist = Math.max(8, (d.d || 5) * 1.1);
  const cx = manejando.position.x - Math.sin(manejando.rotation.y) * dist;
  const cz = manejando.position.z - Math.cos(manejando.rotation.y) * dist;
  camera.position.set(cx, manejando.position.y + alto * 0.55, cz);
  camera.lookAt(manejando.position.x, manejando.position.y + (d.h || 2) * 0.4, manejando.position.z);
}

/* ============ VISTA 2D EN PLANTA (organizar zonas viendo los m²) ============
   Cámara ortográfica cenital sobre la misma escena: el lote se ve en planta
   con su etiqueta de m², cada zona muestra "nombre · N m²" y se puede
   arrastrar igual que en 3D. Arrastrar en vacío desplaza el plano; la rueda
   hace zoom. El botón alterna Plano 2D ↔ Vista 3D. */
let modo2D = false;
let zoom2D = 90;                 // media altura visible del plano, en metros
const cam2D = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
cam2D.up.set(0, 0, -1);          // norte (−z) hacia arriba de la pantalla
function actualizarCamara2D(){
  const aspecto = innerWidth / innerHeight;
  cam2D.left = -zoom2D * aspecto; cam2D.right = zoom2D * aspecto;
  cam2D.top = zoom2D; cam2D.bottom = -zoom2D;
  cam2D.position.set(camCtrl.target.x, 260, camCtrl.target.z);
  cam2D.lookAt(camCtrl.target.x, 0, camCtrl.target.z);
  cam2D.updateProjectionMatrix();
}
function camActiva(){ return modo2D ? cam2D : camera; }
/* texto de la etiqueta flotante: en el plano 2D incluye los m² de la zona */
function textoEtiqueta(def){
  if (modo2D && typeof def.w === 'number' && typeof def.d === 'number'){
    return def.nombre + ' · ' + Math.round(def.w * def.d) + ' m²';
  }
  return def.nombre;
}
function refrescarEtiquetas(){ elementos.forEach(regenerarEtiquetaLibre); }
function toggleVista2D(){
  if (caminando) toggleCaminar();   // el plano 2D apaga el modo caminar
  modo2D = !modo2D;
  const btn = document.getElementById('btn2D');
  btn.classList.toggle('activo', modo2D);
  btn.innerHTML = modo2D ? ic('caja') + 'Vista 3D' : ic('plano') + 'Plano 2D';
  document.getElementById('btnAreas').style.display = modo2D ? '' : 'none';
  if (modo2D){
    const centro = loteCentro();
    camCtrl.target.set(centro[0], 0, centro[1]);
    zoom2D = zoomAjustadoLote();
    animCam = null;
  } else if (amueblando){
    cerrarAmoblar();
  }
  refrescarEtiquetas();
  redibujarCotas2D();
  avisar(modo2D
    ? 'Plano 2D: arrastra las zonas para organizarlas · arrastrar en vacío mueve el plano · rueda = zoom'
    : 'Vista 3D');
}

/* ============ EXPORTAR PLANO (PDF, mismo truco del proyecto Bambú) ============
   No usa ninguna librería de PDF: abre una ventana nueva con la foto de la
   obra en planta + el cuadro de áreas (m² ejecutados por zona y el espacio
   disponible del lote) en una hoja con estilo de impresión, y llama a
   window.print() — el usuario elige "Guardar como PDF" en el diálogo del
   navegador. Igual de confiable que una librería, sin pesar la página. */
function capturarPlantaLibre(){
  const eraModo2D = modo2D, eraCotas = mostrarCotas, eraEtiquetas = etiquetasVisibles;
  const eraTarget = camCtrl.target.clone(), eraZoom = zoom2D;
  const centro = loteCentro();
  if (!modo2D){ modo2D = true; camCtrl.target.set(centro[0], 0, centro[1]); }
  zoom2D = zoomAjustadoLote();
  if (!mostrarCotas) setCotas(true);
  if (!etiquetasVisibles) toggleEtiquetasLibre();
  animCam = null;
  actualizarCamara2D();
  redibujarCotas2D();
  renderer.render(scene, cam2D);
  const url = renderer.domElement.toDataURL('image/png');
  modo2D = eraModo2D; camCtrl.target.copy(eraTarget); zoom2D = eraZoom;
  if (mostrarCotas !== eraCotas) setCotas(eraCotas);
  if (etiquetasVisibles !== eraEtiquetas) toggleEtiquetasLibre();
  const btn2d = document.getElementById('btn2D');
  btn2d.classList.toggle('activo', modo2D);
  btn2d.innerHTML = modo2D ? ic('caja') + 'Vista 3D' : ic('plano') + 'Plano 2D';
  document.getElementById('btnAreas').style.display = modo2D ? '' : 'none';
  redibujarCotas2D();
  return url;
}
function exportarPlanoLibre(){
  const img = capturarPlantaLibre();
  const loteM2 = loteAreaM2();
  const descLote = loteEsLibre() ? 'Perímetro libre' : ('Terreno total (' + ficha.loteLargo + ' × ' + ficha.loteAncho + ' m)');
  const filas = elementos.map(g => {
    const d = g.userData.def;
    const area = tieneMedidasCota(d) ? Math.round(d.w * d.d * 10) / 10 : null;
    return { nombre: d.nombre, tipo: NOMBRE_TIPO[d.tipo] || d.tipo, area };
  });
  const totalArea = Math.round(filas.reduce((s, f) => s + (f.area || 0), 0) * 10) / 10;
  const disponible = Math.max(0, Math.round((loteM2 - totalArea) * 10) / 10);
  const ocupacion = loteM2 > 0 ? Math.round(totalArea / loteM2 * 1000) / 10 : 0;
  const filasHtml = filas.map(f =>
    '<tr><td>' + esc(f.nombre) + '</td><td>' + esc(f.tipo) + '</td><td class="num">' + (f.area !== null ? f.area : '—') + '</td></tr>').join('');
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const equipoHtml = (ficha.equipo && ficha.equipo.length) ? esc(ficha.equipo.join(' · ')) : '—';
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<title>Plano de obra — ' + esc(ficha.nombre || 'Proyecto libre') + '</title>' +
    '<style>' +
      '@page { size: A4 landscape; margin: 12mm; }' +
      'body { font-family: "Nunito", Arial, sans-serif; color: #1f241b; margin: 24px; }' +
      'header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #3E8E5A; padding-bottom: 8px; margin-bottom: 14px; }' +
      'h1 { font-family: "Fredoka", sans-serif; font-size: 19px; margin: 0; color: #2E6B44; text-transform: uppercase; letter-spacing: 1px; }' +
      'h2 { font-family: "Fredoka", sans-serif; font-size: 13px; margin: 18px 0 6px; color: #2E6B44; text-transform: uppercase; letter-spacing: 1px; }' +
      'header small { color: #6a7260; font-size: 12px; }' +
      'img.planta { width: 100%; max-height: 56vh; object-fit: contain; border: 1px solid #d9ddd1; }' +
      '.resumen { display:flex; gap:14px; margin-top:10px; flex-wrap:wrap; }' +
      '.resumen div { background:#f3f5ee; border:1px solid #d9ddd1; border-radius:8px; padding:8px 14px; }' +
      '.resumen b { display:block; font-size:16px; color:#2E6B44; }' +
      '.resumen span { font-size:10.5px; color:#6a7260; text-transform:uppercase; letter-spacing:.5px; }' +
      'table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px; }' +
      'th { text-align: left; color: #6a7260; border-bottom: 2px solid #c3c9b8; padding: 4px 6px; text-transform: uppercase; font-size: 10px; letter-spacing: .6px; }' +
      'td { border-bottom: 1px solid #e4e8dd; padding: 4px 6px; }' +
      'td.num, th.num { text-align: right; }' +
      'tr.total td { font-weight: bold; color: #2E6B44; border-top: 2px solid #c3c9b8; }' +
      '.acciones { margin: 14px 0; display: flex; gap: 10px; }' +
      '.acciones button, .acciones a { font-family: "Fredoka", sans-serif; font-size: 12px; padding: 8px 16px; border: 1px solid #3E8E5A; background: #3E8E5A; color: #fff; border-radius: 999px; cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: .5px; }' +
      '.acciones a { background: transparent; color: #2E6B44; }' +
      '@media print { .acciones { display: none; } body { margin: 0; } }' +
    '</style></head><body>' +
    '<header><div><h1>' + esc(ficha.nombre || 'Proyecto libre') + ' — Plano de obra</h1>' +
      '<small>' + esc(ficha.ubicacion || 'Sin ubicación') + ' · ' + esc(ficha.taller || 'Taller II') + ' · Equipo: ' + equipoHtml + '</small></div>' +
      '<small>Fase: <b>' + esc(FASES_OBRA[ficha.faseObra] || ficha.fase || '—') + '</b> · ' + esc(fecha) + '</small></header>' +
    '<div class="acciones">' +
      '<button onclick="window.print()">Imprimir / Guardar PDF</button>' +
      '<a href="' + img + '" download="plano_2d.png">Descargar PNG</a>' +
    '</div>' +
    '<img class="planta" src="' + img + '" alt="Vista en planta de la obra">' +
    '<div class="resumen">' +
      '<div><b>' + loteM2.toLocaleString('es-CO') + ' m²</b><span>' + esc(descLote) + '</span></div>' +
      '<div><b>' + totalArea.toLocaleString('es-CO') + ' m²</b><span>Ejecutado / construido (' + ocupacion + '%)</span></div>' +
      '<div><b>' + disponible.toLocaleString('es-CO') + ' m²</b><span>Espacio disponible</span></div>' +
    '</div>' +
    '<h2>Descripción de zonas y espacios</h2>' +
    '<table><tr><th>Zona</th><th>Tipo</th><th class="num">Área (m²)</th></tr>' +
      filasHtml +
      '<tr class="total"><td>Total (' + filas.length + ' elementos)</td><td></td><td class="num">' + totalArea + '</td></tr>' +
    '</table>' +
    '<script>window.addEventListener("load", function(){ setTimeout(function(){ window.print(); }, 400); });<\/script>' +
    '</body></html>';
  const w = window.open('', '_blank');
  if (!w){ avisar('Permite las ventanas emergentes para exportar el plano'); return; }
  w.document.write(html);
  w.document.close();
  avisar('Plano listo — usa "Imprimir / Guardar PDF" en la ventana nueva');
}

/* ============ COTAS (acotado de cada zona, botón "Cotas" — apagadas por
   defecto, igual que en el proyecto Bambú) ============
   Cada zona con ancho/fondo (espacio, edificio, maquinaria…) muestra el
   ancho y el fondo como cotas de un plano arquitectónico — visibles tanto
   en 3D como en el Plano 2D. Si quedó girada en un ángulo que no es
   múltiplo de 90° (0/90/180/270°) se marca además el ángulo exacto en
   rojo, para que un giro "raro" nunca pase desapercibido. */
const cotasGrupo = new THREE.Group(); scene.add(cotasGrupo);
let mostrarCotas = false;
let ultimaActualizacionCotas = 0;
function setCotas(on){
  mostrarCotas = on;
  const btn = document.getElementById('btnCotas');
  if (btn) btn.classList.toggle('activo', mostrarCotas);
  redibujarCotas2D();
}
function toggleCotas(){
  setCotas(!mostrarCotas);
  avisar(mostrarCotas ? 'Cotas visibles' : 'Cotas ocultas');
}
function tieneMedidasCota(d){ return typeof d.w === 'number' && typeof d.d === 'number'; }
function anguloRaro(rot){
  const grados = ((rot * 180 / Math.PI) % 360 + 360) % 360;
  const resto = grados % 90;
  const distancia = Math.min(resto, 90 - resto);
  return distancia > 1.5 ? Math.round(grados * 10) / 10 : null;
}
function dibujarCota(p1, p2, medida){
  const dx = p2.x - p1.x, dz = p2.z - p1.z, len = Math.hypot(dx, dz);
  if (len < 0.1) return;
  const grosor = modo2D ? 0.09 : 0.02;   // más gruesa en 2D: se ve mejor desde arriba
  const linea = new THREE.Mesh(new THREE.BoxGeometry(len, grosor, grosor * 2.5),
    new THREE.MeshBasicMaterial({ color: modo2D ? 0x2c3038 : 0x5a6270 }));
  linea.position.set((p1.x + p2.x) / 2, modo2D ? 0.3 : 0.22, (p1.z + p2.z) / 2);
  linea.rotation.y = -Math.atan2(dz, dx);
  cotasGrupo.add(linea);
  const et = crearEtiqueta(Math.round(medida * 100) / 100 + ' m', modo2D ? 11 : 7, modo2D ? 'rgba(20,23,28,0.92)' : 'rgba(40,45,55,0.85)');
  et.position.set((p1.x + p2.x) / 2, modo2D ? 1.8 : 1.4, (p1.z + p2.z) / 2);
  cotasGrupo.add(et);
}
function redibujarCotas2D(){
  vaciarGrupo(cotasGrupo);
  if (!mostrarCotas) return;
  const off = 1.4;
  elementos.forEach(g => {
    if (amueblando === g) return;   // dentro del amoblado no se acota el espacio, solo se ven los muebles
    const d = g.userData.def;
    if (!tieneMedidasCota(d)) return;
    const hw = d.w / 2, hd = d.d / 2;
    const cos = Math.cos(d.rot), sin = Math.sin(d.rot);
    const aMundo = (lx, lz) => ({ x: d.x + lx * cos + lz * sin, z: d.z - lx * sin + lz * cos });
    dibujarCota(aMundo(-hw, -hd - off), aMundo(hw, -hd - off), d.w);
    dibujarCota(aMundo(hw + off, -hd), aMundo(hw + off, hd), d.d);
    const angulo = anguloRaro(d.rot);
    if (angulo !== null){
      const et = crearEtiqueta('∠ ' + angulo + '°', modo2D ? 12 : 8, 'rgba(150,40,20,0.9)');
      et.position.set(d.x, modo2D ? 3.2 : 2.6, d.z);
      cotasGrupo.add(et);
    }
  });
  aplicarVisibilidadEtiquetas(cotasGrupo);
}

/* ============ AMOBLAR ESPACIOS POR DENTRO (interacción) ============
   Modo especial dentro del plano 2D: se hace zoom sobre un espacio elegido y
   el clic izquierdo pasa a colocar/mover muebles de su catálogo DENTRO de
   ese espacio (coordenadas locales), en vez de mover zonas de la obra. */
let amueblando = null;            // THREE.Group del espacio abierto, o null
let muebleArmadoInterior = null;  // catalogoId elegido para colocar en el siguiente clic
let arrastrandoInterior = null;   // pieza interior que se está arrastrando
let interiorSeleccionado = null;  // pieza interior elegida (para girar/eliminar con teclado)
function salirDeAmoblarSiActivo(){ if (amueblando) cerrarAmoblar(); }
function actualizarTinteInterior(obj){
  if (!obj) return;
  const emi = obj === interiorSeleccionado ? 0x554400 : 0x000000;
  obj.traverse(n => { if (n.isMesh && n.material && n.material.emissive !== undefined) n.material.emissive.setHex(emi); });
}
function abrirAmoblar(){
  if (!seleccionado || seleccionado.userData.def.tipo !== 'espacio') return;
  const objetivo = seleccionado;
  setHerramienta(null);
  if (!modo2D) toggleVista2D();
  amueblando = objetivo;
  muebleArmadoInterior = null;
  interiorSeleccionado = null;
  const d = amueblando.userData.def;
  camCtrl.target.set(d.x, 0, d.z);
  zoom2D = Math.max(d.w, d.d) * 0.75 + 2;
  animCam = null;
  redibujarCotas2D();
  renderPanelAmoblar();
  avisar('Amoblando "' + d.nombre + '": elige una pieza y haz clic dentro del espacio · Esc para salir');
}
function cerrarAmoblar(){
  amueblando = null;
  muebleArmadoInterior = null;
  interiorSeleccionado = null;
  arrastrandoInterior = null;
  redibujarCotas2D();
  mostrarPanelVacio();
}
function elegirMuebleInterior(id){
  muebleArmadoInterior = id;
  renderPanelAmoblar();
}
function renderPanelAmoblar(){
  if (!amueblando) return;
  const d = amueblando.userData.def;
  const lista = (d.muebles || []).map((m, i) => {
    const item = catalogoMuebleInterior(m.catalogoId);
    return '<div class="planoFila"><span class="planoNom">' + ic('silla') + ' <b class="txtFuerte">' + esc(item.nombre) + '</b></span>' +
      '<span style="white-space:nowrap">' +
        '<button class="planoBtn" style="width:auto; margin:0" title="Girar 45°" onclick="girarMuebleInterior(' + i + ')">' + ic('girarDer') + '</button> ' +
        '<button class="planoBtn peligro" style="width:auto; margin:0" title="Eliminar" onclick="eliminarMuebleInterior(' + i + ')">' + ic('basura') + '</button>' +
      '</span></div>';
  }).join('');
  panelSel('Amoblar: ' + d.nombre,
    '<div class="desc">Elige una pieza del catálogo y haz <b class="txtAcento">clic dentro del espacio</b> para colocarla. ' +
    'Arrastra las que ya pusiste para reorganizarlas, o usa <b class="txtAcento">R</b> / <b class="txtAcento">Supr</b> sobre la seleccionada. ' +
    '<b class="txtAcento">Esc</b> para salir.</div>' +
    '<select onchange="elegirMuebleInterior(this.value)">' +
      '<option value="">— elige una pieza —</option>' + opcionesCatalogoMueble(muebleArmadoInterior) +
    '</select>' +
    (muebleArmadoInterior ? '<div class="desc">Pieza armada: haz clic dentro del espacio para colocarla.</div>' : '') +
    '<button onclick="cerrarAmoblar()">' + ic('volver') + 'Salir de amoblar</button>' +
    (lista ? '<b style="display:block; margin-top:10px">Muebles colocados</b>' + lista
           : '<div class="desc">Aún no has agregado muebles a este espacio.</div>'));
}
function clicAmoblar(p){
  const d = amueblando.userData.def;
  const loc = mundoALocalRoom(p, d);
  const hw = d.w / 2 - 0.2, hd = d.d / 2 - 0.2;
  if (Math.abs(loc.x) > hw || Math.abs(loc.z) > hd){
    if (!muebleArmadoInterior) avisar('Elige primero una pieza del catálogo arriba');
    else avisar('Coloca la pieza dentro del espacio');
    return;
  }
  if (!muebleArmadoInterior){ avisar('Elige primero una pieza del catálogo arriba'); return; }
  const item = catalogoMuebleInterior(muebleArmadoInterior);
  const nuevo = { id: idSec++, catalogoId: item.id, x: red2(loc.x), z: red2(loc.z), rot: 0, w: item.w, d: item.d, h: item.h, color: item.color };
  d.muebles = d.muebles || [];
  d.muebles.push(nuevo);
  agregarMuebleInteriorAGrupo(amueblando, nuevo, d.muebles.length - 1);
  guardar();
  renderPanelAmoblar();
  avisar(item.nombre + ' colocado — sigue haciendo clic para agregar otro, o arrástralo para moverlo');
}
function seleccionarMuebleInterior(obj){
  actualizarTinteInterior(interiorSeleccionado);
  interiorSeleccionado = obj;
  actualizarTinteInterior(obj);
}
function girarMuebleInterior(i){
  const d = amueblando.userData.def;
  const m = d.muebles[i];
  if (!m) return;
  m.rot = (m.rot || 0) + Math.PI / 4;
  const obj = amueblando.children.find(c => c.userData.esMuebleInterior && c.userData.muebleIdx === i);
  if (obj) obj.rotation.y = m.rot;
  guardar();
  avisar('Pieza girada');
}
function eliminarMuebleInterior(i){
  const d = amueblando.userData.def;
  if (!d.muebles || !d.muebles[i]) return;
  const obj = amueblando.children.find(c => c.userData.esMuebleInterior && c.userData.muebleIdx === i);
  if (obj){
    amueblando.remove(obj);
    obj.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material && n.material.dispose) n.material.dispose(); });
  }
  d.muebles.splice(i, 1);
  // reindexar las piezas restantes (sus índices se corrieron un puesto)
  amueblando.children.forEach(c => { if (c.userData.esMuebleInterior && c.userData.muebleIdx > i) c.userData.muebleIdx--; });
  if (interiorSeleccionado === obj) interiorSeleccionado = null;
  guardar();
  renderPanelAmoblar();
  avisar('Mueble eliminado del espacio');
}

/* ============ ETIQUETAS (mostrar/ocultar nombres flotantes) ============ */
let etiquetasVisibles = true;
/* los grupos que se RECONSTRUYEN (lote, cerramiento, vías, rutas) llaman esto
   al final para que sus etiquetas respeten el estado del botón "Etiquetas" */
function aplicarVisibilidadEtiquetas(grupo){
  if (!etiquetasVisibles) grupo.traverse(n => { if (n.isSprite) n.visible = false; });
}
function toggleEtiquetasLibre(){
  etiquetasVisibles = !etiquetasVisibles;
  elementos.forEach(g => { if (g.userData.etiqueta) g.userData.etiqueta.visible = etiquetasVisibles; });
  [loteGrupo, cerrGrupo, viasGrupo, rutasGrupo].forEach(gr => gr.traverse(n => { if (n.isSprite) n.visible = etiquetasVisibles; }));
  // resaltado solo cuando están OCULTOS (estado no predeterminado)
  document.getElementById('btnEtiquetas').classList.toggle('activo', !etiquetasVisibles);
  avisar(etiquetasVisibles ? 'Nombres y medidas visibles' : 'Nombres y medidas ocultos');
}

/* ============ ZONAS Y AFORO (mismo panel del proyecto Bambú) ============ */
function abrirZonasLibre(){
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Zonas y aforo';
  const loteM2 = loteAreaM2();
  const centro = loteCentro();
  const b = loteBoundingSize();
  const filas = elementos.map(g => {
    const d = g.userData.def;
    const area = (typeof d.w === 'number' && typeof d.d === 'number') ? Math.round(d.w * d.d * 10) / 10 : null;
    const fuera = Math.abs(d.x - centro[0]) + (d.w || 2) / 2 > b.largo / 2 + 0.5 || Math.abs(d.z - centro[1]) + (d.d || 2) / 2 > b.ancho / 2 + 0.5;
    return { d, area, fuera };
  });
  const totalArea = Math.round(filas.reduce((s, f) => s + (f.area || 0), 0) * 10) / 10;
  const ocupacion = Math.round(totalArea / loteM2 * 1000) / 10;
  const stVias = statsVias();
  const areaVias = Math.round(vias.reduce((s, v) => s + Math.hypot(v.x2 - v.x1, v.z2 - v.z1) * v.ancho, 0));
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Todo lo creado en la obra con su área (m²) y la ocupación del lote — igual que "Zonas y aforo" del proyecto Bambú. ' +
    'Los elementos marcados con ⚠ quedaron por fuera del lote.</div>' +
    (filas.length
      ? filas.map(f =>
          '<div class="planoFila"><span class="planoNom"><b class="txtFuerte">' + esc(f.d.nombre) + '</b> ' +
            '<small>· ' + NOMBRE_TIPO[f.d.tipo] + (f.d.bloqueado ? ' · bloqueado' : '') + '</small>' +
            (f.fuera ? ' <small style="color:var(--rojo-texto)">⚠ fuera del lote</small>' : '') + '</span>' +
          '<small style="white-space:nowrap">' + (f.area !== null ? f.area + ' m²' : '—') + '</small></div>').join('')
      : '<div class="desc">Aún no hay zonas ni equipos creados.</div>') +
    '<div class="desc" style="margin-top:10px"><b class="txtFuerte">' + filas.length + ' elementos · ' + totalArea + ' m² ocupados · ' +
      ocupacion + '% del lote (' + Math.round(loteM2).toLocaleString('es-CO') + ' m²)</b><br>' +
      'Vías: ' + stVias.tramos + ' tramo(s) · ' + stVias.total + ' m lineales ≈ ' + areaVias + ' m² · Rutas de vehículos: ' + rutas.length + '</div>';
  document.getElementById('libreOverlay').style.display = 'flex';
}

/* ============ CUADRO DE ÁREAS (solo dentro del Plano 2D) ============
   Botón que aparece únicamente mientras estás en el plano 2D: resumen al
   estilo de un cuadro de áreas arquitectónico — el terreno completo,
   cuánto ocupa cada categoría de elemento, y el detalle (m² y %) de cada
   zona creada, con relación al total ocupado de la obra. */
function abrirCuadroAreas(){
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Cuadro de áreas';
  const loteM2 = loteAreaM2();
  const descLote = loteEsLibre() ? 'Perímetro libre ≈ ' + loteM2.toLocaleString('es-CO') + ' m²' : (ficha.loteLargo + ' × ' + ficha.loteAncho + ' m ≈ ' + loteM2.toLocaleString('es-CO') + ' m²');
  const filas = elementos.map(g => {
    const d = g.userData.def;
    const area = tieneMedidasCota(d) ? Math.round(d.w * d.d * 10) / 10 : 0;
    const perimetro = tieneMedidasCota(d) ? Math.round(2 * (d.w + d.d) * 10) / 10 : 0;
    return { d, area, perimetro };
  });
  const totalArea = Math.round(filas.reduce((s, f) => s + f.area, 0) * 10) / 10;
  const totalPerimetro = Math.round(filas.reduce((s, f) =>
    s + ((f.d.tipo === 'espacio' || f.d.tipo === 'edificio') ? f.perimetro : 0), 0) * 10) / 10;
  const accesos = filas.filter(f => f.d.tipo === 'espacio' && f.d.muros).length;
  const ocupacion = loteM2 > 0 ? Math.round(totalArea / loteM2 * 1000) / 10 : 0;

  const categorias = {};
  filas.forEach(f => {
    const cat = NOMBRE_TIPO[f.d.tipo] || f.d.tipo;
    if (!categorias[cat]) categorias[cat] = { n: 0, area: 0 };
    categorias[cat].n++; categorias[cat].area += f.area;
  });

  const tile = (num, lbl) =>
    '<div style="flex:1; min-width:110px; background:var(--sup-alta); border-radius:var(--radio-boton); padding:10px; text-align:center">' +
    '<div style="font-size:19px; font-weight:700; color:var(--acento-texto)">' + num + '</div>' +
    '<div style="font-size:11px; color:var(--texto-2); margin-top:2px">' + lbl + '</div></div>';
  const barra = pct => '<div style="background:var(--sup-baja); border-radius:6px; height:8px; margin-top:4px; overflow:hidden">' +
    '<div style="width:' + Math.min(100, pct) + '%; height:100%; background:var(--acento)"></div></div>';

  const detalle = filas.filter(f => f.area > 0).sort((a, b) => b.area - a.area).map(f => {
    const pct = totalArea > 0 ? Math.round(f.area / totalArea * 1000) / 10 : 0;
    return '<div style="margin-top:10px">' +
      '<div style="display:flex; justify-content:space-between; font-size:12.5px">' +
        '<b class="txtFuerte">' + esc(f.d.nombre) + '</b><span>' + f.area + ' m² · ' + pct + '%</span></div>' +
      barra(pct) + '</div>';
  }).join('');
  const categoriasHtml = Object.keys(categorias).map(cat => {
    const c = categorias[cat];
    const pct = totalArea > 0 ? Math.round(c.area / totalArea * 1000) / 10 : 0;
    return '<div class="planoFila"><span class="planoNom"><b class="txtFuerte">' + esc(cat) + '</b> <small>(' + c.n + ')</small></span>' +
      '<small style="white-space:nowrap">' + Math.round(c.area * 10) / 10 + ' m² · ' + pct + '%</small></div>';
  }).join('');

  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Terreno total: <b class="txtFuerte">' + descLote + '</b> · ' +
      'Ocupado: <b class="txtFuerte">' + totalArea.toLocaleString('es-CO') + ' m² (' + ocupacion + '%)</b></div>' +
    '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px">' +
      tile(filas.length, 'Zonas creadas') +
      tile(totalArea.toLocaleString('es-CO') + ' m²', 'Área total') +
      tile(accesos, 'Accesos (puertas)') +
      tile(totalPerimetro + ' m', 'Long. de muros') +
    '</div>' +
    '<b style="display:block; margin-top:16px">Por categoría</b>' +
    (categoriasHtml || '<div class="desc">Aún no hay zonas creadas.</div>') +
    '<b style="display:block; margin-top:16px">Detalle por zona</b>' +
    (detalle || '<div class="desc">Aún no hay zonas con área.</div>');
  document.getElementById('libreOverlay').style.display = 'flex';
}

/* ============ ORGANIGRAMA (plantilla predeterminada, roles editables) ============ */
function plantillaOrganigrama(){
  return [
    { id: 101, nivel: 1, titulo: 'Coordinador(a) General', nombre: '', color: '#b06ad4',
      funciones: ['Responde por el resultado global del proyecto', 'Aprueba presupuesto, cronograma y cambios mayores', 'Preside los comités de obra'] },
    { id: 102, nivel: 1, titulo: 'Interventor(a)', nombre: '', color: '#16a085',
      funciones: ['Verifica que lo construido cumpla planos y especificaciones', 'Aprueba actas de avance y avala pagos', 'Exige correcciones ante no conformidades'] },
    { id: 103, nivel: 2, titulo: 'Director(a) de Obra', nombre: '', color: '#f0a340',
      funciones: ['Dirige la ejecución y los frentes de trabajo', 'Administra contratistas y mano de obra', 'Controla calidad, plazos y rendimientos'] },
    { id: 104, nivel: 3, titulo: 'Residente Administrativo', nombre: '', color: '#4da3ff',
      funciones: ['Controla costos, presupuesto y flujo de caja', 'Maneja almacén, inventarios y compras', 'Administra nómina y contratos'] },
    { id: 105, nivel: 3, titulo: 'Residente de Estructura', nombre: '', color: '#9fb6c9',
      funciones: ['Supervisa acero, formaleta y vaciados', 'Controla la calidad del concreto', 'Coordina izajes y equipos de estructura'] },
    { id: 106, nivel: 3, titulo: 'Residente de Acabados', nombre: '', color: '#58b368',
      funciones: ['Dirige mampostería y acabados', 'Coordina las cuadrillas', 'Recibe apartamentos y gestiona remates'] },
    { id: 107, nivel: 3, titulo: 'Residente SST', nombre: '', color: '#e74c3c',
      funciones: ['Implementa el plan SST y la matriz de riesgos', 'Autoriza trabajos en altura', 'Capacita al personal e investiga incidentes'] }
  ];
}
let organigrama = plantillaOrganigrama();
function normalizarRol(raw){
  raw = raw || {};
  return {
    id: isFinite(Number(raw.id)) ? Number(raw.id) : idSec++,
    nivel: Math.min(3, Math.max(1, Math.round(Number(raw.nivel) || 3))),
    titulo: String(raw.titulo || 'Nuevo rol').slice(0, 60),
    nombre: String(raw.nombre || '').slice(0, 60),
    color: /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : '#7a8ca0',
    funciones: (Array.isArray(raw.funciones) ? raw.funciones : []).map(f => String(f).slice(0, 140)).slice(0, 20)
  };
}
function rolPorId(id){ return organigrama.find(r => r.id === id) || null; }
function abrirOrganigrama(){
  renderOrgLibre();
  document.getElementById('libreOverlay').style.display = 'flex';
}
function renderOrgLibre(){
  document.getElementById('libreVentTitulo').textContent = 'Organigrama de la obra';
  const nodo = r =>
    '<div class="orgNodo" style="border-color:' + r.color + '" onclick="editarRolLibre(' + r.id + ')">' +
      '<div class="rol" style="color:' + r.color + '">' + esc(r.titulo) + '</div>' +
      '<div class="nom">' + (r.nombre ? esc(r.nombre) : '<i style="opacity:.6">clic para poner el nombre</i>') + '</div>' +
    '</div>';
  const niveles = [1, 2, 3].map(n => organigrama.filter(r => r.nivel === n)).filter(l => l.length);
  document.getElementById('libreBody').innerHTML =
    niveles.map(l => '<div class="orgNivel">' + l.map(nodo).join('') + '</div>').join('<div class="orgConector"></div>') +
    '<div class="desc" style="margin-top:12px">La plantilla trae los roles típicos de una obra. ' +
    'Haz clic sobre cualquier rol para escribir el <b>nombre del responsable</b> y editar <b>de qué es responsable</b>; ' +
    'también puedes agregar roles nuevos o eliminar los que no uses.</div>' +
    '<div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap">' +
      '<button class="orgAccion primario" style="margin:0" onclick="agregarRolLibre()">' + ic('mas') + 'Agregar rol</button>' +
      '<button class="orgAccion" style="margin:0" onclick="restaurarOrganigrama()">Restaurar plantilla</button>' +
    '</div>';
}
function editarRolLibre(id){
  const r = rolPorId(id);
  if (!r) return;
  document.getElementById('libreVentTitulo').textContent = 'Organigrama — editar rol';
  const funciones = r.funciones.map((f, i) =>
    '<div class="orgFn"><span>• ' + esc(f) + '</span><span class="fnX" title="Quitar" onclick="quitarFuncionRol(' + id + ',' + i + ')">✕</span></div>').join('');
  document.getElementById('libreBody').innerHTML =
    '<div style="border-left:4px solid ' + r.color + '; padding-left:10px; margin-bottom:10px">' +
      '<b style="color:' + r.color + '">' + esc(r.titulo) + '</b>' + (r.nombre ? ' · ' + esc(r.nombre) : '') +
    '</div>' +
    '<div style="display:flex; flex-direction:column; gap:8px">' +
      '<label>Cargo / rol<br><input maxlength="60" value="' + esc(r.titulo) + '" style="width:100%" onchange="orgCampoLibre(' + id + ', \'titulo\', this.value)"></label>' +
      '<label>Nombre del responsable<br><input maxlength="60" value="' + esc(r.nombre) + '" placeholder="ej: Bryan Yama" style="width:100%" onchange="orgCampoLibre(' + id + ', \'nombre\', this.value)"></label>' +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center">' +
        '<label>Nivel <select onchange="orgCampoLibre(' + id + ', \'nivel\', this.value)">' +
          [1, 2, 3].map(n => '<option value="' + n + '"' + (n === r.nivel ? ' selected' : '') + '>Nivel ' + n + '</option>').join('') +
        '</select></label>' +
        '<label>Color <input type="color" value="' + r.color + '" onchange="orgCampoLibre(' + id + ', \'color\', this.value)"></label>' +
      '</div>' +
    '</div>' +
    '<b style="display:block; margin-top:12px">Responsable de:</b>' +
    (funciones || '<div class="desc">Aún no tiene funciones — agrégale la primera abajo.</div>') +
    '<div id="orgAgregar" style="display:flex; gap:6px; margin-top:8px">' +
      '<input id="fnNuevaLibre" maxlength="140" placeholder="Agregar otra responsabilidad a este rol…" style="flex:1">' +
      '<button class="orgAccion primario" style="margin:0" onclick="agregarFuncionRol(' + id + ')">' + ic('mas') + 'Agregar</button>' +
    '</div>' +
    '<div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap">' +
      '<button class="orgAccion" style="margin:0" onclick="renderOrgLibre()">' + ic('volver') + 'Volver al organigrama</button>' +
      '<button class="orgAccion" style="margin:0; border-color:var(--rojo); color:var(--rojo-texto)" onclick="eliminarRolLibre(' + id + ')">' + ic('basura') + 'Eliminar este rol</button>' +
    '</div>';
  const inp = document.getElementById('fnNuevaLibre');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') agregarFuncionRol(id); });
}
function orgCampoLibre(id, campo, val){
  const r = rolPorId(id);
  if (!r) return;
  if (campo === 'titulo') r.titulo = String(val || '').trim().slice(0, 60) || r.titulo;
  else if (campo === 'nombre') r.nombre = String(val || '').trim().slice(0, 60);
  else if (campo === 'nivel') r.nivel = Math.min(3, Math.max(1, Math.round(Number(val) || r.nivel)));
  else if (campo === 'color' && /^#[0-9a-f]{6}$/i.test(val)) r.color = val;
  guardar();
}
function agregarFuncionRol(id){
  const r = rolPorId(id);
  const inp = document.getElementById('fnNuevaLibre');
  if (!r || !inp) return;
  const txt = (inp.value || '').trim().slice(0, 140);
  if (!txt) return;
  r.funciones.push(txt);
  guardar();
  editarRolLibre(id);
  avisar('Responsabilidad agregada a ' + r.titulo);
}
function quitarFuncionRol(id, i){
  const r = rolPorId(id);
  if (!r) return;
  r.funciones.splice(i, 1);
  guardar();
  editarRolLibre(id);
}
function agregarRolLibre(){
  const r = normalizarRol({ id: idSec++, nivel: 3, titulo: 'Nuevo rol', color: '#7a8ca0', funciones: [] });
  organigrama.push(r);
  guardar();
  editarRolLibre(r.id);
}
function eliminarRolLibre(id){
  const r = rolPorId(id);
  if (!r) return;
  if (!confirm('¿Eliminar el rol "' + r.titulo + '" del organigrama?')) return;
  organigrama = organigrama.filter(x => x.id !== id);
  guardar();
  renderOrgLibre();
  avisar('Rol eliminado');
}
function restaurarOrganigrama(){
  if (!confirm('¿Restaurar la plantilla original del organigrama? Se pierden los cambios que hayas hecho.')) return;
  organigrama = plantillaOrganigrama();
  guardar();
  renderOrgLibre();
  avisar('Plantilla del organigrama restaurada');
}

/* ============ GUARDAR / CARGAR (localStorage propio + respaldo JSON) ============ */
const CLAVE = 'tallerLibre_v1';
function estadoActual(){
  return {
    version: 2,
    proyecto: (ficha && ficha.nombre) || 'Proyecto libre — Taller II',
    fecha: new Date().toISOString(),
    ficha, fichaCompleta,
    cerramiento: cerrCfg,
    noche: esNoche,
    elementos: elementos.map(g => g.userData.def),
    vias, rutas, organigrama,
    camiones: camionesLibre,
    reloj: { hora: horaObraLibre, fecha: fechaObraLibre, corriendo: relojCorriendoLibre, vel: velRelojLibre }
  };
}
/* ============ HISTORIAL DE CAMBIOS (navegable) ============
   Cada guardar() agrega un paso con una etiqueta legible ("Elemento creado:
   X", "Movido: X", "Eliminado: X"…). Ctrl+Z / Ctrl+Shift+Z retroceden y
   avanzan un paso; el botón "Historial" (sidebar) abre la lista completa
   con "Paso N de TOTAL" y permite saltar a cualquier paso con un clic —
   ideal para revisar qué se movió o se borró y volver atrás si hace falta. */
let historialPasos = [];      // [{ etiqueta, estado: JSON string }]
let historialIndice = -1;     // paso actual (0-based)
let aplicandoHistorial = false;   // true mientras se restaura un paso (evita reentradas)
function guardar(etiqueta){
  const nuevo = JSON.stringify(estadoActual());
  try { localStorage.setItem(CLAVE, nuevo); } catch (e) {}
  if (aplicandoHistorial) return;
  historialPasos = historialPasos.slice(0, historialIndice + 1);
  historialPasos.push({ etiqueta: etiqueta || 'Cambio en la obra', estado: nuevo });
  if (historialPasos.length > 60) historialPasos.shift();
  historialIndice = historialPasos.length - 1;
  actualizarBotonHistorial();
}
function actualizarBotonHistorial(){
  const b = document.getElementById('btnHistorial');
  if (b) b.title = 'Historial de cambios — Paso ' + (historialIndice + 1) + ' de ' + historialPasos.length;
}
function irAPasoHistorial(i){
  if (i < 0 || i >= historialPasos.length || i === historialIndice) return;
  historialIndice = i;
  aplicandoHistorial = true;
  try { localStorage.setItem(CLAVE, historialPasos[i].estado); } catch (e) {}
  aplicarEstado(JSON.parse(historialPasos[i].estado));
  aplicandoHistorial = false;
  actualizarBotonHistorial();
  const titulo = document.getElementById('libreVentTitulo');
  if (document.getElementById('libreOverlay').style.display === 'flex' && titulo && titulo.textContent.indexOf('Historial') === 0) renderHistorialLibre();
}
function deshacer(){
  if (historialIndice <= 0){ avisar('Nada más para deshacer'); return; }
  irAPasoHistorial(historialIndice - 1);
  avisar('Deshecho (Ctrl+Z)');
}
function rehacer(){
  if (historialIndice >= historialPasos.length - 1){ avisar('Nada más para rehacer'); return; }
  irAPasoHistorial(historialIndice + 1);
  avisar('Rehecho (Ctrl+Shift+Z)');
}
function abrirHistorialLibre(){
  setHerramienta(null);
  renderHistorialLibre();
  document.getElementById('libreOverlay').style.display = 'flex';
}
function renderHistorialLibre(){
  document.getElementById('libreVentTitulo').textContent = 'Historial de cambios — Paso ' + (historialIndice + 1) + ' de ' + historialPasos.length;
  const filas = historialPasos.map((p, i) => {
    const activo = i === historialIndice;
    return '<div class="planoFila"' + (activo ? ' style="background:var(--sup-alta); border-radius:8px"' : '') + '>' +
      '<span class="planoNom">' + (activo ? '▶ ' : '') + '<b class="txtFuerte">Paso ' + (i + 1) + '</b> <small>· ' + esc(p.etiqueta) + '</small></span>' +
      (activo ? '<small class="txtAcento">actual</small>'
              : '<button class="planoBtn" style="width:auto; margin:0" onclick="irAPasoHistorial(' + i + ')">Volver aquí</button>') +
    '</div>';
  }).join('');
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Cada vez que mueves, giras, creas o eliminas algo queda un paso guardado aquí. Haz clic en <b class="txtAcento">"Volver aquí"</b> para regresar a ese momento, o usa <b class="txtAcento">Ctrl+Z</b> / <b class="txtAcento">Ctrl+Shift+Z</b>.</div>' +
    '<div style="display:flex; gap:6px; margin:10px 0">' +
      '<button style="flex:1; margin:0" onclick="deshacer()">' + ic('girarIzq') + 'Deshacer</button>' +
      '<button style="flex:1; margin:0" onclick="rehacer()">' + ic('girarDer') + 'Rehacer</button>' +
    '</div>' +
    '<div style="max-height:55vh; overflow-y:auto">' + filas + '</div>';
}
/* acepta el estado v2 completo, un {elementos:[...]} v1 o una lista suelta de defs */
function aplicarEstado(o){
  detenerTodosLosRecorridos();
  const defs = Array.isArray(o) ? o : (o && Array.isArray(o.elementos)) ? o.elementos : [];
  elementos.slice().forEach(g => { g.traverse(n => { if (n.geometry) n.geometry.dispose(); }); scene.remove(g); });
  elementos.length = 0;
  seleccionado = null; selVia = null; selRuta = null; trazoVia = null; trazoRuta = null;
  defs.forEach(d => crearElemento(d));
  o = o && !Array.isArray(o) ? o : {};
  ficha = normalizarFicha(o.ficha);
  fichaCompleta = !!o.fichaCompleta;
  const cerrRaw = o.cerramiento || {};
  cerrCfg = {
    activo: cerrRaw.activo !== false,
    material: MATERIALES_CERR[cerrRaw.material] ? cerrRaw.material : 'lona',
    altura: numLim(cerrRaw.altura, 2.4, 1.8, 4)
  };
  vias = (Array.isArray(o.vias) ? o.vias : [])
    .filter(v => v && [v.x1, v.z1, v.x2, v.z2].every(n => typeof n === 'number' && isFinite(n)))
    .map(v => ({ id: isFinite(Number(v.id)) ? Number(v.id) : idSec++, x1: v.x1, z1: v.z1, x2: v.x2, z2: v.z2, ancho: numLim(v.ancho, 6, 3, 12) }));
  rutas = (Array.isArray(o.rutas) ? o.rutas : [])
    .filter(r => r && Array.isArray(r.puntos))
    .map(r => ({
      id: isFinite(Number(r.id)) ? Number(r.id) : idSec++,
      nombre: String(r.nombre || 'Ruta').slice(0, 30),
      color: /^#[0-9a-f]{6}$/i.test(r.color || '') ? r.color : PALETA_RUTAS[0],
      vehiculo: String(r.vehiculo || ''),
      vel: numLim(r.vel, 3, 0.5, 20),
      sentido: ['vaiven', 'ida', 'vuelta'].includes(r.sentido) ? r.sentido : 'vaiven',
      puntos: r.puntos.filter(p => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1])).map(p => [red2(p[0]), red2(p[1])])
    }));
  organigrama = (Array.isArray(o.organigrama) && o.organigrama.length)
    ? o.organigrama.map(normalizarRol)
    : plantillaOrganigrama();
  const maxId = Math.max(0,
    ...vias.map(v => v.id), ...rutas.map(r => r.id), ...organigrama.map(r => r.id));
  idSec = Math.max(idSec, maxId + 1);
  camionesActivosLibre.forEach(a => { scene.remove(a.grupo); scene.remove(a.rutaG); });
  camionesActivosLibre.length = 0;
  colaCamionesLibre.length = 0;
  camionesLibre = (Array.isArray(o.camiones) ? o.camiones : [])
    .filter(c => c && c.hora)
    .map(c => ({ fecha: String(c.fecha || fechaISOLibre()).slice(0, 10), hora: String(c.hora).slice(0, 5), material: String(c.material || 'Materiales').slice(0, 60), zona: String(c.zona || '').slice(0, 40) }));
  const relojRaw = o.reloj || {};
  horaObraLibre = numLim(relojRaw.hora, 6 * 60, 0, 1439);
  fechaObraLibre = String(relojRaw.fecha || fechaISOLibre()).slice(0, 10);
  relojCorriendoLibre = relojRaw.corriendo !== false;
  velRelojLibre = numLim(relojRaw.vel, 12, 1, 200);
  esNoche = !!o.noche;
  aplicarCielo();
  construirLote();
  construirCerramiento();
  redibujarVias();
  redibujarRutas();
  mostrarPanelVacio();
  const selFase = document.getElementById('selFaseLibre');
  if (selFase) selFase.value = ficha.faseObra;
  refrescarSelectorUbicar();
  actualizarPieEquipo();
}
function cargarLocal(){
  let txt = null;
  try { txt = localStorage.getItem(CLAVE); } catch (e) {}
  let obj = {};
  if (txt){ try { obj = JSON.parse(txt); } catch (e) {} }
  aplicarEstado(obj);
  // si ya había una obra guardada (recarga de página), no bloquear la app
  // con la pantalla de bienvenida — saltar directo al plano restaurado
  if (fichaCompleta){
    const el = document.getElementById('libreInicio');
    el.classList.add('oculto');
    el.style.display = 'none';
  }
}

/* iconos: los botones ya traen su <span class="ic" data-ic="..."> en el
   HTML (igual que el proyecto Bambú) — un solo barrido los llena */
aplicarIconosLibre();

document.getElementById('btnVia').onclick = () => setHerramienta('via');
document.getElementById('btnRuta').onclick = () => setHerramienta('ruta');
document.getElementById('btnBorrarRutas').onclick = () => {
  if (!rutas.length){ avisar('No hay rutas dibujadas'); return; }
  if (confirm('¿Eliminar TODAS las rutas dibujadas (' + rutas.length + ')? Para borrar solo una, selecciónala y usa "Eliminar SOLO esta ruta".')){
    detenerTodosLosRecorridos();
    rutas = []; trazoRuta = null; selRuta = null;
    redibujarRutas(); guardar();
    if (herramienta === 'ruta') panelHerramientaRuta(); else mostrarPanelVacio();
    avisar('Rutas eliminadas');
  }
};
document.getElementById('btnCamiones').onclick = abrirCamionesLibre;
document.getElementById('btnFichaLibre').onclick = () => { setHerramienta(null); abrirFicha(); };
document.getElementById('btnOrg').onclick = () => { setHerramienta(null); abrirOrganigrama(); };
document.getElementById('btnRegla').onclick = () => setHerramienta('regla');
document.getElementById('btnLote').onclick = () => setHerramienta('lote');
document.getElementById('btnPorton').onclick = () => setHerramienta('porton');
document.getElementById('btnCotas').onclick = toggleCotas;
document.getElementById('btn2D').onclick = toggleVista2D;
document.getElementById('btnAreas').onclick = abrirCuadroAreas;
document.getElementById('btnHistorial').onclick = abrirHistorialLibre;
document.getElementById('btnFondoPlano').onclick = abrirFondoPlano;
document.getElementById('btnEditarEquipo').onclick = () => { setHerramienta(null); abrirFicha(); };
document.getElementById('btnZonas').onclick = abrirZonasLibre;
document.getElementById('btnEtiquetas').onclick = toggleEtiquetasLibre;
document.getElementById('btnCaminar').onclick = toggleCaminar;
document.getElementById('btnNoche').onclick = toggleNoche;
document.getElementById('btnEspacios').onclick = abrirVentanaEspacios;
document.getElementById('btnEquipos').onclick = abrirVentanaEquipos;
document.getElementById('btnExportar').onclick = exportarPlanoLibre;
document.getElementById('selFaseLibre').onchange = e => cambiarFaseObra(e.target.value);
document.querySelectorAll('#panelTabs .tabBtn').forEach(b => { b.onclick = () => mostrarTabLibre(b.dataset.tab); });

/* ---- "Ir a elemento" (Ubicar): mismo selector que en el proyecto Bambú ---- */
function refrescarSelectorUbicar(){
  const sel = document.getElementById('selElemLibre');
  if (!sel) return;
  const actual = sel.value;
  sel.innerHTML = '<option value="">— Ir a elemento —</option>' +
    elementos.map((g, i) => '<option value="' + i + '">' + esc(g.userData.def.nombre) + '</option>').join('');
  sel.value = elementos[actual] ? actual : '';
}
document.getElementById('selElemLibre').onchange = function(){
  const i = this.value;
  if (i === '') return;
  const g = elementos[i];
  if (g){ setHerramienta(null); if (modo2D) toggleVista2D(); seleccionar(g); irA(g.position.x, g.position.z, 60); }
  this.value = '';
};

/* ---- Menú móvil (cajón) y minimizar el sidebar (escritorio) — igual que Bambú ---- */
document.getElementById('btnMenu').onclick = () => { document.getElementById('ui').classList.toggle('abierto'); };
(function(){
  const ui = document.getElementById('ui');
  const btn = document.getElementById('btnMin');
  let minimizado = false;
  try { minimizado = localStorage.getItem('tallerLibre_menuMin') === '1'; } catch (e) {}
  function set(v){
    minimizado = v;
    ui.classList.toggle('minimizado', minimizado);
    btn.innerHTML = minimizado ? ic('menu') + 'Menú' : ic('menos');
    btn.title = minimizado ? 'Mostrar el menú' : 'Minimizar el menú';
    try { localStorage.setItem('tallerLibre_menuMin', minimizado ? '1' : '0'); } catch (e) {}
  }
  btn.onclick = () => set(!minimizado);
  set(minimizado);
})();
/* ---- Ocultar/mostrar el panel de información (escritorio) ---- */
(function(){
  const panel = document.getElementById('panel');
  const btn = document.getElementById('panelToggle');
  let plegado = false;
  try { plegado = localStorage.getItem('tallerLibre_panelPlegado') === '1'; } catch (e) {}
  function set(v){
    plegado = v;
    panel.classList.toggle('plegado', plegado);
    btn.textContent = plegado ? '+' : '–';
    btn.title = plegado ? 'Mostrar el panel' : 'Ocultar el panel';
    try { localStorage.setItem('tallerLibre_panelPlegado', plegado ? '1' : '0'); } catch (e) {}
  }
  btn.onclick = e => { e.stopPropagation(); set(!plegado); };
  set(plegado);
})();
document.getElementById('pTitulo').onclick = () => { document.getElementById('panel').classList.toggle('abierto'); };
/* ---- Ayuda de controles: se puede ocultar ---- */
(function(){
  const ayuda = document.getElementById('ayuda');
  const toggle = document.getElementById('ayudaToggle');
  let oculta = false;
  try { oculta = localStorage.getItem('tallerLibre_ayudaOculta') === '1'; } catch (e) {}
  function set(v){
    oculta = v;
    ayuda.classList.toggle('colapsada', oculta);
    toggle.textContent = oculta ? '?' : '✕';
    toggle.title = oculta ? 'Mostrar la ayuda de controles' : 'Ocultar esta ayuda';
    try { localStorage.setItem('tallerLibre_ayudaOculta', oculta ? '1' : '0'); } catch (e) {}
  }
  toggle.onclick = () => set(!oculta);
  set(oculta);
})();
/* ---- Pad de navegación táctil (móvil) + controles de vista (escritorio) ---- */
const PAD_ACCIONES_LIBRE = {
  arriba:    () => moverCamaraPantalla(0, 16),
  abajo:     () => moverCamaraPantalla(0, -16),
  izquierda: () => moverCamaraPantalla(16, 0),
  derecha:   () => moverCamaraPantalla(-16, 0),
  acercar:   () => { if (modo2D) zoom2D = Math.max(12, zoom2D * 0.95); else camCtrl.radius = Math.max(12, camCtrl.radius * 0.95); },
  alejar:    () => { if (modo2D) zoom2D = Math.min(400, zoom2D * 1.055); else camCtrl.radius = Math.min(560, camCtrl.radius * 1.055); }
};
document.querySelectorAll('#pad button[data-mover]').forEach(btn => {
  const accion = PAD_ACCIONES_LIBRE[btn.dataset.mover];
  let repetidor = null;
  const iniciar = e => { e.preventDefault(); e.stopPropagation(); accion(); clearInterval(repetidor); repetidor = setInterval(accion, 70); };
  const detener = () => { clearInterval(repetidor); repetidor = null; };
  btn.addEventListener('pointerdown', iniciar);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, detener));
});
document.getElementById('padToggle').addEventListener('click', () => {
  const contraido = document.getElementById('pad').classList.toggle('contraido');
  document.getElementById('padToggle').innerHTML = ic(contraido ? 'mando' : 'menos');
});
document.getElementById('padEtiquetas').onclick = toggleEtiquetasLibre;
const ACCIONES_VISTA_LIBRE = {
  zin:   () => { if (modo2D) zoom2D = Math.max(12, zoom2D * 0.88); else camCtrl.radius = Math.max(12, camCtrl.radius * 0.88); },
  zout:  () => { if (modo2D) zoom2D = Math.min(400, zoom2D * 1.14); else camCtrl.radius = Math.min(560, camCtrl.radius * 1.14); },
  rot:   () => { if (!modo2D) camCtrl.theta += Math.PI / 6; },
  reset: () => { modo2D ? (camCtrl.target.set(0, 0, 0)) : irA(0, 0, 110); }
};
document.querySelectorAll('#viewCtrl button[data-vc]').forEach(btn => {
  btn.addEventListener('click', () => { const fn = ACCIONES_VISTA_LIBRE[btn.dataset.vc]; if (fn) fn(); });
});
/* ---- atajos de teclado: Esc (salir/deseleccionar), R (girar), Supr
   (eliminar lo seleccionado: elemento, tramo de vía o ruta), Ctrl+C/Ctrl+V
   (copiar y pegar el elemento seleccionado) + teclas del modo caminar ---- */
addEventListener('keydown', e => {
  const tag = (document.activeElement || {}).tagName;
  const enCampo = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  if (caminando && !enCampo){
    teclasCaminar[e.code] = true;
    if (e.code.indexOf('Arrow') === 0 || e.code === 'Space') e.preventDefault();
  }
  if (e.key === 'Escape'){
    const overlay = document.getElementById('libreOverlay');
    if (overlay.style.display === 'flex'){ overlay.style.display = 'none'; return; }
    if (amueblando){ cerrarAmoblar(); return; }
    if (manejando){ bajarDeVehiculo(); return; }
    if (caminando){ toggleCaminar(); return; }
    if (herramienta){
      if (herramienta === 'regla'){ if (escRegla()) return; setHerramienta(null); return; }
      if (herramienta === 'lote'){ if (escLote()) return; setHerramienta(null); return; }
      if (trazoVia || trazoRuta) terminarTrazo();
      else setHerramienta(null);
      return;
    }
    if (seleccionado || selVia !== null || selRuta !== null){
      seleccionado = null;
      elementos.forEach(actualizarTinte);
      mostrarPanelVacio();
      avisar('Selección quitada');
    }
    return;
  }
  if (enCampo) return;
  // dentro del amoblado, R y Supr actúan sobre el MUEBLE seleccionado (no
  // sobre el espacio completo) y el resto de atajos generales no aplican
  if (amueblando){
    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && interiorSeleccionado){
      girarMuebleInterior(interiorSeleccionado.userData.muebleIdx);
    } else if (e.key === 'Delete' && interiorSeleccionado){
      eliminarMuebleInterior(interiorSeleccionado.userData.muebleIdx);
    }
    return;
  }
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey){
    toggleManejar();
    return;
  }
  if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && seleccionado){
    girarSel(1);
    return;
  }
  if (e.key === 'Delete'){
    if (seleccionado) eliminarSel();
    else if (selVia !== null) eliminarTramoVia(selVia);
    else if (selRuta !== null) eliminarRuta(selRuta);
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')){
    if (seleccionado){
      portapapeles = JSON.parse(JSON.stringify(seleccionado.userData.def));
      avisar('"' + portapapeles.nombre + '" copiado — Ctrl+V para pegarlo');
      e.preventDefault();
    }
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')){
    if (portapapeles){
      const raw = JSON.parse(JSON.stringify(portapapeles));
      raw.x = numLim(raw.x + 4, 0, -260, 260);
      raw.z = numLim(raw.z + 4, 0, -180, 180);
      raw.nombre = nombreDisponible(raw.nombre);
      const g = crearElemento(raw);
      portapapeles.x = raw.x; portapapeles.z = raw.z;   // el siguiente pegado cae escalonado
      guardar();
      seleccionar(g);
      avisar('"' + raw.nombre + '" pegado — arrástralo para ubicarlo');
      e.preventDefault();
    }
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')){
    e.preventDefault();
    if (e.shiftKey) rehacer(); else deshacer();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')){
    e.preventDefault();
    rehacer();
    return;
  }
});
addEventListener('keyup', e => { delete teclasCaminar[e.code]; });
document.getElementById('libreCerrar').onclick = () => { document.getElementById('libreOverlay').style.display = 'none'; };
document.getElementById('libreOverlay').addEventListener('click', e => { if (e.target.id === 'libreOverlay') e.target.style.display = 'none'; });
document.getElementById('btnGuardar').onclick = () => {
  guardar();
  const blob = new Blob([JSON.stringify(estadoActual(), null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'proyecto_libre.json'; a.click();
  URL.revokeObjectURL(a.href);
  avisar('Guardado (+ respaldo proyecto_libre.json)');
};
document.getElementById('btnCargar').onclick = () => document.getElementById('libreArchivo').click();
document.getElementById('libreArchivo').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try { aplicarEstado(JSON.parse(lector.result)); guardar(); avisar('Proyecto cargado'); }
    catch (err) { avisar('Archivo no válido'); }
  };
  lector.readAsText(f); e.target.value = '';
};
document.getElementById('btnVaciar').onclick = () => {
  if (!elementos.length && !vias.length && !rutas.length){ avisar('La obra ya está vacía'); return; }
  if (confirm('¿Vaciar toda la obra? Se eliminan los elementos, las vías y las rutas (la ficha técnica, el organigrama y los camiones programados se conservan).')){
    aplicarEstado({
      ficha, fichaCompleta, cerramiento: cerrCfg, organigrama, elementos: [], vias: [], rutas: [],
      camiones: camionesLibre, noche: esNoche,
      reloj: { hora: horaObraLibre, fecha: fechaObraLibre, corriendo: relojCorriendoLibre, vel: velRelojLibre }
    });
    guardar();
    avisar('Obra vaciada');
  }
};

/* pantalla de bienvenida: al comenzar por primera vez se diseña PRIMERO el
   terreno (rectángulo o dibujado a mano) y solo DESPUÉS se piden los
   nombres/datos generales en la ficha técnica — así quien dibuja el lote
   libre no tiene que pasar primero por un formulario pensado para el
   rectángulo. */
document.getElementById('libreComenzar').onclick = () => {
  const el = document.getElementById('libreInicio');
  el.classList.add('oculto');
  setTimeout(() => { el.style.display = 'none'; }, 400);
  if (!fichaCompleta) setTimeout(abrirDisenoTerrenoInicial, 450);
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
  // vehículos recorriendo sus rutas (ida y vuelta por las vías)
  for (let i = rutasActivas.length - 1; i >= 0; i--){
    const a = rutasActivas[i];
    if (!elementos.includes(a.g) || !rutas.some(r => r.id === a.rutaId)){ rutasActivas.splice(i, 1); continue; }
    moverVehiculoRuta(a, dt);
  }
  actualizarCamionesLibre(dt);
  if (manejando) moverVehiculoManejado(dt);
  else if (caminando) moverCaminante(dt);
  else if (modo2D) actualizarCamara2D();
  else actualizarCamara();
  renderer.render(scene, camActiva());
}

/* arranque */
mostrarPanelVacio();
cargarLocal();
historialPasos = [{ etiqueta: 'Obra inicial', estado: JSON.stringify(estadoActual()) }];   // línea base del historial
historialIndice = 0;
actualizarBotonHistorial();
actualizarCamara();
animar();
