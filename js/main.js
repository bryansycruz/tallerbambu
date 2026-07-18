/* Arranque: botones de la UI, vista Piso 4, menú móvil y bucle de animación */

aplicarIconos();
repintarTodo();   // semáforo inicial: provisionales libres en verde, bloqueados en rojo
mostrarPanelSinSeleccion();   // contenido inicial de las 3 pestañas del panel

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

/* ---- Minimizar/expandir la barra de herramientas (escritorio) ----
   Oculta los grupos de botones (Sótanos, Etiquetas, Camiones, etc.) dejando
   solo el botón para volver a mostrarlos; recuerda la preferencia. ---- */
(function(){
  const ui = document.getElementById('ui');
  const btn = document.getElementById('btnMin');
  if (!ui || !btn) return;
  let minimizado = false;
  try { minimizado = localStorage.getItem('planoObra3D_menuMin') === '1'; } catch (e) {}
  function set(v){
    minimizado = v;
    ui.classList.toggle('minimizado', minimizado);
    btn.innerHTML = minimizado ? icono('menu') + 'Menú' : icono('menos');
    btn.title = minimizado ? 'Mostrar el menú' : 'Minimizar el menú';
    try { localStorage.setItem('planoObra3D_menuMin', minimizado ? '1' : '0'); } catch (e) {}
    if (typeof posicionarBanner === 'function') posicionarBanner();
  }
  btn.onclick = () => set(!minimizado);
  set(minimizado);
})();
document.getElementById('pTitulo').onclick = () => {
  document.getElementById('panel').classList.toggle('abierto');
  posicionarPad();
};

/* ---- Ocultar/mostrar el panel de información a voluntad (escritorio).
   La ficha de un elemento puede estorbar la vista; este botón la pliega
   dejando solo el título, y recuerda la preferencia entre sesiones. ---- */
(function(){
  const panel = document.getElementById('panel');
  const btn = document.getElementById('panelToggle');
  if (!panel || !btn) return;
  let plegado = false;
  try { plegado = localStorage.getItem('planoObra3D_panelPlegado') === '1'; } catch (e) {}
  function set(v){
    plegado = v;
    panel.classList.toggle('plegado', plegado);
    btn.textContent = plegado ? '+' : '–';
    btn.title = plegado ? 'Mostrar el panel' : 'Ocultar el panel';
    try { localStorage.setItem('planoObra3D_panelPlegado', plegado ? '1' : '0'); } catch (e) {}
  }
  btn.onclick = e => { e.stopPropagation(); set(!plegado); };
  set(plegado);
})();

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
  document.getElementById('btnPiso4').innerHTML = '<span class="ic">' + icono('edificio') + '</span>' + (vistaPiso4 ? 'Ver torre completa' : 'Ver Piso 4');
  document.getElementById('btnPiso4').classList.toggle('activo', vistaPiso4);
  aplicarFiltroEtiquetas();
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
   Con el layout de sidebar (la barra ocupa toda la altura a la izquierda)
   la posición de los avisos la fija el CSS: arriba y centrados sobre el
   lienzo. Esta función solo limpia cualquier top en línea que quedara de
   la versión anterior (barra superior de una o dos filas). */
