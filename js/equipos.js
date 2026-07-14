/* Equipos y maquinaria móvil de obra (montacargas, carretilla, plataforma de
   transporte, andamio colgante y torre grúa) + panel "Zonas y aforo".
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
  plumaGrua:            { nombre: 'Torre grúa' },
  pilaArena:            { nombre: 'Pila de arena' },
  bultosCemento:        { nombre: 'Bultos de cemento (estiba)' },
  pilaAgregado:         { nombre: 'Pila de agregado (grava/triturado)' },
  plantaConcreto:       { nombre: 'Planta de concreto' },
  tanqueAgua:           { nombre: 'Tanque de agua elevado' }
};
/* subgrupos del selector "Equipos": vertical = sube/baja material entre
   niveles; horizontal = lo mueve por el mismo piso; acopio = materiales
   sueltos junto a la vía; instalaciones = plantas fijas */
const GRUPOS_EQUIPO = [
  { nombre: 'Transporte vertical', tipos: ['montacargasElectrico', 'montacargasManual', 'andamioColgante', 'plumaGrua'] },
  { nombre: 'Transporte horizontal', tipos: ['carretilla', 'plataformaTransporte'] },
  { nombre: 'Materiales de acopio', tipos: ['pilaArena', 'bultosCemento', 'pilaAgregado'] },
  { nombre: 'Planta e instalaciones', tipos: ['plantaConcreto', 'tanqueAgua'] }
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
const MAT_ROJO_EQ = 0xc0392b;
const MAT_NARANJA_EQ = 0xd9822b;

function ruedaEq(g, x, y, z, r){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.16, r || 0.16, 0.1, 14), new THREE.MeshLambertMaterial({ color: MAT_NEGRO_EQ }));
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  g.add(m);
  return m;
}

/* ---- Montacargas eléctrico: chasis + contrapeso trasero + techo de
   protección tipo jaula (parales finos, NO cabina cerrada) + mástil de dos
   rieles con horquillas al frente — silueta de montacargas reconocible,
   bien distinta de la transpaleta manual (baja y sin techo/mástil). ---- */
function construirMontacargasElectrico(def){
  const g = new THREE.Group();
  // contrapeso trasero: bloque macizo, opuesto a las horquillas
  caja(g, 0.5, 0.5, 0.7, MAT_NEGRO_EQ, 0.55, 0.32, 0.15);
  // chasis
  caja(g, 1.15, 0.42, 0.75, MAT_AMARILLO_EQ, 0.05, 0.28, 0.15);
  // asiento del operario + respaldo
  caja(g, 0.32, 0.28, 0.3, MAT_NEGRO_EQ, 0.2, 0.63, 0.15);
  caja(g, 0.3, 0.34, 0.06, MAT_NEGRO_EQ, 0.2, 0.87, 0.0);
  // techo de protección: 4 parales finos + techo plano (jaula, no cabina cerrada)
  [[-0.15, -0.1], [0.45, -0.1], [-0.15, 0.4], [0.45, 0.4]].forEach(([x, z]) => {
    caja(g, 0.045, 1.2, 0.045, MAT_GRIS_EQ, x, 0.82, z);
  });
  caja(g, 0.75, 0.05, 0.65, MAT_GRIS_EQ, 0.15, 1.44, 0.15);
  // ruedas: motrices grandes junto al mástil, dirección pequeñas atrás
  ruedaEq(g, -0.4, 0.24, -0.15, 0.24); ruedaEq(g, -0.4, 0.24, 0.45, 0.24);
  ruedaEq(g, 0.5, 0.15, -0.05, 0.15); ruedaEq(g, 0.5, 0.15, 0.35, 0.15);
  // mástil: 2 rieles verticales + travesaños — se lee como mástil, no bloque ciego
  [-0.13, 0.43].forEach(z => caja(g, 0.09, 2.0, 0.09, MAT_GRIS_EQ, -0.62, 1.05, z));
  for (let y = 0.2; y < 1.95; y += 0.55) caja(g, 0.09, 0.06, 0.68, MAT_GRIS_EQ, -0.62, y, 0.15);
  // porta-horquillas + horquillas (2 dientes a ras de piso, sobresaliendo al frente)
  caja(g, 0.5, 0.32, 0.68, MAT_GRIS_EQ, -0.85, 0.17, 0.15);
  [-0.15, 0.42].forEach(z => caja(g, 0.85, 0.06, 0.1, MAT_NEGRO_EQ, -1.3, 0.06, z));
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona · carga hasta 1.000 kg',
    dimensiones: '≈2.5 × 1.0 m (con horquillas)',
    altura: 'Mástil 2.0 m · techo de protección 1.5 m',
    material: 'Montacargas eléctrico a batería — contrapeso trasero, techo de protección tipo jaula y mástil de dos rieles con horquillas',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Montacargas eléctrico creado desde "Equipos". Arrástralo, gíralo de a 45°, bloquéalo o elimínalo cuando ya no se necesite.'
  };
  return g;
}

