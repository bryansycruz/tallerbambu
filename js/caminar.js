/* Modo Caminar (primera persona por la obra) + Manejar (subirse a un
   montacargas, carretilla, plataforma de transporte, andamio colgante,
   torre grúa o malacate cercano con E). Mantener una tecla de movimiento
   ACELERA progresivamente hasta el tope; soltarla frena rápido. */

let caminando = false;
const camWalk = { x: 0, z: 0, yaw: Math.PI, pitch: 0 };
const teclasCaminar = {};

function toggleCaminar(){
  if (manejando) bajarDeVehiculo();   // no se puede alternar caminar mientras se maneja
  caminando = !caminando;
  const btn = document.getElementById('btnCaminar');
  btn.classList.toggle('activo', caminando);
  btn.innerHTML = caminando ? icono('volver') + 'Salir' : icono('caminar') + 'Caminar';
  if (caminando){
    if (vistaPiso4) togglePiso4();
    if (vistaSotanos) toggleSotanos();
    if (modoFlujo) document.getElementById('btnFlujo').click();
    if (modoVia) document.getElementById('btnVia').click();
    if (modoRegla) toggleRegla();
    const entrada = entradaObra || { x: CFG.limites.xMax - 10, z: 0 };
    camWalk.x = entrada.x; camWalk.z = entrada.z;
    camWalk.yaw = Math.atan2(0 - camWalk.x, 0 - camWalk.z); camWalk.pitch = 0;
    animCam = null;
    try { renderer.domElement.requestPointerLock(); } catch (e) {}
    avisoGuardado('Caminando por la obra: W A S D o flechas · Shift corre · mueve el mouse para mirar · Esc sale');
  } else {
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    Object.keys(teclasCaminar).forEach(k => delete teclasCaminar[k]);
    actualizarCamara();
    avisoGuardado('Saliste del modo caminar');
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
    camWalk.x = Math.min(CFG.limites.xMax, Math.max(CFG.limites.xMin, camWalk.x + (fx * adelante - fz * lado) * velCaminarActual * dt));
    camWalk.z = Math.min(CFG.limites.zMax, Math.max(CFG.limites.zMin, camWalk.z + (fz * adelante + fx * lado) * velCaminarActual * dt));
  }
  camera.position.set(camWalk.x, 1.7, camWalk.z);
  camera.lookAt(
    camWalk.x + Math.sin(camWalk.yaw) * Math.cos(camWalk.pitch),
    1.7 + Math.sin(camWalk.pitch),
    camWalk.z + Math.cos(camWalk.yaw) * Math.cos(camWalk.pitch)
  );
}

/* ---- Manejar: subirse a un equipo cercano ----
   Móviles (avanzan de verdad con W/A/S/D): montacargas, carretilla,
   plataforma de transporte. Fijos (solo miradores elevados, como el
   malacate y la torre grúa): andamio colgante, torre grúa y el/los
   malacate(s) de la obra. */
