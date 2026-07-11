/* Equipos y maquinaria móvil de obra (montacargas, carretilla, plataforma de
   transporte, andamio colgante y pluma grúa) + panel "Zonas y aforo".
   Se crean desde el botón "Equipos", se comportan como cualquier provisional
   (arrastrar, girar, bloquear, destino de camiones) y persisten junto con el
   resto de la distribución (ver estado.js). */

/* ============ 15. EQUIPOS PERSONALIZADOS ============ */
let equiposCreados = [];   // defs: { tipo, nombre, descripcion, pos:[x,z], ...campos según tipo }

const TIPOS_EQUIPO = {
  montacargasElectrico: { nombre: 'Montacargas eléctrico' },
  montacargasManual:    { nombre: 'Montacargas manual' },
  carretilla:           { nombre: 'Carretilla' },
  plataformaTransporte: { nombre: 'Plataforma de transporte' },
  andamioColgante:      { nombre: 'Andamio colgante' },
  plumaGrua:            { nombre: 'Pluma grúa' }
};
/* subgrupos del selector "Equipos": vertical = sube/baja material entre
   niveles; horizontal = lo mueve por el mismo piso */
const GRUPOS_EQUIPO = [
  { nombre: 'Transporte vertical', tipos: ['montacargasElectrico', 'montacargasManual', 'andamioColgante', 'plumaGrua'] },
  { nombre: 'Transporte horizontal', tipos: ['carretilla', 'plataformaTransporte'] }
];
function opcionesTipoEquipo(){
  return GRUPOS_EQUIPO.map(grupo =>
    '<optgroup label="' + esc(grupo.nombre) + '">' +
      grupo.tipos.map(k => '<option value="' + k + '">' + esc(TIPOS_EQUIPO[k].nombre) + '</option>').join('') +
    '</optgroup>'
  ).join('');
}

const MAT_AMARILLO_EQ = 0xf0b429;
const MAT_GRIS_EQ = 0x6d7075;
const MAT_NEGRO_EQ = 0x23262b;
const MAT_AZUL_EQ = 0x2e6db8;

function ruedaEq(g, x, y, z, r){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.16, r || 0.16, 0.1, 10), new THREE.MeshLambertMaterial({ color: MAT_NEGRO_EQ }));
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  g.add(m);
  return m;
}

/* ---- Montacargas eléctrico: carro a batería con mástil y horquillas ---- */
function construirMontacargasElectrico(def){
  const g = new THREE.Group();
  caja(g, 1.3, 0.55, 0.8, MAT_AMARILLO_EQ, 0, 0.35, 0.15);
  caja(g, 0.7, 0.5, 0.5, MAT_NEGRO_EQ, -0.1, 0.9, 0.15);
  caja(g, 0.5, 0.6, 0.05, MAT_GRIS_EQ, 0.15, 1.3, 0.15);
  [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.6], [0.5, 0.6]].forEach(([x, z]) => ruedaEq(g, x, 0.16, z, 0.16));
  caja(g, 0.12, 2.1, 0.5, MAT_GRIS_EQ, -0.65, 1.1, -0.35);
  caja(g, 0.9, 0.07, 0.12, MAT_GRIS_EQ, -1.05, 0.16, -0.55);
  caja(g, 0.9, 0.07, 0.12, MAT_GRIS_EQ, -1.05, 0.16, -0.15);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona · carga hasta 1.000 kg',
    dimensiones: '1.3 × 0.8 m',
    altura: 'Mástil 2.1 m',
    material: 'Montacargas eléctrico a batería — mástil vertical con horquillas para tarimas y material paletizado',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Montacargas eléctrico creado desde "Equipos". Arrástralo, gíralo de a 45°, bloquéalo o elimínalo cuando ya no se necesite.'
  };
  return g;
}

