/* ============================================================================
   EDITOR DE PLANOS  (editor-plano.html)
   Editor de planta estilo CAD: se trazan muros con clics sobre un lienzo 2D y
   la app detecta las habitaciones automáticamente (algoritmo de caras de un
   grafo planar, verificado aparte con casos de prueba antes de integrarlo
   aquí). Página aislada del resto del proyecto: su propia clave de
   localStorage ('editorPlano_v1'), sin módulos compartidos — mismo criterio
   que taller-libre.html/js/libre.js.
   ========================================================================== */

/* ---------- iconos SVG mínimos (sin dependencias) ---------- */
const ICO = {
  muro:     '<path d="M4 4h16v16H4z M4 10h16M4 16h16M10 4v6M16 10v6M10 16v4"/>',
  puerta:   '<path d="M5 21V4h11v17M5 21h13M13 12.5v.01"/>',
  ventana:  '<path d="M4 4h16v16H4z M12 4v16M4 12h16"/>',
  mueble:   '<path d="M6 4v9h12V4M6 13v3h12v-3M7 16v4M17 16v4"/>',
  guardar:  '<path d="M5 3h11l3 3v15H5z M8 3v5h7V3M8 21v-7h8v7"/>',
  carpeta:  '<path d="M3 7V5h6l2 2h10v13H3z"/>',
  basura:   '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
  bajar:    '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  cubo:     '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v9M4 7.5l8 4.5 8-4.5"/>',
  volver:   '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  sectores: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  play:     '<path d="M6 4l14 8-14 8z"/>'
};
function ic(n){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICO[n] || '') + '</svg>';
}
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function avisar(msj){
  const a = document.getElementById('edAvisoGuardado');
  a.textContent = msj; a.style.display = 'block';
  clearTimeout(a._t); a._t = setTimeout(() => { a.style.display = 'none'; }, 2600);
}
function cssVar(nombre){
  return (getComputedStyle(document.documentElement).getPropertyValue(nombre) || '').trim() || '#888';
}

/* ============ CONSTANTES ============ */
const MURO_GROSOR = 0.15;   // m — grosor visual de los muros
const NODO_SNAP = 0.25;     // m — radio para fusionar extremos de muro cercanos en un mismo nodo
const PALETA_HABITACIONES = ['#dce8f5', '#fde8d8', '#e3f0da', '#f5e0ea', '#e8e0f5', '#fdf0d0', '#e0f3f0', '#f7e3e3'];
const PALETA_SECTORES = ['#e07a5f', '#3d5a80', '#81b29a', '#f2cc8f', '#9d8189', '#457b9d', '#e9c46a', '#6d597a'];

/* ============ CRONOGRAMA REAL DE ACABADOS (gemini-code-*.md) ============
   45 actividades transcritas del documento del curso: [nombre, cuadrillas,
   duración en días, rendimiento/día]. El patrón de rotación de cada una se
   DERIVA de la cantidad de cuadrillas (1→lineal, 2→paralelo, 4→frentes,
   8→simultáneo) — así no hay que repetirlo a mano en cada fila. */
const ACTIVIDADES_CRUDAS = [
  ['Mampostería Exterior', 4, 3, '20 m²'],
  ['Mampostería Interior', 8, 3, '32 m²'],
  ['Instalación de Ventanas', 2, 2, '12 und'],
  ['Instalación Puertas de Entrada', 2, 2, '2 und'],
  ['Revoque Muros Interiores', 8, 6, '16 m²'],
  ['Estuco', 8, 4, '24 m²'],
  ['Pintura Muros (Fase inicial)', 8, 3, '40 m²'],
  ['Cielo Falso Drywall', 8, 5, '12 m²'],
  ['Cielo Falso RH', 4, 1, '12 m²'],
  ['Cielo en Superboard', 4, 1, '10 m²'],
  ['Piso en Porcelanato', 8, 3, '12 m²'],
  ['Piso en Cerámica Baños', 4, 1, '12 m²'],
  ['Piso Alcobas + Vestier', 4, 2, '24 m²'],
  ['Pasamanos', 4, 2, '8 m'],
  ['Enchape Duchas', 8, 2, '12 m²'],
  ['Salpicadero Cocina', 8, 1, '12 m²'],
  ['Enchape Zona de Ropas', 2, 1, '12 und'],
  ['Lavamanos Alcoba Principal', 2, 1, '4 und'],
  ['Lavamanos Baño Social', 1, 1, '8 juegos'],
  ['Lavamanos Alcoba Principal (Repaso)', 2, 1, '4 und'],
  ['Sanitario Baño Alcoba Principal', 2, 1, '4 und'],
  ['Sanitario Baño Social', 2, 1, '4 und'],
  ['Cabina Baño Principal', 4, 1, '2 und'],
  ['Cabina Baño Social', 4, 1, '2 und'],
  ['Muebles Cocina', 8, 4, '2 m²'],
  ['Mueble de Ropas', 2, 1, '2 und'],
  ['Mueble Baño Social', 1, 1, '4 und'],
  ['Mueble Baño Habitación Principal', 1, 2, '4 und'],
  ['Mesón Cocina', 8, 4, '2 m'],
  ['Mesón WC Principal', 4, 1, '2 und'],
  ['Mesón WC Social', 4, 1, '2 und'],
  ['Vestier / Closet', 1, 1, '2 und'],
  ['Puertas Vidrieras', 1, 1, '8 und'],
  ['Puerta Alcoba Principal', 4, 1, '4 und'],
  ['Puerta Alcobas', 4, 1, '4 und'],
  ['Puerta WC Alcoba Principal', 4, 1, '4 und'],
  ['Puerta Baño Social', 4, 1, '4 und'],
  ['Zócalo en Madera', 1, 1, '40 m'],
  ['Zócalo en Cerámica', 2, 1, '24 m'],
  ['Grifería Lavamanos', 2, 1, '8 und'],
  ['Ducha Monocontrol', 2, 1, '8 und'],
  ['Grifería Lavaplatos', 1, 1, '8 und'],
  ['Grifería para Lavadero', 1, 1, '8 und'],
  ['Pintura Cielos', 8, 2, '40 m²'],
  ['Pintura Muros (Acabado final)', 8, 3, '40 m²']
];
function patronDeCuadrillas(cuadrillas){
  if (cuadrillas >= 8) return 'simultaneo8';
  if (cuadrillas === 4) return 'frentes4';
  if (cuadrillas === 2) return 'paralelo2';
  return 'lineal1';
}
const ACTIVIDADES = ACTIVIDADES_CRUDAS.map(([nombre, cuadrillas, duracionDias, rendimiento], i) => ({
  id: i + 1, nombre, cuadrillas, duracionDias, rendimiento, patron: patronDeCuadrillas(cuadrillas)
}));
function construirLineaTiempo(actividades){
  let acumulado = 0;
  return actividades.map(a => {
    const inicioDia = acumulado;
    acumulado += a.duracionDias;
    return Object.assign({}, a, { inicioDia, finDia: acumulado });
  });
}
const LINEA_TIEMPO = construirLineaTiempo(ACTIVIDADES);
const DURACION_TOTAL_DIAS = LINEA_TIEMPO.length ? LINEA_TIEMPO[LINEA_TIEMPO.length - 1].finDia : 0;

/* agrupa una lista ORDENADA de sectores en grupos que trabajan en paralelo;
   dentro de un grupo, sus miembros se resuelven en orden secuencial. Con
   sectores creados en el orden real del documento (A,B,C,D,I,J,K,L) esto
   reproduce EXACTAMENTE los 4 patrones descritos — verificado aparte con
   Node antes de integrarlo aquí (frentes4 -> [A,B][C,D][I,J][K,L],
   paralelo2 -> [A,B,C,D] y [L,K,J,I], etc.) */
function agruparSectoresPorPatron(sectoresIds, patron){
  const n = sectoresIds.length;
  if (n === 0) return [];
  if (patron === 'simultaneo8') return sectoresIds.map(s => [s]);
  if (patron === 'lineal1') return [sectoresIds.slice()];
  if (patron === 'paralelo2'){
    const mitad = Math.ceil(n / 2);
    const linea1 = sectoresIds.slice(0, mitad);
    const linea2 = sectoresIds.slice(mitad).reverse();
    return [linea1, linea2].filter(g => g.length);
  }
  if (patron === 'frentes4'){
    const porGrupo = Math.ceil(n / 4);
    const grupos = [];
    for (let i = 0; i < n; i += porGrupo) grupos.push(sectoresIds.slice(i, i + porGrupo));
    return grupos.filter(g => g.length);
  }
  return sectoresIds.map(s => [s]);
}

/* ============ MODELO DE DATOS ============ */
let muros = [];         // [{id, x1,z1, x2,z2}]
let puertas = [];       // [{id, muroId, t, ancho, doble}]  (próxima etapa)
let ventanas = [];      // [{id, muroId, t, ancho}]         (próxima etapa)
let muebles = [];       // [{id, catalogoId, x,z, rot, w,d, color}] (próxima etapa)
let habitaciones = [];  // [{id, nombre, color, cx,cz, area, puntos}] — puntos/area/cx/cz se RECALCULAN, no se guardan tal cual
let siguienteId = 1;
let cicloColor = 0;
function nuevoId(){ return siguienteId++; }
function colorHabitacionDefault(){ return PALETA_HABITACIONES[(cicloColor++) % PALETA_HABITACIONES.length]; }
function red(n){ return Math.round((n || 0) * 100) / 100; }

/* ============ SECTORES (genérico: el usuario crea los que quiera) ============
   El orden define cómo rotan las cuadrillas en la secuencia de obra. Se
   siembran 8 por defecto (A-L, como el documento real del curso) solo si el
   proyecto arranca vacío — totalmente editable después. */