/* ---- Montacargas manual: transpaleta de gato hidráulico. Silueta a
   propósito muy baja y plana (horquillas casi a ras de piso, sin techo ni
   mástil) para no confundirse con el montacargas eléctrico; cilindro
   hidráulico visible + timón alto en T como rasgos distintivos. ---- */
function construirMontacargasManual(def){
  const g = new THREE.Group();
  // horquillas: 2 tablas largas y muy bajas
  [-0.22, 0.22].forEach(z => caja(g, 1.05, 0.05, 0.13, MAT_ROJO_EQ, 0.15, 0.08, z));
  [-0.22, 0.22].forEach(z => ruedaEq(g, 0.65, 0.05, z, 0.05));
  // unidad hidráulica: cilindro del gato + cuerpo
  cilindro(g, 0.1, 0.3, MAT_NEGRO_EQ, -0.4, 0.2, 0);
  caja(g, 0.4, 0.34, 0.34, MAT_ROJO_EQ, -0.48, 0.24, 0);
  // eje trasero con ruedas de dirección, más grandes que las guía del frente
  ruedaEq(g, -0.48, 0.13, -0.22, 0.13); ruedaEq(g, -0.48, 0.13, 0.22, 0.13);
  // timón: barra inclinada alta + empuñadura en T (rasgo clave, bien visible)
  const barra = caja(g, 0.055, 1.1, 0.055, MAT_NEGRO_EQ, -0.85, 0.66, 0);
  barra.rotation.z = -0.6;
  caja(g, 0.06, 0.4, 0.06, MAT_NEGRO_EQ, -1.25, 1.05, 0);
  caja(g, 0.06, 0.06, 0.42, MAT_NEGRO_EQ, -1.25, 1.2, 0);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona · carga hasta 2.000 kg',
    dimensiones: '≈1.5 × 0.5 m (con timón)',
    altura: 'Horquilla a 0.08 m del piso · timón hasta 1.2 m',
    material: 'Transpaleta manual (gato hidráulico) — horquillas bajas y timón en T; para mover tarimas sobre piso firme',
    cerramiento: 'Equipo móvil sin cerramiento',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Montacargas manual creado desde "Equipos". Arrástralo, gíralo de a 45°, bloquéalo o elimínalo cuando ya no se necesite.'
  };
  return g;
}

/* ---- Carretilla de obra (bugui): rueda delantera grande y prominente (el
   rasgo más reconocible de una carretilla) + tina con borde + horquilla
   que conecta la rueda a la tina, para que se lea como un solo objeto. ---- */
