/* Arranque: botones de la UI, vista Piso 4, menú móvil y bucle de animación */

aplicarIconos();
repintarTodo();   // semáforo inicial: provisionales libres en verde, bloqueados en rojo

/* al pulsar "Ver la obra" (Play) en la portada: revela la obra con un
   barrido de cámara desde una vista alta y lejana hasta la vista normal */
(function(){
  const btn = document.getElementById('inicioBtn');
  if (btn) btn.addEventListener('click', () => {
    camCtrl.target.set(4, 9, -4);
    camCtrl.radius = 400; camCtrl.theta = 1.0; camCtrl.phi = 0.32;
    actualizarCamara();
    irA(0, 6, -8, 170, 0.5, 1.22, 2200);
  });
})();

/* ---- Menú móvil y panel plegable (solo visible en pantallas pequeñas) ---- */
document.getElementById('btnMenu').onclick = () => {
  document.getElementById('ui').classList.toggle('abierto');
};
document.getElementById('pTitulo').onclick = () => {
  document.getElementById('panel').classList.toggle('abierto');
  posicionarPad();
};

/* ---- Pad de navegación: se reubica según el borde real del panel para
   nunca quedar encima de su texto (más fiable que usar unidades vh, que
   varían con la barra de direcciones del navegador móvil). El panel no
   tiene transición en móvil, así que la medición es siempre instantánea
   y exacta, sin necesidad de esperar ninguna animación. ---- */
function posicionarPad(){
  const pad = document.getElementById('pad');
  const panel = document.getElementById('panel');
  if (!pad || !panel || getComputedStyle(pad).display === 'none') return;
  const top = panel.getBoundingClientRect().top;
  pad.style.bottom = Math.max(64, innerHeight - top + 14) + 'px';
}
addEventListener('resize', posicionarPad);
posicionarPad();

/* ============ 13. UI + LOOP ============ */
let vistaPiso4 = false;
function setFantasma(grupo, on){
  grupo.traverse(n => {
    if (n.isMesh){
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach(m => {
        const op0 = (m.userData && m.userData.op0 !== undefined) ? m.userData.op0 : 1;
        m.transparent = on || op0 < 1;
        m.opacity = on ? 0.07 : op0;
        m.depthWrite = !on;
      });
    }
  });
}
function togglePiso4(){
  vistaPiso4 = !vistaPiso4;
  if (vistaPiso4 && vistaSotanos) toggleSotanos();   // una vista de corte a la vez
  // corte arquitectónico: se ocultan el cajón genérico del piso 4 (la planta
  // detallada lo reemplaza) y todos los pisos superiores; atenuarlos no
  // servía porque 6 pisos translúcidos acumulaban una neblina que tapaba todo
  for (let i=3; i<CFG.pisos; i++) pisosMesh[i].visible = !vistaPiso4;
  techoG.visible = !vistaPiso4;
  setFantasma(retrocesosG, vistaPiso4);
  piso4.visible = vistaPiso4;
  document.getElementById('btnPiso4').innerHTML = icono('edificio') + (vistaPiso4 ? 'Ver torre completa' : 'Ver Piso 4');
  document.getElementById('btnPiso4').classList.toggle('activo', vistaPiso4);
  etiquetasTodas.forEach(s => { s.visible = vistaPiso4 ? false : etiquetasOn; });
  if (vistaPiso4){
    irA(2.3, y4 + 1, -1, 52, 0.3, 0.72);
    rangoMalacate.value = 3;
  } else {
    irA(0, 6, -8, 170, 0.5, 1.22);
  }
  actualizarBanner();
}
document.getElementById('btnPiso4').onclick = togglePiso4;

/* ---- Banner contextual: dice en qué vista de corte estás y cómo volver ----
   Se ubica DEBAJO de la barra de herramientas real (no a una altura fija):
   como la barra puede ocupar una o dos filas según cuántos grupos de
   botones tenga, un top fijo terminaba tapando la segunda fila en
   pantallas angostas o con varios grupos. En móvil manda el CSS (top fijo
   bajo el botón "Menú" plegado), así que ahí no se toca el estilo. */