function posicionarBanner(){
  ['vistaBanner', 'modoAviso'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.top = '';
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
  btnSotanos.innerHTML = '<span class="ic">' + icono('bajar') + '</span>' + (vistaSotanos ? 'Ocultar sótanos' : 'Sótanos');
  btnSotanos.classList.toggle('activo', vistaSotanos);
  if (vistaSotanos) irA(12, -5, 1, 92, 0.35, 1.38);
  else irA(0, 6, -8, 170, 0.5, 1.22);
  actualizarBanner();
}
btnSotanos.onclick = toggleSotanos;

const btnFlujo = document.getElementById('btnFlujo');
const btnFin   = document.getElementById('btnFin');
const btnVia    = document.getElementById('btnVia');
const btnFinVia = document.getElementById('btnFinVia');
const TXT_AVISO_RUTA = 'Dibujando ruta: haz clic sobre el terreno para marcar el recorrido y termina con "Finalizar ruta"';
const TXT_AVISO_VIA  = 'Dibujando vía: haz clic sobre el terreno para marcar el tramo y termina con "Finalizar vía"';
btnFlujo.onclick = () => {
  if (typeof modoRegla !== 'undefined' && modoRegla) toggleRegla();
  if (typeof modoColocarPorteria !== 'undefined' && modoColocarPorteria) terminarColocarPorteria();
  modoFlujo = !modoFlujo;
  if (modoFlujo && modoVia){ modoVia = false; btnVia.classList.remove('activo'); btnFinVia.style.display = 'none'; finalizarVia(); }
  btnFlujo.classList.toggle('activo', modoFlujo);
  btnFin.style.display = modoFlujo ? '' : 'none';
  document.getElementById('modoAviso').textContent = TXT_AVISO_RUTA;
  document.getElementById('modoAviso').style.display = modoFlujo ? 'block' : 'none';
  if (modoFlujo) posicionarBanner();   // ubica el aviso bajo la barra (no la tapa)
  if (!modoFlujo) finalizarRuta();
};
btnFin.onclick = () => { finalizarRuta(); };
document.getElementById('btnBorrar').onclick = borrarRutas;

btnVia.onclick = () => {
  if (typeof modoRegla !== 'undefined' && modoRegla) toggleRegla();
  if (typeof modoColocarPorteria !== 'undefined' && modoColocarPorteria) terminarColocarPorteria();
  modoVia = !modoVia;
  if (modoVia && modoFlujo){ modoFlujo = false; btnFlujo.classList.remove('activo'); btnFin.style.display = 'none'; finalizarRuta(); }
  btnVia.classList.toggle('activo', modoVia);
  btnFinVia.style.display = modoVia ? '' : 'none';
  document.getElementById('modoAviso').textContent = TXT_AVISO_VIA;
  document.getElementById('modoAviso').style.display = modoVia ? 'block' : 'none';
  if (modoVia) posicionarBanner();
  if (!modoVia) finalizarVia();
};
btnFinVia.onclick = () => { finalizarVia(); };
document.getElementById('btnBorrarVias').onclick = borrarVias;

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
  aplicarFiltroEtiquetas();
  document.getElementById('padEtiquetas').classList.toggle('activo', !etiquetasOn);
}
document.getElementById('padEtiquetas').onclick = () => {
  setEtiquetas(!etiquetasOn);
  avisoGuardado(etiquetasOn ? 'Etiquetas visibles' : 'Etiquetas ocultas');
};

// en el celular las etiquetas arrancan ocultas para despejar la vista
// (se activan con el botón del ojo en el pad o desde "Etiquetas y cotas")
if (innerWidth <= 820) setEtiquetas(false);

/* ---- Cotas (medidas) de zonas y edificios: apagadas por defecto, el
   usuario las activa cuando las necesita; capturarPlanta() (analisis.js)
   las fuerza visibles al exportar el plano sin tocar esta preferencia. ---- */
function setCotas(on){
  mostrarCotas = on;
  gruposCotas.forEach(gr => { gr.visible = mostrarCotas; });
}

/* ---- Panel "Etiquetas y cotas": en vez de varios botones sueltos
   (Etiquetas/Etiquetas chicas/Cotas), un panel donde se elige QUÉ etiquetas
   se ven (por categoría) y el TAMAÑO de letra — para etiquetas y cotas por
   separado. Aplica en vivo a la vista 3D (y también al corte de Piso 4). */