/* ---- Montacargas manual: transpaleta de gato hidráulico ---- */
function construirMontacargasManual(def){
  const g = new THREE.Group();
  caja(g, 1.0, 0.08, 0.16, MAT_GRIS_EQ, 0, 0.14, -0.22);
  caja(g, 1.0, 0.08, 0.16, MAT_GRIS_EQ, 0, 0.14, 0.22);
  ruedaEq(g, -0.4, 0.1, -0.22, 0.1); ruedaEq(g, -0.4, 0.1, 0.22, 0.1);
  ruedaEq(g, 0.42, 0.09, 0, 0.09);
  caja(g, 0.5, 0.35, 0.4, MAT_AMARILLO_EQ, -0.55, 0.28, 0);
  const barra = caja(g, 0.06, 1.0, 0.06, MAT_NEGRO_EQ, -0.9, 0.6, 0);
  barra.rotation.x = -0.5;
  caja(g, 0.4, 0.06, 0.06, MAT_NEGRO_EQ, -1.15, 0.95, 0);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona · carga hasta 2.000 kg',
    dimensiones: '1.15 × 0.5 m',
    altura: 'Horquilla a 0.14 m del piso',
    material: 'Transpaleta manual (gato hidráulico) para mover tarimas sobre piso firme',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Montacargas manual creado desde "Equipos". Arrástralo, gíralo de a 45°, bloquéalo o elimínalo cuando ya no se necesite.'
  };
  return g;
}

/* ---- Carretilla de obra (bugui) ---- */
function construirCarretilla(def){
  const g = new THREE.Group();
  const tub = caja(g, 0.55, 0.35, 0.75, MAT_AZUL_EQ, 0, 0.45, -0.05);
  tub.rotation.x = -0.15;
  ruedaEq(g, 0, 0.16, -0.55, 0.16);
  [[-0.22, -0.35], [0.22, -0.35]].forEach(([x, z]) => {
    const pata = caja(g, 0.05, 0.5, 0.05, MAT_NEGRO_EQ, x, 0.22, z);
    pata.rotation.x = 0.4;
  });
  [-0.24, 0.24].forEach(x => {
    const asa = caja(g, 0.05, 0.9, 0.05, MAT_NEGRO_EQ, x, 0.4, 0.5);
    asa.rotation.x = 0.55;
  });
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona · carga hasta 90 kg',
    dimensiones: '0.75 × 0.55 m',
    altura: 'Tina a 0.45 m del piso',
    material: 'Carretilla de obra (bugui) para mezcla, escombro o material suelto',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Carretilla creada desde "Equipos". Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite.'
  };
  return g;
}

/* ---- Plataforma de transporte sobre ruedas giratorias ---- */
function construirPlataformaTransporte(def){
  const g = new THREE.Group();
  const w = def.w || 1.6, d = def.d || 1.0;
  caja(g, w, 0.15, d, MAT_GRIS_EQ, 0, 0.25, 0);
  [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]
    .forEach(([x, z]) => ruedaEq(g, x, 0.1, z, 0.1));
  [-w / 2, w / 2].forEach(x => caja(g, 0.05, 0.3, d, MAT_NEGRO_EQ, x, 0.47, 0, 0.7));
  g.userData.info = {
    nombre: def.nombre, w, d,
    aforo: 'Carga hasta ' + (def.capacidad || 500) + ' kg',
    dimensiones: w + ' × ' + d + ' m',
    altura: 'Plataforma a 0.25 m del piso',
    material: 'Plataforma de transporte sobre ruedas giratorias para mover material entre zonas',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Plataforma de transporte creada desde "Equipos". Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite.'
  };
  return g;
}

/* ---- Andamio colgante: se ancla a la fachada más cercana (como el malacate)
   y puede desplazarse (control "Nivel" en su ficha) entre el piso mínimo y
   máximo elegidos al crearlo. Los cables y la plataforma se dibujan a la
   altura absoluta correspondiente; el grupo permanece en y=0. ---- */