let sectores = [];  // [{id, nombre, color, orden}]
let cicloColorSector = 0;
function colorSectorDefecto(){ return PALETA_SECTORES[(cicloColorSector++) % PALETA_SECTORES.length]; }
function sectorPorId(id){ return sectores.find(s => s.id === id) || null; }
function sectoresOrdenados(){ return [...sectores].sort((a, b) => a.orden - b.orden); }
function sembrarSectoresDefecto(){
  const nombres = ['A', 'B', 'C', 'D', 'I', 'J', 'K', 'L'];
  sectores = nombres.map((n, i) => ({ id: nuevoId(), nombre: 'Sector ' + (i + 1) + ' (' + n + ')', color: colorSectorDefecto(), orden: i }));
}
function agregarSector(){
  const input = document.getElementById('edNuevoSector');
  const nombre = (input.value || '').trim().slice(0, 30);
  if (!nombre){ avisar('Escribe un nombre para el sector'); return; }
  const orden = sectores.length ? Math.max(...sectores.map(s => s.orden)) + 1 : 0;
  sectores.push({ id: nuevoId(), nombre, color: colorSectorDefecto(), orden });
  guardar(); renderPanelSectores();
}
function renombrarSector(id, nombre){
  const s = sectorPorId(id); if (!s) return;
  s.nombre = (nombre || '').trim().slice(0, 30) || s.nombre;
  guardar(); dibujar();
}
function cambiarColorSector(id, color){
  const s = sectorPorId(id); if (!s) return;
  s.color = color; guardar(); dibujar();
}
function moverSector(id, dir){
  const lista = sectoresOrdenados();
  const i = lista.findIndex(s => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return;
  const tmp = lista[i].orden; lista[i].orden = lista[j].orden; lista[j].orden = tmp;
  guardar(); renderPanelSectores(); dibujar();
}
function eliminarSector(id){
  sectores = sectores.filter(s => s.id !== id);
  habitaciones.forEach(h => { if (h.sectorId === id) h.sectorId = null; });
  guardar(); renderPanelSectores(); dibujar();
  avisar('Sector eliminado');
}
function renderPanelSectores(){
  document.getElementById('edPTitulo').textContent = 'Sectores';
  const lista = sectoresOrdenados().map(s =>
    '<div style="display:flex; align-items:center; gap:6px; margin-top:6px">' +
      '<input type="color" value="' + s.color + '" onchange="cambiarColorSector(' + s.id + ', this.value)" style="width:30px; height:30px; padding:2px; flex:none; margin:0">' +
      '<input value="' + esc(s.nombre) + '" maxlength="30" onchange="renombrarSector(' + s.id + ', this.value)" style="flex:1; margin:0">' +
      '<button style="width:auto; margin:0; padding:6px 9px" title="Subir" onclick="moverSector(' + s.id + ',-1)">↑</button>' +
      '<button style="width:auto; margin:0; padding:6px 9px" title="Bajar" onclick="moverSector(' + s.id + ',1)">↓</button>' +
      '<button style="width:auto; margin:0; padding:6px 9px" title="Eliminar" onclick="eliminarSector(' + s.id + ')">' + ic('basura') + '</button>' +
    '</div>'
  ).join('');
  const sinAsignar = habitaciones.filter(h => !h.sectorId).length;
  document.getElementById('edPBody').innerHTML =
    '<div class="desc">Crea los sectores de tu obra (apartamentos, zonas comunes) y luego asígnalos a cada habitación desde su ficha (clic sobre ella). ' +
    'El orden de esta lista define cómo rotan las cuadrillas en la secuencia de obra — igual que en el cronograma real. ' +
    '<b class="txtAcento">Una habitación sin sector nunca cambia de color en la secuencia de obra</b> — si le das reproducir y no ves nada, revisa que cada habitación tenga un sector asignado.</div>' +
    (lista || '<div class="desc">Aún no has creado ningún sector.</div>') +
    '<div style="display:flex; gap:6px; margin-top:10px">' +
      '<input id="edNuevoSector" maxlength="30" placeholder="Nombre del nuevo sector" style="flex:1; margin:0">' +
      '<button style="width:auto; margin:0" onclick="agregarSector()">' + ic('check') + '</button>' +
    '</div>' +
    (habitaciones.length
      ? '<button style="margin-top:10px" onclick="asignarSectoresAuto()">' + ic('sectores') + 'Asignar automáticamente' +
        (sinAsignar ? ' (' + sinAsignar + ' sin sector)' : '') + '</button>'
      : '');
}
/* reparte las habitaciones SIN sector entre los sectores existentes (round
   robin, en el mismo orden de la lista) — para que "Secuencia de obra"
   tenga algo que animar sin tener que asignar sector habitación por
   habitación una por una */
function asignarSectoresAuto(){
  const lista = sectoresOrdenados();
  if (!lista.length){ avisar('Crea al menos un sector primero'); return; }
  let i = 0;
  habitaciones.forEach(h => {
    if (h.sectorId) return;
    h.sectorId = lista[i % lista.length].id;
    i++;
  });
  guardar(); renderPanelSectores(); dibujar();
  avisar(i ? (i + ' habitación(es) asignadas') : 'Todas las habitaciones ya tenían sector');
}

/* ============ CATÁLOGO DE MUEBLES (mismas piezas que taller-libre.js/CATALOGO_MUEBLES,
   adaptadas a un rectángulo simple en 2D — la vista 3D las representa como
   una caja con la altura por defecto del catálogo) ============ */
const CATALOGO_MUEBLES_2D = [
  { id:'sofa', nombre:'Sofá', categoria:'Sala', w:2.0, d:0.9, h:0.85, color:'#5c7290' },
  { id:'mesaCentro', nombre:'Mesa de centro', categoria:'Sala', w:1.1, d:0.55, h:0.42, color:'#8a6642' },
  { id:'tv', nombre:'Mueble de TV', categoria:'Sala', w:1.3, d:0.4, h:0.9, color:'#23262b' },
  { id:'mesaComedor', nombre:'Mesa de comedor', categoria:'Comedor', w:1.6, d:0.9, h:0.75, color:'#a97a4d' },
  { id:'sillaComedor', nombre:'Silla de comedor', categoria:'Comedor', w:0.45, d:0.45, h:0.9, color:'#a97a4d' },
  { id:'camaDoble', nombre:'Cama doble', categoria:'Dormitorio', w:1.6, d:2.0, h:0.55, color:'#eef1f5' },
  { id:'mesaNoche', nombre:'Mesa de noche', categoria:'Dormitorio', w:0.45, d:0.4, h:0.55, color:'#a97a4d' },
  { id:'closet', nombre:'Closet', categoria:'Dormitorio', w:1.2, d:0.6, h:2.0, color:'#d8c8a8' },
  { id:'nevera', nombre:'Nevera', categoria:'Cocina', w:0.7, d:0.7, h:1.8, color:'#d9dde0' },
  { id:'estufa', nombre:'Estufa', categoria:'Cocina', w:0.6, d:0.6, h:0.9, color:'#2b2f36' },
  { id:'meson', nombre:'Mesón de cocina', categoria:'Cocina', w:2.0, d:0.65, h:0.9, color:'#cfd3d8' },
  { id:'inodoro', nombre:'Inodoro', categoria:'Baño', w:0.4, d:0.6, h:0.75, color:'#f2f2f2' },
  { id:'lavamanos', nombre:'Lavamanos', categoria:'Baño', w:0.55, d:0.45, h:0.85, color:'#f2f2f2' },
  { id:'ducha', nombre:'Ducha', categoria:'Baño', w:0.9, d:0.9, h:2.0, color:'#bcd6e0' },
  { id:'escritorio', nombre:'Escritorio', categoria:'Oficina', w:1.4, d:0.7, h:0.75, color:'#a97a4d' },
  { id:'sillaOficina', nombre:'Silla de oficina', categoria:'Oficina', w:0.55, d:0.55, h:1.0, color:'#2e6db8' },
  { id:'estanteria', nombre:'Estantería', categoria:'Oficina', w:0.9, d:0.35, h:1.9, color:'#a97a4d' }
];
function catalogoMuebleId(id){ return CATALOGO_MUEBLES_2D.find(c => c.id === id) || CATALOGO_MUEBLES_2D[0]; }
let muebleArmado = null;   // catalogoId elegido en el panel mientras modo==='mueble'

/* ============ LIENZO 2D: cámara (pan/zoom) y transformación mundo↔pantalla ============ */
const canvas = document.getElementById('edLienzo');
const ctx = canvas.getContext('2d');
function ajustarTamano(){
  const dpr = devicePixelRatio || 1;
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
}
const vista = { x: 0, z: 0, escala: 28 };  // escala = píxeles CSS por metro
function mundoAPantalla(x, z){
  return [ innerWidth / 2 + (x - vista.x) * vista.escala, innerHeight / 2 + (z - vista.z) * vista.escala ];
}
function pantallaAMundo(px, py){
  return [ (px - innerWidth / 2) / vista.escala + vista.x, (py - innerHeight / 2) / vista.escala + vista.z ];
}

/* ============ GEOMETRÍA ============ */
function distPuntoSegmento(px, pz, x1, z1, x2, z2){
  const dx = x2 - x1, dz = z2 - z1;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - x1) * dx + (pz - z1) * dz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + dx * t, cz = z1 + dz * t;
  return { dist: Math.hypot(px - cx, pz - cz), t, cx, cz };
}
function puntoEnPoligono(x, z, pts){
  let dentro = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const xi = pts[i].x, zi = pts[i].z, xj = pts[j].x, zj = pts[j].z;
    const cruza = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/* ============ GRAFO DE MUROS + DETECCIÓN DE HABITACIONES ============
   "Caras de un grafo planar": en cada nodo se ordenan las aristas salientes
   por ángulo; la siguiente arista de una misma cara es la que queda
   inmediatamente antes (en ese orden) de la arista gemela de la que se llega.
   Las caras interiores (habitaciones) salen con área con signo POSITIVA; la
   cara exterior no acotada sale NEGATIVA — verificado con casos de prueba
   (cuadrado simple, rectángulo dividido por un muro en T, forma en L) antes
   de integrar este algoritmo aquí. */
function construirGrafo(){
  const nodos = [];
  function indiceNodo(x, z){
    for (let i = 0; i < nodos.length; i++){
      if (Math.hypot(nodos[i].x - x, nodos[i].z - z) <= NODO_SNAP) return i;
    }
    nodos.push({ x, z });
    return nodos.length - 1;
  }
  const aristas = [];
  muros.forEach(m => {
    const ia = indiceNodo(m.x1, m.z1), ib = indiceNodo(m.x2, m.z2);
    if (ia !== ib) aristas.push({ a: ia, b: ib, muro: m });
  });
  return { nodos, aristas };
}
/* devuelve, por cada cara detectada, tanto la secuencia de nodos como la
   secuencia de ARISTAS (y por tanto de muros) que la bordean — así una
   habitación sabe qué muros son "suyos" y se pueden pintar junto con ella */
function detectarCaras(nodos, aristas){
  if (nodos.length < 3 || aristas.length < 3) return [];
  const medios = [];
  aristas.forEach((ar, ai) => {
    medios.push({ desde: ar.a, hasta: ar.b, aristaIdx: ai });
    medios.push({ desde: ar.b, hasta: ar.a, aristaIdx: ai });
  });
  medios.forEach((m, i) => { m.gemelo = (i % 2 === 0) ? i + 1 : i - 1; });
  const salientes = nodos.map(() => []);
  medios.forEach((m, i) => {
    const A = nodos[m.desde], B = nodos[m.hasta];
    m.angulo = Math.atan2(B.z - A.z, B.x - A.x);
    salientes[m.desde].push(i);
  });
  salientes.forEach(lista => lista.sort((i, j) => medios[i].angulo - medios[j].angulo));
  const usado = new Array(medios.length).fill(false);
  const caras = [];
  for (let inicio = 0; inicio < medios.length; inicio++){
    if (usado[inicio]) continue;
    const nodosCara = [], aristasCara = [];
    let actual = inicio, vueltas = 0;
    while (!usado[actual] && vueltas++ < medios.length + 2){
      usado[actual] = true;
      nodosCara.push(medios[actual].desde);
      aristasCara.push(medios[actual].aristaIdx);
      const llegada = medios[actual].hasta;
      const gemelo = medios[actual].gemelo;
      const lista = salientes[llegada];
      const pos = lista.indexOf(gemelo);
      actual = lista[(pos - 1 + lista.length) % lista.length];
    }
    if (nodosCara.length >= 3) caras.push({ nodos: nodosCara, aristas: aristasCara });
  }
  return caras;
}
function areaConSigno(nodosCara, nodos){
  let a = 0;
  for (let i = 0; i < nodosCara.length; i++){
    const p = nodos[nodosCara[i]], q = nodos[nodosCara[(i + 1) % nodosCara.length]];
    a += p.x * q.z - q.x * p.z;
  }
  return a / 2;
}
/* recalcula habitaciones[] desde cero a partir de muros[]; conserva
   nombre/color de habitaciones existentes emparejando por cercanía de
   centroide (mismo espíritu tolerante que el resto del proyecto) */
function recalcularHabitaciones(){
  const { nodos, aristas } = construirGrafo();
  const caras = detectarCaras(nodos, aristas);
  const anteriores = habitaciones;
  habitaciones = caras.map(cara => {
    const area = areaConSigno(cara.nodos, nodos);
    if (area <= 0.5) return null;
    const pts = cara.nodos.map(i => nodos[i]);
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    const muroIds = [...new Set(cara.aristas.map(ai => aristas[ai].muro.id))];
    let meta = anteriores.find(h => Math.hypot((h.cx || 0) - cx, (h.cz || 0) - cz) < 2.5);
    if (!meta) meta = { id: nuevoId(), nombre: 'Habitación', color: colorHabitacionDefault(), sectorId: null };
    return { id: meta.id, nombre: meta.nombre, color: meta.color, sectorId: meta.sectorId || null, cx, cz, area: red(area), puntos: pts, muroIds };
  }).filter(Boolean);
}

/* ============ TRAZADO DE MUROS ============ */
let modo = 'seleccionar';   // 'muro' | 'seleccionar' (más modos en próximas etapas)
let panelModo = null;       // null | 'sectores' | 'secuencia' — qué muestra el panel lateral fuera de una selección
let trazoMuro = null;       // { puntos:[{x,z}] } mientras se traza
let imantar = true;
let ratonMundo = { x: 0, z: 0 };

function imantarAngulo(x0, z0, x, z){
  const dx = x - x0, dz = z - z0;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.01) return [x, z];
  const paso = Math.PI / 4;
  const ang = Math.round(Math.atan2(dz, dx) / paso) * paso;
  return [x0 + Math.cos(ang) * dist, z0 + Math.sin(ang) * dist];
}
function imantarNodo(x, z){
  const { nodos } = construirGrafo();
  let mejor = null, mejorD = NODO_SNAP;
  nodos.forEach(n => { const d = Math.hypot(n.x - x, n.z - z); if (d <= mejorD){ mejorD = d; mejor = n; } });
  return mejor ? [mejor.x, mejor.z] : null;
}
/* si el punto cae sobre el INTERIOR de un muro existente (no cerca de sus
   extremos, que ya maneja imantarNodo), lo parte en dos ahí mismo para que
   el muro nuevo se conecte a un vértice real (necesario para que la
   detección de habitaciones vea la unión en T) */
