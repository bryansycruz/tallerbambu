/* Provisionales de obra, personas y flujo de materiales */

/* ============ 8. PROVISIONALES (dimensiones reales del informe) ============ */
const draggables = [];
const selectorUI = document.getElementById('selElem');

function crearProvisional(def){
  const g = new THREE.Group();
  g.position.set(def.pos[0], alturaTerreno(def.pos[0], def.pos[1]), def.pos[1]);
  g.userData.esProvisional = true;
  g.userData.info = def;
  caja(g, def.w, 0.12, def.d, 0xb5b8bc, 0, 0.06, 0);
  if (def.muros){
    const t = 0.12, h = def.h, cm = def.color;
    caja(g, def.w, h, t, cm, 0, h/2, -def.d/2 + t/2, 0.92);
    caja(g, t, h, def.d, cm, -def.w/2 + t/2, h/2, 0, 0.92);
    caja(g, t, h, def.d, cm,  def.w/2 - t/2, h/2, 0, 0.92);
    const puerta = 1.0, segw = (def.w - puerta) / 2;
    caja(g, segw, h, t, cm, -(puerta + segw)/2, h/2, def.d/2 - t/2, 0.92);
    caja(g, segw, h, t, cm,  (puerta + segw)/2, h/2, def.d/2 - t/2, 0.92);
  }
  if (def.techo){
    caja(g, def.w + 0.6, 0.1, def.d + 0.6, 0x8a8f96, 0, def.h + 0.12, 0, 0.35);
  }
  if (def.detalle) def.detalle(g, def);
  const et = crearEtiqueta(def.nombre, Math.max(9, def.w * 1.05));
  et.position.y = def.h + 1.8;
  g.add(et);
  scene.add(g);
  draggables.push(g);
  const opt = document.createElement('option');
  opt.value = draggables.length - 1;
  opt.textContent = def.nombre;
  selectorUI.appendChild(opt);
  return g;
}