function construirAndamioColgante(def){
  const g = new THREE.Group();
  const ancho = def.ancho || 2.0;
  const pisoDesde = def.pisoDesde, pisoHasta = def.pisoHasta;
  const pisoActual = (def.pisoActual !== undefined) ? def.pisoActual : pisoDesde;
  const yPlataforma = pisoActual * CFG.hPiso + 1.0;
  const yViga = CFG.alto + 0.3;
  caja(g, 0.16, 0.16, 1.4, MAT_GRIS_EQ, 0, yViga, 0.7);
  const largoCable = Math.max(0.3, yViga - yPlataforma);
  [-ancho / 2 + 0.15, ancho / 2 - 0.15].forEach(x => {
    cilindro(g, 0.025, largoCable, MAT_NEGRO_EQ, x, yPlataforma + largoCable / 2, 1.2);
  });
  caja(g, ancho, 0.12, 0.6, MAT_AMARILLO_EQ, 0, yPlataforma, 0.5);
  [-ancho / 2 + 0.08, ancho / 2 - 0.08].forEach(x => caja(g, 0.05, 1.0, 0.05, MAT_NEGRO_EQ, x, yPlataforma + 0.5, 0.5));
  caja(g, ancho, 0.05, 0.05, MAT_NEGRO_EQ, 0, yPlataforma + 1.0, 0.78);
  caja(g, ancho, 0.05, 0.05, MAT_NEGRO_EQ, 0, yPlataforma + 1.0, 0.22);

  g.userData.esAndamio = true;
  g.userData.pisoDesde = pisoDesde;
  g.userData.pisoHasta = pisoHasta;
  g.userData.pisoActual = pisoActual;
  g.userData.etiquetaY = yPlataforma + 2.2;
  g.userData.info = {
    nombre: def.nombre,
    aforo: '2 operarios · carga 250 kg',
    altura: 'Recorrido: piso ' + (pisoDesde + 1) + ' a piso ' + (pisoHasta + 1),
    dimensiones: ancho + ' m de plataforma',
    material: 'Andamio colgante motorizado, suspendido de la cubierta con cables de acero',
    cerramiento: 'Plataforma con baranda; anclado a la fachada más cercana',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Andamio colgante creado desde "Equipos": se ancla a la fachada más cercana (no puede quedar suelto). ' +
      'Usa el control "Nivel" en su ficha para desplazarlo entre el piso ' + (pisoDesde + 1) + ' y el piso ' + (pisoHasta + 1) + '.'
  };
  return g;
}

/* ---- Pluma grúa: mástil de celosía + pluma giratoria (igual estructura que
   una torre grúa). "En el suelo" = mástil completo desde el piso, junto a la
   torre; "Encima de la torre" = mástil corto anclado sobre la cubierta. ---- */