function posicionarBanner(){
  const ui = document.getElementById('ui');
  if (!ui) return;
  const bajoBarra = Math.round(ui.getBoundingClientRect().bottom + 10) + 'px';
  const enMovil = innerWidth <= 820;
  // los dos avisos flotantes que aparecen bajo la barra: el banner de las
  // vistas de corte y el aviso de "Dibujar ruta". Ambos se sitúan justo bajo
  // la barra real (que crece a dos filas al haber más grupos). En móvil manda
  // el CSS (top fijo bajo el botón "Menú" plegado).
  ['vistaBanner', 'modoAviso'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.top = enMovil ? '' : bajoBarra;
  });
}
addEventListener('resize', posicionarBanner);
function actualizarBanner(){
  const banner = document.getElementById('vistaBanner');
  const txt = document.getElementById('vistaBannerTxt');
  let mensaje = '';
  if (vistaPiso4) mensaje = 'Corte del Piso 4 — haz clic sobre un apartamento para ver su detalle';
  else if (vistaSotanos) mensaje = 'Corte de sótanos S1-S3 — el terreno se ve translúcido';
  txt.textContent = mensaje;
  banner.style.display = mensaje ? 'inline-flex' : 'none';
  if (mensaje) posicionarBanner();
}
document.getElementById('vistaBannerBtn').onclick = () => {
  if (vistaPiso4) togglePiso4();
  if (vistaSotanos) toggleSotanos();
};

/* ---- Vista de sótanos: muestra el corte S1-S3 y aclara el terreno ---- */
let vistaSotanos = false;
const btnSotanos = document.getElementById('btnSotanos');
function toggleSotanos(){
  vistaSotanos = !vistaSotanos;
  if (vistaSotanos && vistaPiso4) togglePiso4();
  sotanosG.visible = vistaSotanos;
  superficiesTerreno.forEach(m => {
    m.material.transparent = vistaSotanos;
    m.material.opacity = vistaSotanos ? 0.18 : 1;
    m.material.depthWrite = !vistaSotanos;
  });
  btnSotanos.innerHTML = icono('bajar') + (vistaSotanos ? 'Ocultar sótanos' : 'Sótanos');
  btnSotanos.classList.toggle('activo', vistaSotanos);
  if (vistaSotanos) irA(12, -5, 1, 92, 0.35, 1.38);
  else irA(0, 6, -8, 170, 0.5, 1.22);
  actualizarBanner();
}
btnSotanos.onclick = toggleSotanos;

const btnFlujo = document.getElementById('btnFlujo');
const btnFin   = document.getElementById('btnFin');
btnFlujo.onclick = () => {
  modoFlujo = !modoFlujo;
  btnFlujo.classList.toggle('activo', modoFlujo);
  btnFin.style.display = modoFlujo ? '' : 'none';
  document.getElementById('modoAviso').style.display = modoFlujo ? 'block' : 'none';
  if (modoFlujo) posicionarBanner();   // ubica el aviso bajo la barra (no la tapa)
  if (!modoFlujo) finalizarRuta();
};
btnFin.onclick = () => { finalizarRuta(); };
document.getElementById('btnBorrar').onclick = borrarRutas;

/* ---- ayuda de controles: se puede ocultar (queda solo el botón redondo) ---- */
(function(){
  const ayuda = document.getElementById('ayuda');
  const toggle = document.getElementById('ayudaToggle');
  if (!ayuda || !toggle) return;
  let oculta = false;
  try { oculta = localStorage.getItem('planoObra3D_ayudaOculta') === '1'; } catch (e) {}
  function set(v){
    oculta = v;
    ayuda.classList.toggle('colapsada', oculta);
    toggle.textContent = oculta ? '?' : '✕';
    toggle.title = oculta ? 'Mostrar la ayuda de controles' : 'Ocultar esta ayuda';
    try { localStorage.setItem('planoObra3D_ayudaOculta', oculta ? '1' : '0'); } catch (e) {}
  }
  toggle.onclick = () => set(!oculta);
  set(oculta);
})();