/* ---- Campamento de oficinas 20×18 (Lupa 1: programa completo) ---- */
function detalleCampamento(g, def){
  const cm = def.color, h = 2.3;
  // perímetro con puerta en Circulación/Acceso (frente +z)
  caja(g, 20, h, 0.12, cm, 0, h/2, -9, 0.92);
  caja(g, 0.12, h, 18, cm, -10, h/2, 0, 0.92);
  caja(g, 0.12, h, 18, cm, 10, h/2, 0, 0.92);
  caja(g, 17.4, h, 0.12, cm, -1.3, h/2, 9, 0.92);
  caja(g, 1.4, h, 0.12, cm, 9.3, h/2, 9, 0.92);
  // divisiones interiores (según Lupa 1)
  caja(g, 20, 2.2, 0.1, cm, 0, 1.1, -3, 0.95);
  caja(g, 20, 2.2, 0.1, cm, 0, 1.1, 4, 0.95);
  caja(g, 0.1, 2.2, 6, cm, -5, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 6, cm, 0, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 6, cm, 6, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 7, cm, 4, 1.1, 0.5, 0.95);
  caja(g, 0.1, 2.2, 7, cm, 7, 1.1, 0.5, 0.95);
  caja(g, 0.1, 2.2, 5, cm, 0, 1.1, 6.5, 0.95);
  caja(g, 0.1, 2.2, 5, cm, 6, 1.1, 6.5, 0.95);
  // nombres pintados en piso
  textoLocal(g, 'DIRECCIÓN 5×6', 4.4, -7.5, -6);
  textoLocal(g, 'COORDINACIÓN 5×6', 4.6, -2.5, -6);
  textoLocal(g, 'INTERVENTORÍA 6×6', 5, 3, -6);
  textoLocal(g, 'COCINETA 4×6', 3.6, 8, -6);
  textoLocal(g, 'OFICINA TÉCNICA 14×7 · 10 puestos', 8.5, -3, 0.5);
  textoLocal(g, 'BAÑO H 3×7', 2.6, 5.5, 0.5);
  textoLocal(g, 'WC M 3×7', 2.6, 8.5, 0.5);
  textoLocal(g, 'SALA REUNIONES 10×5', 6, -5, 6.5);
  textoLocal(g, 'ARCHIVO 6×5', 3.6, 3, 6.5);
  textoLocal(g, 'ACCESO 4×5', 3, 8, 6.5);
  // dotación
  mesaFig(g, -7.5, -7, 1.6, 0.8); sillaFig(g, -7.5, -6.2);
  mesaFig(g, -2.5, -7, 1.6, 0.8); sillaFig(g, -2.5, -6.2);
  mesaFig(g, 3, -7, 2, 0.8); sillaFig(g, 2.4, -6.2); sillaFig(g, 3.6, -6.2);
  caja(g, 2.4, 0.9, 0.6, 0x9aa0a6, 8, 0.45, -8.5);                       // mesón cocineta
  caja(g, 0.6, 1.6, 0.6, 0xe8eaec, 9.4, 0.8, -8.4);                      // nevera
  for (let i=0; i<5; i++){
    mesaFig(g, -8.5 + i*2.3, -1.2, 1.5, 0.7); sillaFig(g, -8.5 + i*2.3, -0.4);
    mesaFig(g, -8.5 + i*2.3, 2.4, 1.5, 0.7);  sillaFig(g, -8.5 + i*2.3, 1.6);
  }
  sanitarioFig(g, 5, -2.2, Math.PI); lavamanosFig(g, 6.2, 3);
  sanitarioFig(g, 8, -2.2, Math.PI); lavamanosFig(g, 9.2, 3);
  caja(g, 4, 0.08, 1.4, 0xc9a36a, -5, 0.76, 6.5);                        // mesa reuniones
  [-6.6,-5.4,-4.2,-3.4].forEach(x => { sillaFig(g, x, 5.6); sillaFig(g, x, 7.4); });
  estanteriaFig(g, 2, 8.2, 3, 0);
  estanteriaFig(g, 4.5, 5.2, 3, Math.PI/2);
}
/* ---- Almacén central de acabados 38×14 ---- */
function detalleAlmacen(g, def){
  estanteriaFig(g, -12, -def.d/2 + 0.5, 8, 0);
  estanteriaFig(g, 0,   -def.d/2 + 0.5, 8, 0);
  estanteriaFig(g, 12,  -def.d/2 + 0.5, 8, 0);
  estanteriaFig(g, -def.w/2 + 0.5, 0, 8, Math.PI/2);
  [[-13,1.5,0xc9b394],[-8,1.5,0xc9b394],[-3,1.5,0xd5d8da],[2,1.5,0xd5d8da],[7,1.5,0xb08f5a]].forEach(([x,z,c]) =>
    arrumeFig(g, x, z, 1.8, 1.3, 2, c));
  baldesFig(g, 12, 1.5); baldesFig(g, 15, 1.5);                          // pintura
  [[-13,4.5],[-9,4.5],[-5,4.5]].forEach(([x,z]) => {
    estibaFig(g, x, z);
    sanitarioFig(g, x - 0.25, z, 0); sanitarioFig(g, x + 0.3, z + 0.1, 0);
  });
  caja(g, 2.4, 0.95, 0.6, 0x9a7a48, 15, 0.48, def.d/2 - 1.2);            // mostrador almacenista
  textoLocal(g, 'CERÁMICA · ENCHAPES · PINTURA · GRIFERÍA · SANITARIOS', 20, 0, 5.5, '#5a5245');
}
/* ---- Zona de paletizado 22×16 ---- */
function detallePaletizado(g, def){
  for (let fx=0; fx<5; fx++) for (let fz=0; fz<3; fz++){
    const x = -8.8 + fx*4.4, z = -5 + fz*5;
    if ((fx + fz) % 3 === 0) arrumeFig(g, x, z, 1.8, 1.3, 2, 0xc9b394);
    else if ((fx + fz) % 3 === 1) arrumeFig(g, x, z, 1.8, 1.3, 3, 0xd5d8da);
    else estibaFig(g, x, z);
  }
  textoLocal(g, 'RECEPCIÓN Y ORGANIZACIÓN DE ESTIBAS', 13, 0, 7, '#5a5245');
}
/* ---- Patio de maniobra y descargue 15×18 ---- */
function detalleManiobra(g, def){
  for (let i=0; i<6; i++){
    caja(g, 0.5, 0.05, 1.4, i%2 ? 0x2e3236 : 0xe0c040, -def.w/2 + 0.5, 0.16, -def.d/2 + 1.5 + i*2.8);
    caja(g, 0.5, 0.05, 1.4, i%2 ? 0x2e3236 : 0xe0c040,  def.w/2 - 0.5, 0.16, -def.d/2 + 1.5 + i*2.8);
  }
  [[-5,-6],[5,-6],[-5,6],[5,6]].forEach(([x,z]) => cono(g, 0.28, 0.65, 0xe06a1e, x, z));
  // camión en maniobra
  const cam = new THREE.Group();
  caja(cam, 2.1, 1.7, 2, 0xb8371f, 0, 0.95, 2.6);                        // cabina
  caja(cam, 2.2, 2.2, 5, 0xd8dde2, 0, 1.2, -1);                          // furgón
  [[-0.9,2.6],[0.9,2.6],[-0.9,-2.4],[0.9,-2.4],[-0.9,0.2],[0.9,0.2]].forEach(([x,z]) =>
    cilindro(cam, 0.42, 0.3, 0x22262b, x, 0.42, z).rotation.z = Math.PI/2);
  cam.rotation.y = 0.5;
  cam.position.set(1, 0.1, 0);
  g.add(cam);
  textoLocal(g, 'RADIO DE GIRO CAMIÓN SENCILLO / TURBO', 11, 0, -8, '#5a5245');
}
/* ---- Lavado de llantas 12×16 (Lupa 3) ---- */
function detalleLavadoInforme(g, def){
  // rampa reductora (entrada, +z) → rejilla + cepillos → poceta → escurrido (−z, hacia portería)
  for (let i=0; i<3; i++) caja(g, 8, 0.18, 0.6, 0x8a8f96, 0, 0.2, 6 - i*1.1);
  caja(g, 8, 0.1, 6, 0x77808a, 0, 0.14, 0.5);                            // zona de rejilla
  for (let i=0; i<9; i++) caja(g, 0.18, 0.06, 5.6, 0xaab2b8, -3.5 + i*0.9, 0.21, 0.5);
  const cep1 = cilindro(g, 0.35, 6, 0x3f7fbf, -1.5, 0.5, 0.5); cep1.rotation.x = Math.PI/2;
  const cep2 = cilindro(g, 0.35, 6, 0x3f7fbf, 1.5, 0.5, 0.5);  cep2.rotation.x = Math.PI/2;
  caja(g, 5, 0.4, 2.4, 0x2f5d8a, -1, 0.25, -4);                          // poceta sedimentación
  textoLocal(g, 'POCETA + TRAMPA DE GRASAS', 6.5, -1, -4, '#dfe6ee');
  caja(g, 8, 0.06, 2, 0xc9ccd0, 0, 0.15, -6.8);                          // escurrido
  textoLocal(g, 'SALIDA → PORTERÍA', 6, 0, -7.6, '#7a2e00');
}
/* ---- Portería / control de acceso ---- */
function detallePorteria(g, def){
  caja(g, 1.6, 0.95, 0.5, 0x9a7a48, 0, 0.48, def.d/2 - 0.7);
  sillaFig(g, 0, def.d/2 - 1.4);
  cilindro(g, 0.08, 1.1, 0xd8d8d0, def.w/2 + 0.7, 0.55, 0.5);
  caja(g, 3, 0.09, 0.09, 0xc9302e, def.w/2 + 2.1, 1.05, 0.5);
}
/* ---- Comedor + cocineta trabajadores (~87 m²) ---- */
function detalleComedor(g, def){
  [[-4,-1.4],[-4,1.4],[0,-1.4],[0,1.4],[4,-1.4],[4,1.4]].forEach(([x,z]) => {
    mesaFig(g, x, z, 2.6, 0.9);
    bancaFig(g, x, z - 0.75, 2.6);
    bancaFig(g, x, z + 0.75, 2.6);
  });
  caja(g, 3.5, 0.9, 0.6, 0x9aa0a6, -4, 0.45, -def.d/2 + 0.5);            // mesón cocineta
  caja(g, 0.6, 0.08, 0.5, 0x2e3236, -4.8, 0.94, -def.d/2 + 0.5);         // estufa
  for (let i=0; i<3; i++) lavamanosFig(g, def.w/2 - 0.55, -1 + i);
}
/* ---- Casilleros trabajadores 16×14 ---- */
function detalleCasilleros(g, def){
  [-4.5,-1.5,1.5,4.5].forEach(z => {
    caja(g, 12, 1.8, 0.5, 0x5a6a7a, 0, 1.02, z);
    bancaFig(g, 0, z + 1, 10);
  });
  textoLocal(g, 'CASILLEROS — 305 TRABAJADORES', 10, 0, -6, '#5a5245');
}
/* ---- Baños + vestieres trabajadores ---- */
function detalleBanosVest(g, def){
  for (let i=0; i<8; i++){
    const x = -7 + i*2;
    sanitarioFig(g, x, -def.d/2 + 0.6, Math.PI);
    divisionFig(g, x + 0.9, -def.d/2 + 0.7, 1.4);
  }
  for (let i=0; i<5; i++) orinalFig(g, -def.w/2 + 0.16 + 0, -2 + i*1) ;
  for (let i=0; i<6; i++) lavamanosFig(g, -6 + i*2, 0.5);
  for (let i=0; i<6; i++){
    caja(g, 1, 0.06, 1, 0x7fb2c9, -6 + i*2.2, 0.16, 3.5);                // platos de ducha
    divisionFig(g, -6 + i*2.2 + 0.6, 3.5, 1.1);
  }
  bancaFig(g, -3, 6.5, 6); bancaFig(g, 4, 6.5, 5);
  caja(g, 5, 1.8, 0.5, 0x5a6a7a, 2, 1.02, def.d/2 - 0.6);                // lockers vestier
  textoLocal(g, 'BAÑOS + VESTIERES (2 módulos de obra)', 11, 0, 7.8, '#5a5245');
}
/* ---- Acometidas ---- */
function detalleAcomElec(g, def){
  cilindro(g, 0.1, 6, 0x6a4a2a, -0.5, 3, 0);
  caja(g, 0.8, 1.2, 0.3, 0x77808a, 0.5, 0.85, 0);
  textoLocal(g, 'TABLERO', 2, 0, 1.2, '#a86a10');
}
function detalleAcomAgua(g, def){
  cilindro(g, 0.7, 1.2, 0x2f5d8a, -0.4, 0.72, 0);
  caja(g, 0.5, 0.5, 0.4, 0x9aa0a6, 0.8, 0.4, 0);
  textoLocal(g, 'MEDIDOR', 2, 0.3, 1.2, '#2f5d8a');
}

