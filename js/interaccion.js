/* Interacción: cámara, arrastre, selección, bloqueo y tintes */

/* ============ 11. INTERACCIÓN ============ */
const camCtrl = { target: new THREE.Vector3(0,6,-8), radius: 170, theta: 0.5, phi: 1.22 };
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
function irA(tx, ty, tz, radius, theta, phi, dur){
  animCam = {
    t0: performance.now(), dur: dur || 900,
    de: { x:camCtrl.target.x, y:camCtrl.target.y, z:camCtrl.target.z, r:camCtrl.radius, th:camCtrl.theta, ph:camCtrl.phi },
    a:  { x:tx, y:ty, z:tz, r:radius, th:theta, ph:phi }
  };
}

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();
const planoSuelo = new THREE.Plane(new THREE.Vector3(0,1,0), 0);

let arrastrando = null;
let rotando = false, paneando = false;
let x0=0, y0=0, movido=0;
let seleccionado = null;
let offsetCerr = { x: 0, z: 0 };   // desfase entre el punto tomado y el origen del cerramiento, para que lo siga sin "saltar"

/* ---- soporte táctil: pellizco (zoom) y dos dedos (desplazar) ---- */
const punterosTactiles = new Map();   // pointerId -> {x, y}
let pinza = null;                     // { dist0, radio0, cx, cy }

/* Desplaza el objetivo de la cámara según un delta en pantalla
   (lo usan el paneo con clic derecho, el gesto de dos dedos y el pad móvil) */
function moverCamaraPantalla(dx, dy){
  const derecha = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
  const frente = new THREE.Vector3().subVectors(camCtrl.target, camera.position);
  frente.y = 0; frente.normalize();
  camCtrl.target.addScaledVector(derecha, -dx * camCtrl.radius * 0.0013);
  camCtrl.target.addScaledVector(frente,  dy * camCtrl.radius * 0.0013);
}

function rayoDesdeEvento(e){
  puntero.x = (e.clientX / innerWidth) * 2 - 1;
  puntero.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(puntero, camera);
}
function interseccionSuelo(){
  const hits = raycaster.intersectObject(terreno);
  if (hits.length) return hits[0].point;
  const p = new THREE.Vector3();
  return raycaster.ray.intersectPlane(planoSuelo, p) ? p : null;
}
function buscarRaiz(obj){
  while (obj){
    if (obj.userData && obj.userData.info) return obj;
    obj = obj.parent;
  }
  return null;
}

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch'){
    punterosTactiles.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punterosTactiles.size === 2){
      // segundo dedo: cancelar arrastre/rotación y empezar pellizco + paneo
      arrastrando = null; rotando = false; paneando = false; movido = 999;
      const [a, b] = [...punterosTactiles.values()];
      pinza = {
        dist0: Math.hypot(a.x - b.x, a.y - b.y),
        radio0: camCtrl.radius,
        cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2
      };
      return;
    }
  }
  x0 = e.clientX; y0 = e.clientY; movido = 0;
  rayoDesdeEvento(e);
  if (e.button === 2 || e.shiftKey){ paneando = true; return; }
  if (e.button !== 0) return;

  if (modoFlujo){
    const p = interseccionSuelo();
    if (p){ if (!rutaActual) iniciarRuta(); agregarPunto(p); }
    return;
  }
  const hitsM = raycaster.intersectObjects(malacates, true);
  if (hitsM.length){
    arrastrando = buscarRaiz(hitsM[0].object) || malacate;
    return;
  }
  const hitsC = raycaster.intersectObject(cerramiento, true);
  if (hitsC.length){
    // el cerramiento es una sola pieza fija: se arrastra completo, sin girar
    // ni bloquear, guardando el desfase para que siga al cursor sin saltar
    const p0 = interseccionSuelo();
    if (p0){
      offsetCerr.x = cerramiento.position.x - p0.x;
      offsetCerr.z = cerramiento.position.z - p0.z;
      arrastrando = cerramiento;
      return;
    }
  }
  const hits = raycaster.intersectObjects(draggables, true);
  if (hits.length){
    const raiz = buscarRaiz(hits[0].object);
    if (raiz && !raiz.userData.bloqueado) arrastrando = raiz;
    return;
  }
  rotando = true;
});

renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' && punterosTactiles.has(e.pointerId)){
    punterosTactiles.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinza && punterosTactiles.size >= 2){
      const [a, b] = [...punterosTactiles.values()];
      // pellizco = zoom
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      camCtrl.radius = Math.min(500, Math.max(12, pinza.radio0 * (pinza.dist0 / Math.max(dist, 1))));
      // movimiento del punto medio = desplazamiento (paneo)
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      moverCamaraPantalla(cx - pinza.cx, cy - pinza.cy);
      pinza.cx = cx; pinza.cy = cy;
      return;
    }
  }
  const dx = e.clientX - x0, dy = e.clientY - y0;
  movido += Math.abs(dx) + Math.abs(dy);
  x0 = e.clientX; y0 = e.clientY;

  if (arrastrando){
    rayoDesdeEvento(e);
    const p = interseccionSuelo();
    if (p){
      if (arrastrando.userData.esMalacate || arrastrando.userData.esAndamio){
        // el andamio colgante se ancla a la fachada más cercana igual que el malacate
        const s = ajustarMalacate(p.x, p.z);
        arrastrando.position.set(s.x, 0, s.z);
        if (arrastrando === malacate) actualizarDescargue();
      } else if (arrastrando === cerramiento){
        // sigue al cursor manteniendo el desfase con el que se tomó (no tiene
        // límites de CFG.limites: es la cerca perimetral, puede salir del lote)
        cerramiento.position.set(p.x + offsetCerr.x, cerramiento.position.y, p.z + offsetCerr.z);
      } else if (arrastrando.userData.yFija !== undefined){
        // pluma grúa montada sobre la cubierta: conserva su altura fija al arrastrarla
        const nx = Math.min(CFG.limites.xMax, Math.max(CFG.limites.xMin, p.x));
        const nz = Math.min(CFG.limites.zMax, Math.max(CFG.limites.zMin, p.z));
        arrastrando.position.set(nx, arrastrando.userData.yFija, nz);
      } else {
        const nx = Math.min(CFG.limites.xMax, Math.max(CFG.limites.xMin, p.x));
        const nz = Math.min(CFG.limites.zMax, Math.max(CFG.limites.zMin, p.z));
        const inf = arrastrando.userData.info;
        arrastrando.position.set(nx, alturaApoyo(nx, nz, inf.w, inf.d), nz);
      }
      if (seleccionado === arrastrando) actualizarUbicacion(arrastrando);
    }
    return;
  }
  if (rotando){
    camCtrl.theta -= dx * 0.0055;
    camCtrl.phi   = Math.min(1.52, Math.max(0.12, camCtrl.phi - dy * 0.0045));
  } else if (paneando){
    moverCamaraPantalla(dx, dy);
  }
});

renderer.domElement.addEventListener('pointercancel', e => {
  punterosTactiles.delete(e.pointerId);
  if (punterosTactiles.size < 2) pinza = null;
});

renderer.domElement.addEventListener('pointerup', e => {
  if (e.pointerType === 'touch'){
    punterosTactiles.delete(e.pointerId);
    if (punterosTactiles.size < 2) pinza = null;
  }
  const eraArrastre = arrastrando;
  arrastrando = null; rotando = false; paneando = false;
  if (movido < 6 && e.button === 0 && !modoFlujo){
    rayoDesdeEvento(e);
    if (vistaPiso4){
      const hitsA = raycaster.intersectObjects(aptosClick);
      if (hitsA.length){ abrirApto(hitsA[0].object.userData.apto); return; }
    }
    const todo = [...draggables, edificio, ...malacates, cerramiento];
    const hits = raycaster.intersectObjects(todo, true);
    if (hits.length){
      if (!vistaPiso4 && esPiso5(hits[0].object)){ abrirHojaPiso5(); return; }
      seleccionar(buscarRaiz(hits[0].object));
    }
  } else if (eraArrastre){
    if (seleccionado === eraArrastre) actualizarUbicacion(eraArrastre);
    guardarCompartido();
    // validación visual al soltar: si el elemento movido (o la grúa) dejó
    // algo fuera de alcance o una vía angosta, se avisa de inmediato
    if (typeof validarObra === 'function'){
      const n = eraArrastre.userData.info.nombre;
      const esGrua = eraArrastre.userData.tipoEquipo === 'plumaGrua';
      const alerta = validarObra().find(a => esGrua || a.indexOf('"' + n + '"') >= 0);
      if (alerta) avisoGuardado('⚠ ' + alerta);
    }
  }
});