function dividirMuroSiNecesario(x, z){
  for (let i = 0; i < muros.length; i++){
    const m = muros[i];
    const dx = m.x2 - m.x1, dz = m.z2 - m.z1;
    const len2 = dx * dx + dz * dz;
    if (len2 < 0.0001) continue;
    const t = ((x - m.x1) * dx + (z - m.z1) * dz) / len2;
    if (t <= 0.03 || t >= 0.97) continue;
    const px = m.x1 + dx * t, pz = m.z1 + dz * t;
    if (Math.hypot(x - px, z - pz) <= NODO_SNAP){
      const nuevo = { id: nuevoId(), x1: px, z1: pz, x2: m.x2, z2: m.z2 };
      m.x2 = px; m.z2 = pz;
      muros.push(nuevo);
      return [px, pz];
    }
  }
  return null;
}
function resolverPunto(xRaw, zRaw, anterior){
  let x = xRaw, z = zRaw;
  if (anterior && imantar){ [x, z] = imantarAngulo(anterior.x, anterior.z, xRaw, zRaw); }
  const nodo = imantarNodo(x, z);
  if (nodo) return nodo;
  const corte = dividirMuroSiNecesario(x, z);
  if (corte) return corte;
  return [x, z];
}
function agregarPuntoMuro(xRaw, zRaw){
  if (!trazoMuro) trazoMuro = { puntos: [] };
  const anterior = trazoMuro.puntos.length ? trazoMuro.puntos[trazoMuro.puntos.length - 1] : null;
  const [x, z] = resolverPunto(xRaw, zRaw, anterior);
  if (anterior){
    if (Math.hypot(x - anterior.x, z - anterior.z) < 0.15) return;
    muros.push({ id: nuevoId(), x1: anterior.x, z1: anterior.z, x2: x, z2: z });
  }
  trazoMuro.puntos.push({ x, z });
  recalcularHabitaciones();
  guardar();
  if (trazoMuro.puntos.length >= 4){
    const p0 = trazoMuro.puntos[0];
    if (Math.hypot(x - p0.x, z - p0.z) < 0.05){
      trazoMuro = null;
      cambiarModo('seleccionar');
      avisar('Contorno cerrado' + (habitaciones.length ? ' — habitación detectada' : ''));
      return;
    }
  }
  dibujar();
}

/* ============ PUERTAS Y VENTANAS ============
   Se ubican sobre un muro como un rango [t0,t1] a lo largo de su centerline
   (t en 0..1). El muro se dibuja en TRAMOS que saltan esos rangos — así el
   hueco se ve sin necesitar ninguna resta booleana (mismo truco simplificado
   que usará la vista 3D). */
function anchoT(obj, muro){
  const largo = Math.hypot(muro.x2 - muro.x1, muro.z2 - muro.z1);
  return largo > 0 ? (obj.ancho / 2) / largo : 0;
}
function aberturasDeMuro(muroId){
  const muro = muros.find(m => m.id === muroId);
  if (!muro) return [];
  const list = [];
  puertas.forEach(p => { if (p.muroId === muroId){ const a = anchoT(p, muro); list.push({ t0: p.t - a, t1: p.t + a, tipo: 'puerta', obj: p }); } });
  ventanas.forEach(v => { if (v.muroId === muroId){ const a = anchoT(v, muro); list.push({ t0: v.t - a, t1: v.t + a, tipo: 'ventana', obj: v }); } });
  return list.sort((a, b) => a.t0 - b.t0);
}
function todasAberturas(){
  return [...puertas.map(p => ({ tipo: 'puerta', obj: p })), ...ventanas.map(v => ({ tipo: 'ventana', obj: v }))];
}
function aberturaBajoPuntero(x, z){
  const radioMundo = 10 / vista.escala;
  let mejor = null, mejorD = radioMundo;
  todasAberturas().forEach(ab => {
    const m = muros.find(mm => mm.id === ab.obj.muroId);
    if (!m) return;
    const px = m.x1 + (m.x2 - m.x1) * ab.obj.t, pz = m.z1 + (m.z2 - m.z1) * ab.obj.t;
    const d = Math.hypot(x - px, z - pz);
    if (d <= mejorD){ mejorD = d; mejor = ab; }
  });
  return mejor;
}
function colocarAbertura(xRaw, zRaw, tipo){
  const m = muroBajoPuntero(xRaw, zRaw);
  if (!m){ avisar('Acércate a un muro para colocar la ' + (tipo === 'puerta' ? 'puerta' : 'ventana')); return; }
  const { t } = distPuntoSegmento(xRaw, zRaw, m.x1, m.z1, m.x2, m.z2);
  const anchoDefecto = tipo === 'puerta' ? 0.9 : 1.2;
  const largo = Math.hypot(m.x2 - m.x1, m.z2 - m.z1);
  const anchoTLocal = largo > 0 ? anchoDefecto / largo : 0;
  const tClamp = Math.min(1 - anchoTLocal / 2 - 0.02, Math.max(anchoTLocal / 2 + 0.02, t));
  const existentes = aberturasDeMuro(m.id);
  const solapa = existentes.some(ab => tClamp - anchoTLocal / 2 < ab.t1 + 0.02 && tClamp + anchoTLocal / 2 > ab.t0 - 0.02);
  if (solapa){ avisar('Ya hay una abertura ahí — prueba otro punto del muro'); return; }
  if (tipo === 'puerta') puertas.push({ id: nuevoId(), muroId: m.id, t: red(tClamp), ancho: anchoDefecto, doble: false });
  else ventanas.push({ id: nuevoId(), muroId: m.id, t: red(tClamp), ancho: anchoDefecto });
  guardar(); dibujar();
  avisar((tipo === 'puerta' ? 'Puerta' : 'Ventana') + ' colocada');
}
function eliminarAberturaSel(){
  if (!seleccion || (seleccion.tipo !== 'puerta' && seleccion.tipo !== 'ventana')) return;
  const esPuerta = seleccion.tipo === 'puerta';
  const lista = esPuerta ? puertas : ventanas;
  const i = lista.indexOf(seleccion.obj);
  if (i >= 0) lista.splice(i, 1);
  seleccion = null;
  guardar(); renderPanel(); dibujar();
  avisar((esPuerta ? 'Puerta' : 'Ventana') + ' eliminada');
}
function guardarAberturaSel(){
  if (!seleccion || (seleccion.tipo !== 'puerta' && seleccion.tipo !== 'ventana')) return;
  const obj = seleccion.obj;
  obj.ancho = Math.min(3, Math.max(0.4, parseFloat(document.getElementById('edAbAncho').value) || obj.ancho));
  if (seleccion.tipo === 'puerta'){
    const chk = document.getElementById('edAbDoble');
    if (chk) obj.doble = chk.checked;
  }
  guardar(); renderPanel(); dibujar();
  avisar('Actualizado');
}

/* ============ MUEBLES ============ */
function colocarMueble(x, z){
  if (!muebleArmado){ avisar('Elige una pieza del catálogo primero'); return; }
  const item = catalogoMuebleId(muebleArmado);
  muebles.push({ id: nuevoId(), catalogoId: item.id, x: red(x), z: red(z), rot: 0, w: item.w, d: item.d, color: item.color });
  guardar(); dibujar();
}
function armarMueble(id){ muebleArmado = id; renderPanelMueble(); }
function muebleBajoPuntero(x, z){
  for (let i = muebles.length - 1; i >= 0; i--){
    const mu = muebles[i];
    const dx = x - mu.x, dz = z - mu.z;
    const cos = Math.cos(-mu.rot), sin = Math.sin(-mu.rot);
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    if (Math.abs(lx) <= mu.w / 2 && Math.abs(lz) <= mu.d / 2) return mu;
  }
  return null;
}
function girarMueble(dir){
  if (!seleccion || seleccion.tipo !== 'mueble') return;
  seleccion.obj.rot += dir * Math.PI / 4;
  guardar(); renderPanel(); dibujar();
}
function guardarMuebleSel(){
  if (!seleccion || seleccion.tipo !== 'mueble') return;
  const mu = seleccion.obj;
  mu.w = Math.min(6, Math.max(0.2, parseFloat(document.getElementById('edMuAncho').value) || mu.w));
  mu.d = Math.min(6, Math.max(0.2, parseFloat(document.getElementById('edMuFondo').value) || mu.d));
  mu.color = document.getElementById('edMuColor').value || mu.color;
  guardar(); renderPanel(); dibujar();
  avisar('Mueble actualizado');
}
function eliminarMuebleSel(){
  if (!seleccion || seleccion.tipo !== 'mueble') return;
  const i = muebles.indexOf(seleccion.obj);
  if (i >= 0) muebles.splice(i, 1);
  seleccion = null;
  guardar(); renderPanel(); dibujar();
  avisar('Mueble eliminado');
}

/* ============ SELECCIÓN / HIT-TESTING ============ */
let seleccion = null;   // { tipo:'muro'|'habitacion', obj }
function nodoBajoPuntero(x, z){
  const { nodos } = construirGrafo();
  const radioMundo = Math.max(10 / vista.escala, NODO_SNAP);
  let mejor = null, mejorD = radioMundo;
  nodos.forEach(n => { const d = Math.hypot(n.x - x, n.z - z); if (d <= mejorD){ mejorD = d; mejor = n; } });
  return mejor;
}
function muroBajoPuntero(x, z){
  const radioMundo = 8 / vista.escala;
  let mejor = null, mejorD = radioMundo;
  muros.forEach(m => {
    const { dist } = distPuntoSegmento(x, z, m.x1, m.z1, m.x2, m.z2);
    if (dist <= mejorD){ mejorD = dist; mejor = m; }
  });
  return mejor;
}
function habitacionBajoPuntero(x, z){
  return habitaciones.find(h => puntoEnPoligono(x, z, h.puntos)) || null;
}
function seleccionar(s){ seleccion = s; renderPanel(); dibujar(); }
function eliminarMuroSel(){
  if (!seleccion || seleccion.tipo !== 'muro') return;
  const i = muros.indexOf(seleccion.obj);
  if (i >= 0) muros.splice(i, 1);
  const muroId = seleccion.obj.id;
  puertas = puertas.filter(p => p.muroId !== muroId);
  ventanas = ventanas.filter(v => v.muroId !== muroId);
  seleccion = null;
  recalcularHabitaciones(); guardar(); renderPanel(); dibujar();
  avisar('Muro eliminado');
}
function guardarHabitacionSel(){
  if (!seleccion || seleccion.tipo !== 'habitacion') return;
  const h = seleccion.obj;
  h.nombre = (document.getElementById('edHabNombre').value || '').trim().slice(0, 40) || 'Habitación';
  h.color = document.getElementById('edHabColor').value || h.color;
  const selSector = document.getElementById('edHabSector').value;
  h.sectorId = selSector ? Number(selSector) : null;
  guardar(); renderPanel(); dibujar();
  avisar('Habitación actualizada: ' + h.nombre);
}

/* ============ SECUENCIA DE OBRA: motor de animación ============
   diaActual recorre LINEA_TIEMPO (0..DURACION_TOTAL_DIAS). Para cada sector,
   se calcula qué fracción de las 45 actividades ya se completó (para el
   color) y si su actividad actual está "en proceso" (para el resalte) según
   el grupo/sub-tramo que le toca en el patrón de rotación de la actividad
   vigente — nada de esto se guarda, se recalcula en cada cuadro. */
let diaActual = 0;
let reproduciendo = false;
let velocidadDias = 1;   // días simulados por segundo real
let ultimoTs = null;