/* Catálogo — dimensiones reales del informe (m). w=x, d=z, h=altura. */
const PROVISIONALES = [
  { nombre:'Campamento de oficinas 20×18', w:20, d:18, h:2.5, color:0x3f7fbf, techo:true, pos:[-68,8], detalle:detalleCampamento,
    material:'Contenedores / casetas prefabricadas — área total 360 m²',
    cerramiento:'Panel metálico con ventanería; Interventoría con acceso independiente',
    descripcion:'Programa según organigrama: Dirección 5×6 (30 m²), Coordinación 5×6 (30 m²), Interventoría 6×6 (36 m², acceso independiente), Cocineta 4×6 (24 m²), Oficina técnica 14×7 (98 m², 10 puestos: Residentes Administrativo, Cerramientos, Acabados, Ambiental + SST y auxiliares), Baño H 3×7, WC M 3×7, Sala de reuniones 10×5 (50 m²), Archivo/planoteca 6×5 y Circulación 4×5. En el extremo opuesto al ingreso, lejos del polvo y ruido.' },
  { nombre:'Almacén central de acabados 38×14', w:38, d:14, h:4, color:0xd9a521, muros:true, techo:true, pos:[38,15], detalle:detalleAlmacen,
    material:'Estructura metálica, cubierto y ventilado — 532 m²',
    cerramiento:'Cerrado con control de humedad (materiales delicados)',
    descripcion:'Almacén de 38×14 = 532 m² junto a la torre para minimizar la manipulación de cerámica, enchapes, pintura, grifería y aparatos sanitarios. Desde aquí el material va en carretillas buggy al pie del montacargas (≈15-25 m).' },
  { nombre:'Zona de paletizado 22×16', w:22, d:16, h:1.6, color:0xb08f5a, pos:[38,-14], detalle:detallePaletizado,
    material:'Superficie afirmada con estibas — 352 m²',
    cerramiento:'Demarcada, a cielo abierto',
    descripcion:'Recepción y organización de estibas (22×16 = 352 m²) antes de su ingreso al almacén o directamente al pie del montacargas.' },
  { nombre:'Patio de maniobra y descargue 15×18', w:15, d:18, h:2.4, color:0xe0c040, pos:[62,-12], detalle:detalleManiobra,
    material:'Placa afirmada señalizada — 270 m²',
    cerramiento:'Demarcación con franjas y conos',
    descripcion:'Patio de 15×18 = 270 m² con radio de giro suficiente para camión sencillo/turbo. El camión ingresa por portería → maniobra → descargue en paletizado → salida por lavado de llantas.' },
  { nombre:'Lavado de llantas 12×16', w:12, d:16, h:1, color:0x4a9ec9, pos:[76,4], detalle:detalleLavadoInforme,
    material:'Rejilla metálica + cepillos giratorios y aspersores — 192 m²',
    cerramiento:'Poceta de sedimentación + trampa de grasas antes de descarga',
    descripcion:'1 unidad de 12×16 = 192 m², inmediatamente antes de la portería: todo vehículo que sale pasa obligatoriamente por el lavado antes de incorporarse a la vía de acceso / autopista. Capacidad ~3-4 min/vehículo, con recirculación de agua y purga de lodos a disposición autorizada.' },
  { nombre:'Portería / Control de acceso', w:4, d:3, h:2.5, color:0xb8371f, muros:true, techo:true, pos:[72,-19], detalle:detallePorteria,
    material:'Caseta prefabricada junto al portón de 6.00 m',
    cerramiento:'Portón vehicular corredizo 6.00 m + puerta peatonal 1.00 m',
    descripcion:'Único acceso vehicular y peatonal del lote, en el extremo donde la vía de 15.00 m conecta con la salida de la autopista. Concentra el control de ingreso; requiere señalización para evitar cruces de flujo.' },
  { nombre:'Comedor + cocineta trabajadores', w:12.5, d:7, h:2.7, color:0x5fae4a, muros:true, techo:true, pos:[-45,18], detalle:detalleComedor,
    material:'Estructura metálica con cubierta — ≈87 m² (≈1.2 m²/trabajador en pico)',
    cerramiento:'Semi-abierto con malla',
    descripcion:'Comedor y cocineta del personal en la zona de bienestar (extremo opuesto al ingreso), lejos del polvo y del tránsito de camiones.' },
  { nombre:'Casilleros trabajadores 16×14', w:16, d:14, h:2.5, color:0x8a6a3a, muros:true, techo:true, pos:[-68,-13], detalle:detalleCasilleros,
    material:'Módulos de casilleros metálicos — 224 m²',
    cerramiento:'Caseta cerrada con panel metálico',
    descripcion:'Guardarropa del personal de obra (16×14 = 224 m²) junto a baños y vestieres, en la zona de bienestar.' },
  { nombre:'Baños + vestieres trabajadores', w:16, d:18, h:2.5, color:0x4f66c9, muros:true, techo:true, pos:[-42,-10], detalle:detalleBanosVest,
    material:'Módulos sanitarios prefabricados — 288 m²',
    cerramiento:'Panel metálico, conectado a acometidas provisionales',
    descripcion:'Batería de baños, duchas y vestieres para el personal (pico 305 trabajadores): 3 módulos en total según el informe (2 de obra + 1 administrativo dentro del campamento).' },
  { nombre:'Acometida eléctrica', w:2.5, d:2.5, h:2, color:0xd9a521, pos:[78,-14], detalle:detalleAcomElec,
    material:'Tablero temporal con contador, junto a la portería',
    cerramiento:'Gabinete con candado y señalización de riesgo eléctrico',
    descripcion:'Junto a la portería para facilitar lectura y mantenimiento de la empresa prestadora. Distribuye a montacargas, oficinas, almacén y comedor. Concentrarla en el ingreso reduce redes expuestas en el patio de maniobra.' },
  { nombre:'Acometida de agua (abastos)', w:2.5, d:2.5, h:1.5, color:0x2f5d8a, pos:[78,-9], detalle:detalleAcomAgua,
    material:'Empalme a red municipal existente en la vía de acceso',
    cerramiento:'Caja de medidor + registro de corte',
    descripcion:'Junto a la portería, con empalme a la red municipal de la vía de acceso. Distribuye a comedor, baños/vestieres, almacén (limpieza) y zona de lavado de llantas. Facilita el corte de servicios en emergencia.' }
];
PROVISIONALES.forEach(crearProvisional);

