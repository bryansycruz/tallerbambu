/* Provisionales de obra, personas y flujo de materiales */

/* ============ 8. PROVISIONALES (dimensiones reales del informe) ============ */
const draggables = [];
const selectorUI = document.getElementById('selElem');

function crearProvisional(def){
  const g = new THREE.Group();
  g.position.set(def.pos[0], alturaApoyo(def.pos[0], def.pos[1], def.w, def.d), def.pos[1]);
  g.userData.esProvisional = true;
  g.userData.info = def;
  // identidad estable para los de fábrica (PROVISIONALES): permite renombrar,
  // recolorear o eliminar cualquiera desde la pestaña "Modificar" y que el
  // cambio persista por nombre original, no por el nombre visible actual.
  // construirEspacio() (creador.js) sobrescribe esto con 'c:' + su propio id
  // porque también reutiliza este mismo constructor para espacios creados.
  g.userData.idEstable = 'p:' + def.nombre;
  g.userData.nombreOriginal = def.nombre;
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
  // etiqueta de tamaño normal: crece un poco con el ancho del espacio pero
  // con tope, para que un espacio grande (p. ej. el Almacén de 37.5 m) no
  // muestre un rótulo desproporcionado sobre la escena
  const et = crearEtiqueta(def.nombre, Math.max(9, Math.min(20, def.w * 0.6)));
  et.position.y = def.h + 1.8;
  g.add(et);
  if (typeof agregarCotas === 'function') agregarCotas(g, def.w, def.d, def.h);
  // sin sombra proyectada: a pedido del usuario, los provisionales no deben
  // ensuciar el terreno con manchas de sombra dinámica (sí siguen recibiendo
  // luz/sombra ambiente normalmente, solo se desactiva que ELLOS la proyecten)
  g.traverse(n => { if (n.isMesh) n.castShadow = false; });
  scene.add(g);
  draggables.push(g);
  const opt = document.createElement('option');
  opt.value = draggables.length - 1;
  opt.textContent = def.nombre;
  selectorUI.appendChild(opt);
  return g;
}

