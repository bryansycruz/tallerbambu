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
  luna:     '<path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z"/>'
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
    desc:'Sistema de Madera: ecológico y flexible; usado sobre todo en construcciones de baja altura y viviendas residenciales.' }
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

/* ============ CATÁLOGO DE MAQUINARIA Y TRANSPORTE ============
   Equipos reales de la obra, agrupados como en el proyecto Bambú (transporte
   horizontal / vertical / planta e instalaciones). Cada pieza se dibuja a su
   tamaño nominal y luego se ESCALA al ancho/largo/alto que el usuario escriba,
   así "colocar el tamaño y las dimensiones" funciona para todas. Los equipos
   con movil:true se pueden asignar a una RUTA para verlos recorrer la obra;
   los fijos (planta, silo) son instalaciones. El frente de todos apunta a +z
   (mismo criterio que el camión de camiones.js) para que giren bien al rodar. */
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
  const et = crearEtiqueta(textoEtiqueta(def), 12);
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
  return g;
}
function eliminarElemento(g){
  const i = elementos.indexOf(g);
  if (i < 0) return;
  // si estaba recorriendo una ruta, se baja de ella
  for (let k = rutasActivas.length - 1; k >= 0; k--){
    if (rutasActivas[k].g === g) rutasActivas.splice(k, 1);
  }
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
  // con la herramienta Vía/Ruta activa, el clic izquierdo marca puntos en el terreno
  if (herramienta){
    movido = 999;
    const p = puntoSuelo();
    if (p) clicHerramienta(p);
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
  if (caminando) return;
  if (e.pointerType === 'touch'){
    punterosTactiles.delete(e.pointerId);
    if (punterosTactiles.size < 2) pinza = null;
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
    guardar();
    // aviso si el elemento quedó atravesado sobre una vía
    const d = eraArrastre.userData.def;
    if (typeof elementoSobreVia === 'function' && elementoSobreVia(eraArrastre)){
      avisar('Ojo: "' + d.nombre + '" quedó sobre una vía — los vehículos no podrán pasar por ahí');
    }
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
const pTitulo = document.getElementById('librePTitulo');
const pBody = document.getElementById('librePBody');   // pestaña Selección
const pMod = document.getElementById('libreMod');      // pestaña Modificar
const pFic = document.getElementById('libreFic');      // pestaña Ficha técnica
function mostrarTabLibre(nombre){
  document.querySelectorAll('#libreTabs .tabBtn').forEach(b => b.classList.toggle('activo', b.dataset.tab === nombre));
  document.querySelectorAll('#librePanel .panelTab').forEach(t => t.classList.toggle('activo', t.dataset.tab === nombre));
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
    const m2 = Math.round(ficha.loteLargo * ficha.loteAncho);
    selHtml =
      '<div class="bimGrid">' +
        card('Ubicación', ficha.ubicacion) +
        card('Torres', ficha.torres) +
        card('Apartamentos', ficha.apartamentos) +
        card('Niveles', ficha.niveles) +
        card('Altura', ficha.alturaTxt) +
        card('Lote', ficha.loteLargo + ' × ' + ficha.loteAncho + ' m ≈ ' + m2.toLocaleString('es-CO') + ' m²') +
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
    '</div>' +
    '<button onclick="editarSel()">' + ic('editar') + 'Editar dimensiones</button>' +
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
    material = 'Espacio creado por el equipo — ' + d.w + ' × ' + d.d + ' m ≈ ' + area + ' m²';
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
  guardar();
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
  // las rutas que usaban este vehículo siguen apuntando al mismo
  rutas.forEach(r => { if (r.vehiculo === actual) r.vehiculo = nuevo; });
  guardar();
  seleccionar(seleccionado);
  mostrarTabLibre('mod');
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
  guardar();
  avisar('Color actualizado');
}
/* reconstruye la etiqueta flotante conservando posición y visibilidad */
function regenerarEtiquetaLibre(g){
  const vieja = g.userData.etiqueta;
  const nueva = crearEtiqueta(textoEtiqueta(g.userData.def), vieja ? vieja.scale.x : 12);
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
        '<select id="libTipo" onchange="cambiarTipo()">' +
          '<option value="espacio">Espacio</option>' +
          '<option value="edificio">Edificio</option>' +
          '<option value="maquina">Maquinaria / transporte</option>' +
          '<option value="malacate">Malacate</option>' +
          '<option value="gruaTorre">Torre grúa</option>' +
          '<option value="gruaPluma">Grúa pluma</option>' +
          '<option value="mueble">Mueble</option>' +
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
      '<label><input type="checkbox" id="edTecho"' + (d.techo ? ' checked' : '') + '> Techo</label>';
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
  const i = elementos.indexOf(g);
  g.traverse(n => { if (n.geometry) n.geometry.dispose(); });
  scene.remove(g);
  elementos.splice(i, 1);
  const ng = crearElemento(raw);
  editandoLibre = null;
  guardar();
  document.getElementById('libreOverlay').style.display = 'none';
  seleccionar(ng);
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
    personal: String(raw.personal || '').slice(0, 90),
    loteLargo: numLim(raw.loteLargo, 120, 20, 400),
    loteAncho: numLim(raw.loteAncho, 60, 20, 300)
  };
}
function construirLote(){
  vaciarGrupo(loteGrupo);
  const L = ficha.loteLargo, A = ficha.loteAncho;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(L, A), new THREE.MeshLambertMaterial({ color: 0x8a9a55 }));
  piso.rotation.x = -Math.PI / 2; piso.position.y = 0.02; piso.receiveShadow = true;
  loteGrupo.add(piso);
  [[0, -A/2, L, 0.3], [0, A/2, L, 0.3], [-L/2, 0, 0.3, A], [L/2, 0, 0.3, A]].forEach(([x, z, w, d]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), new THREE.MeshBasicMaterial({ color: 0xe8e4d8 }));
    b.position.set(x, 0.045, z);
    loteGrupo.add(b);
  });
  const m2 = Math.round(L * A);
  const et = crearEtiqueta('Lote ' + L + ' × ' + A + ' m ≈ ' + m2.toLocaleString('es-CO') + ' m²', 26, 'rgba(60,80,30,0.85)');
  et.position.set(0, 3, -A/2 - 2);
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
function construirCerramiento(){
  vaciarGrupo(cerrGrupo);
  if (!cerrCfg.activo) return;
  const L = ficha.loteLargo, A = ficha.loteAncho, H = cerrCfg.altura;
  const mat = MATERIALES_CERR[cerrCfg.material] || MATERIALES_CERR.lona;
  const esquinas = [[-L/2, -A/2], [L/2, -A/2], [L/2, A/2], [-L/2, A/2]];
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
    const n = Math.max(1, Math.floor(len / 3));
    for (let i = 0; i <= n; i++) postes.push([x1 + dx * i / n, z1 + dz * i / n]);
  }
  for (let i = 0; i < 4; i++){
    const a = esquinas[i], b = esquinas[(i + 1) % 4];
    if (i === 2){
      // lado sur: acceso con portón vehicular de 7 m centrado
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const f1 = Math.max(0.05, (len / 2 - 3.5) / len), f2 = Math.min(0.95, (len / 2 + 3.5) / len);
      const px = f => a[0] + (b[0] - a[0]) * f, pz = f => a[1] + (b[1] - a[1]) * f;
      tramoCerrLibre(a[0], a[1], px(f1), pz(f1));
      tramoCerrLibre(px(f2), pz(f2), b[0], b[1]);
      const hP = Math.min(H, 2.2);
      const porton = new THREE.Mesh(new THREE.BoxGeometry(6.4, hP, 0.1),
        new THREE.MeshLambertMaterial({ color: 0xc9581e }));
      const fPorton = Math.max(0.05, 0.5 - 3.2 / len);   // corrido: se ve semiabierto
      porton.position.set(px(fPorton), hP / 2, pz(fPorton) + 0.35);
      porton.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      cerrGrupo.add(porton);
      const et = crearEtiqueta('PORTÓN DE ACCESO', 13, 'rgba(120,60,15,0.88)');
      et.position.set(px(0.5), H + 2, pz(0.5));
      cerrGrupo.add(et);
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

function abrirFicha(){
  document.getElementById('libreVentTitulo').textContent = 'Ficha técnica de la obra';
  const campo = (id, lbl, val, ph) =>
    '<label style="display:block; margin-top:8px">' + lbl +
    '<input id="' + id + '" maxlength="90" value="' + esc(val || '') + '" placeholder="' + esc(ph || '') + '" style="width:100%; margin-top:3px"></label>';
  const m2 = Math.round(ficha.loteLargo * ficha.loteAncho);
  document.getElementById('libreBody').innerHTML =
    '<div class="desc">Estos datos son los mismos del <b>Panel de obra</b> del proyecto Bambú, pero de <b class="txtAcento">tu propia obra</b>. ' +
    'El lote se dibuja en el terreno con las medidas que escribas y el cerramiento perimetral lo envuelve.</div>' +
    campo('fxNombre', 'Nombre del proyecto', ficha.nombre === 'Mi obra' ? '' : ficha.nombre, 'ej: Proyecto Bambú') +
    campo('fxUbicacion', 'Ubicación', ficha.ubicacion, 'ej: Marinilla, Antioquia') +
    '<div style="display:flex; gap:8px; margin-top:8px; align-items:flex-end">' +
      '<label style="flex:1">Largo del lote (m)<input type="number" id="fxLoteLargo" value="' + ficha.loteLargo + '" min="20" max="400" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Ficha()"></label>' +
      '<label style="flex:1">Ancho del lote (m)<input type="number" id="fxLoteAncho" value="' + ficha.loteAncho + '" min="20" max="300" step="0.5" style="width:100%; margin-top:3px" oninput="refrescarM2Ficha()"></label>' +
      '<b id="fichaM2" style="white-space:nowrap; padding-bottom:8px">≈ ' + m2.toLocaleString('es-CO') + ' m²</b>' +
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
  const L = numLim(document.getElementById('fxLoteLargo').value, ficha.loteLargo, 20, 400);
  const A = numLim(document.getElementById('fxLoteAncho').value, ficha.loteAncho, 20, 300);
  document.getElementById('fichaM2').textContent = '≈ ' + Math.round(L * A).toLocaleString('es-CO') + ' m²';
}
function guardarFicha(){
  const v = id => (document.getElementById(id) || {}).value || '';
  ficha = normalizarFicha({
    nombre: v('fxNombre') || 'Mi obra',
    ubicacion: v('fxUbicacion'), torres: v('fxTorres'), apartamentos: v('fxApartamentos'),
    niveles: v('fxNiveles'), alturaTxt: v('fxAltura'), fase: v('fxFase'), personal: v('fxPersonal'),
    loteLargo: v('fxLoteLargo'), loteAncho: v('fxLoteAncho')
  });
  cerrCfg = {
    activo: !!document.getElementById('fxCerrActivo').checked,
    material: MATERIALES_CERR[v('fxCerrMaterial')] ? v('fxCerrMaterial') : 'lona',
    altura: numLim(v('fxCerrAltura'), 2.4, 1.8, 4)
  };
  fichaCompleta = true;
  construirLote();
  construirCerramiento();
  guardar();
  cerrarVentanaLibre();
  mostrarPanelVacio();
  avisar('Ficha técnica guardada — lote de ' + Math.round(ficha.loteLargo * ficha.loteAncho).toLocaleString('es-CO') + ' m²');
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
  redibujarVias(); redibujarRutas(); guardar(); mostrarPanelVacio();
  avisar('Tramo eliminado — el resto de la vía sigue intacto');
}
function eliminarViaCompleta(id){
  const comp = new Set(componenteVia(id));
  vias = vias.filter(v => !comp.has(v.id));
  selVia = null;
  redibujarVias(); redibujarRutas(); guardar(); mostrarPanelVacio();
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
    trazoRuta = { id: idSec++, nombre: nombreRutaLibre(), color: PALETA_RUTAS[rutas.length % PALETA_RUTAS.length], vehiculo: '', vel: 3, puntos: [p] };
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
    '<div style="display:flex; gap:6px">' +
      '<label style="flex:1">Velocidad (m/s)<input type="number" value="' + r.vel + '" min="0.5" max="20" step="0.5" onchange="cambiarRuta(' + r.id + ', \'vel\', this.value)"></label>' +
      '<label style="flex:1">Color<input type="color" value="' + r.color + '" onchange="cambiarRuta(' + r.id + ', \'color\', this.value)"></label>' +
    '</div>' +
    '<button onclick="toggleRecorrido(' + r.id + ')">' + ic(enMarcha ? 'stop' : 'play') + (enMarcha ? 'Detener el vehículo' : 'Recorrer la ruta (ida y vuelta)') + '</button>' +
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
  guardar(); redibujarRutas();
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
  rutasActivas.push({ rutaId: id, g, pts, acum, len: acum[acum.length - 1], s: 0, dir: 1 });
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
  if (a.s >= a.len){ a.s = a.len; a.dir = -1; }
  if (a.s <= 0){ a.s = 0; a.dir = 1; }
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

/* ============ HERRAMIENTAS VÍA / RUTA / REGLA: modo, clics y previsualización ============ */
let herramienta = null;   // null | 'via' | 'ruta' | 'regla'
let previewMesh = null;
function setHerramienta(h){
  if (herramienta === h) h = null;
  herramienta = h;
  trazoVia = null; trazoRuta = null; trazoRegla = null;
  redibujarMediciones();
  quitarPreviewHerramienta();
  document.getElementById('libreBtnVia').classList.toggle('activo', herramienta === 'via');
  document.getElementById('libreBtnRuta').classList.toggle('activo', herramienta === 'ruta');
  document.getElementById('libreBtnRegla').classList.toggle('activo', herramienta === 'regla');
  if (herramienta === 'via') panelHerramientaVia();
  else if (herramienta === 'ruta') panelHerramientaRuta();
  else if (herramienta === 'regla') panelHerramientaRegla();
  else mostrarPanelVacio();
}
function clicHerramienta(p){
  if (herramienta === 'via') clicVia(p);
  else if (herramienta === 'ruta') clicRuta(p);
  else if (herramienta === 'regla') clicRegla(p);
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
  previewMesh.material.color.setHex(herramienta === 'via' ? 0x8a8f96 : herramienta === 'regla' ? 0xffd23e : 0x2e9bff);
  previewMesh.scale.set(len, 1, herramienta === 'via' ? viaAnchoNuevo : herramienta === 'regla' ? 0.25 : 0.5);
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
    const et = crearEtiqueta(Math.round(len * 100) / 100 + ' m', 9, 'rgba(120,85,10,0.88)');
    et.position.set((me.x1 + me.x2) / 2, 1.8, (me.z1 + me.z2) / 2);
    reglaGrupo.add(et);
  });
  if (trazoRegla) disco(trazoRegla.x, trazoRegla.z);
  aplicarVisibilidadEtiquetas(reglaGrupo);
}
function panelHerramientaRegla(){
  const total = Math.round(mediciones.reduce((s, m) => s + Math.hypot(m.x2 - m.x1, m.z2 - m.z1), 0) * 100) / 100;
  panelSel('Regla — medir distancias',
    '<div class="desc">Haz <b class="txtAcento">clic sobre el terreno</b> en dos puntos para medir la distancia entre ellos; ' +
    'cada clic siguiente encadena otra medición. Las cotas quedan en pantalla hasta que las borres ' +
    '(no se guardan con el proyecto).</div>' +
    (mediciones.length
      ? '<table>' + mediciones.map((m, i) =>
          '<tr><td>Medición ' + (i + 1) + '</td><td>' + (Math.round(Math.hypot(m.x2 - m.x1, m.z2 - m.z1) * 100) / 100) + ' m</td></tr>').join('') +
        '<tr><td><b>Total</b></td><td><b>' + total + ' m</b></td></tr></table>'
      : '') +
    (trazoRegla ? '<div class="desc"><b class="txtAcento">Midiendo…</b> haz clic en el siguiente punto.</div>' : '') +
    '<button onclick="deshacerPuntoHerramienta()">' + ic('girarIzq') + 'Deshacer última medición</button>' +
    '<button onclick="terminarTrazo()">' + ic('check') + 'Terminar (empezar otra medición)</button>' +
    (mediciones.length ? '<button class="btnEliminar" onclick="borrarMediciones()">' + ic('basura') + 'Borrar todas las mediciones</button>' : ''));
}
function borrarMediciones(){
  mediciones = []; trazoRegla = null;
  redibujarMediciones();
  if (herramienta === 'regla') panelHerramientaRegla();
  avisar('Mediciones borradas');
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
  const btn = document.getElementById('libreBtnNoche');
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
  if (!caminando && modo2D) toggleVista2D();   // caminar es en 3D
  caminando = !caminando;
  const btn = document.getElementById('libreBtnCaminar');
  btn.classList.toggle('activo', caminando);
  btn.innerHTML = caminando ? ic('volver') + 'Salir' : ic('caminar') + 'Caminar';
  if (caminando){
    setHerramienta(null);
    // entra por el portón del costado sur, mirando hacia el lote (norte)
    camWalk.x = 0; camWalk.z = ficha.loteAncho / 2 + 8;
    camWalk.yaw = Math.PI; camWalk.pitch = 0;
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
function moverCaminante(dt){
  const t = teclasCaminar;
  const adelante = ((t.KeyW || t.ArrowUp) ? 1 : 0) - ((t.KeyS || t.ArrowDown) ? 1 : 0);
  const lado = ((t.KeyD || t.ArrowRight) ? 1 : 0) - ((t.KeyA || t.ArrowLeft) ? 1 : 0);
  const vel = (t.ShiftLeft || t.ShiftRight) ? 9 : 4.5;
  if (adelante || lado){
    const fx = Math.sin(camWalk.yaw), fz = Math.cos(camWalk.yaw);
    camWalk.x = Math.min(290, Math.max(-290, camWalk.x + (fx * adelante - fz * lado) * vel * dt));
    camWalk.z = Math.min(190, Math.max(-190, camWalk.z + (fz * adelante + fx * lado) * vel * dt));
  }
  camera.position.set(camWalk.x, 1.7, camWalk.z);
  camera.lookAt(
    camWalk.x + Math.sin(camWalk.yaw) * Math.cos(camWalk.pitch),
    1.7 + Math.sin(camWalk.pitch),
    camWalk.z + Math.cos(camWalk.yaw) * Math.cos(camWalk.pitch)
  );
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
  const btn = document.getElementById('libreBtn2D');
  btn.classList.toggle('activo', modo2D);
  btn.innerHTML = modo2D ? ic('caja') + 'Vista 3D' : ic('plano') + 'Plano 2D';
  if (modo2D){
    camCtrl.target.set(0, 0, 0);
    zoom2D = Math.max(ficha.loteAncho * 0.72, ficha.loteLargo * 0.42, 55);
    animCam = null;
  }
  refrescarEtiquetas();
  avisar(modo2D
    ? 'Plano 2D: arrastra las zonas para organizarlas · arrastrar en vacío mueve el plano · rueda = zoom'
    : 'Vista 3D');
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
  document.getElementById('libreBtnEtiquetas').classList.toggle('activo', !etiquetasVisibles);
  avisar(etiquetasVisibles ? 'Nombres y medidas visibles' : 'Nombres y medidas ocultos');
}

/* ============ ZONAS Y AFORO (mismo panel del proyecto Bambú) ============ */
function abrirZonasLibre(){
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Zonas y aforo';
  const L = ficha.loteLargo, A = ficha.loteAncho;
  const filas = elementos.map(g => {
    const d = g.userData.def;
    const area = (typeof d.w === 'number' && typeof d.d === 'number') ? Math.round(d.w * d.d * 10) / 10 : null;
    const fuera = Math.abs(d.x) + (d.w || 2) / 2 > L / 2 + 0.5 || Math.abs(d.z) + (d.d || 2) / 2 > A / 2 + 0.5;
    return { d, area, fuera };
  });
  const totalArea = Math.round(filas.reduce((s, f) => s + (f.area || 0), 0) * 10) / 10;
  const ocupacion = Math.round(totalArea / (L * A) * 1000) / 10;
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
      ocupacion + '% del lote (' + Math.round(L * A).toLocaleString('es-CO') + ' m²)</b><br>' +
      'Vías: ' + stVias.tramos + ' tramo(s) · ' + stVias.total + ' m lineales ≈ ' + areaVias + ' m² · Rutas de vehículos: ' + rutas.length + '</div>';
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
    vias, rutas, organigrama
  };
}
function guardar(){
  try { localStorage.setItem(CLAVE, JSON.stringify(estadoActual())); } catch (e) {}
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
      puntos: r.puntos.filter(p => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1])).map(p => [red2(p[0]), red2(p[1])])
    }));
  organigrama = (Array.isArray(o.organigrama) && o.organigrama.length)
    ? o.organigrama.map(normalizarRol)
    : plantillaOrganigrama();
  const maxId = Math.max(0,
    ...vias.map(v => v.id), ...rutas.map(r => r.id), ...organigrama.map(r => r.id));
  idSec = Math.max(idSec, maxId + 1);
  esNoche = !!o.noche;
  aplicarCielo();
  construirLote();
  construirCerramiento();
  redibujarVias();
  redibujarRutas();
  mostrarPanelVacio();
}
function cargarLocal(){
  let txt = null;
  try { txt = localStorage.getItem(CLAVE); } catch (e) {}
  let obj = {};
  if (txt){ try { obj = JSON.parse(txt); } catch (e) {} }
  aplicarEstado(obj);
}