/* ============ 9. PERSONAS ============ */
function figuraTrabajador(colorCasco){
  const p = new THREE.Group();
  caja(p, 0.26, 0.3, 0.18, 0x3a4150, 0, 0.15, 0);
  caja(p, 0.3, 0.55, 0.2, 0xe06a1e, 0, 0.57, 0);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshLambertMaterial({ color:0xd9a06a }));
  cab.position.y = 0.97; p.add(cab);
  const casco = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 10, 8, 0, Math.PI*2, 0, Math.PI/2),
    new THREE.MeshLambertMaterial({ color: colorCasco })
  );
  casco.position.y = 0.99; p.add(casco);
  return p;
}
const CASCOS = [0xf2d21f, 0xffffff, 0x3f7fbf, 0xe06a1e];
const personas = [];
function nuevoObjetivo(){
  return new THREE.Vector3(-78 + Math.random()*156, 0, -36 + Math.random()*57);
}
for (let i=0; i<10; i++){
  const f = figuraTrabajador(CASCOS[i % CASCOS.length]);
  const o = nuevoObjetivo();
  f.position.set(o.x, alturaTerreno(o.x, o.z) + 0.1, o.z);
  scene.add(f);
  personas.push({ g:f, obj:nuevoObjetivo(), vel:0.9 + Math.random()*0.9 });
}
const t4a = figuraTrabajador(0xf2d21f); t4a.position.set(10, y4 + 0.15, -3); piso4.add(t4a);
const t4b = figuraTrabajador(0xffffff); t4b.position.set(-6, y4 + 0.15, 2); t4b.rotation.y = 1.2; piso4.add(t4b);