/* ---- Campamento de oficinas 19.8×17.6 (Lupa 1: programa completo) ---- */
function detalleCampamento(g, def){
  const cm = def.color, h = 2.3, W = def.w, D = def.d;
  // perímetro con puerta en Circulación/Acceso (frente +z); se adapta a w×d
  caja(g, W, h, 0.12, cm, 0, h/2, -D/2, 0.92);
  caja(g, 0.12, h, D, cm, -W/2, h/2, 0, 0.92);
  caja(g, 0.12, h, D, cm, W/2, h/2, 0, 0.92);
  caja(g, 7.4 + W/2, h, 0.12, cm, (7.4 - W/2)/2, h/2, D/2, 0.92);
  caja(g, W/2 - 8.6, h, 0.12, cm, (8.6 + W/2)/2, h/2, D/2, 0.92);
  // divisiones interiores (según Lupa 1)
  caja(g, W, 2.2, 0.1, cm, 0, 1.1, -3, 0.95);
  caja(g, W, 2.2, 0.1, cm, 0, 1.1, 4, 0.95);
  caja(g, 0.1, 2.2, 6, cm, -5, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 6, cm, 0, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 6, cm, 6, 1.1, -6, 0.95);
  caja(g, 0.1, 2.2, 7, cm, 4, 1.1, 0.5, 0.95);
  caja(g, 0.1, 2.2, 7, cm, 7, 1.1, 0.5, 0.95);
  caja(g, 0.1, 2.2, D/2 - 4, cm, 0, 1.1, (4 + D/2)/2, 0.95);
  caja(g, 0.1, 2.2, D/2 - 4, cm, 6, 1.1, (4 + D/2)/2, 0.95);
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
/* ---- Almacén central de acabados 17.5×8 (140 m²) ---- */
function detalleAlmacen(g, def){
  const W = def.w, D = def.d;
  const largoFondo = Math.max(2, Math.min(6, W/2 - 1.5));
  estanteriaFig(g, -W/4, -D/2 + 0.6, largoFondo, 0);
  estanteriaFig(g,  W/4, -D/2 + 0.6, largoFondo, 0);
  estanteriaFig(g, -W/2 + 0.5, 0, Math.max(2, Math.min(5, D - 2)), Math.PI/2);
  [[-W/5, D/6, 0xc9b394], [0, D/6, 0xd5d8da], [W/5, D/6, 0xb08f5a]].forEach(([x, z, c]) =>
    arrumeFig(g, x, z, 1.6, 1.1, 2, c));
  baldesFig(g, W/2 - 1.6, D/2 - 1.6);                                    // pintura
  caja(g, 2.0, 0.9, 0.55, 0x9a7a48, W/2 - 1.5, 0.45, D/2 - 1);           // mostrador almacenista
  textoLocal(g, 'CERÁMICA · PINTURA · GRIFERÍA', Math.min(12, W * 0.65), 0, D/2 - 2.9, '#5a5245');
}
/* ---- Acopio de materiales (antes "Paletizado") 21.4×16 ---- */
function detallePaletizado(g, def){
  for (let fx=0; fx<5; fx++) for (let fz=0; fz<3; fz++){
    const x = -8.8 + fx*4.4, z = -5 + fz*5;
    if ((fx + fz) % 3 === 0) arrumeFig(g, x, z, 1.8, 1.3, 2, 0xc9b394);
    else if ((fx + fz) % 3 === 1) arrumeFig(g, x, z, 1.8, 1.3, 3, 0xd5d8da);
    else estibaFig(g, x, z);
  }
  textoLocal(g, 'RECEPCIÓN Y ORGANIZACIÓN DE ESTIBAS', 13, 0, 7, '#5a5245');
}
/* ---- Patio de maniobra y descargue 14.8×17.5 ---- */
function detalleManiobra(g, def){
  const W = def.w, D = def.d;
  // franjas amarillas/negras del borde
  for (let i=0; i<6; i++){
    caja(g, 0.5, 0.05, 1.4, i%2 ? 0x2e3236 : 0xe0c040, -W/2 + 0.5, 0.16, -D/2 + 1.5 + i*2.8);
    caja(g, 0.5, 0.05, 1.4, i%2 ? 0x2e3236 : 0xe0c040,  W/2 - 0.5, 0.16, -D/2 + 1.5 + i*2.8);
  }
  // radio de giro pintado en el piso (elipse discontinua)
  for (let i=0; i<28; i += 2){
    const a = (i/28) * Math.PI * 2;
    const seg = caja(g, 1.0, 0.04, 0.2, 0xeceadf, Math.cos(a)*5.7, 0.17, Math.sin(a)*4.9);
    seg.rotation.y = Math.atan2(-4.9*Math.cos(a), -5.7*Math.sin(a));
    seg.castShadow = false;
  }
  // flechas de circulación pintadas (entrada → giro → salida)
  const geoFlecha = new THREE.CircleGeometry(0.6, 3);
  geoFlecha.rotateX(-Math.PI/2);
  [[0, D/2 - 1.4, Math.PI/2], [-4.6, 3.2, Math.PI*0.8], [-4.6, -3.2, -Math.PI*0.8], [0, -D/2 + 1.6, -Math.PI/2]]
    .forEach(([x, z, rot]) => {
      const f = new THREE.Mesh(geoFlecha.clone(), new THREE.MeshBasicMaterial({ color:0xf2d21f }));
      f.rotation.y = rot;
      f.position.set(x, 0.18, z);
      g.add(f);
    });
  // cebra de la zona de descargue
  for (let i=0; i<5; i++){
    const c = caja(g, 0.2, 0.04, 3.2, 0xe8e6da, 3.2 + (i - 2)*1.3, 0.165, -D/2 + 2.6);
    c.rotation.y = 0.5;
    c.castShadow = false;
  }
  textoLocal(g, 'DESCARGUE', 4, 3.2, -D/2 + 5.1, '#7a2e00');
  // conos de señalización alrededor del giro
  [[-5,-6],[5,-6],[-5,6],[5,6],[-6.3,0],[6.3,0],[0,7.2],[0,-7.2]].forEach(([x,z]) => cono(g, 0.28, 0.65, 0xe06a1e, x, z));
  // señal de PARE a la salida
  cilindro(g, 0.06, 2.2, 0x8a8f96, W/2 - 1, 1.1, D/2 - 1);
  const pare = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 8),
    new THREE.MeshLambertMaterial({ color:0xc9302e }));
  pare.rotation.x = Math.PI/2;
  pare.position.set(W/2 - 1, 2.3, D/2 - 1);
  g.add(pare);
  // camión en maniobra (cabina + parabrisas + faros + furgón con franja + ruedas con rin)
  const cam = new THREE.Group();
  caja(cam, 2.3, 0.5, 8.4, 0x2b2f36, 0, 0.72, 0);                        // chasis
  caja(cam, 2.35, 2.1, 2.1, 0x2e6db8, 0, 1.95, 2.85);                    // cabina
  caja(cam, 2.2, 0.9, 0.06, 0x9fc4e8, 0, 2.5, 3.93);                     // parabrisas
  caja(cam, 0.4, 0.18, 0.1, 0xf2d21f, -0.8, 1.05, 3.92);                 // faros
  caja(cam, 0.4, 0.18, 0.1, 0xf2d21f, 0.8, 1.05, 3.92);
  caja(cam, 2.45, 2.3, 5.2, 0xe6e2d8, 0, 2.1, -1.35);                    // furgón
  caja(cam, 2.47, 0.34, 5.22, 0xc9581e, 0, 1.2, -1.35);                  // franja del furgón
  [[-1.05,2.85],[1.05,2.85],[-1.05,-0.6],[1.05,-0.6],[-1.05,-3.0],[1.05,-3.0]].forEach(([x,z]) => {
    cilindro(cam, 0.5, 0.34, 0x15181c, x, 0.5, z).rotation.z = Math.PI/2;   // llanta
    cilindro(cam, 0.2, 0.36, 0x9aa0a6, x, 0.5, z).rotation.z = Math.PI/2;   // rin
  });
  cam.rotation.y = 0.5;
  cam.position.set(0.6, 0.1, 0.4);
  g.add(cam);
  textoLocal(g, 'RADIO DE GIRO CAMIÓN SENCILLO / TURBO', 11, 0, -8, '#5a5245');
}
/* ---- Lavado de llantas 11.6×15.7 (Lupa 3) ---- */
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
/* ---- Portería / control de acceso — portón del ancho de la vía ---- */
function detallePorteria(g, def){
  const w = def.w;
  // caseta del vigilante en un extremo
  caja(g, 2.6, 2.1, def.d, 0x9a7a48, -w/2 + 1.4, 1.05, 0, 1);
  caja(g, 2.9, 0.12, def.d + 0.3, 0x6d7075, -w/2 + 1.4, 2.2, 0, 1); // techito
  sillaFig(g, -w/2 + 1.4, 0.4);
  // postes a ambos lados de la vía
  cilindro(g, 0.13, 2.4, 0xd8d8d0, -w/2 + 3, 1.2, 0);
  cilindro(g, 0.13, 2.4, 0xd8d8d0,  w/2 - 0.5, 1.2, 0);
  // barrera roja/blanca que cruza toda la vía (del ancho de la vía)
  caja(g, w - 3.5, 0.16, 0.16, 0xc9302e, ((-w/2 + 3) + (w/2 - 0.5)) / 2, 1.7, 0);
}
/* ---- Comedor + cocineta trabajadores (77 m²) ---- */
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
/* ---- Casilleros trabajadores 10×10 (100 m²) ---- */
function detalleCasilleros(g, def){
  const W = def.w, D = def.d;
  const filaW = Math.min(8, W - 1.5);
  [-D/2 + 1.3, 0, D/2 - 2.2].forEach(z => {
    caja(g, filaW, 1.8, 0.5, 0x5a6a7a, 0, 1.02, z);
    bancaFig(g, 0, z + 1, Math.min(6.5, filaW - 1));
  });
  textoLocal(g, 'CASILLEROS', Math.min(8, W * 0.7), 0, -D/2 + 0.3, '#5a5245');
}
/* ---- Baños + vestidores trabajadores 10×10 (100 m²) ---- */
function detalleBanosVest(g, def){
  const W = def.w, D = def.d;
  const mx = W/2 - 1.3, mz = D/2 - 1.3;   // margen seguro contra las paredes
  [-mx*0.6, -mx*0.2, mx*0.2, mx*0.6].forEach((x, i) => {
    sanitarioFig(g, x, -mz, Math.PI);
    if (i < 3) divisionFig(g, x + mx*0.2, -mz + 0.1, 1.1);
  });
  [-0.6, 0, 0.6].forEach(dz => orinalFig(g, -mx, dz));                   // orinales contra el lado
  [-mx*0.6, -mx*0.2, mx*0.2, mx*0.6].forEach(x => lavamanosFig(g, x, 0));
  [-mx*0.5, 0, mx*0.5].forEach(x => {
    caja(g, 1, 0.06, 1, 0x7fb2c9, x, 0.16, mz*0.55);                     // platos de ducha
    divisionFig(g, x + 0.55, mz*0.55, 1);
  });
  bancaFig(g, 0, mz, Math.min(6, W - 2.6));
  caja(g, Math.min(4, W - 3), 1.6, 0.4, 0x5a6a7a, 0, 0.92, mz - 0.6);    // lockers vestier
  textoLocal(g, 'BAÑOS + VESTIDORES', Math.min(9, W * 0.8), 0, mz - 1.8, '#5a5245');
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
  { aforo:'25 personas (oficinas, técnica y sala de reuniones)', nombre:'Campamento', w:19.8, d:17.2, h:2.5, color:0x3f7fbf, techo:true, pos:[-68,-8], detalle:detalleCampamento,
    material:'Contenedores / casetas prefabricadas — área total 341 m² (19.8×17.2)',
    cerramiento:'Panel metálico con ventanería; Interventoría con acceso independiente',
    descripcion:'Programa según organigrama: Dirección 5×6 (30 m²), Coordinación 5×6 (30 m²), Interventoría 6×6 (36 m², acceso independiente), Cocineta 4×6 (24 m²), Oficina técnica 14×7 (98 m², 10 puestos: Residentes Administrativo, Cerramientos, Acabados, Ambiental + SST y auxiliares), Baño H 3×7, WC M 3×7, Sala de reuniones 10×5 (50 m²), Archivo/planoteca 6×5 y Circulación 4×5. En el extremo opuesto al ingreso, lejos del polvo y ruido.' },
  { aforo:'8 personas (almacenista y ayudantes)', nombre:'Almacén central', w:17.5, d:8, h:4, color:0xd9a521, muros:true, techo:true, pos:[38,-15], detalle:detalleAlmacen,
    material:'Estructura metálica, cubierto y ventilado — 140 m²',
    cerramiento:'Cerrado con control de humedad (materiales delicados)',
    descripcion:'Almacén de 17.5×8 = 140 m² junto a la torre para minimizar la manipulación de cerámica, enchapes, pintura, grifería y aparatos sanitarios. Desde aquí el material va en carretillas buggy al pie del malacate (≈15-25 m).' },
  { aforo:'6 personas en labores de acopio', nombre:'Acopio de materiales', w:20.9, d:16, h:1.6, color:0xb08f5a, pos:[38,14], detalle:detallePaletizado,
    material:'Superficie afirmada con estibas — 334 m²',
    cerramiento:'Demarcada, a cielo abierto',
    descripcion:'Recepción y organización de estibas (20.9×16 ≈ 334 m²) antes de su ingreso al almacén o directamente al pie del malacate.' },
  { aforo:'4 personas (conductor y señaleros)', nombre:'Patio de maniobra', w:14.3, d:17.5, h:2.4, color:0xe0c040, pos:[62,12], detalle:detalleManiobra,
    material:'Placa afirmada señalizada — 250 m²',
    cerramiento:'Demarcación con franjas y conos',
    descripcion:'Patio de 14.3×17.5 ≈ 250 m² con radio de giro suficiente para camión sencillo/turbo. El camión ingresa por portería → maniobra → descargue en la zona de acopio → salida por lavado de llantas.' },
  { aforo:'2 operarios', nombre:'Lavado de llantas', w:11.6, d:15.7, h:1, color:0x4a9ec9, pos:[76,-4], detalle:detalleLavadoInforme,
    material:'Rejilla metálica + cepillos giratorios y aspersores — 182 m²',
    cerramiento:'Poceta de sedimentación + trampa de grasas antes de descarga',
    descripcion:'1 unidad de 11.6×15.7 ≈ 182 m², inmediatamente antes de la portería: todo vehículo que sale pasa obligatoriamente por el lavado antes de incorporarse a la vía de acceso / autopista. Capacidad ~3-4 min/vehículo, con recirculación de agua y purga de lodos a disposición autorizada.' },
  { aforo:'2 vigilantes', nombre:'Portería', w:10, d:4, h:2.5, color:0xb8371f, muros:false, techo:false, pos:[84,24], detalle:detallePorteria,
    material:'Caseta de vigilancia + portón del ancho de la vía (~10 m)',
    cerramiento:'Portón vehicular en toda la vía + puerta peatonal',
    descripcion:'Único acceso vehicular y peatonal del lote, en el extremo donde la vía de 15.00 m conecta con la salida de la autopista. Concentra el control de ingreso; requiere señalización para evitar cruces de flujo.' },
  { aforo:'64 personas por turno', nombre:'Comedor', w:12, d:6.4, h:2.7, color:0x5fae4a, muros:true, techo:true, pos:[-45,-18], detalle:detalleComedor,
    material:'Estructura metálica con cubierta — 77 m² (≈1.2 m²/comensal por turno)',
    cerramiento:'Semi-abierto con malla',
    descripcion:'Comedor y cocineta del personal en la zona de bienestar (extremo opuesto al ingreso), lejos del polvo y del tránsito de camiones.' },
  { aforo:'40 personas', nombre:'Casilleros', w:10, d:10, h:2.5, color:0x8a6a3a, muros:true, techo:true, pos:[-68,13], detalle:detalleCasilleros,
    material:'Módulos de casilleros metálicos — 100 m²',
    cerramiento:'Caseta cerrada con panel metálico',
    descripcion:'Guardarropa del personal de obra (10×10 = 100 m²) junto a baños y vestidores, en la zona de bienestar.' },
  { aforo:'45 personas', nombre:'Baños y vestidores', w:10, d:10, h:2.5, color:0x4f66c9, muros:true, techo:true, pos:[-42,10], detalle:detalleBanosVest,
    material:'Módulos sanitarios prefabricados — 100 m²',
    cerramiento:'Panel metálico, conectado a acometidas provisionales',
    descripcion:'Batería de baños, duchas y vestidores para el personal (pico 305 trabajadores): 3 módulos en total según el informe (2 de obra + 1 administrativo dentro del campamento).' },
  { aforo:'1 técnico autorizado', nombre:'Acometida eléctrica', w:2, d:2, h:2, color:0xd9a521, pos:[78,14], detalle:detalleAcomElec,
    material:'Tablero temporal con contador, junto a la portería',
    cerramiento:'Gabinete con candado y señalización de riesgo eléctrico',
    descripcion:'Junto a la portería para facilitar lectura y mantenimiento de la empresa prestadora. Distribuye a malacate, oficinas, almacén y comedor. Concentrarla en el ingreso reduce redes expuestas en el patio de maniobra.' },
  { aforo:'1 técnico autorizado', nombre:'Acometida de agua', w:2, d:2, h:1.5, color:0x2f5d8a, pos:[78,9], detalle:detalleAcomAgua,
    material:'Empalme a red municipal existente en la vía de acceso',
    cerramiento:'Caja de medidor + registro de corte',
    descripcion:'Junto a la portería, con empalme a la red municipal de la vía de acceso. Distribuye a comedor, baños/vestidores, almacén (limpieza) y zona de lavado de llantas. Facilita el corte de servicios en emergencia.' }
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
  // sin sombra propia: a más trabajadores en escena, cada uno proyectando
  // sombra dinámica vuelve el modelo notablemente más lento
  p.traverse(n => { if (n.isMesh) n.castShadow = false; });
  return p;
}
const CASCOS = [0xf2d21f, 0xffffff, 0x3f7fbf, 0xe06a1e];
const personas = [];
// focos de actividad real de la obra: pie de la torre/malacate, acopio,
// almacén y patio de maniobra (camiones) — los trabajadores se agrupan
// alrededor de estos puntos en vez de caminar al azar por terreno vacío,
// para que la escena se lea como una obra activa
const FOCOS_TRABAJO = [
  [2, -8], [2, -8],   // pie de la torre / malacate (doble peso: es el punto con más movimiento)
  [38, 14],           // acopio de materiales
  [38, -15],          // almacén
  [62, 12]            // patio de maniobra / camiones
];
function nuevoObjetivo(){
  const f = FOCOS_TRABAJO[Math.floor(Math.random() * FOCOS_TRABAJO.length)];
  const radio = 8 + Math.random() * 8;
  const ang = Math.random() * Math.PI * 2;
  return new THREE.Vector3(
    Math.max(CFG.limites.xMin, Math.min(CFG.limites.xMax, f[0] + Math.cos(ang) * radio)),
    0,
    Math.max(CFG.limites.zMin, Math.min(CFG.limites.zMax, f[1] + Math.sin(ang) * radio))
  );
}
// máximo 150 trabajadores en escena (menos en celular, donde cada figura
// adicional pesa más). INSTANCIADOS: si cada trabajador fuera un Group con
// sus 4 mallas propias (como los 2 estáticos del piso 4), serían 600 draw
// calls por cuadro solo en personas — el costo dominante en PC. Con un
// InstancedMesh por parte del cuerpo (piernas, torso, cabeza, casco) son
// 4 draw calls en total, con exactamente el mismo aspecto.
const N_TRABAJADORES = ES_MOVIL ? 40 : 150;
const partesTrabajador = [
  // [geometría, color, altura local] — mismas medidas que figuraTrabajador
  [new THREE.BoxGeometry(0.26, 0.3, 0.18), 0x3a4150, 0.15],
  [new THREE.BoxGeometry(0.3, 0.55, 0.2), 0xe06a1e, 0.57],
  [new THREE.SphereGeometry(0.13, 10, 10), 0xd9a06a, 0.97],
  // casco: material blanco + color POR INSTANCIA (setColorAt multiplica)
  [new THREE.SphereGeometry(0.15, 10, 8, 0, Math.PI*2, 0, Math.PI/2), 0xffffff, 0.99]
].map(([geo, color, dy]) => {
  const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color }), N_TRABAJADORES);
  m.userData.dy = dy;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.castShadow = false;
  // el culling de un InstancedMesh usa el bounding de la GEOMETRÍA base (no
  // el de las instancias repartidas por todo el lote): sin esto, todos los
  // trabajadores desaparecen cuando la cámara no mira el origen
  m.frustumCulled = false;
  scene.add(m);
  return m;
});
{
  const colTmp = new THREE.Color();
  const casco = partesTrabajador[3];
  for (let i = 0; i < N_TRABAJADORES; i++) casco.setColorAt(i, colTmp.setHex(CASCOS[i % CASCOS.length]));
  casco.instanceColor.needsUpdate = true;
}
for (let i=0; i<N_TRABAJADORES; i++){
  const o = nuevoObjetivo();
  personas.push({
    x: o.x, y: alturaTerreno(o.x, o.z) + 0.1, z: o.z, rot: 0,
    obj: nuevoObjetivo(), vel: 0.9 + Math.random()*0.9
  });
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