function construirCarretilla(def){
  const g = new THREE.Group();
  const tub = caja(g, 0.6, 0.3, 0.7, MAT_AZUL_EQ, 0, 0.42, -0.05);
  tub.rotation.x = -0.2;
  caja(g, 0.66, 0.04, 0.76, MAT_AZUL_EQ, 0, 0.58, -0.12);   // borde/labio superior de la tina
  ruedaEq(g, 0, 0.22, -0.62, 0.22);
  caja(g, 0.04, 0.5, 0.04, MAT_NEGRO_EQ, 0, 0.22, -0.5);    // horquilla de la rueda
  [[-0.22, -0.35], [0.22, -0.35]].forEach(([x, z]) => {
    const pata = caja(g, 0.05, 0.5, 0.05, MAT_NEGRO_EQ, x, 0.22, z);
    pata.rotation.x = 0.4;
  });
  [-0.26, 0.26].forEach(x => {
    const asa = caja(g, 0.05, 0.95, 0.05, MAT_NEGRO_EQ, x, 0.42, 0.52);
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

/* ---- Plataforma de transporte sobre ruedas giratorias, con manija de
   empuje en un extremo — sin la manija se leía como una mesa fija, no
   como un carro que se empuja de un lado a otro. ---- */
function construirPlataformaTransporte(def){
  const g = new THREE.Group();
  const w = def.w || 1.6, d = def.d || 1.0;
  caja(g, w, 0.12, d, MAT_NARANJA_EQ, 0, 0.22, 0);
  [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]
    .forEach(([x, z]) => ruedaEq(g, x, 0.1, z, 0.1));
  [-w / 2, w / 2].forEach(x => caja(g, 0.05, 0.28, d, MAT_NEGRO_EQ, x, 0.42, 0, 0.7));
  // manija de empuje en un extremo (característica clave: es un carro que se empuja)
  const postX = w / 2 - 0.06;
  [-d / 2 + 0.1, d / 2 - 0.1].forEach(z => caja(g, 0.05, 0.75, 0.05, MAT_NEGRO_EQ, postX, 0.6, z));
  caja(g, 0.06, 0.06, d - 0.1, MAT_NEGRO_EQ, postX, 0.95, 0);
  g.userData.info = {
    nombre: def.nombre, w, d,
    aforo: 'Carga hasta ' + (def.capacidad || 500) + ' kg',
    dimensiones: w + ' × ' + d + ' m',
    altura: 'Plataforma a 0.22 m del piso · manija a 0.95 m',
    material: 'Plataforma de transporte sobre ruedas giratorias, con manija de empuje, para mover material entre zonas',
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
    // malacate (cajita al tope de cada cable): de aquí "cuelga" el andamio
    caja(g, 0.22, 0.16, 0.22, MAT_NARANJA_EQ, x, yPlataforma + largoCable, 1.2);
  });
  caja(g, ancho, 0.12, 0.6, MAT_AMARILLO_EQ, 0, yPlataforma, 0.5);
  // barandas: parales en las 4 esquinas + travesaños en los 4 lados (jaula
  // completa — antes solo tenía frente/atrás y se leía como una tabla suelta)
  [[-ancho / 2 + 0.08, 0.22], [-ancho / 2 + 0.08, 0.78], [ancho / 2 - 0.08, 0.22], [ancho / 2 - 0.08, 0.78]]
    .forEach(([x, z]) => caja(g, 0.05, 1.0, 0.05, MAT_NEGRO_EQ, x, yPlataforma + 0.5, z));
  caja(g, ancho, 0.05, 0.05, MAT_NEGRO_EQ, 0, yPlataforma + 1.0, 0.78);
  caja(g, ancho, 0.05, 0.05, MAT_NEGRO_EQ, 0, yPlataforma + 1.0, 0.22);
  [-ancho / 2 + 0.08, ancho / 2 - 0.08].forEach(x => caja(g, 0.05, 0.05, 0.56, MAT_NEGRO_EQ, x, yPlataforma + 1.0, 0.5));

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

/* ---- Torre grúa (pluma grúa): mástil de celosía + pluma giratoria.
   "En el suelo" = mástil completo desde el piso, junto a la torre;
   "Encima de la torre" = mástil corto anclado sobre la cubierta. ---- */
function diagonalEq(g, x1, y1, z1, x2, y2, z2, color){
  const dir = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1);
  const len = dir.length();
  dir.normalize();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, len, 0.08), new THREE.MeshLambertMaterial({ color }));
  m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  m.castShadow = true;
  g.add(m);
  return m;
}
function construirPlumaGrua(def){
  const g = new THREE.Group();
  const enTecho = def.ubicacion === 'techo';
  const H = enTecho ? 3.2 : (CFG.alto + 8);
  const L = def.brazo || 20;
  const R = def.radio || 25;
  // radio de barrido visible en el piso (o sobre la cubierta si va en techo):
  // ayuda a ubicar acopios dentro del alcance; validarObra() (analisis.js)
  // usa el mismo radioGrua para alertar cuando un acopio queda por fuera.
  // brazo/radio quedan en userData para poder editarlos luego desde "Modificar"
  g.userData.radioGrua = R;
  g.userData.brazo = L;
  const anillo = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.5, R - 0.35), R, 48),
    new THREE.MeshBasicMaterial({ color: 0xc9302e, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
  );
  anillo.rotation.x = -Math.PI / 2;
  anillo.position.y = 0.06;
  g.add(anillo);
  // medida del radio de giro, siempre visible sobre el anillo (se apaga y
  // enciende junto con el botón "Etiquetas", igual que el nombre)
  const etR = crearEtiqueta('Radio ' + R + ' m', 9, 'rgba(150,25,25,0.88)', 'equipo');
  etR.position.set(R * 0.7, 0.75, R * 0.7);
  g.add(etR);
  [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(([x, z]) => {
    caja(g, 0.16, H, 0.16, MAT_AMARILLO_EQ, x, H / 2, z);
  });
  let zigzag = false;
  for (let y = 1; y < H; y += 2.4){
    const y2 = Math.min(H, y + 2.4);
    [[0, -0.9], [0, 0.9]].forEach(([x, z]) => caja(g, 1.8, 0.1, 0.1, MAT_AMARILLO_EQ, x, y, z));
    [[-0.9, 0], [0.9, 0]].forEach(([x, z]) => caja(g, 0.1, 0.1, 1.8, MAT_AMARILLO_EQ, x, y, z));
    // diagonales en cruz (celosía real de torre grúa, no una simple escalera)
    const xa = zigzag ? -0.9 : 0.9, xb = zigzag ? 0.9 : -0.9;
    diagonalEq(g, xa, y, -0.9, xb, y2, -0.9, MAT_AMARILLO_EQ);
    diagonalEq(g, xa, y, 0.9, xb, y2, 0.9, MAT_AMARILLO_EQ);
    zigzag = !zigzag;
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
    material: 'Torre grúa — el brazo gira sobre el mástil de celosía',
    cerramiento: enTecho ? 'Montada sobre la cubierta de la torre' : 'Base fija en el suelo, junto a la torre',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Torre grúa creada desde "Equipos" (' + (enTecho ? 'sobre la cubierta' : 'en el suelo') + '). ' +
      'Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite. El brazo y el radio de giro se pueden ajustar después desde "Modificar".'
  };
  return g;
}

/* ---- Materiales de acopio: pilas junto a la vía o la zona de mezcla.
   Geometría simple (conos/cajas), sin animación ni campos propios. ---- */
function construirPilaArena(def){
  const g = new THREE.Group();
  const c = 0xd9c08a;
  cono(g, 1.7, 1.6, c, 0, 0);
  cono(g, 0.9, 0.9, c, 0.5, 0.3);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'No aplica',
    dimensiones: '≈3.4 × 3.4 m',
    altura: '1.6 m',
    material: 'Acopio de arena a granel, junto a la vía o la zona de mezcla de concreto/mortero',
    cerramiento: 'A cielo abierto',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Pila de arena creada desde "Equipos". Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite.'
  };
  return g;
}
function construirPilaAgregado(def){
  const g = new THREE.Group();
  const c = 0x9a9a94;
  cono(g, 1.7, 1.6, c, 0, 0);
  cono(g, 0.9, 0.9, c, -0.5, -0.3);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'No aplica',
    dimensiones: '≈3.4 × 3.4 m',
    altura: '1.6 m',
    material: 'Acopio de agregado grueso (grava o triturado), junto a la vía',
    cerramiento: 'A cielo abierto',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Pila de agregado creada desde "Equipos". Arrástrala, gírala de a 45°, bloquéala o elimínala cuando ya no se necesite.'
  };
  return g;
}
function construirBultosCemento(def){
  const g = new THREE.Group();
  const c = 0xc9c3b5;
  caja(g, 1.3, 0.12, 1.1, 0x8a6642, 0, 0.06, 0);
  caja(g, 1.15, 0.22, 0.95, c, 0, 0.24, 0);
  caja(g, 1.0, 0.22, 0.82, c, 0, 0.48, 0);
  caja(g, 0.85, 0.22, 0.68, c, 0, 0.72, 0);
  caja(g, 0.62, 0.22, 0.5, c, 0, 0.95, 0);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'No aplica',
    dimensiones: '≈1.3 × 1.1 m',
    altura: '1.1 m',
    material: 'Estiba de bultos de cemento sobre estibador de madera, lista para mezcla en obra',
    cerramiento: 'A cielo abierto',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Bultos de cemento creados desde "Equipos". Arrástralos, gíralos de a 45°, bloquéalos o elimínalos cuando ya no se necesiten.'
  };
  return g;
}