/* ============ 10. FLUJO DE MATERIALES ============ */
const rutas = [];
let rutaActual = null;
let modoFlujo = false;
const coloresRuta = [0xffd23e, 0x53d0ff, 0xff7a4f, 0x9dff5a, 0xff5ad0];

function iniciarRuta(){
  rutaActual = { puntos: [], grupo: new THREE.Group(), linea: null };
  scene.add(rutaActual.grupo);
}
function agregarPunto(p){
  const ya = alturaTerreno(p.x, p.z);
  const marca = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.5, 12),
    new THREE.MeshLambertMaterial({ color: coloresRuta[rutas.length % coloresRuta.length] })
  );
  marca.position.set(p.x, ya + 0.3, p.z);
  rutaActual.grupo.add(marca);
  rutaActual.puntos.push(new THREE.Vector3(p.x, ya + 0.5, p.z));
  redibujarRuta();
}
function redibujarRuta(){
  if (rutaActual.linea){ rutaActual.grupo.remove(rutaActual.linea); rutaActual.linea.geometry.dispose(); }
  if (rutaActual.puntos.length < 2) return;
  const curva = new THREE.CatmullRomCurve3(rutaActual.puntos);
  const geo = new THREE.TubeGeometry(curva, Math.max(20, rutaActual.puntos.length*10), 0.28, 6, false);
  rutaActual.linea = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
    color: coloresRuta[rutas.length % coloresRuta.length], transparent:true, opacity:0.85
  }));
  rutaActual.grupo.add(rutaActual.linea);
  rutaActual.curva = curva;
}
function finalizarRuta(){
  if (!rutaActual) return;
  if (rutaActual.puntos.length < 2){ scene.remove(rutaActual.grupo); rutaActual = null; return; }
  rutaActual.flechas = [];
  const col = coloresRuta[rutas.length % coloresRuta.length];
  for (let i=0; i<4; i++){
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 8), new THREE.MeshLambertMaterial({ color: col }));
    rutaActual.grupo.add(f);
    rutaActual.flechas.push(f);
  }
  rutaActual.offset = Math.random();
  rutas.push(rutaActual);
  rutaActual = null;
  guardarCompartido();
}
function borrarRutas(){
  rutas.forEach(r => scene.remove(r.grupo));
  rutas.length = 0;
  if (rutaActual){ scene.remove(rutaActual.grupo); rutaActual = null; }
  guardarCompartido();
}