function actividadEnDia(dia){
  if (!LINEA_TIEMPO.length) return null;
  if (dia >= DURACION_TOTAL_DIAS) return LINEA_TIEMPO[LINEA_TIEMPO.length - 1];
  return LINEA_TIEMPO.find(a => dia >= a.inicioDia && dia < a.finDia) || LINEA_TIEMPO[0];
}
function fraccionCompletadaSector(sectorId, dia){
  if (!LINEA_TIEMPO.length) return 0;
  let completadas = 0;
  const ids = sectoresOrdenados().map(s => s.id);
  for (const a of LINEA_TIEMPO){
    if (a.finDia <= dia){ completadas++; continue; }
    if (a.inicioDia <= dia){
      const grupos = agruparSectoresPorPatron(ids, a.patron);
      const grupo = grupos.find(g => g.includes(sectorId));
      if (grupo){
        const diaLocal = dia - a.inicioDia;
        const idx = grupo.indexOf(sectorId);
        const subDur = a.duracionDias / grupo.length;
        if (diaLocal >= idx * subDur + subDur) completadas++;
        else if (diaLocal >= idx * subDur) completadas += 0.5;
      }
    }
    break;
  }
  return completadas / LINEA_TIEMPO.length;
}
function sectorEnProceso(sectorId, dia){
  const act = actividadEnDia(dia);
  if (!act) return false;
  const ids = sectoresOrdenados().map(s => s.id);
  const grupos = agruparSectoresPorPatron(ids, act.patron);
  const grupo = grupos.find(g => g.includes(sectorId));
  if (!grupo) return false;
  const diaLocal = dia - act.inicioDia;
  const idx = grupo.indexOf(sectorId);
  const subDur = act.duracionDias / grupo.length;
  return diaLocal >= idx * subDur && diaLocal < idx * subDur + subDur;
}
function hexANumero(hex){ return parseInt(String(hex).replace('#', ''), 16) || 0; }
/* gris "obra sin acabar" claramente distinto de la paleta pastel de
   habitaciones/sectores (a propósito más oscuro/apagado, no un gris casi
   blanco que se confunda con el color ya terminado) + curva de aceleración
   (raíz cuadrada) para que el cambio se note desde las primeras actividades,
   no solo cerca del final de las 45 */