function construirPlumaGrua(def){
  const g = new THREE.Group();
  const enTecho = def.ubicacion === 'techo';
  const H = enTecho ? 3.2 : (CFG.alto + 8);
  const L = def.brazo || 20;
  const R = def.radio || 25;
  // radio de barrido visible en el piso (o sobre la cubierta si va en techo):
  // ayuda a ubicar acopios dentro del alcance; validarObra() (analisis.js)
  // usa el mismo radioGrua para alertar cuando un acopio queda por fuera
  g.userData.radioGrua = R;
  const anillo = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.5, R - 0.35), R, 48),
    new THREE.MeshBasicMaterial({ color: 0xf0b429, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
  );
  anillo.rotation.x = -Math.PI / 2;
  anillo.position.y = 0.06;
  g.add(anillo);
  [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(([x, z]) => {
    caja(g, 0.16, H, 0.16, MAT_AMARILLO_EQ, x, H / 2, z);
  });
  for (let y = 1; y < H; y += 2.4){
    [[0, -0.9], [0, 0.9]].forEach(([x, z]) => caja(g, 1.8, 0.1, 0.1, MAT_AMARILLO_EQ, x, y, z));
    [[-0.9, 0], [0.9, 0]].forEach(([x, z]) => caja(g, 0.1, 0.1, 1.8, MAT_AMARILLO_EQ, x, y, z));
  }
  const giro = new THREE.Group();
  giro.position.y = H;
  caja(giro, 2.2, 0.5, 2.2, MAT_GRIS_EQ, 0, 0.25, 0);
  caja(giro, 1.0, 1.1, 1.2, MAT_AMARILLO_EQ, 0, 1.0, 1.0);
  const jib = new THREE.Group();
  caja(jib, L, 0.2, 0.5, MAT_AMARILLO_EQ, L / 2, 0.8, 0);
  caja(jib, L, 0.12, 0.4, MAT_AMARILLO_EQ, L / 2, 0.15, 0);
  const rr = Math.min(R, L);
  caja(jib, 0.5, 0.25, 0.6, MAT_GRIS_EQ, rr, 0.3, 0);
  cilindro(jib, 0.025, H * 0.4, MAT_NEGRO_EQ, rr, 0.3 - H * 0.2, 0);
  caja(jib, 0.24, 0.35, 0.24, MAT_NEGRO_EQ, rr, 0.3 - H * 0.4, 0);
  giro.add(jib);
  const cj = Math.max(3.5, L * 0.35);
  caja(giro, cj, 0.18, 0.4, MAT_AMARILLO_EQ, -cj / 2, 0.8, 0);
  caja(giro, 1.4, 1.2, 1.4, MAT_GRIS_EQ, -cj + 0.3, 0.85, 0);
  g.add(giro);

  const alcance = Math.round(rr * 10) / 10;
  g.userData.etiquetaY = H + 4;
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operador 1 persona en cabina · capacidad según radio de trabajo',
    altura: enTecho ? ('Mástil corto sobre la cubierta (+' + Math.round(CFG.alto) + ' m)') : ('Mástil ' + Math.round(H) + ' m desde el suelo'),
    dimensiones: 'Pluma ' + L + ' m · radio de giro ' + R + ' m · alcance ≈ ' + alcance + ' m',
    material: 'Pluma grúa (torre grúa) — el brazo gira sobre el mástil',
    cerramiento: enTecho ? 'Montada sobre la cubierta de la torre' : 'Base fija en el suelo, junto a la torre',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Pluma grúa creada desde "Equipos" (' + (enTecho ? 'sobre la cubierta' : 'en el suelo') + '). ' +
      'Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite.'
  };
  return g;
}

const FABRICAS_EQUIPO = {
  montacargasElectrico: construirMontacargasElectrico,
  montacargasManual: construirMontacargasManual,
  carretilla: construirCarretilla,
  plataformaTransporte: construirPlataformaTransporte,
  andamioColgante: construirAndamioColgante,
  plumaGrua: construirPlumaGrua
};

/* construye, etiqueta, posiciona y registra un equipo (scene + draggables +
   selector "Ir a elemento"), igual que construirEdificio en creador.js */
function construirEquipo(def){
  const fabrica = FABRICAS_EQUIPO[def.tipo];
  if (!fabrica) return null;
  const g = fabrica(def);
  g.userData.esProvisional = true;
  g.userData.esEquipo = true;
  g.userData.tipoEquipo = def.tipo;
  g.userData.idEstable = 'q:' + def.id;
  if (def.tipo === 'plumaGrua' && def.ubicacion === 'techo') g.userData.yFija = CFG.alto;
  const anchoEtq = def.tipo === 'andamioColgante' ? Math.max(9, Math.min(16, (def.ancho || 2) * 4))
    : def.tipo === 'plumaGrua' ? 16 : 10;
  const et = crearEtiqueta(def.nombre, anchoEtq, 'rgba(70,120,45,0.9)');
  et.position.y = (g.userData.etiquetaY !== undefined) ? g.userData.etiquetaY : 2.2;
  g.add(et);
  const y0 = (g.userData.yFija !== undefined) ? g.userData.yFija : 0;
  g.position.set(def.pos[0], y0, def.pos[1]);
  // color recoloreado a mano desde "Modificar" (aplicarColorATraves vive en
  // js/modificar.js, cargado después de este archivo)
  if (def.color && typeof aplicarColorATraves === 'function') aplicarColorATraves(g, def.color);
  scene.add(g);
  draggables.push(g);
  const opt = document.createElement('option');
  opt.value = draggables.length - 1;
  opt.textContent = def.nombre;
  selectorUI.appendChild(opt);
  return g;
}