/* ---- Planta de concreto: dosificadora con mezclador y silos de agregado.
   Escribe la meta de m³ en su ficha ("Modificar") para ver cuántos días de
   producción necesita, a razón de TASA_CONCRETO_DIA m³/día. ---- */
const TASA_CONCRETO_DIA = 240;   // 30 m³/h × 8 h/día
function conoTruncadoEq(g, r1, r2, h, color, x, y, z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, h, 16), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
}
function construirPlantaConcreto(def){
  const g = new THREE.Group();
  const c = 0xd9a521;
  [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([x, z]) => caja(g, 0.25, 4.6, 0.25, MAT_GRIS_EQ, x, 2.3, z));
  caja(g, 4.0, 0.25, 4.0, MAT_GRIS_EQ, 0, 4.7, 0);
  cilindro(g, 1.35, 1.8, c, 0, 5.8, 0);
  caja(g, 1.0, 0.7, 1.0, MAT_GRIS_EQ, 1.6, 5.4, 1.3);
  conoTruncadoEq(g, 0.5, 0.18, 1.2, MAT_GRIS_EQ, 0, 4.0, 0);
  const banda = caja(g, 1.2, 0.18, 9.0, MAT_NEGRO_EQ, -0.2, 3.4, -4.6); banda.rotation.x = 0.42;
  [-2.6, 0, 2.6].forEach(x => {
    conoTruncadoEq(g, 0.35, 1.5, 1.8, MAT_GRIS_EQ, x, 2.6, -6.0);
    caja(g, 2.9, 0.9, 2.9, 0x9aa0a5, x, 3.9, -6.0);
    [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(([px, pz]) => caja(g, 0.14, 3.4, 0.14, MAT_GRIS_EQ, x + px, 1.7, -6.0 + pz));
  });
  caja(g, 2.2, 2.2, 1.8, 0xe6e2d8, 3.4, 1.2, 2.6);
  caja(g, 2.0, 0.7, 0.05, MAT_NEGRO_EQ, 3.4, 1.6, 3.52);
  g.userData.metaM3 = def.metaM3 || 0;
  const dias = g.userData.metaM3 ? Math.ceil(g.userData.metaM3 / TASA_CONCRETO_DIA) : 0;
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'Operario 1 persona en caseta de control',
    dimensiones: '≈9 × 13 m',
    altura: '7 m (silos)',
    material: 'Planta dosificadora de concreto 30 m³/h con mezclador — instálala junto al silo de cemento o la pila de agregado',
    cerramiento: 'Instalación fija, sin cerramiento propio',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Planta de concreto creada desde "Equipos". Escribe la meta de m³ en su ficha ("Modificar") para ver cuántos días de producción necesita' +
      (g.userData.metaM3 ? (' — a ' + TASA_CONCRETO_DIA + ' m³/día, ' + g.userData.metaM3 + ' m³ tardan ' + dias + ' día' + (dias === 1 ? '' : 's') + '.') : ('.'))
  };
  return g;
}