function colorMezclado(hexBase, fraccion){
  const c = hexANumero(hexBase);
  const GRIS = 0x9aa0a3;
  const f = Math.sqrt(Math.max(0, Math.min(1, fraccion)));
  const canal = shift => Math.round(((GRIS >> shift & 255) * (1 - f)) + ((c >> shift & 255) * f));
  const r = canal(16), g = canal(8), b = canal(0);
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
/* misma lógica de grupo/sub-tramo que fraccionCompletadaSector(), pero
   respondiendo solo "¿ya terminó ESTA actividad para ESTE sector?" (no
   cuando termina para TODOS los sectores) — la usan tanto el color de
   muros/pisos como el revelado de puertas/ventanas/muebles reales. */
function actividadHechaParaSector(sectorId, actividad, dia){
  if (actividad.finDia <= dia) return true;
  if (actividad.inicioDia > dia) return false;
  const grupos = agruparSectoresPorPatron(sectoresOrdenados().map(s => s.id), actividad.patron);
  const grupo = grupos.find(g => g.includes(sectorId));
  if (!grupo) return false;
  const diaLocal = dia - actividad.inicioDia;
  const idx = grupo.indexOf(sectorId);
  const subDur = actividad.duracionDias / grupo.length;
  return diaLocal >= idx * subDur + subDur;
}
function algunaActividadHecha(nombres, sectorId, dia){
  return LINEA_TIEMPO.some(a => nombres.includes(a.nombre) && actividadHechaParaSector(sectorId, a, dia));
}

/* ============ COLOR DE MUROS Y PISOS SEGÚN LA ACTIVIDAD EN CURSO ============
   En vez de un solo color que se "aclara" con el progreso, el muro y el piso
   de un sector avanzan por su PROPIA paleta de acabados reales (obra gris →
   pañete → estuco → pintura para el muro; contrapiso → el material de piso
   que corresponda para el piso) — así al terminar las 45 actividades el
   muro y el piso quedan en colores claramente distintos, como en una obra
   real. El color final del muro es el color propio del SECTOR (elegido en
   el panel "Sectores"), para que cada apartamento termine pintado de un
   tono distinto y reconocible. */
const GRIS_ESTRUCTURA = '#9aa0a3';
const GRIS_CONTRAPISO = '#a8a29a';
const COLOR_MURO_POR_ACTIVIDAD = {
  'Mampostería Exterior': '#b5652f',
  'Mampostería Interior': '#b5814a',
  'Revoque Muros Interiores': '#c9c2b8',
  'Estuco': '#e8e4da',
  'Pintura Muros (Fase inicial)': '#eef1e8',
  'Enchape Duchas': '#bcd8e0',
  'Salpicadero Cocina': '#bcd8e0',
  'Enchape Zona de Ropas': '#bcd8e0'
};
const COLOR_PISO_POR_ACTIVIDAD = {
  'Piso en Porcelanato': '#d9d3c8',
  'Piso en Cerámica Baños': '#e3eef2',
  'Piso Alcobas + Vestier': '#c9a876'
};
function colorMuroSector(sectorId, dia){
  const sector = sectorPorId(sectorId);
  let color = GRIS_ESTRUCTURA;
  for (const a of LINEA_TIEMPO){
    if (!actividadHechaParaSector(sectorId, a, dia)) continue;
    if (a.nombre === 'Pintura Muros (Acabado final)') color = (sector && sector.color) || color;
    else if (COLOR_MURO_POR_ACTIVIDAD[a.nombre]) color = COLOR_MURO_POR_ACTIVIDAD[a.nombre];
  }
  return color;
}
function colorPisoSector(sectorId, dia){
  let color = GRIS_CONTRAPISO;
  for (const a of LINEA_TIEMPO){
    if (!actividadHechaParaSector(sectorId, a, dia)) continue;
    if (COLOR_PISO_POR_ACTIVIDAD[a.nombre]) color = COLOR_PISO_POR_ACTIVIDAD[a.nombre];
  }
  return color;
}
function categoriaDeActividad(nombre){
  if (nombre === 'Pintura Muros (Acabado final)' || COLOR_MURO_POR_ACTIVIDAD[nombre]) return 'muro';
  if (COLOR_PISO_POR_ACTIVIDAD[nombre]) return 'piso';
  return null;
}
/* texto blanco o negro según el brillo del color de fondo, para que la
   etiqueta de actividad siempre se lea bien sin importar el acabado */
function colorTextoContraste(hex){
  const c = hexANumero(hex);
  const lum = (0.299 * (c >> 16 & 255) + 0.587 * (c >> 8 & 255) + 0.114 * (c & 255)) / 255;
  return lum > 0.6 ? '#1a1a1a' : '#ffffff';
}
/* estado de un MURO: sector "dueño" (el de mayor progreso entre las
   habitaciones que lo bordean, así una pared compartida muestra el más
   avanzado) + si está en proceso ahora mismo. tieneSector=false -> se pinta
   siempre como muro normal (nunca se ve distinto si no se usa Secuencia) */
function estadoMuro(muroId, dia){
  let mejorFraccion = -1, sectorId = null, enProceso = false;
  habitaciones.forEach(h => {
    if (!h.sectorId || !(h.muroIds || []).includes(muroId)) return;
    const f = fraccionCompletadaSector(h.sectorId, dia);
    if (f > mejorFraccion){ mejorFraccion = f; sectorId = h.sectorId; }
    if (sectorEnProceso(h.sectorId, dia)) enProceso = true;
  });
  return { sectorId, enProceso, tieneSector: sectorId !== null };
}

/* ============ REVELADO DE PUERTAS/VENTANAS/MUEBLES REALES EN LA VISTA 3D ============
   En 2D SIEMPRE se ve todo lo que el usuario colocó (es el lienzo de
   diseño). En 3D, si la pieza pertenece a un sector con secuencia activa,
   solo se muestra una vez que la actividad real que la instala ya se
   completó PARA ESE SECTOR — así "reproducir" realmente hace aparecer las
   puertas/ventanas/muebles que el usuario ya diseñó, en vez de inventar
   piezas nuevas. Sin sector asignado, todo se ve siempre (comportamiento de
   antes de usar Sectores/Secuencia). */
const ACTIVIDADES_PUERTA = ['Instalación Puertas de Entrada', 'Puerta Alcoba Principal', 'Puerta Alcobas', 'Puerta WC Alcoba Principal', 'Puerta Baño Social', 'Puertas Vidrieras'];
const ACTIVIDADES_VENTANA = ['Instalación de Ventanas'];
const CATALOGO_A_ACTIVIDADES = {
  lavamanos: ['Lavamanos Alcoba Principal', 'Lavamanos Baño Social', 'Lavamanos Alcoba Principal (Repaso)', 'Mesón WC Principal', 'Mesón WC Social', 'Mueble Baño Social', 'Mueble Baño Habitación Principal'],
  inodoro: ['Sanitario Baño Alcoba Principal', 'Sanitario Baño Social'],
  ducha: ['Cabina Baño Principal', 'Cabina Baño Social'],
  meson: ['Mesón Cocina', 'Muebles Cocina'],
  nevera: ['Muebles Cocina'],
  estufa: ['Muebles Cocina'],
  closet: ['Mueble de Ropas', 'Vestier / Closet']
};
function sectorDeMuro(muroId){
  const h = habitaciones.find(hh => hh.sectorId && (hh.muroIds || []).includes(muroId));
  return h ? h.sectorId : null;
}
function sectorDePunto(x, z){
  const h = habitaciones.find(hh => hh.sectorId && puntoEnPoligono(x, z, hh.puntos));
  return h ? h.sectorId : null;
}
function visibleAbertura3D(ab, nombresActividad, dia){
  const sectorId = sectorDeMuro(ab.muroId);
  if (!sectorId) return true;
  return algunaActividadHecha(nombresActividad, sectorId, dia);
}
function visibleMueble3D(mu, dia){
  const nombres = CATALOGO_A_ACTIVIDADES[mu.catalogoId];
  if (!nombres) return true;
  const sectorId = sectorDePunto(mu.x, mu.z);
  if (!sectorId) return true;
  return algunaActividadHecha(nombres, sectorId, dia);
}

function togglePlay(){
  reproduciendo = !reproduciendo;
  if (reproduciendo){ ultimoTs = null; requestAnimationFrame(pasoAnimacion); }
  renderPanelSecuencia();
}
function reiniciarSecuencia(){
  diaActual = 0; reproduciendo = false;
  renderPanelSecuencia(); dibujar();
  if (vista3D){ construir3DDesdeDatos(); renderer3D.render(escena3D, camara3D); }
}
function cambiarVelocidadSecuencia(){
  velocidadDias = parseFloat(document.getElementById('edVelocidad').value) || 1;
}
function saltarADia(v){
  diaActual = Math.min(DURACION_TOTAL_DIAS, Math.max(0, parseFloat(v) || 0));
  dibujar();
  actualizarLecturaSecuencia();
  if (vista3D){ construir3DDesdeDatos(); renderer3D.render(escena3D, camara3D); }
}
let ultimoRefresco3D = 0;
function pasoAnimacion(ts){
  if (!reproduciendo){ ultimoTs = null; return; }
  if (ultimoTs == null) ultimoTs = ts;
  const dt = (ts - ultimoTs) / 1000;
  ultimoTs = ts;
  diaActual = Math.min(DURACION_TOTAL_DIAS, diaActual + dt * velocidadDias);
  if (diaActual >= DURACION_TOTAL_DIAS) reproduciendo = false;
  dibujar();
  actualizarLecturaSecuencia();
  // la vista 3D se reconstruye completa (no hay sincronización cuadro a
  // cuadro para eso) -- solo tiene sentido hacerlo unas pocas veces por
  // segundo, no 60 veces, mientras esté visible y reproduciendo
  if (vista3D && ts - ultimoRefresco3D > 300){
    ultimoRefresco3D = ts;
    construir3DDesdeDatos();
    renderer3D.render(escena3D, camara3D);
  }
  if (reproduciendo) requestAnimationFrame(pasoAnimacion);
  else renderPanelSecuencia();
}
/* actualiza SOLO el texto de día/actividad y el resaltado de la fila activa
   (sin reconstruir todo el innerHTML) para no pelear con el usuario si está
   arrastrando la barra de progreso, y para no repintar 45 filas 60 veces/seg */
function actualizarLecturaSecuencia(){
  const el = document.getElementById('edDiaTexto');
  if (!el) return;
  const act = actividadEnDia(diaActual);
  el.textContent = 'Día ' + diaActual.toFixed(1) + ' de ' + DURACION_TOTAL_DIAS + (act ? ' — ' + act.nombre : '');
  document.querySelectorAll('.edActActiva').forEach(n => n.classList.remove('edActActiva'));
  if (act){
    const fila = document.getElementById('edAct' + act.id);
    if (fila){ fila.classList.add('edActActiva'); fila.scrollIntoView({ block: 'nearest' }); }
  }
  const scrub = document.getElementById('edScrub');
  if (scrub && document.activeElement !== scrub) scrub.value = diaActual;
}
function renderPanelSecuencia(){
  document.getElementById('edPTitulo').textContent = 'Secuencia de obra';
  const listaHtml = ACTIVIDADES.map(a =>
    '<div id="edAct' + a.id + '" style="padding:4px 6px; border-radius:8px; font-size:11.5px; color:var(--texto-2)">' +
      a.id + '. ' + esc(a.nombre) +
      ' <span style="opacity:.75">(' + a.cuadrillas + ' cuadrillas · ' + a.duracionDias + ' d)</span></div>'
  ).join('');
  document.getElementById('edPBody').innerHTML =
    '<div class="desc">Reproduce el cronograma real de 45 actividades sobre los sectores que hayas asignado — cada habitación se va "pintando" a medida que su sector avanza.</div>' +
    '<div style="display:flex; gap:6px; margin-top:8px">' +
      '<button style="width:auto; flex:1; margin:0" onclick="togglePlay()">' + (reproduciendo ? 'Pausar' : ic('play') + 'Reproducir') + '</button>' +
      '<button style="width:auto; margin:0" onclick="reiniciarSecuencia()">Reiniciar</button>' +
    '</div>' +
    '<label>Velocidad <select id="edVelocidad" onchange="cambiarVelocidadSecuencia()">' +
      [0.5, 1, 2, 5, 10].map(v => '<option value="' + v + '"' + (v === velocidadDias ? ' selected' : '') + '>' + v + ' día/s</option>').join('') +
    '</select></label>' +
    '<input type="range" id="edScrub" min="0" max="' + DURACION_TOTAL_DIAS + '" step="0.1" value="' + diaActual + '" oninput="saltarADia(this.value)" style="width:100%; margin-top:8px">' +
    '<div class="desc" id="edDiaTexto" style="margin-top:2px"></div>' +
    '<div style="max-height:220px; overflow-y:auto; margin-top:8px; display:flex; flex-direction:column; gap:2px">' + listaHtml + '</div>';
  actualizarLecturaSecuencia();
}

/* ============ MODOS (barra de herramientas) ============ */
const MAPA_BOTON_MODO = { muro:'edBtnMuro', puerta:'edBtnPuerta', ventana:'edBtnVentana', mueble:'edBtnMueble' };
const AVISOS_MODO = {
  muro: 'Dibujando muros: clic para colocar cada punto, clic cerca del inicio para cerrar el contorno.',
  puerta: 'Colocando puertas: haz clic cerca de un muro.',
  ventana: 'Colocando ventanas: haz clic cerca de un muro.',
  mueble: 'Elige una pieza en el panel y haz clic sobre el lienzo para colocarla.'
};
function cambiarModo(nuevo){
  if (vista3D) toggleVista3D();
  modo = nuevo;
  panelModo = null;
  if (nuevo !== 'mueble') muebleArmado = null;
  Object.values(MAPA_BOTON_MODO).forEach(id => document.getElementById(id).classList.remove('activo'));
  if (MAPA_BOTON_MODO[nuevo]) document.getElementById(MAPA_BOTON_MODO[nuevo]).classList.add('activo');
  document.getElementById('edBtnFin').style.display = (nuevo === 'seleccionar') ? 'none' : '';
  canvas.classList.toggle('modoSeleccionar', nuevo === 'seleccionar');
  const aviso = document.getElementById('edAviso');
  if (AVISOS_MODO[nuevo]){ aviso.textContent = AVISOS_MODO[nuevo]; aviso.style.display = 'block'; }
  else aviso.style.display = 'none';
  seleccion = null;
  renderPanel(); dibujar();
}

/* ============ PANEL LATERAL ============
   Orden de prioridad: reproduciendo la secuencia (para no interrumpir la
   animación con un clic sin querer) > trazando muro > ficha de selección
   (muro/habitación) > gestión de sectores > texto de bienvenida. */
function renderPanel(){
  const titulo = document.getElementById('edPTitulo');
  const body = document.getElementById('edPBody');
  if (panelModo === 'secuencia'){ renderPanelSecuencia(); return; }
  if (modo === 'muro'){
    titulo.textContent = 'Trazando muros';
    body.innerHTML =
      '<div class="desc">Haz clic sobre el lienzo para colocar cada punto del muro. ' +
      'Cierra el contorno haciendo clic cerca del punto inicial para que la app detecte la habitación.</div>' +
      '<label><input type="checkbox" id="edImantar"' + (imantar ? ' checked' : '') + '> Imantar ángulo (0°/45°/90°)</label>' +
      '<button onclick="finalizarModoMuro()">' + ic('check') + 'Finalizar muro</button>';
    document.getElementById('edImantar').onchange = e => { imantar = e.target.checked; };
    return;
  }
  if (modo === 'puerta' || modo === 'ventana'){
    titulo.textContent = modo === 'puerta' ? 'Colocando puertas' : 'Colocando ventanas';
    body.innerHTML = '<div class="desc">Haz clic cerca de un muro para ubicar la ' +
      (modo === 'puerta' ? 'puerta' : 'ventana') + ' en ese punto. Puedes seguir colocando varias.</div>' +
      '<button onclick="finalizarModoMuro()">' + ic('check') + 'Terminar</button>';
    return;
  }
  if (modo === 'mueble'){ renderPanelMueble(); return; }
  if (seleccion && (seleccion.tipo === 'puerta' || seleccion.tipo === 'ventana')){
    const ab = seleccion.obj;
    titulo.textContent = seleccion.tipo === 'puerta' ? 'Puerta' : 'Ventana';
    body.innerHTML =
      '<label>Ancho (m) <input type="number" id="edAbAncho" value="' + ab.ancho + '" min="0.4" max="3" step="0.05"></label>' +
      (seleccion.tipo === 'puerta' ? '<label><input type="checkbox" id="edAbDoble"' + (ab.doble ? ' checked' : '') + '> Puerta doble</label>' : '') +
      '<button onclick="guardarAberturaSel()">Guardar cambios</button>' +
      '<button class="btnEliminar" onclick="eliminarAberturaSel()">' + ic('basura') + 'Eliminar</button>';
    return;
  }
  if (seleccion && seleccion.tipo === 'mueble'){
    const mu = seleccion.obj;
    const item = catalogoMuebleId(mu.catalogoId);
    titulo.textContent = item.nombre;
    body.innerHTML =
      '<table><tr><td>Categoría</td><td>' + esc(item.categoria) + '</td></tr></table>' +
      '<div class="fila2"><div>Ancho (m)<input type="number" id="edMuAncho" value="' + mu.w + '" min="0.2" max="6" step="0.05"></div>' +
      '<div>Fondo (m)<input type="number" id="edMuFondo" value="' + mu.d + '" min="0.2" max="6" step="0.05"></div></div>' +
      '<label>Color <input type="color" id="edMuColor" value="' + mu.color + '"></label>' +
      '<div style="display:flex; gap:6px; margin-top:8px">' +
        '<button style="flex:1; margin:0" onclick="girarMueble(-1)">↺ Girar</button>' +
        '<button style="flex:1; margin:0" onclick="girarMueble(1)">↻ Girar</button>' +
      '</div>' +
      '<button onclick="guardarMuebleSel()">Guardar cambios</button>' +
      '<button class="btnEliminar" onclick="eliminarMuebleSel()">' + ic('basura') + 'Eliminar</button>';
    return;
  }
  if (seleccion && seleccion.tipo === 'muro'){
    const m = seleccion.obj;
    const largo = Math.hypot(m.x2 - m.x1, m.z2 - m.z1);
    titulo.textContent = 'Muro';
    body.innerHTML =
      '<table><tr><td>Longitud</td><td>' + largo.toFixed(2) + ' m</td></tr></table>' +
      '<button class="btnEliminar" onclick="eliminarMuroSel()">' + ic('basura') + 'Eliminar muro</button>';
    return;
  }
  if (seleccion && seleccion.tipo === 'habitacion'){
    const h = seleccion.obj;
    titulo.textContent = h.nombre;
    const opciones = '<option value="">Sin sector</option>' + sectoresOrdenados().map(s =>
      '<option value="' + s.id + '"' + (h.sectorId === s.id ? ' selected' : '') + '>' + esc(s.nombre) + '</option>').join('');
    body.innerHTML =
      '<table><tr><td>Área</td><td>' + h.area + ' m²</td></tr></table>' +
      '<input id="edHabNombre" maxlength="40" value="' + esc(h.nombre) + '" placeholder="Nombre">' +
      '<label>Color <input type="color" id="edHabColor" value="' + h.color + '"></label>' +
      '<label style="display:block">Sector <select id="edHabSector" style="width:100%; margin-top:4px">' + opciones + '</select></label>' +
      '<button onclick="guardarHabitacionSel()">Guardar cambios</button>';
    return;
  }
  if (panelModo === 'sectores'){ renderPanelSectores(); return; }
  titulo.textContent = 'Editor de planos';
  body.innerHTML = '<div class="desc">Pulsa <b class="txtAcento">Muro</b> y haz clic sobre el lienzo para ' +
    'empezar a trazar tu planta. Cierra el contorno para que la app detecte la habitación automáticamente. ' +
    'Después, usa <b class="txtAcento">Sectores</b> para etiquetar cada habitación y <b class="txtAcento">Secuencia de obra</b> ' +
    'para ver cómo se van terminando según el cronograma real.</div>';
}
function finalizarModoMuro(){ trazoMuro = null; cambiarModo('seleccionar'); }
function renderPanelMueble(){
  document.getElementById('edPTitulo').textContent = 'Colocar mueble';
  const cats = {};
  CATALOGO_MUEBLES_2D.forEach(c => { (cats[c.categoria] = cats[c.categoria] || []).push(c); });
  const listaHtml = Object.keys(cats).map(cat =>
    '<div class="catCat">' + esc(cat) + '</div>' +
    cats[cat].map(c => '<button class="' + (muebleArmado === c.id ? 'activo' : '') + '" onclick="armarMueble(\'' + c.id + '\')">' + esc(c.nombre) + '</button>').join('')
  ).join('');
  document.getElementById('edPBody').innerHTML =
    '<div class="desc">Elige una pieza y haz clic sobre el lienzo para colocarla. Puedes seguir colocando varias.</div>' +
    '<div id="edCatalogo">' + listaHtml + '</div>' +
    '<button style="margin-top:10px" onclick="finalizarModoMuro()">' + ic('check') + 'Terminar</button>';
}

/* ============ RENDER 2D ============ */
function dibujarCuadricula(){
  const paso = vista.escala < 8 ? 5 : 1;
  const [x0] = pantallaAMundo(0, 0), [x1] = pantallaAMundo(innerWidth, 0);
  const [, z0] = pantallaAMundo(0, 0), [, z1] = pantallaAMundo(0, innerHeight);
  ctx.strokeStyle = cssVar('--linea'); ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.floor(x0 / paso) * paso; x <= x1; x += paso){
    const [px] = mundoAPantalla(x, 0);
    ctx.moveTo(px, 0); ctx.lineTo(px, innerHeight);
  }
  for (let z = Math.floor(z0 / paso) * paso; z <= z1; z += paso){
    const [, pz] = mundoAPantalla(0, z);
    ctx.moveTo(0, pz); ctx.lineTo(innerWidth, pz);
  }
  ctx.stroke();
  ctx.strokeStyle = cssVar('--borde'); ctx.lineWidth = 1.4;
  ctx.beginPath();
  const [px0] = mundoAPantalla(0, 0); ctx.moveTo(px0, 0); ctx.lineTo(px0, innerHeight);
  const [, pz0] = mundoAPantalla(0, 0); ctx.moveTo(0, pz0); ctx.lineTo(innerWidth, pz0);
  ctx.stroke();
}
function dibujarHabitaciones(){
  habitaciones.forEach(h => {
    let colorRelleno = h.color, enProceso = false, actividadTxt = '', colorChip = cssVar('--acento');
    if (h.sectorId){
      colorRelleno = colorPisoSector(h.sectorId, diaActual);   // el PISO de la habitación, no un tono aclarado del color de zona
      enProceso = sectorEnProceso(h.sectorId, diaActual);
      if (enProceso){
        const act = actividadEnDia(diaActual);
        if (act){
          actividadTxt = act.nombre;
          const cat = categoriaDeActividad(act.nombre);
          colorChip = cat === 'muro' ? colorMuroSector(h.sectorId, diaActual)
                    : cat === 'piso' ? colorPisoSector(h.sectorId, diaActual)
                    : cssVar('--acento');
        }
      }
    }
    ctx.beginPath();
    h.puntos.forEach((p, i) => {
      const [px, pz] = mundoAPantalla(p.x, p.z);
      if (i === 0) ctx.moveTo(px, pz); else ctx.lineTo(px, pz);
    });
    ctx.closePath();
    ctx.fillStyle = colorRelleno;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    if (enProceso){
      ctx.save();
      ctx.strokeStyle = cssVar('--acento');
      ctx.lineWidth = 5;
      ctx.setLineDash([7, 4]);
      ctx.lineDashOffset = -performance.now() / 60;   // "hormigas marchando": se nota que está EN proceso, no estático
      ctx.stroke();
      ctx.restore();
    }
    const [cx, cz] = mundoAPantalla(h.cx, h.cz);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = cssVar('--texto');
    ctx.font = '600 13px Nunito, sans-serif';
    ctx.fillText(h.nombre, cx, cz - 7);
    ctx.font = '400 11px Nunito, sans-serif';
    ctx.fillText(h.area + ' m²', cx, cz + 9);
    if (actividadTxt){
      // el fondo del chip ES el color del acabado que se está aplicando —
      // así se lee "qué actividad" y "qué color" en un solo elemento
      ctx.font = '700 11px Nunito, sans-serif';
      const anchoChip = Math.max(60, ctx.measureText(actividadTxt).width + 16);
      ctx.fillStyle = colorChip;
      ctx.fillRect(cx - anchoChip / 2, cz + 17, anchoChip, 17);
      ctx.strokeStyle = cssVar('--borde');
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - anchoChip / 2, cz + 17, anchoChip, 17);
      ctx.fillStyle = colorTextoContraste(colorChip);
      ctx.fillText(actividadTxt, cx, cz + 25);
    }
  });
}
/* dibuja un muro en tramos que SALTAN el rango de cada abertura (así el
   hueco de puertas/ventanas se ve sin necesitar ninguna resta booleana) */
