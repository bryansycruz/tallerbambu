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
  const hitsM = raycaster.intersectObject(malacate, true);
  if (hitsM.length){
    arrastrando = malacate;
    return;
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
      if (arrastrando.userData.esMalacate){
        const s = ajustarMalacate(p.x, p.z);
        arrastrando.position.set(s.x, 0, s.z);
        actualizarDescargue();
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
    const todo = [...draggables, edificio, malacate, cerramiento];
    const hits = raycaster.intersectObjects(todo, true);
    if (hits.length){
      if (!vistaPiso4 && esPiso5(hits[0].object)){ abrirHojaPiso5(); return; }
      seleccionar(buscarRaiz(hits[0].object));
    }
  } else if (eraArrastre){
    if (seleccionado === eraArrastre) actualizarUbicacion(eraArrastre);
    guardarCompartido();
  }
});

renderer.domElement.addEventListener('wheel', e => {
  camCtrl.radius = Math.min(500, Math.max(12, camCtrl.radius * (1 + e.deltaY * 0.001)));
}, { passive:true });

/* ---- Selección + panel ---- */
const pTitulo = document.getElementById('pTitulo');
const pBody   = document.getElementById('pBody');

function actualizarTinte(obj){
  if (!obj) return;
  // provisionales: semáforo de estado — rojo = bloqueado, verde = libre
  const esProv = obj.userData.esProvisional;
  const color = obj === seleccionado ? 0x554400
    : (rolPintado && esObjetivoRol(ORG[rolPintado], obj)) ? ORG[rolPintado].emissive
    : (obj.userData.bloqueado ? 0x8a1616 : (esProv ? 0x145020 : 0x000000));
  obj.traverse(n => {
    if (n.isMesh && n.material && n.material.emissive !== undefined){
      n.material.emissive = new THREE.Color(color);
    }
  });
}
function toggleBloqueo(){
  if (!seleccionado) return;
  seleccionado.userData.bloqueado = !seleccionado.userData.bloqueado;
  actualizarTinte(seleccionado);
  seleccionar(seleccionado);
  guardarCompartido();
  avisoGuardado(seleccionado.userData.bloqueado ? 'Objeto bloqueado' : 'Objeto desbloqueado');
}
function seleccionar(obj){
  if (!obj) return;
  const anterior = seleccionado;
  seleccionado = obj;
  actualizarTinte(anterior);
  actualizarTinte(obj);
  const d = obj.userData.info;
  pTitulo.textContent = d.nombre;
  const dim = d.dimensiones || (d.w + ' × ' + d.d + ' m');
  const alt = d.altura || (d.h + ' m');
  const esProvisional = draggables.includes(obj);
  pBody.innerHTML =
    '<table>' +
    '<tr><td>Dimensiones</td><td>' + dim + '</td></tr>' +
    '<tr><td>Altura</td><td>' + alt + '</td></tr>' +
    '<tr><td>Material</td><td>' + d.material + '</td></tr>' +
    '<tr><td>Cerramiento</td><td>' + d.cerramiento + '</td></tr>' +
    '<tr><td>Aforo máximo</td><td>' + (d.aforo || '—') + '</td></tr>' +
    '</table>' +
    '<div class="desc">' + d.descripcion + '</div>' +
    (esProvisional ? '<button onclick="toggleBloqueo()">' + icono(obj.userData.bloqueado ? 'candadoAbierto' : 'candado') + (obj.userData.bloqueado ? 'Desbloquear' : 'Bloquear en este lugar') + '</button>' : '') +
    (esProvisional ? '<button onclick="programarCamionZona(seleccionado.userData.info.nombre)">' + icono('camion') + 'Programar camión a esta zona</button>' : '') +
    '<button onclick="abrirPlanos(seleccionado.userData.info.nombre)">' + icono('plano') + 'Ficha técnica, planos y enlaces</button>' +
    (obj.userData.esEdificio ? '<button onclick="togglePiso4()">' + icono('edificio') + 'Ver Piso 4 en detalle</button>' +
      '<button onclick="abrirHojaPiso5()">' + icono('abrir') + 'Abrir hoja del Piso 5</button>' : '');
  // en móvil el panel es un cajón inferior: se abre al seleccionar un elemento
  document.getElementById('panel').classList.add('abierto');
  posicionarPad();
}
function actualizarUbicacion(obj){
  const u = document.getElementById('pUbic');
  if (!u) return;
  const rx = (obj.position.x + CFG.largo/2).toFixed(1);
  const rz = (obj.position.z + CFG.fondo/2).toFixed(1);
  u.textContent = 'x: ' + rx + ' m · y: ' + rz + ' m (desde esquina de torre)';
}