/* ---- Tanque de agua elevado: sobre torre metálica con arriostramiento en
   cruz — abastece baños, comedor y control de incendios. ---- */
function construirTanqueAgua(def){
  const g = new THREE.Group();
  const c = 0x4a9ec9;
  const patas = [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]];
  patas.forEach(([x, z]) => caja(g, 0.16, 4.2, 0.16, MAT_GRIS_EQ, x, 2.1, z));
  for (let y = 0.9; y < 4.2; y += 1.4){
    patas.forEach(([x1, z1], i) => {
      const [x2, z2] = patas[(i + 1) % 4];
      const largo = Math.hypot(x2 - x1, z2 - z1);
      const barra = caja(g, largo, 0.08, 0.08, MAT_GRIS_EQ, (x1 + x2) / 2, y, (z1 + z2) / 2);
      barra.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    });
  }
  caja(g, 3.0, 0.18, 3.0, 0x565b62, 0, 4.3, 0);
  cilindro(g, 1.45, 2.0, c, 0, 5.4, 0);
  conoTruncadoEq(g, 1.45, 0.15, 0.7, c, 0, 6.55, 0);
  g.userData.info = {
    nombre: def.nombre,
    aforo: 'No aplica',
    dimensiones: '≈3.2 × 3.2 m',
    altura: '6.5 m',
    material: 'Tanque elevado de almacenamiento de agua sobre torre metálica: abastece baños, comedor y control de incendios',
    cerramiento: 'Instalación fija, sin cerramiento propio',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Tanque de agua creado desde "Equipos". Arrástralo, gíralo de a 45°, bloquéalo o elimínalo cuando ya no se necesite.'
  };
  return g;
}