/* nuevo equipo suelto: fila al norte del lote, separado de la franja de
   espacios/edificios (posicionLibre en creador.js) */
function posicionLibreEquipo(){
  const x = -60 + (equiposCreados.length % 6) * 18;
  const z = 20 + Math.floor(equiposCreados.length / 6) * 6;
  return [
    Math.min(CFG.limites.xMax - 4, Math.max(CFG.limites.xMin + 4, x)),
    Math.min(CFG.limites.zMax - 4, Math.max(CFG.limites.zMin + 4, z))
  ];
}
/* el andamio nace anclado a una fachada de la torre (como un malacate) */
function posicionInicialAndamio(){
  const s = ajustarMalacate(10, -(CFG.fondo / 2) - 2);
  return [s.x, s.z];
}

function eliminarEquipo(nombre){
  const i = draggables.findIndex(g => g.userData.esEquipo && g.userData.info.nombre === nombre);
  const j = equiposCreados.findIndex(e => e.nombre === nombre);
  if (i < 0 && j < 0) return;
  if (i >= 0){
    const g = draggables[i];
    if (seleccionado === g){
      seleccionado = null;
      mostrarPanelSinSeleccion();
    }
    quitarGrupoEscena(g);
    draggables.splice(i, 1);
  }
  if (j >= 0) equiposCreados.splice(j, 1);
  reconstruirSelector();
  guardarCompartido();
  if (document.getElementById('equipoOverlay').style.display === 'flex') renderEquipos();
  avisoGuardado('"' + nombre + '" eliminado de la obra');
}

/* control "Nivel" de la ficha del andamio: reconstruye el grupo a la altura
   del piso elegido, conservando posición, rotación y bloqueo */
function moverAndamio(valor){
  if (!seleccionado || !seleccionado.userData.esAndamio) return;
  const nombre = seleccionado.userData.info.nombre;
  const def = equiposCreados.find(e => e.nombre === nombre);
  if (!def) return;
  const piso = Math.round(numLim(valor, def.pisoActual, def.pisoDesde, def.pisoHasta));
  if (piso === def.pisoActual) return;
  def.pisoActual = piso;
  const pos = { x: seleccionado.position.x, z: seleccionado.position.z };
  const rot = seleccionado.rotation.y;
  const bloqueado = !!seleccionado.userData.bloqueado;
  quitarGrupoEscena(seleccionado);
  draggables.splice(draggables.indexOf(seleccionado), 1);
  const ng = construirEquipo(def);
  ng.position.set(pos.x, 0, pos.z);
  ng.rotation.y = rot;
  ng.userData.bloqueado = bloqueado;
  actualizarTinte(ng);
  reconstruirSelector();
  guardarCompartido();
  seleccionar(ng);
}