document.getElementById('libreBtnAgregar').innerHTML = ic('mas') + 'Agregar';
document.getElementById('libreBtnVia').innerHTML = ic('via') + 'Vías';
document.getElementById('libreBtnRuta').innerHTML = ic('ruta') + 'Rutas';
document.getElementById('libreBtnFicha').innerHTML = ic('ficha') + 'Ficha';
document.getElementById('libreBtnOrg').innerHTML = ic('org') + 'Organigrama';
document.getElementById('libreBtnRegla').innerHTML = ic('regla') + 'Regla';
document.getElementById('libreBtn2D').innerHTML = ic('plano') + 'Plano 2D';
document.getElementById('libreBtnZonas').innerHTML = ic('edificio') + 'Zonas';
document.getElementById('libreBtnEtiquetas').innerHTML = ic('etiqueta') + 'Etiquetas';
document.getElementById('libreBtnCaminar').innerHTML = ic('caminar') + 'Caminar';
document.getElementById('libreBtnNoche').innerHTML = ic('luna') + 'Noche';
document.getElementById('libreBtnGuardar').innerHTML = ic('guardar') + 'Guardar';
document.getElementById('libreBtnCargar').innerHTML = ic('carpeta') + 'Cargar';
document.getElementById('libreBtnVaciar').innerHTML = ic('basura') + 'Vaciar';
document.querySelector('#libreUI a.btn').innerHTML = ic('volver') + 'Bambú';