const FABRICAS_EQUIPO = {
  montacargasElectrico: construirMontacargasElectrico,
  montacargasManual: construirMontacargasManual,
  carretilla: construirCarretilla,
  plataformaTransporte: construirPlataformaTransporte,
  andamioColgante: construirAndamioColgante,
  plumaGrua: construirPlumaGrua,
  pilaArena: construirPilaArena,
  bultosCemento: construirBultosCemento,
  pilaAgregado: construirPilaAgregado,
  plantaConcreto: construirPlantaConcreto,
  tanqueAgua: construirTanqueAgua
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
  const et = crearEtiqueta(def.nombre, anchoEtq, 'rgba(70,120,45,0.9)', 'equipo');
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

/* control "Brazo y radio de giro" de la ficha de la torre grúa: reconstruye
   el grupo con las medidas nuevas, conservando posición, rotación y bloqueo
   (mismo patrón que moverAndamio) */
function modificarGrua(){
  if (!seleccionado || seleccionado.userData.tipoEquipo !== 'plumaGrua') return;
  const nombre = seleccionado.userData.info.nombre;
  const def = equiposCreados.find(e => e.nombre === nombre);
  if (!def) return;
  def.brazo = numLim(document.getElementById('modBrazo').value, def.brazo, 8, 40);
  def.radio = numLim(document.getElementById('modRadio').value, def.radio, 10, 50);
  def.pos = [seleccionado.position.x, seleccionado.position.z];
  const rot = seleccionado.rotation.y;
  const bloqueado = !!seleccionado.userData.bloqueado;
  quitarGrupoEscena(seleccionado);
  draggables.splice(draggables.indexOf(seleccionado), 1);
  const ng = construirEquipo(def);
  ng.rotation.y = rot;
  ng.userData.bloqueado = bloqueado;
  actualizarTinte(ng);
  reconstruirSelector();
  guardarCompartido();
  seleccionar(ng);
  avisoGuardado('Torre grúa actualizada: brazo ' + def.brazo + ' m · radio ' + def.radio + ' m');
}

/* control "Meta de producción" de la ficha de la planta de concreto: no
   cambia la geometría, solo el dato y el cálculo de días — no hace falta
   reconstruir el grupo, basta actualizar el def y refrescar el panel */
function modificarPlantaConcreto(){
  if (!seleccionado || seleccionado.userData.tipoEquipo !== 'plantaConcreto') return;
  const nombre = seleccionado.userData.info.nombre;
  const def = equiposCreados.find(e => e.nombre === nombre);
  if (!def) return;
  def.metaM3 = Math.round(numLim(document.getElementById('modMetaM3').value, def.metaM3 || 0, 0, 100000));
  seleccionado.userData.metaM3 = def.metaM3;
  guardarCompartido();
  seleccionar(seleccionado);
  const dias = def.metaM3 ? Math.ceil(def.metaM3 / TASA_CONCRETO_DIA) : 0;
  avisoGuardado('Meta de concreto: ' + def.metaM3 + ' m³' + (def.metaM3 ? (' · ' + dias + ' día' + (dias === 1 ? '' : 's') + ' de producción') : ''));
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
  } else if (raw.tipo === 'plantaConcreto'){
    def.metaM3 = numLim(raw.metaM3, 0, 0, 100000);
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