/* recrea los equipos al cargar estado (local, respaldo o Supabase) */
function normalizarDefEquipo(raw){
  const def = {
    tipo: raw.tipo,
    id: (raw.id && String(raw.id)) || nuevoId(),
    nombre: String(raw.nombre || (TIPOS_EQUIPO[raw.tipo] && TIPOS_EQUIPO[raw.tipo].nombre) || 'Equipo').slice(0, 40),
    descripcion: String(raw.descripcion || '').slice(0, 300),
    color: raw.color || null,
    pos: Array.isArray(raw.pos) ? [numLim(raw.pos[0], 0, CFG.limites.xMin, CFG.limites.xMax),
                                    numLim(raw.pos[1], 0, CFG.limites.zMin, CFG.limites.zMax)] : posicionLibreEquipo()
  };
  if (raw.tipo === 'plataformaTransporte'){
    def.w = numLim(raw.w, 1.6, 0.6, 4);
    def.d = numLim(raw.d, 1.0, 0.5, 3);
    def.capacidad = Math.round(numLim(raw.capacidad, 500, 50, 3000));
  } else if (raw.tipo === 'andamioColgante'){
    def.pisoDesde = Math.round(numLim(raw.pisoDesde, 0, 0, CFG.pisos - 1));
    def.pisoHasta = Math.round(numLim(raw.pisoHasta, CFG.pisos - 1, 0, CFG.pisos - 1));
    def.pisoActual = Math.round(numLim(raw.pisoActual, def.pisoDesde, def.pisoDesde, def.pisoHasta));
    def.ancho = numLim(raw.ancho, 2.0, 1, 4);
  } else if (raw.tipo === 'plumaGrua'){
    def.ubicacion = raw.ubicacion === 'techo' ? 'techo' : 'suelo';
    def.brazo = numLim(raw.brazo, 20, 8, 40);
    def.radio = numLim(raw.radio, 25, 10, 50);
  }
  return def;
}
function aplicarEquipos(lista){
  for (let i = draggables.length - 1; i >= 0; i--){
    if (draggables[i].userData.esEquipo){
      if (seleccionado === draggables[i]) seleccionado = null;
      quitarGrupoEscena(draggables[i]);
      draggables.splice(i, 1);
    }
  }
  equiposCreados = [];
  (Array.isArray(lista) ? lista : []).forEach(raw => {
    if (!raw || !FABRICAS_EQUIPO[raw.tipo]) return;
    const def = normalizarDefEquipo(raw);
    equiposCreados.push(def);
    const g = construirEquipo(def);
    ajustarEtiquetaNueva(g);
  });
  reconstruirSelector();
}