let etiquetasOn = true;
function setEtiquetas(on){
  etiquetasOn = on;
  etiquetasTodas.forEach(s => { s.visible = etiquetasOn && !vistaPiso4; });
  document.getElementById('btnEtiquetas').classList.toggle('activo', !etiquetasOn);
  document.getElementById('padEtiquetas').classList.toggle('activo', !etiquetasOn);
}
document.getElementById('btnEtiquetas').onclick = () => setEtiquetas(!etiquetasOn);
document.getElementById('padEtiquetas').onclick = () => {
  setEtiquetas(!etiquetasOn);
  avisoGuardado(etiquetasOn ? 'Etiquetas visibles' : 'Etiquetas ocultas');
};

// en el celular las etiquetas arrancan ocultas para despejar la vista
// (se activan con el botón del ojo en el pad o con "Etiquetas" en el menú)
if (innerWidth <= 820) setEtiquetas(false);

/* ---- Pad de navegación táctil: flechas = desplazarse, +/− = zoom ----
   Mantener presionado repite el movimiento (como un joystick). */
const PAD_ACCIONES = {
  arriba:    () => moverCamaraPantalla(0, 16),
  abajo:     () => moverCamaraPantalla(0, -16),
  izquierda: () => moverCamaraPantalla(16, 0),
  derecha:   () => moverCamaraPantalla(-16, 0),
  acercar:   () => { camCtrl.radius = Math.max(12, camCtrl.radius * 0.95); },
  alejar:    () => { camCtrl.radius = Math.min(500, camCtrl.radius * 1.055); }
};
document.querySelectorAll('#pad button[data-mover]').forEach(btn => {
  const accion = PAD_ACCIONES[btn.dataset.mover];
  let repetidor = null;
  const iniciar = e => {
    e.preventDefault(); e.stopPropagation();
    accion();
    clearInterval(repetidor);
    repetidor = setInterval(accion, 70);
  };
  const detener = () => { clearInterval(repetidor); repetidor = null; };
  btn.addEventListener('pointerdown', iniciar);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, detener));
});

// esconder / mostrar el mando en el celular
const padToggle = document.getElementById('padToggle');
padToggle.addEventListener('click', () => {
  const contraido = document.getElementById('pad').classList.toggle('contraido');
  padToggle.innerHTML = icono(contraido ? 'mando' : 'menos');
  padToggle.title = contraido ? 'Mostrar el mando' : 'Ocultar el mando';
  posicionarPad();
});

const nivelTxt = document.getElementById('nivelTxt');
const chkAuto = document.getElementById('chkAuto');
let nivelMalacate = 0;
rangoMalacate.addEventListener('change', guardarCompartido);

selectorUI.onchange = () => {
  const i = selectorUI.value;
  if (i === '') return;
  const o = draggables[i];
  seleccionar(o);
  irA(o.position.x, 2, o.position.z, 55, camCtrl.theta, 1.1);
  selectorUI.value = '';
};

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// restaurar la distribución compartida del equipo (Supabase); si no hay
// conexión, usa la copia local o dibuja la ruta de ejemplo del informe
cargarCompartido();