renderer.domElement.addEventListener('wheel', e => {
  camCtrl.radius = Math.min(500, Math.max(12, camCtrl.radius * (1 + e.deltaY * 0.001)));
}, { passive:true });

/* ---- Selección + panel (3 pestañas: Selección / Modificar / Ficha técnica) ---- */
const pTitulo = document.getElementById('pTitulo');
const pBody   = document.getElementById('pInfoGeneral');   // pestaña "Selección": info general
const pModificar = document.getElementById('pModificar');  // pestaña "Modificar": acciones
const pFicha  = document.getElementById('pFichaTecnica');  // pestaña "Ficha técnica": datos técnicos

/* resumen del proyecto: es lo que se ve en "Selección" cuando no hay nada
   elegido en el 3D (y también tras eliminar el elemento seleccionado) */
function infoGeneralProyecto(){
  return '<div class="bimGrid">' +
      '<div class="bimCard"><span>Ubicación</span><b>Marinilla, Antioquia</b></div>' +
      '<div class="bimCard"><span>Torres</span><b>2 (01 y 02), en línea</b></div>' +
      '<div class="bimCard"><span>Apartamentos</span><b>120 (80 + 40) · A–L</b></div>' +
      '<div class="bimCard"><span>Niveles</span><b>10 pisos + cubierta · 3 sótanos</b></div>' +
      '<div class="bimCard"><span>Altura</span><b>26,50 m · entrepiso 2,65 m</b></div>' +
      '<div class="bimCard"><span>Lote</span><b>163,00 × 47,00 m</b></div>' +
      '<div class="bimCard"><span>Fase actual</span><b>Cerramientos y acabados</b></div>' +
      '<div class="bimCard"><span>Personal en pico</span><b>305 trabajadores</b></div>' +
    '</div>' +
    '<div class="bimNota">' + icono('etiqueta') +
      '<div><b>Arquitectura sostenible</b>Torre 02 en bambú estructural certificado; el bambú actúa como sumidero de CO₂ y compensa parte de las emisiones del hormigón de la Torre 01.</div>' +
    '</div>' +
    '<div class="desc" style="margin-top:12px">Haz clic sobre cualquier elemento (torre, malacate, cerramiento o provisionales) para ver su información, modificarlo en la pestaña <b>Modificar</b> o consultar su <b>ficha técnica</b>.</div>';
}
/* estado sin selección: se llama al arrancar y cada vez que se elimina el
   elemento que estaba elegido (creador.js, equipos.js, escena.js) */
function mostrarPanelSinSeleccion(){
  pTitulo.textContent = 'Panel de obra';
  pBody.innerHTML = infoGeneralProyecto();
  pModificar.innerHTML = '<div class="desc">Selecciona un elemento en la obra para bloquearlo, girarlo, renombrarlo, cambiar su color o eliminarlo.</div>';
  pFicha.innerHTML = '<div class="desc">Selecciona un elemento en la obra para ver su ficha técnica: dimensiones, material, cerramiento y aforo.</div>';
}
/* color "actual" de un elemento (para precargar el selector de color de la
   pestaña Modificar): toma el color del primer material que encuentre */
function colorActualHex(g){
  let hex = null;
  g.traverse(n => { if (!hex && n.isMesh && n.material && n.material.color) hex = '#' + n.material.color.getHexString(); });
  return hex;
}

function actualizarTinte(obj){
  if (!obj) return;
  // los objetos NO se tiñen por estado; solo se resalta el seleccionado (ámbar)
  // o el área de un rol del organigrama. El bloqueo se indica en el texto del panel.
  const color = obj === seleccionado ? 0x554400
    : (rolPintado && esObjetivoRol(ORG[rolPintado], obj)) ? ORG[rolPintado].emissive
    : 0x000000;
  obj.traverse(n => {
    if (n.isMesh && n.material && n.material.emissive !== undefined){
      n.material.emissive = new THREE.Color(color);
    }
  });
}
/* Gira la zona seleccionada sobre su propio eje (45° por toque).
   Solo aplica a los provisionales: el edificio y el cerramiento no giran. */