document.getElementById('libreBtnVia').onclick = () => setHerramienta('via');
document.getElementById('libreBtnRuta').onclick = () => setHerramienta('ruta');
document.getElementById('libreBtnFicha').onclick = () => { setHerramienta(null); abrirFicha(); };
document.getElementById('libreBtnOrg').onclick = () => { setHerramienta(null); abrirOrganigrama(); };
document.getElementById('libreBtnRegla').onclick = () => setHerramienta('regla');
document.getElementById('libreBtn2D').onclick = toggleVista2D;
document.getElementById('libreBtnZonas').onclick = abrirZonasLibre;
document.getElementById('libreBtnEtiquetas').onclick = toggleEtiquetasLibre;
document.getElementById('libreBtnCaminar').onclick = toggleCaminar;
document.getElementById('libreBtnNoche').onclick = toggleNoche;
document.querySelectorAll('#libreTabs .tabBtn').forEach(b => { b.onclick = () => mostrarTabLibre(b.dataset.tab); });
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
    if (caminando){ toggleCaminar(); return; }
    if (herramienta){
      if (trazoVia || trazoRuta || trazoRegla) terminarTrazo();
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
});
addEventListener('keyup', e => { delete teclasCaminar[e.code]; });
document.getElementById('libreBtnAgregar').onclick = () => {
  setHerramienta(null);
  document.getElementById('libreVentTitulo').textContent = 'Agregar elemento a la obra';
  renderVentana();
  document.getElementById('libreOverlay').style.display = 'flex';
};
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
    try { aplicarEstado(JSON.parse(lector.result)); guardar(); avisar('Proyecto cargado'); }
    catch (err) { avisar('Archivo no válido'); }
  };
  lector.readAsText(f); e.target.value = '';
};
document.getElementById('libreBtnVaciar').onclick = () => {
  if (!elementos.length && !vias.length && !rutas.length){ avisar('La obra ya está vacía'); return; }
  if (confirm('¿Vaciar toda la obra? Se eliminan los elementos, las vías y las rutas (la ficha técnica y el organigrama se conservan).')){
    aplicarEstado({ ficha, fichaCompleta, cerramiento: cerrCfg, organigrama, elementos: [], vias: [], rutas: [] });
    guardar();
    avisar('Obra vaciada');
  }
};

/* pantalla de bienvenida: al comenzar por primera vez pide la ficha técnica
   (m² del terreno + datos generales) antes de armar la obra */
document.getElementById('libreComenzar').onclick = () => {
  const el = document.getElementById('libreInicio');
  el.classList.add('oculto');
  setTimeout(() => { el.style.display = 'none'; }, 400);
  if (!fichaCompleta) setTimeout(abrirFicha, 450);
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
  if (caminando) moverCaminante(dt);
  else if (modo2D) actualizarCamara2D();
  else actualizarCamara();
  renderer.render(scene, camActiva());
}

/* arranque */
mostrarPanelVacio();
cargarLocal();
actualizarCamara();
animar();