const reloj = new THREE.Clock();
let tiempo = 0;
let numFrame = 0;
const dirTmp = new THREE.Vector3();
const puntoTmp = new THREE.Vector3();
const tangenteTmp = new THREE.Vector3();
const ejeYTmp = new THREE.Vector3(0, 1, 0);
function animar(){
  requestAnimationFrame(animar);
  const dt = Math.min(reloj.getDelta(), 0.05);
  tiempo += dt;

  if (animCam){
    let k = (performance.now() - animCam.t0) / animCam.dur;
    if (k >= 1) k = 1;
    const e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
    camCtrl.target.set(
      animCam.de.x + (animCam.a.x - animCam.de.x)*e,
      animCam.de.y + (animCam.a.y - animCam.de.y)*e,
      animCam.de.z + (animCam.a.z - animCam.de.z)*e
    );
    camCtrl.radius = animCam.de.r + (animCam.a.r - animCam.de.r)*e;
    camCtrl.theta  = animCam.de.th + (animCam.a.th - animCam.de.th)*e;
    camCtrl.phi    = animCam.de.ph + (animCam.a.ph - animCam.de.ph)*e;
    if (k === 1) animCam = null;
  }

  // malacate (30-40 m/min a escala visual)
  let objetivo = parseFloat(rangoMalacate.value);
  if (chkAuto.checked){
    objetivo = (Math.sin(tiempo*0.35)*0.5 + 0.5) * 9;
    rangoMalacate.value = objetivo;
  }
  nivelMalacate += (objetivo - nivelMalacate) * 0.06;
  const yCabina = 0.2 + nivelMalacate * CFG.hPiso;
  malacates.forEach(m => { m.userData.cabina.position.y = yCabina; });
  // escribir en el DOM solo cuando el nivel cambia (60 escrituras/s → ~1)
  const nivelEtiqueta = 'P' + (Math.round(nivelMalacate) + 1);
  if (nivelTxt.textContent !== nivelEtiqueta) nivelTxt.textContent = nivelEtiqueta;

  // personas
  personas.forEach(p => {
    dirTmp.subVectors(p.obj, p.g.position);
    dirTmp.y = 0;
    if (dirTmp.length() < 1.2){ p.obj = nuevoObjetivo(); return; }
    dirTmp.normalize();
    p.g.position.addScaledVector(dirTmp, p.vel * dt);
    p.g.rotation.y = Math.atan2(dirTmp.x, dirTmp.z);
    p.g.position.y = alturaTerreno(p.g.position.x, p.g.position.z)
      + 0.1 + Math.abs(Math.sin(tiempo*8 + p.vel*10)) * 0.04;
  });

  // flechas de flujo
  rutas.forEach(r => {
    if (!r.curva || !r.flechas) return;
    r.flechas.forEach((f, i) => {
      const u = (tiempo*0.08 + r.offset + i/r.flechas.length) % 1;
      r.curva.getPointAt(u, puntoTmp);
      r.curva.getTangentAt(u, tangenteTmp);
      f.position.copy(puntoTmp);
      f.quaternion.setFromUnitVectors(ejeYTmp, tangenteTmp.normalize());
    });
  });

  actualizarCamiones(dt);

  actualizarCamara();
  numFrame++;
  if (numFrame % 3 === 0) renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  vigilarRendimiento();
}

/* ---- Degradación automática de calidad si el equipo va lento ----
   Mide los FPS reales cada 4 s; si bajan de 24, reduce la resolución de
   render y, si sigue lento, apaga las sombras. Así la app se mantiene
   fluida también en equipos y celulares modestos. */
let fpsFrames = 0, fpsT0 = performance.now(), nivelRendimiento = 0;
function vigilarRendimiento(){
  fpsFrames++;
  const t = performance.now();
  if (t - fpsT0 < 4000) return;
  const fps = fpsFrames * 1000 / (t - fpsT0);
  fpsFrames = 0; fpsT0 = t;
  if (fps >= 24 || nivelRendimiento >= 2) return;
  nivelRendimiento++;
  if (nivelRendimiento === 1){
    renderer.setPixelRatio(1);
  } else {
    renderer.shadowMap.enabled = false;
    scene.traverse(n => {
      if (n.isMesh && n.material){
        (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => { m.needsUpdate = true; });
      }
    });
  }
}

actualizarCamara();
animar();