function opcionesTamano(factorActual){
  return [[0.4,'Muy pequeña'],[0.6,'Pequeña'],[1,'Normal'],[1.4,'Grande']].map(([f, nombre]) =>
    '<option value="' + f + '"' + (factorActual === f ? ' selected' : '') + '>' + nombre + '</option>').join('');
}
function renderPanelEtiquetas(){
  document.getElementById('etqBody').innerHTML =
    '<label class="chk" style="display:block"><input type="checkbox" id="etqMaestro"' + (etiquetasOn ? ' checked' : '') +
      ' onchange="setEtiquetas(this.checked); renderPanelEtiquetas();"> Mostrar etiquetas</label>' +
    '<div style="margin:8px 0 12px 24px; opacity:' + (etiquetasOn ? '1' : '.45') + '">' +
      Object.keys(CATEGORIAS_ETIQUETA).map(cat =>
        '<label class="chk" style="display:block; margin-top:4px"><input type="checkbox"' +
        (categoriasEtiquetaVisibles[cat] !== false ? ' checked' : '') + (etiquetasOn ? '' : ' disabled') +
        ' onchange="categoriasEtiquetaVisibles[\'' + cat + '\'] = this.checked; aplicarFiltroEtiquetas();"> ' +
        CATEGORIAS_ETIQUETA[cat] + '</label>').join('') +
      '<label style="display:block; margin-top:10px; font-size:12.5px">Tamaño de letra<br>' +
        '<select style="width:100%; margin-top:3px"' + (etiquetasOn ? '' : ' disabled') +
        ' onchange="aplicarTamanoEtiquetas(parseFloat(this.value))">' + opcionesTamano(factorEtiquetas) + '</select></label>' +
    '</div>' +
    '<label class="chk" style="display:block; margin-top:6px"><input type="checkbox" id="etqCotasOn"' + (mostrarCotas ? ' checked' : '') +
      ' onchange="setCotas(this.checked); renderPanelEtiquetas();"> Mostrar cotas (medidas)</label>' +
    '<div style="margin:8px 0 0 24px; opacity:' + (mostrarCotas ? '1' : '.45') + '">' +
      '<label style="display:block; font-size:12.5px">Tamaño de letra<br>' +
        '<select style="width:100%; margin-top:3px"' + (mostrarCotas ? '' : ' disabled') +
        ' onchange="aplicarTamanoCotas(parseFloat(this.value))">' + opcionesTamano(factorCotas) + '</select></label>' +
    '</div>';
}
(function(){
  const b = document.getElementById('btnEtiquetasCotas');
  if (b) b.onclick = () => { renderPanelEtiquetas(); document.getElementById('etqOverlay').style.display = 'flex'; };
  document.getElementById('etqCerrar').onclick = () => { document.getElementById('etqOverlay').style.display = 'none'; };
  document.getElementById('etqOverlay').addEventListener('click', e => {
    if (e.target.id === 'etqOverlay') e.target.style.display = 'none';
  });
})();

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

// restaurar SOLO la copia local de este navegador (ver estado.js): si nunca
// se ha usado la app aquí, la obra queda en cero — ya no se hereda nada de
// la nube ni de otra persona al abrir la página por primera vez.
// La línea base del historial se siembra DESPUÉS de que esto termine, para
// que "Paso 1" sea la obra recién cargada, no una escena vacía.
cargarCompartido().then(() => {
  if (typeof sembrarHistorialInicial === 'function') sembrarHistorialInicial();
});

const reloj = new THREE.Clock();
let tiempo = 0;
let numFrame = 0;
const dirTmp = new THREE.Vector3();
const puntoTmp = new THREE.Vector3();
const tangenteTmp = new THREE.Vector3();
const ejeYTmp = new THREE.Vector3(0, 1, 0);
// temporales para volcar las matrices de los trabajadores instanciados
const posTmp = new THREE.Vector3();
const quatTmp = new THREE.Quaternion();
const sclTmp = new THREE.Vector3(1, 1, 1);
const mtxTmp = new THREE.Matrix4();
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

  // personas (instanciadas: 4 draw calls en total, ver provisionales.js §9)
  for (let i = 0; i < personas.length; i++){
    const p = personas[i];
    dirTmp.set(p.obj.x - p.x, 0, p.obj.z - p.z);
    if (dirTmp.length() < 1.2){ p.obj = nuevoObjetivo(); }
    else {
      dirTmp.normalize();
      p.x += dirTmp.x * p.vel * dt;
      p.z += dirTmp.z * p.vel * dt;
      p.rot = Math.atan2(dirTmp.x, dirTmp.z);
      p.y = alturaTerreno(p.x, p.z) + 0.1 + Math.abs(Math.sin(tiempo*8 + p.vel*10)) * 0.04;
    }
    quatTmp.setFromAxisAngle(ejeYTmp, p.rot);
    for (let k = 0; k < partesTrabajador.length; k++){
      posTmp.set(p.x, p.y + partesTrabajador[k].userData.dy, p.z);
      mtxTmp.compose(posTmp, quatTmp, sclTmp);
      partesTrabajador[k].setMatrixAt(i, mtxTmp);
    }
  }
  for (let k = 0; k < partesTrabajador.length; k++) partesTrabajador[k].instanceMatrix.needsUpdate = true;

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

  if (manejando) moverVehiculoManejado(dt);
  else if (caminando) moverCaminante(dt);
  else actualizarCamara();
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