function girarSeleccionado(dir){
  if (!seleccionado || !draggables.includes(seleccionado)) return;
  if (seleccionado.userData.bloqueado){
    avisoGuardado('Zona bloqueada: desbloquéala para girarla');
    return;
  }
  seleccionado.rotation.y += dir * Math.PI / 4;
  const grados = Math.round(((seleccionado.rotation.y * 180 / Math.PI) % 360 + 360) % 360);
  guardarCompartido();
  avisoGuardado(seleccionado.userData.info.nombre + ' girado (' + grados + '°)');
}
function toggleBloqueo(){
  if (!seleccionado) return;
  seleccionado.userData.bloqueado = !seleccionado.userData.bloqueado;
  actualizarTinte(seleccionado);
  seleccionar(seleccionado);
  guardarCompartido();
  avisoGuardado(seleccionado.userData.bloqueado ? 'Objeto bloqueado' : 'Objeto desbloqueado');
}
/* pestaña "Selección": info general (qué es, para qué sirve) */
function renderInfoGeneral(obj){
  const d = obj.userData.info;
  return '<div class="desc">' + (d.descripcion || 'Sin descripción.') + '</div>';
}
/* pestaña "Modificar": bloqueo, girar, renombrar, cambiar color, eliminar.
   Renombrar/recolorear/eliminar solo aplican a elementos con idEstable
   (provisionales de fábrica, espacios/edificios y equipos personalizados) —
   la torre, el cerramiento y los malacates son estructura fija de la obra. */