function dibujarMuro(m){
  const aberturas = aberturasDeMuro(m.id);
  const seleccionado = seleccion && seleccion.tipo === 'muro' && seleccion.obj === m;
  const { sectorId, enProceso, tieneSector } = estadoMuro(m.id, diaActual);
  const grosor = Math.max(3, MURO_GROSOR * vista.escala);
  let cursor = 0;
  const tramos = [];
  aberturas.forEach(ab => { if (ab.t0 > cursor) tramos.push([cursor, ab.t0]); cursor = Math.max(cursor, ab.t1); });
  if (cursor < 1) tramos.push([cursor, 1]);
  const segmentosPantalla = tramos.map(([ta, tb]) => {
    const xa = m.x1 + (m.x2 - m.x1) * ta, za = m.z1 + (m.z2 - m.z1) * ta;
    const xb = m.x1 + (m.x2 - m.x1) * tb, zb = m.z1 + (m.z2 - m.z1) * tb;
    return [mundoAPantalla(xa, za), mundoAPantalla(xb, zb)];
  });
  ctx.lineCap = 'square';
  ctx.strokeStyle = seleccionado ? cssVar('--acento') : (tieneSector ? colorMuroSector(sectorId, diaActual) : cssVar('--texto'));
  ctx.lineWidth = grosor;
  ctx.setLineDash([]);
  segmentosPantalla.forEach(([[pxa, pza], [pxb, pzb]]) => {
    ctx.beginPath(); ctx.moveTo(pxa, pza); ctx.lineTo(pxb, pzb); ctx.stroke();
  });
  ctx.setLineDash([]);
  if (enProceso){
    ctx.save();
    ctx.strokeStyle = cssVar('--acento');
    ctx.lineWidth = grosor + 5;
    ctx.globalAlpha = 0.45;
    ctx.lineDashOffset = -performance.now() / 60;
    ctx.setLineDash([8, 5]);
    segmentosPantalla.forEach(([[pxa, pza], [pxb, pzb]]) => {
      ctx.beginPath(); ctx.moveTo(pxa, pza); ctx.lineTo(pxb, pzb); ctx.stroke();
    });
    ctx.restore();
  }
  aberturas.forEach(ab => dibujarAbertura(m, ab));
}
function dibujarAbertura(m, ab){
  const dx = m.x2 - m.x1, dz = m.z2 - m.z1, largo = Math.hypot(dx, dz);
  if (largo < 0.01) return;
  const ux = dx / largo, uz = dz / largo, nx = -uz, nz = ux;   // unitario a lo largo / normal
  const anchoM = (ab.t1 - ab.t0) * largo;
  const seleccionada = seleccion && (seleccion.tipo === 'puerta' || seleccion.tipo === 'ventana') && seleccion.obj === ab.obj;
  const x0 = m.x1 + dx * ab.t0, z0 = m.z1 + dz * ab.t0;
  const x1 = m.x1 + dx * ab.t1, z1 = m.z1 + dz * ab.t1;
  if (ab.tipo === 'puerta'){
    const xHoja = x0 + nx * anchoM, zHoja = z0 + nz * anchoM;
    const [p0x, p0z] = mundoAPantalla(x0, z0);
    const [pHx, pHz] = mundoAPantalla(xHoja, zHoja);
    const [p1x, p1z] = mundoAPantalla(x1, z1);
    ctx.strokeStyle = seleccionada ? cssVar('--acento') : cssVar('--texto-2');
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p0x, p0z); ctx.lineTo(pHx, pHz); ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(pHx, pHz); ctx.lineTo(p1x, p1z); ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const [p1x, p1z] = mundoAPantalla(x0, z0), [p2x, p2z] = mundoAPantalla(x1, z1);
    ctx.strokeStyle = seleccionada ? cssVar('--acento') : '#6fb3d9';
    ctx.lineWidth = Math.max(3, MURO_GROSOR * vista.escala * 0.6);
    ctx.beginPath(); ctx.moveTo(p1x, p1z); ctx.lineTo(p2x, p2z); ctx.stroke();
  }
}
function dibujarMuros(){
  muros.forEach(dibujarMuro);
  const { nodos } = construirGrafo();
  ctx.fillStyle = cssVar('--acento-2');
  nodos.forEach(n => {
    const [px, pz] = mundoAPantalla(n.x, n.z);
    ctx.beginPath(); ctx.arc(px, pz, 3.5, 0, Math.PI * 2); ctx.fill();
  });
}
/* piezas que "aparecen" al completarse su actividad (ver ACTIVIDAD_A_MUEBLE)
   — puramente visual, calculadas cada cuadro desde diaActual, nunca se
   agregan a muebles[] ni se guardan */
function dibujarMuebles(){
  muebles.forEach(mu => {
    const [cx, cz] = mundoAPantalla(mu.x, mu.z);
    ctx.save();
    ctx.translate(cx, cz);
    ctx.rotate(-mu.rot);
    const wpx = mu.w * vista.escala, dpx = mu.d * vista.escala;
    const seleccionado = seleccion && seleccion.tipo === 'mueble' && seleccion.obj === mu;
    ctx.fillStyle = seleccionado ? cssVar('--acento') : mu.color;
    ctx.fillRect(-wpx / 2, -dpx / 2, wpx, dpx);
    ctx.strokeStyle = cssVar('--texto-2'); ctx.lineWidth = 1;
    ctx.strokeRect(-wpx / 2, -dpx / 2, wpx, dpx);
    ctx.restore();
    if (vista.escala > 12){
      ctx.fillStyle = cssVar('--texto');
      ctx.font = '400 9px Nunito, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(catalogoMuebleId(mu.catalogoId).nombre, cx, cz);
    }
  });
}
function dibujarTrazoActual(){
  if (modo !== 'muro' || !trazoMuro || !trazoMuro.puntos.length) return;
  const ultimo = trazoMuro.puntos[trazoMuro.puntos.length - 1];
  const [x, z] = imantar ? imantarAngulo(ultimo.x, ultimo.z, ratonMundo.x, ratonMundo.z) : [ratonMundo.x, ratonMundo.z];
  const [px1, pz1] = mundoAPantalla(ultimo.x, ultimo.z);
  const [px2, pz2] = mundoAPantalla(x, z);
  ctx.strokeStyle = cssVar('--acento');
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px1, pz1); ctx.lineTo(px2, pz2); ctx.stroke();
  ctx.setLineDash([]);
  const dist = Math.hypot(x - ultimo.x, z - ultimo.z);
  ctx.fillStyle = cssVar('--acento-texto');
  ctx.font = '600 12px Nunito, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(dist.toFixed(2) + ' m', (px1 + px2) / 2, (pz1 + pz2) / 2 - 10);
}
function dibujar(){
  const dpr = devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = cssVar('--fondo');
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  dibujarCuadricula();
  dibujarHabitaciones();
  dibujarMuros();
  dibujarMuebles();
  dibujarTrazoActual();
}

/* ============ INTERACCIÓN: puntero, pellizco, rueda ============ */
let arrastreNodo = null;
let arrastreMuro = null;
let arrastreMueble = null;
let paneando = false;
let panX0 = 0, panY0 = 0;
let pinza = null;
const punterosTactiles = new Map();

canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  if (e.pointerType === 'touch'){
    punterosTactiles.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punterosTactiles.size === 2){
      const [a, b] = [...punterosTactiles.values()];
      pinza = { dist0: Math.hypot(a.x - b.x, a.y - b.y), escala0: vista.escala, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      arrastreNodo = null; arrastreMuro = null; paneando = false;
      return;
    }
  }
  const [x, z] = pantallaAMundo(e.clientX, e.clientY);
  if (e.button === 2 || e.shiftKey){ paneando = true; panX0 = e.clientX; panY0 = e.clientY; return; }
  if (e.button !== 0) return;

  if (modo === 'muro'){ agregarPuntoMuro(x, z); return; }
  if (modo === 'puerta' || modo === 'ventana'){ colocarAbertura(x, z, modo); return; }
  if (modo === 'mueble'){ colocarMueble(x, z); return; }

  const muCerca = muebleBajoPuntero(x, z);
  if (muCerca){
    seleccionar({ tipo: 'mueble', obj: muCerca });
    arrastreMueble = { mueble: muCerca, ox: muCerca.x, oz: muCerca.z, x0: x, z0: z };
    return;
  }
  const abCerca = aberturaBajoPuntero(x, z);
  if (abCerca){ seleccionar({ tipo: abCerca.tipo, obj: abCerca.obj }); return; }
  const nodoCerca = nodoBajoPuntero(x, z);
  if (nodoCerca){
    const refs = [];
    muros.forEach(m => {
      if (Math.hypot(m.x1 - nodoCerca.x, m.z1 - nodoCerca.z) <= NODO_SNAP) refs.push({ muro: m, campo: '1' });
      if (Math.hypot(m.x2 - nodoCerca.x, m.z2 - nodoCerca.z) <= NODO_SNAP) refs.push({ muro: m, campo: '2' });
    });
    arrastreNodo = { refs };
    return;
  }
  const muroCerca = muroBajoPuntero(x, z);
  if (muroCerca){
    seleccionar({ tipo: 'muro', obj: muroCerca });
    arrastreMuro = { muro: muroCerca, ox1: muroCerca.x1, oz1: muroCerca.z1, ox2: muroCerca.x2, oz2: muroCerca.z2, x0: x, z0: z };
    return;
  }
  const habCerca = habitacionBajoPuntero(x, z);
  if (habCerca){ seleccionar({ tipo: 'habitacion', obj: habCerca }); return; }
  seleccion = null; renderPanel(); dibujar();
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' && punterosTactiles.has(e.pointerId)){
    punterosTactiles.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinza && punterosTactiles.size >= 2){
      const [a, b] = [...punterosTactiles.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      vista.escala = Math.min(120, Math.max(4, pinza.escala0 * (dist / Math.max(pinza.dist0, 1))));
      dibujar();
      return;
    }
  }
  const [x, z] = pantallaAMundo(e.clientX, e.clientY);
  ratonMundo = { x, z };
  if (paneando){
    vista.x -= (e.clientX - panX0) / vista.escala;
    vista.z -= (e.clientY - panY0) / vista.escala;
    panX0 = e.clientX; panY0 = e.clientY;
    dibujar(); return;
  }
  if (arrastreNodo){
    arrastreNodo.refs.forEach(r => {
      if (r.campo === '1'){ r.muro.x1 = x; r.muro.z1 = z; } else { r.muro.x2 = x; r.muro.z2 = z; }
    });
    dibujar(); return;
  }
  if (arrastreMuro){
    const dx = x - arrastreMuro.x0, dz = z - arrastreMuro.z0;
    arrastreMuro.muro.x1 = arrastreMuro.ox1 + dx; arrastreMuro.muro.z1 = arrastreMuro.oz1 + dz;
    arrastreMuro.muro.x2 = arrastreMuro.ox2 + dx; arrastreMuro.muro.z2 = arrastreMuro.oz2 + dz;
    dibujar(); return;
  }
  if (arrastreMueble){
    const dx = x - arrastreMueble.x0, dz = z - arrastreMueble.z0;
    arrastreMueble.mueble.x = red(arrastreMueble.ox + dx);
    arrastreMueble.mueble.z = red(arrastreMueble.oz + dz);
    dibujar(); return;
  }
  if (modo === 'muro') dibujar();
});
function finPointer(e){
  if (e.pointerType === 'touch'){ punterosTactiles.delete(e.pointerId); if (punterosTactiles.size < 2) pinza = null; }
  paneando = false;
  if (arrastreNodo){ arrastreNodo = null; recalcularHabitaciones(); guardar(); renderPanel(); dibujar(); }
  if (arrastreMuro){ arrastreMuro = null; recalcularHabitaciones(); guardar(); renderPanel(); dibujar(); }
  if (arrastreMueble){ arrastreMueble = null; guardar(); renderPanel(); dibujar(); }
}
canvas.addEventListener('pointerup', finPointer);
canvas.addEventListener('pointercancel', e => { punterosTactiles.delete(e.pointerId); if (punterosTactiles.size < 2) pinza = null; });
canvas.addEventListener('wheel', e => {
  vista.escala = Math.min(120, Math.max(4, vista.escala * (1 - e.deltaY * 0.001)));
  dibujar();
}, { passive: true });
addEventListener('resize', () => { ajustarTamano(); dibujar(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && modo !== 'seleccionar') finalizarModoMuro();
});

/* ============ GUARDAR / CARGAR ============ */
const CLAVE = 'editorPlano_v1';
function estadoActual(){
  return {
    version: 1, proyecto: 'Editor de planos — Taller II', fecha: new Date().toISOString(),
    muros: muros.map(m => ({ id: m.id, x1: red(m.x1), z1: red(m.z1), x2: red(m.x2), z2: red(m.z2) })),
    puertas: puertas.map(p => ({ id: p.id, muroId: p.muroId, t: red(p.t), ancho: red(p.ancho), doble: !!p.doble })),
    ventanas: ventanas.map(v => ({ id: v.id, muroId: v.muroId, t: red(v.t), ancho: red(v.ancho) })),
    muebles: muebles.map(mu => ({ id: mu.id, catalogoId: mu.catalogoId, x: red(mu.x), z: red(mu.z), rot: red(mu.rot), w: red(mu.w), d: red(mu.d), color: mu.color })),
    habitaciones: habitaciones.map(h => ({ id: h.id, nombre: h.nombre, color: h.color, sectorId: h.sectorId || null, cx: red(h.cx), cz: red(h.cz) })),
    sectores: sectores.map(s => ({ id: s.id, nombre: s.nombre, color: s.color, orden: s.orden }))
  };
}
function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(estadoActual())); } catch (e) {} }
function limitarArray(a, max){ return Array.isArray(a) ? a.slice(0, max) : []; }
function reconstruir(d){
  d = d || {};
  muros = limitarArray(d.muros, 400).map(m => ({
    id: (typeof m.id === 'number') ? m.id : nuevoId(),
    x1: +m.x1 || 0, z1: +m.z1 || 0, x2: +m.x2 || 0, z2: +m.z2 || 0
  }));
  const idsMuros = new Set(muros.map(m => m.id));
  puertas = limitarArray(d.puertas, 200)
    .filter(p => idsMuros.has(p.muroId))
    .map(p => ({ id: (typeof p.id === 'number') ? p.id : nuevoId(), muroId: p.muroId, t: +p.t || 0.5, ancho: +p.ancho || 0.9, doble: !!p.doble }));
  ventanas = limitarArray(d.ventanas, 200)
    .filter(v => idsMuros.has(v.muroId))
    .map(v => ({ id: (typeof v.id === 'number') ? v.id : nuevoId(), muroId: v.muroId, t: +v.t || 0.5, ancho: +v.ancho || 1.2 }));
  muebles = limitarArray(d.muebles, 400).map(mu => {
    const item = catalogoMuebleId(mu.catalogoId);
    return {
      id: (typeof mu.id === 'number') ? mu.id : nuevoId(),
      catalogoId: item.id, x: +mu.x || 0, z: +mu.z || 0, rot: +mu.rot || 0,
      w: +mu.w || item.w, d: +mu.d || item.d,
      color: /^#[0-9a-f]{6}$/i.test(mu.color || '') ? mu.color : item.color
    };
  });
  sectores = limitarArray(d.sectores, 60).map((s, i) => ({
    id: (typeof s.id === 'number') ? s.id : nuevoId(),
    nombre: String(s.nombre || ('Sector ' + (i + 1))).slice(0, 30),
    color: /^#[0-9a-f]{6}$/i.test(s.color || '') ? s.color : colorSectorDefecto(),
    orden: (typeof s.orden === 'number') ? s.orden : i
  }));
  habitaciones = limitarArray(d.habitaciones, 100).map(h => ({
    id: (typeof h.id === 'number') ? h.id : nuevoId(),
    nombre: String(h.nombre || 'Habitación').slice(0, 40),
    color: /^#[0-9a-f]{6}$/i.test(h.color || '') ? h.color : colorHabitacionDefault(),
    sectorId: (typeof h.sectorId === 'number') ? h.sectorId : null,
    cx: +h.cx || 0, cz: +h.cz || 0
  }));
  [...muros, ...puertas, ...ventanas, ...muebles, ...habitaciones, ...sectores].forEach(o => { siguienteId = Math.max(siguienteId, o.id + 1); });
  seleccion = null; trazoMuro = null;
  diaActual = 0; reproduciendo = false;
  recalcularHabitaciones();
  cambiarModo('seleccionar');
}
function cargarLocal(){
  let txt = null;
  try { txt = localStorage.getItem(CLAVE); } catch (e) {}
  if (!txt){ sembrarSectoresDefecto(); return; }
  try { reconstruir(JSON.parse(txt)); } catch (e) { sembrarSectoresDefecto(); }
}

/* ============ EXPORTAR PNG / PDF ============
   Mismo patrón que exportarPlano()/capturarPlanta() en js/analisis.js (el
   proyecto principal): ventana nueva con una hoja formateada para imprimir
   + window.print() (el usuario elige "Guardar como PDF" en el diálogo nativo
   del navegador) — cero dependencias nuevas, ninguna librería de PDF. Aquí es
   más simple que en el proyecto 3D: el lienzo YA es la vista en planta,
   no hace falta reposicionar ninguna cámara antes de capturarlo. */
function exportarPlano(){
  const img = canvas.toDataURL('image/png');
  const totalArea = Math.round(habitaciones.reduce((s, h) => s + (h.area || 0), 0) * 10) / 10;
  const filasHtml = habitaciones.map(h => {
    const sector = h.sectorId ? ((sectorPorId(h.sectorId) || {}).nombre || '—') : '—';
    return '<tr><td>' + esc(h.nombre) + '</td><td class="num">' + h.area + '</td><td>' + esc(sector) + '</td></tr>';
  }).join('');
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<title>Plano — Sectorización</title>' +
    '<style>' +
      '@page { size: A4 landscape; margin: 12mm; }' +
      'body { font-family: "Nunito", Arial, sans-serif; color: #1f241b; margin: 24px; }' +
      'header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #3E8E5A; padding-bottom: 8px; margin-bottom: 14px; }' +
      'h1 { font-family: "Fredoka", sans-serif; font-size: 19px; margin: 0; color: #2E6B44; text-transform: uppercase; letter-spacing: 1px; }' +
      'h2 { font-family: "Fredoka", sans-serif; font-size: 13px; margin: 18px 0 6px; color: #2E6B44; text-transform: uppercase; letter-spacing: 1px; }' +
      'header small { color: #6a7260; font-size: 12px; }' +
      'img.planta { width: 100%; max-height: 58vh; object-fit: contain; border: 1px solid #d9ddd1; background:#fff; }' +
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
    '<header><div><h1>Sectorización — Editor de planos</h1>' +
      '<small>Taller II · Universidad Nacional de Colombia</small></div>' +
      '<small>' + esc(fecha) + '</small></header>' +
    '<div class="acciones">' +
      '<button onclick="window.print()">Imprimir / Guardar PDF</button>' +
      '<a href="' + img + '" download="plano_editor.png">Descargar PNG</a>' +
    '</div>' +
    '<img class="planta" src="' + img + '" alt="Vista del plano">' +
    '<h2>Cuadro de áreas</h2>' +
    (habitaciones.length
      ? '<table><tr><th>Habitación</th><th class="num">Área (m²)</th><th>Sector</th></tr>' + filasHtml +
        '<tr class="total"><td>Total (' + habitaciones.length + ')</td><td class="num">' + totalArea + '</td><td></td></tr></table>'
      : '<p style="color:#6a7260; font-size:11.5px">Aún no hay habitaciones detectadas.</p>') +
    '<h2>Resumen</h2>' +
    '<table><tr><td>Muros</td><td class="num">' + muros.length + '</td></tr>' +
      '<tr><td>Puertas</td><td class="num">' + puertas.length + '</td></tr>' +
      '<tr><td>Ventanas</td><td class="num">' + ventanas.length + '</td></tr>' +
      '<tr><td>Muebles</td><td class="num">' + muebles.length + '</td></tr></table>' +
    '<script>window.addEventListener("load", function(){ setTimeout(function(){ window.print(); }, 400); });<\/script>' +
    '</body></html>';
  const w = window.open('', '_blank');
  if (!w){ avisar('Permite las ventanas emergentes para exportar el plano'); return; }
  w.document.write(html);
  w.document.close();
}

/* ============ VISTA 3D ============
   Se reconstruye desde el modelo de datos vigente CADA VEZ que se activa
   (no hay sincronización en vivo cuadro a cuadro, ni loop de animación
   continuo — se renderiza "on demand" igual que el lienzo 2D). Reutiliza la
   misma técnica de caja orientada que dibujarSegmentoVia() (js/vias.js) para
   extruir muros, y el mismo patrón de cámara orbital (theta/phi) que
   js/libre.js. */
let vista3D = false;
let escena3D = null, camara3D = null, renderer3D = null, grupo3D = null;
const cam3D = { target: new THREE.Vector3(0, 1.3, 0), radius: 30, theta: 0.7, phi: 1.1 };
const ALTURA_MURO = 2.6;