/* ---- ventana de creación ---- */
function opcionesPiso(sel){
  let out = '';
  for (let i = 0; i < CFG.pisos; i++) out += '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>Piso ' + (i + 1) + '</option>';
  return out;
}
function cambiarTipoEquipo(){
  const t = document.getElementById('equipoTipo').value;
  const cont = document.getElementById('equipoCamposEspecificos');
  if (t === 'plataformaTransporte'){
    cont.innerHTML =
      '<label>Ancho (m) <input type="number" id="eqAncho" value="1.6" min="0.6" max="4" step="0.1" style="width:64px"></label>' +
      '<label>Fondo (m) <input type="number" id="eqFondo" value="1.0" min="0.5" max="3" step="0.1" style="width:64px"></label>' +
      '<label>Capacidad (kg) <input type="number" id="eqCapacidad" value="500" min="50" max="3000" step="50" style="width:76px"></label>';
  } else if (t === 'andamioColgante'){
    cont.innerHTML =
      '<label>Piso desde <select id="eqPisoDesde">' + opcionesPiso(0) + '</select></label>' +
      '<label>Piso hasta <select id="eqPisoHasta">' + opcionesPiso(CFG.pisos - 1) + '</select></label>' +
      '<label>Ancho plataforma (m) <input type="number" id="eqAncho" value="2.0" min="1" max="4" step="0.1" style="width:64px"></label>';
  } else if (t === 'plumaGrua'){
    cont.innerHTML =
      '<label>Ubicación <select id="eqUbicacion"><option value="suelo">En el suelo</option><option value="techo">Encima de la torre</option></select></label>' +
      '<label>Brazo (m) <input type="number" id="eqBrazo" value="20" min="8" max="40" step="1" style="width:60px"></label>' +
      '<label>Radio de giro (m) <input type="number" id="eqRadio" value="25" min="10" max="50" step="1" style="width:64px"></label>';
  } else {
    cont.innerHTML = '';
  }
}
function renderEquipos(){
  const filas = equiposCreados.length
    ? equiposCreados.map((e, i) =>
        '<div class="planoFila"><span class="planoNom">' + icono('camion') +
          ' <b class="txtFuerte">' + esc(e.nombre) + '</b> <small>· ' + esc((TIPOS_EQUIPO[e.tipo] || {}).nombre || e.tipo) + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Llevar la cámara hasta este equipo" onclick="irAEquipoIdx(' + i + ')">' + icono('ojo') + '</button> ' +
            '<button class="planoBtn peligro" title="Eliminar de la obra" onclick="eliminarEquipoIdx(' + i + ')">' + icono('basura') + '</button>' +
          '</span></div>'
      ).join('')
    : '<div class="desc">Aún no has creado equipos.</div>';
  document.getElementById('equipoBody').innerHTML =
    '<div class="desc">Crea maquinaria y equipos móviles de obra: montacargas, carretillas, plataformas de ' +
      'transporte, andamios colgantes y plumas grúa. Arrástralos para ubicarlos, gíralos de a 45°, bloquéalos ' +
      'o elimínalos cuando ya no se necesiten.</div>' +
    '<b>Creados en la obra</b>' + filas +
    '<div style="margin-top:14px; display:flex; flex-direction:column; gap:8px">' +
      '<b>Crear nuevo</b>' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<select id="equipoTipo" onchange="cambiarTipoEquipo()">' + opcionesTipoEquipo() + '</select>' +
        '<input id="equipoNombre" maxlength="40" placeholder="Nombre (opcional)" style="flex:1; min-width:150px">' +
      '</div>' +
      '<textarea id="equipoDescripcion" maxlength="300" rows="2" placeholder="Descripción (opcional)" style="width:100%; resize:vertical; font-family:inherit"></textarea>' +
      '<div id="equipoCamposEspecificos" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center"></div>' +
      '<button class="orgAccion primario" style="margin:0; align-self:flex-start" onclick="agregarEquipo()">' +
        icono('mas') + 'Crear y ubicar en la obra</button>' +
    '</div>';
  cambiarTipoEquipo();
}
function agregarEquipo(){
  const tipo = document.getElementById('equipoTipo').value;
  const meta = TIPOS_EQUIPO[tipo];
  if (!meta) return;
  const nombreBase = (document.getElementById('equipoNombre').value || '').trim() || meta.nombre;
  const nombre = nombreDisponible(nombreBase);
  const descripcion = (document.getElementById('equipoDescripcion').value || '').trim().slice(0, 300);
  const def = { tipo, nombre, descripcion, id: nuevoId() };
  if (tipo === 'plataformaTransporte'){
    def.w = numLim(document.getElementById('eqAncho').value, 1.6, 0.6, 4);
    def.d = numLim(document.getElementById('eqFondo').value, 1.0, 0.5, 3);
    def.capacidad = Math.round(numLim(document.getElementById('eqCapacidad').value, 500, 50, 3000));
    def.pos = posicionLibreEquipo();
  } else if (tipo === 'andamioColgante'){
    def.pisoDesde = Math.round(numLim(document.getElementById('eqPisoDesde').value, 0, 0, CFG.pisos - 1));
    def.pisoHasta = Math.round(numLim(document.getElementById('eqPisoHasta').value, CFG.pisos - 1, 0, CFG.pisos - 1));
    if (def.pisoHasta < def.pisoDesde){ const t = def.pisoDesde; def.pisoDesde = def.pisoHasta; def.pisoHasta = t; }
    def.pisoActual = def.pisoDesde;
    def.ancho = numLim(document.getElementById('eqAncho').value, 2.0, 1, 4);
    def.pos = posicionInicialAndamio();
  } else if (tipo === 'plumaGrua'){
    def.ubicacion = document.getElementById('eqUbicacion').value === 'techo' ? 'techo' : 'suelo';
    def.brazo = numLim(document.getElementById('eqBrazo').value, 20, 8, 40);
    def.radio = numLim(document.getElementById('eqRadio').value, 25, 10, 50);
    def.pos = (def.ubicacion === 'techo') ? [0, 0] : posicionLibreEquipo();
  } else {
    def.pos = posicionLibreEquipo();
  }
  equiposCreados.push(def);
  const g = construirEquipo(def);
  ajustarEtiquetaNueva(g);
  guardarCompartido();
  document.getElementById('equipoOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, (g.position.y || 0) + 3, g.position.z, 45, camCtrl.theta, 1.05);
  avisoGuardado('"' + nombre + '" creado — arrástralo para ubicarlo');
}
function irAEquipoIdx(i){
  const e = equiposCreados[i];
  if (!e) return;
  const g = draggables.find(g2 => g2.userData.esEquipo && g2.userData.info.nombre === e.nombre);
  if (!g) return;
  document.getElementById('equipoOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, (g.position.y || 0) + 3, g.position.z, 45, camCtrl.theta, 1.05);
}
function eliminarEquipoIdx(i){
  const e = equiposCreados[i];
  if (e) eliminarEquipo(e.nombre);
}
function abrirEquipos(){
  renderEquipos();
  document.getElementById('equipoOverlay').style.display = 'flex';
}
document.getElementById('btnEquipos').onclick = abrirEquipos;
document.getElementById('equipoCerrar').onclick = () => {
  document.getElementById('equipoOverlay').style.display = 'none';
};
document.getElementById('equipoOverlay').addEventListener('click', e => {
  if (e.target.id === 'equipoOverlay') e.target.style.display = 'none';
});

/* ============ 16. VER ZONAS: área y aforo de todo lo creado en la obra ============
   Lista TODO lo que hay en draggables (provisionales de fábrica, espacios y
   edificios personalizados, y equipos/maquinaria): nombre, m² (si aplica) y
   aforo máximo. Los equipos sin área definida (montacargas, carretilla…)
   muestran "—" en vez de quedar fuera de la lista. */
function renderZonas(){
  const filas = draggables.map(g => {
    const inf = g.userData.info;
    const tieneArea = typeof inf.w === 'number' && typeof inf.d === 'number';
    return {
      nombre: inf.nombre,
      area: tieneArea ? Math.round(inf.w * inf.d * 10) / 10 : null,
      aforo: inf.aforo || '—',
      esEquipo: !!g.userData.esEquipo
    };
  });
  const totalArea = Math.round(filas.reduce((s, f) => s + (f.area || 0), 0) * 10) / 10;
  const filasHtml = filas.length
    ? filas.map(f =>
        '<div class="planoFila"><span class="planoNom"><b class="txtFuerte">' + esc(f.nombre) + '</b>' +
        (f.esEquipo ? ' <small>· equipo</small>' : '') + '</span>' +
        '<small style="white-space:nowrap">' + (f.area !== null ? f.area + ' m² · ' : '') + esc(f.aforo) + '</small></div>'
      ).join('')
    : '<div class="desc">Aún no hay zonas ni equipos creados.</div>';
  document.getElementById('zonasBody').innerHTML =
    '<div class="desc">Todo lo creado en la obra: provisionales, espacios, edificios y equipos, con su área (cuando aplica) y aforo máximo.</div>' +
    filasHtml +
    (filas.length ? '<div class="desc" style="margin-top:10px"><b class="txtFuerte">' + filas.length + ' elementos · ' + totalArea + ' m² en total</b></div>' : '') +
    // validaciones de implantación + calculadora de dotación (analisis.js)
    ((typeof seccionesZonasExtra === 'function') ? seccionesZonasExtra() : '');
  if (typeof calcularDotacion === 'function') calcularDotacion();
}
function abrirZonas(){
  renderZonas();
  document.getElementById('zonasOverlay').style.display = 'flex';
}
document.getElementById('btnZonas').onclick = abrirZonas;
document.getElementById('zonasCerrar').onclick = () => {
  document.getElementById('zonasOverlay').style.display = 'none';
};
document.getElementById('zonasOverlay').addEventListener('click', e => {
  if (e.target.id === 'zonasOverlay') e.target.style.display = 'none';
});