function renderModificar(obj){
  const d = obj.userData.info;
  const esProvisional = draggables.includes(obj);
  const id = obj.userData.idEstable || '';
  let html = '';
  if (esProvisional){
    html += '<button class="btnBloqueo ' + (obj.userData.bloqueado ? 'bloqueado' : 'libre') + '" onclick="toggleBloqueo()">' + icono(obj.userData.bloqueado ? 'candadoAbierto' : 'candado') + (obj.userData.bloqueado ? 'Bloqueado — toca para desbloquear' : 'Libre — toca para bloquear') + '</button>' +
      '<div style="display:flex; gap:6px; margin-top:8px"><button style="flex:1" onclick="girarSeleccionado(-1)">' + icono('girarIzq') + 'Girar 45°</button><button style="flex:1" onclick="girarSeleccionado(1)">' + icono('girarDer') + 'Girar 45°</button></div>';
  }
  if (obj.userData.esMalacate){
    html += '<div style="display:flex; gap:6px; margin-top:8px">' +
      '<button style="flex:1" onclick="agregarMalacate()">' + icono('mas') + 'Agregar otro malacate</button>' +
      (malacates.length > 1 ? '<button style="flex:1" class="btnEliminar" onclick="eliminarMalacate(seleccionado.userData.info.nombre)">' + icono('basura') + 'Eliminar este</button>' : '') +
      '</div>';
  }
  if (obj.userData.esAndamio){
    html += '<div class="desc" style="margin-top:8px">' +
      '<b class="txtFuerte">Nivel actual: Piso ' + (obj.userData.pisoActual + 1) + '</b><br>' +
      '<input type="range" style="width:100%; margin-top:4px" min="' + obj.userData.pisoDesde + '" max="' + obj.userData.pisoHasta + '" step="1" value="' + obj.userData.pisoActual + '" onchange="moverAndamio(this.value)">' +
      '<small>Puede recorrer del piso ' + (obj.userData.pisoDesde + 1) + ' al piso ' + (obj.userData.pisoHasta + 1) + '</small>' +
      '</div>';
  }
  if (obj.userData.tipoEquipo === 'plumaGrua'){
    html += '<div class="desc" style="margin-top:8px">' +
      '<b class="txtFuerte">Brazo y radio de giro</b>' +
      '<div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap; align-items:center">' +
        '<label style="display:flex; align-items:center; gap:4px">Brazo (m) <input id="modBrazo" type="number" min="8" max="40" step="1" value="' + obj.userData.brazo + '" style="width:60px"></label>' +
        '<label style="display:flex; align-items:center; gap:4px">Radio (m) <input id="modRadio" type="number" min="10" max="50" step="1" value="' + obj.userData.radioGrua + '" style="width:64px"></label>' +
        '<button style="width:auto" title="Aplicar" onclick="modificarGrua()">' + icono('check') + ' Aplicar</button>' +
      '</div>' +
      '<small>El anillo amarillo sobre el terreno muestra el alcance real y su medida.</small>' +
      '</div>';
  }
  if (id){
    html += '<div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--borde)">' +
      '<label style="display:block">Nombre' +
        '<div style="display:flex; gap:6px; margin-top:3px"><input id="modNombre" maxlength="40" value="' + esc(d.nombre) + '" style="flex:1"><button style="width:auto" title="Aplicar" onclick="renombrarSeleccionado()">' + icono('check') + '</button></div>' +
      '</label>' +
      '<label style="display:block; margin-top:10px">Color' +
        '<div style="display:flex; gap:6px; margin-top:3px; align-items:center"><input type="color" id="modColor" value="' + (colorActualHex(obj) || '#3f7fbf') + '"><button style="width:auto" title="Aplicar" onclick="recolorearSeleccionado()">' + icono('check') + ' Aplicar</button></div>' +
      '</label>' +
    '</div>' +
    '<button class="btnEliminar" style="margin-top:12px" onclick="eliminarSeleccionado()">' + icono('basura') + 'Eliminar de la obra</button>';
  } else if (obj === cerramiento){
    html += '<div class="desc" style="margin-top:12px">El cerramiento perimetral es una sola pieza: arrástralo desde el lienzo (clic y arrastrar sobre cualquier tramo) para reubicarlo completo. No se puede girar, bloquear, renombrar, recolorear ni eliminar desde aquí.</div>';
  } else {
    html += '<div class="desc" style="margin-top:12px">Este elemento es parte de la estructura fija de la obra (torre o malacate) y no se puede renombrar, recolorear ni eliminar desde aquí.</div>';
  }
  if (esProvisional){
    html += '<button style="margin-top:10px" onclick="programarCamionZona(seleccionado.userData.info.nombre)">' + icono('camion') + 'Programar camión a esta zona</button>';
  }
  return html;
}
/* pestaña "Ficha técnica": dimensiones, altura, material, cerramiento, aforo */
function renderFichaTecnica(obj){
  const d = obj.userData.info;
  const dim = d.dimensiones || ((typeof d.w === 'number' && typeof d.d === 'number') ? (d.w + ' × ' + d.d + ' m') : '—');
  const alt = d.altura || (d.h ? (d.h + ' m') : '—');
  let html = '<table>' +
    '<tr><td>Dimensiones</td><td>' + dim + '</td></tr>' +
    '<tr><td>Altura</td><td>' + alt + '</td></tr>' +
    '<tr><td>Material</td><td>' + (d.material || '—') + '</td></tr>' +
    '<tr><td>Cerramiento</td><td>' + (d.cerramiento || '—') + '</td></tr>' +
    '<tr><td>Aforo máximo</td><td>' + (d.aforo || '—') + '</td></tr>' +
    '</table>' +
    '<button style="margin-top:10px" onclick="abrirPlanos(seleccionado.userData.info.nombre)">' + icono('plano') + 'Ficha técnica, planos y enlaces</button>';
  if (obj.userData.esEdificio){
    html += '<button style="margin-top:8px" onclick="togglePiso4()">' + icono('edificio') + 'Ver Piso 4 en detalle</button>' +
      '<button style="margin-top:8px" onclick="abrirHojaPiso5()">' + icono('abrir') + 'Abrir hoja del Piso 5</button>';
  }
  return html;
}
function seleccionar(obj){
  if (!obj) return;
  const anterior = seleccionado;
  seleccionado = obj;
  actualizarTinte(anterior);
  actualizarTinte(obj);
  const d = obj.userData.info;
  pTitulo.textContent = d.nombre;
  pBody.innerHTML = renderInfoGeneral(obj);
  pModificar.innerHTML = renderModificar(obj);
  pFicha.innerHTML = renderFichaTecnica(obj);
  // en móvil el cajón se muestra plegado (solo el nombre + flecha); el usuario
  // toca la flecha para desplegar toda la descripción
  posicionarPad();
}
function actualizarUbicacion(obj){
  const u = document.getElementById('pUbic');
  if (!u) return;
  const rx = (obj.position.x + CFG.largo/2).toFixed(1);
  const rz = (obj.position.z + CFG.fondo/2).toFixed(1);
  u.textContent = 'x: ' + rx + ' m · y: ' + rz + ' m (desde esquina de torre)';
}