function caja3D(g, w, h, d, color, x, y, z, op){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial(op !== undefined ? { color, transparent: true, opacity: op } : { color }));
  m.position.set(x, y, z); g.add(m); return m;
}
function actualizarCamara3D(){
  const s = Math.sin(cam3D.phi);
  camara3D.position.set(
    cam3D.target.x + cam3D.radius * s * Math.sin(cam3D.theta),
    cam3D.target.y + cam3D.radius * Math.cos(cam3D.phi),
    cam3D.target.z + cam3D.radius * s * Math.cos(cam3D.theta)
  );
  camara3D.lookAt(cam3D.target);
}
function inicializar3DSiFalta(){
  if (renderer3D) return;
  escena3D = new THREE.Scene();
  escena3D.background = new THREE.Color(0xe9ecef);
  camara3D = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
  renderer3D = new THREE.WebGLRenderer({ antialias: true });
  renderer3D.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  document.getElementById('ed3D').appendChild(renderer3D.domElement);
  escena3D.add(new THREE.HemisphereLight(0xffffff, 0x3a3428, 0.9));
  const sol = new THREE.DirectionalLight(0xfff2dd, 0.8);
  sol.position.set(-10, 20, 10);
  escena3D.add(sol);
  grupo3D = new THREE.Group();
  escena3D.add(grupo3D);

  const dom = renderer3D.domElement;
  let rotando3D = false, x0_3d = 0, y0_3d = 0;
  dom.addEventListener('contextmenu', e => e.preventDefault());
  dom.addEventListener('pointerdown', e => { rotando3D = true; x0_3d = e.clientX; y0_3d = e.clientY; });
  addEventListener('pointerup', () => { rotando3D = false; });
  dom.addEventListener('pointermove', e => {
    if (!rotando3D || !vista3D) return;
    cam3D.theta -= (e.clientX - x0_3d) * 0.0055;
    cam3D.phi = Math.min(1.5, Math.max(0.1, cam3D.phi - (e.clientY - y0_3d) * 0.0045));
    x0_3d = e.clientX; y0_3d = e.clientY;
    actualizarCamara3D(); renderer3D.render(escena3D, camara3D);
  });
  dom.addEventListener('wheel', e => {
    if (!vista3D) return;
    cam3D.radius = Math.min(200, Math.max(3, cam3D.radius * (1 + e.deltaY * 0.001)));
    actualizarCamara3D(); renderer3D.render(escena3D, camara3D);
  }, { passive: true });
  addEventListener('resize', () => {
    if (!vista3D) return;
    camara3D.aspect = innerWidth / innerHeight; camara3D.updateProjectionMatrix();
    renderer3D.setSize(innerWidth, innerHeight);
    renderer3D.render(escena3D, camara3D);
  });
}
function construir3DDesdeDatos(){
  while (grupo3D.children.length){
    const n = grupo3D.children[0];
    if (n.geometry) n.geometry.dispose();
    grupo3D.remove(n);
  }
  muros.forEach(m => {
    const aberturas = aberturasDeMuro(m.id);
    const { sectorId, enProceso, tieneSector } = estadoMuro(m.id, diaActual);
    const colorMuro = !tieneSector ? 0xd8d8d0 : hexANumero(enProceso ? colorMezclado('#f2a33e', 0.85) : colorMuroSector(sectorId, diaActual));
    let cursor = 0; const tramos = [];
    aberturas.forEach(ab => { if (ab.t0 > cursor) tramos.push([cursor, ab.t0]); cursor = Math.max(cursor, ab.t1); });
    if (cursor < 1) tramos.push([cursor, 1]);
    tramos.forEach(([ta, tb]) => {
      const xa = m.x1 + (m.x2 - m.x1) * ta, za = m.z1 + (m.z2 - m.z1) * ta;
      const xb = m.x1 + (m.x2 - m.x1) * tb, zb = m.z1 + (m.z2 - m.z1) * tb;
      const dx = xb - xa, dz = zb - za, len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const c = caja3D(grupo3D, len, ALTURA_MURO, MURO_GROSOR, colorMuro, (xa + xb) / 2, ALTURA_MURO / 2, (za + zb) / 2);
      c.rotation.y = -Math.atan2(dz, dx);
    });
    // puertas/ventanas REALES colocadas por el usuario: en 3D solo se
    // revelan cuando su actividad de instalación ya se completó para el
    // sector de este muro (si no tiene sector, se ven siempre)
    aberturas.forEach(ab => {
      const nombres = ab.tipo === 'puerta' ? ACTIVIDADES_PUERTA : ACTIVIDADES_VENTANA;
      if (!visibleAbertura3D(ab.obj, nombres, diaActual)) return;
      const x0 = m.x1 + (m.x2 - m.x1) * ab.t0, z0 = m.z1 + (m.z2 - m.z1) * ab.t0;
      const x1 = m.x1 + (m.x2 - m.x1) * ab.t1, z1 = m.z1 + (m.z2 - m.z1) * ab.t1;
      const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
      if (len < 0.05) return;
      const rotY = -Math.atan2(dz, dx);
      if (ab.tipo === 'puerta'){
        const c = caja3D(grupo3D, len * 0.94, 2.05, 0.045, 0x8a6642, (x0 + x1) / 2, 1.025, (z0 + z1) / 2);
        c.rotation.y = rotY;
      } else {
        const c = caja3D(grupo3D, len * 0.94, 1.1, 0.04, 0x9fc4e8, (x0 + x1) / 2, 1.35, (z0 + z1) / 2, 0.55);
        c.rotation.y = rotY;
      }
    });
  });
  habitaciones.forEach(h => {
    if (h.puntos.length < 3) return;
    const shape = new THREE.Shape(h.puntos.map(p => new THREE.Vector2(p.x, p.z)));
    const geo = new THREE.ShapeGeometry(shape);
    let color = h.color;
    if (h.sectorId){
      color = sectorEnProceso(h.sectorId, diaActual) ? colorMezclado('#f2a33e', 0.85) : colorPisoSector(h.sectorId, diaActual);
    }
    const piso = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
    piso.rotation.x = Math.PI / 2;   // shape en plano XY -> mundo (x, 0, z): local Y del shape pasa a mundo Z
    piso.position.y = 0.02;
    grupo3D.add(piso);
  });
  // muebles REALES colocados por el usuario: mismo criterio de revelado
  muebles.forEach(mu => {
    if (!visibleMueble3D(mu, diaActual)) return;
    const item = catalogoMuebleId(mu.catalogoId);
    const alto = item.h || 0.8;
    const c = caja3D(grupo3D, mu.w, alto, mu.d, mu.color, mu.x, alto / 2, mu.z);
    c.rotation.y = -mu.rot;
  });
}
function toggleVista3D(){
  vista3D = !vista3D;
  document.getElementById('edLienzo').style.display = vista3D ? 'none' : 'block';
  document.getElementById('ed3D').style.display = vista3D ? 'block' : 'none';
  document.getElementById('edBtn3D').classList.toggle('activo', vista3D);
  document.getElementById('edBtn3D').innerHTML = ic('cubo') + (vista3D ? 'Ver en 2D' : 'Ver en 3D');
  if (!vista3D) return;
  // no se puede llamar a cambiarModo() aquí: su primera línea revierte vista3D
  // si ya está activa, lo que causaría un toggle infinito entre 2D y 3D
  if (modo !== 'seleccionar'){
    trazoMuro = null; modo = 'seleccionar';
    Object.values(MAPA_BOTON_MODO).forEach(id => document.getElementById(id).classList.remove('activo'));
    document.getElementById('edBtnFin').style.display = 'none';
    canvas.classList.add('modoSeleccionar');
    document.getElementById('edAviso').style.display = 'none';
  }
  panelModo = null; seleccion = null; renderPanel();
  inicializar3DSiFalta();
  construir3DDesdeDatos();
  camara3D.aspect = innerWidth / innerHeight; camara3D.updateProjectionMatrix();
  renderer3D.setSize(innerWidth, innerHeight);
  actualizarCamara3D();
  renderer3D.render(escena3D, camara3D);
}

/* ============ BARRA DE HERRAMIENTAS ============ */
document.getElementById('edBtnMuro').innerHTML = ic('muro') + 'Muro';
document.getElementById('edBtnPuerta').innerHTML = ic('puerta') + 'Puerta';
document.getElementById('edBtnVentana').innerHTML = ic('ventana') + 'Ventana';
document.getElementById('edBtnMueble').innerHTML = ic('mueble') + 'Mueble';
document.getElementById('edBtnFin').innerHTML = ic('check') + 'Finalizar';
document.getElementById('edBtnSectores').innerHTML = ic('sectores') + 'Sectores';
document.getElementById('edBtnSecuencia').innerHTML = ic('play') + 'Secuencia de obra';
document.getElementById('edBtnGuardar').innerHTML = ic('guardar') + 'Guardar';
document.getElementById('edBtnCargar').innerHTML = ic('carpeta') + 'Cargar';
document.getElementById('edBtnVaciar').innerHTML = ic('basura') + 'Vaciar';
document.getElementById('edBtnExportar').innerHTML = ic('bajar') + 'Exportar';
document.getElementById('edBtn3D').innerHTML = ic('cubo') + 'Ver en 3D';
document.querySelector('#edUI a.btn').innerHTML = ic('volver') + 'Bambú';

document.getElementById('edBtnMuro').onclick = () => {
  if (modo === 'muro'){ finalizarModoMuro(); return; }
  trazoMuro = { puntos: [] };
  cambiarModo('muro');
};
document.getElementById('edBtnFin').onclick = () => { finalizarModoMuro(); };
document.getElementById('edBtnPuerta').onclick = () => { modo === 'puerta' ? finalizarModoMuro() : cambiarModo('puerta'); };
document.getElementById('edBtnVentana').onclick = () => { modo === 'ventana' ? finalizarModoMuro() : cambiarModo('ventana'); };
document.getElementById('edBtnMueble').onclick = () => { modo === 'mueble' ? finalizarModoMuro() : cambiarModo('mueble'); };
document.getElementById('edBtnSectores').onclick = () => {
  if (modo !== 'seleccionar') finalizarModoMuro();
  panelModo = (panelModo === 'sectores') ? null : 'sectores';
  seleccion = null;
  renderPanel(); dibujar();
};
document.getElementById('edBtnSecuencia').onclick = () => {
  if (modo !== 'seleccionar') finalizarModoMuro();
  panelModo = (panelModo === 'secuencia') ? null : 'secuencia';
  seleccion = null;
  renderPanel(); dibujar();
};
document.getElementById('edBtnExportar').onclick = exportarPlano;
document.getElementById('edBtn3D').onclick = toggleVista3D;

document.getElementById('edBtnGuardar').onclick = () => {
  guardar();
  const blob = new Blob([JSON.stringify(estadoActual(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'plano_editor.json'; a.click();
  URL.revokeObjectURL(a.href);
  avisar('Guardado (+ respaldo plano_editor.json)');
};
document.getElementById('edBtnCargar').onclick = () => document.getElementById('edArchivo').click();
document.getElementById('edArchivo').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try { reconstruir(JSON.parse(lector.result)); guardar(); avisar('Plano cargado'); dibujar(); }
    catch (err) { avisar('Archivo no válido'); }
  };
  lector.readAsText(f); e.target.value = '';
};
document.getElementById('edBtnVaciar').onclick = () => {
  if (!muros.length && !muebles.length){ avisar('El plano ya está vacío'); return; }
  if (confirm('¿Vaciar todo el plano? Esto elimina muros, puertas, ventanas y muebles. Los sectores que creaste se conservan.')){
    const sectoresPrevios = estadoActual().sectores;
    reconstruir({ sectores: sectoresPrevios });
    guardar(); avisar('Plano vaciado'); dibujar();
  }
};

/* pantalla de bienvenida */
document.getElementById('edComenzar').onclick = () => {
  const el = document.getElementById('edInicio');
  el.classList.add('oculto');
  setTimeout(() => { el.style.display = 'none'; }, 400);
};

/* ============ ARRANQUE ============ */
ajustarTamano();
cargarLocal();
cambiarModo('seleccionar');