let manejando = null;
let velManejarActual = 0;
const RADIO_SUBIR = 7;
const TIPOS_CONDUCIBLES = ['montacargasElectrico', 'montacargasManual', 'carretilla', 'plataformaTransporte'];
const TIPOS_FIJOS = ['andamioColgante', 'plumaGrua'];
function esConducible(g){ return TIPOS_CONDUCIBLES.includes(g.userData.tipoEquipo); }
function esManejableFijo(g){ return !!g.userData.esMalacate || TIPOS_FIJOS.includes(g.userData.tipoEquipo); }
function esVehiculoManejable(g){ return esConducible(g) || esManejableFijo(g); }
function elementoCercanoParaSubir(){
  const px = caminando ? camWalk.x : camCtrl.target.x;
  const pz = caminando ? camWalk.z : camCtrl.target.z;
  let mejor = null, mejorD = RADIO_SUBIR;
  [...draggables, ...malacates].forEach(g => {
    if (!esVehiculoManejable(g)) return;
    const dist = Math.hypot(g.position.x - px, g.position.z - pz);
    if (dist < mejorD){ mejorD = dist; mejor = g; }
  });
  return mejor;
}
function toggleManejar(){
  if (manejando){ bajarDeVehiculo(); return; }
  if (modoFlujo || modoVia || modoRegla) return;
  const g = elementoCercanoParaSubir();
  if (!g){ avisoGuardado('Acércate a un montacargas, carretilla, plataforma, andamio, torre grúa o malacate y presiona E'); return; }
  if (g.userData.bloqueado){ avisoGuardado('"' + g.userData.info.nombre + '" está bloqueado — desbloquéalo para subirte'); return; }
  manejando = g;
  velManejarActual = 0;
  seleccionar(g);
  if (!caminando){
    caminando = true;
    document.getElementById('btnCaminar').classList.add('activo');
    try { renderer.domElement.requestPointerLock(); } catch (e) {}
  }
  const fijo = esManejableFijo(g);
  avisoGuardado('Subido a "' + g.userData.info.nombre + '"' + (fijo
    ? ' (mirador fijo) — E o Esc para bajarte'
    : ': W A S D / flechas para manejar, mantén para acelerar, T o Shift = turbo — E o Esc para bajarte'));
}
function bajarDeVehiculo(){
  if (!manejando) return;
  const nombre = manejando.userData.info.nombre;
  camWalk.x = manejando.position.x + Math.sin(manejando.rotation.y + Math.PI / 2) * 3;
  camWalk.z = manejando.position.z + Math.cos(manejando.rotation.y + Math.PI / 2) * 3;
  camWalk.yaw = manejando.rotation.y; camWalk.pitch = 0;
  guardarCompartido('Movido: ' + nombre);
  manejando = null;
  avisoGuardado('Bajaste de "' + nombre + '"');
}
const _cajaManejarTmp = new THREE.Box3();
const _tamManejarTmp = new THREE.Vector3();
function moverVehiculoManejado(dt){
  if (!manejando || !draggables.includes(manejando)){ manejando = null; return; }
  if (esConducible(manejando) && !manejando.userData.bloqueado){
    const t = teclasCaminar;
    const adelante = ((t.KeyW || t.ArrowUp) ? 1 : 0) - ((t.KeyS || t.ArrowDown) ? 1 : 0);
    const girar = ((t.KeyA || t.ArrowLeft) ? 1 : 0) - ((t.KeyD || t.ArrowRight) ? 1 : 0);
    const velMax = (t.ShiftLeft || t.ShiftRight || t.KeyT) ? 10 : 5;   // T = turbo, igual que mantener Shift
    velManejarActual = adelante
      ? Math.min(velMax, velManejarActual + dt * velMax * 1.8)
      : Math.max(0, velManejarActual - dt * velMax * 2.5);
    if (velManejarActual > 0.05){
      manejando.rotation.y += girar * dt * 1.3 * Math.sign(adelante || 1);
      const fx = Math.sin(manejando.rotation.y), fz = Math.cos(manejando.rotation.y);
      const nx = Math.min(CFG.limites.xMax, Math.max(CFG.limites.xMin, manejando.position.x + fx * velManejarActual * dt * adelante));
      const nz = Math.min(CFG.limites.zMax, Math.max(CFG.limites.zMin, manejando.position.z + fz * velManejarActual * dt * adelante));
      manejando.position.set(nx, manejando.position.y, nz);
      if (seleccionado === manejando) actualizarUbicacion(manejando);
    }
  }
  _cajaManejarTmp.setFromObject(manejando);
  _cajaManejarTmp.getSize(_tamManejarTmp);
  const alto = Math.max(1.6, _tamManejarTmp.y) + 2.5, dist = Math.max(5, Math.max(_tamManejarTmp.x, _tamManejarTmp.z) * 1.3);
  const cx = manejando.position.x - Math.sin(manejando.rotation.y) * dist;
  const cz = manejando.position.z - Math.cos(manejando.rotation.y) * dist;
  camera.position.set(cx, manejando.position.y + alto * 0.6, cz);
  camera.lookAt(manejando.position.x, manejando.position.y + alto * 0.3, manejando.position.z);
}
document.getElementById('btnCaminar').onclick = toggleCaminar;
