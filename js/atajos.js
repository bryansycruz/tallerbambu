/* Atajos de teclado globales: Escape (cerrar overlays / salir de caminar o
   manejar / apagar herramientas / deseleccionar), E (subir/bajar de un
   vehículo cercano), Ctrl+Z / Ctrl+Shift+Z (deshacer/rehacer) + teclas del
   modo caminar (W A S D, flechas, Shift, T). */
const OVERLAYS_CERRABLES = [
  'aptoOverlay', 'orgOverlay', 'planosOverlay', 'camOverlay',
  'espOverlay', 'equipoOverlay', 'zonasOverlay', 'historialOverlay', 'fondoOverlay'
];
addEventListener('keydown', e => {
  const tag = (document.activeElement || {}).tagName;
  const enCampo = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  if (caminando && !enCampo){
    teclasCaminar[e.code] = true;
    if (e.code.indexOf('Arrow') === 0 || e.code === 'Space') e.preventDefault();
  }
  if (e.key === 'Escape'){
    for (const id of OVERLAYS_CERRABLES){
      const ov = document.getElementById(id);
      if (ov && getComputedStyle(ov).display !== 'none'){ ov.style.display = 'none'; return; }
    }
    if (manejando){ bajarDeVehiculo(); return; }
    if (caminando){ toggleCaminar(); return; }
    if (modoRegla){ if (escRegla()) return; toggleRegla(); return; }
    if (modoFlujo){ document.getElementById('btnFlujo').click(); return; }
    if (modoVia){ document.getElementById('btnVia').click(); return; }
    if (modoColocarPorteria){ terminarColocarPorteria(); avisoGuardado('Ubicación de porterías terminada'); return; }
    if (seleccionado){
      actualizarTinte(seleccionado);
      seleccionado = null;
      mostrarPanelSinSeleccion();
      avisoGuardado('Selección quitada');
    }
    return;
  }
  if (enCampo) return;
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey){
    toggleManejar();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')){
    e.preventDefault();
    if (e.shiftKey) rehacer(); else deshacer();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')){
    e.preventDefault();
    rehacer();
    return;
  }
});
addEventListener('keyup', e => { delete teclasCaminar[e.code]; });
