/* Historial de cambios navegable (Ctrl+Z / Ctrl+Shift+Z) — envuelve
   guardarCompartido() para tomar una foto del estado en cada guardado, sin
   tener que tocar cada uno de sus puntos de llamada repartidos por toda la
   app (creador.js, equipos.js, modificar.js, vias.js, provisionales.js…).

   OJO: esta obra se sincroniza en tiempo real con el equipo (Supabase) —
   "Volver aquí" / deshacer SÍ actualiza el estado compartido para todos,
   no es un deshacer privado de un solo usuario. */

let historialPasos = [];
let historialIndice = -1;
let aplicandoHistorial = false;

const _guardarCompartidoOriginal = guardarCompartido;
guardarCompartido = function(etiqueta){
  const promesa = _guardarCompartidoOriginal();
  if (!aplicandoHistorial){
    const nuevo = JSON.stringify(estadoActual());
    historialPasos = historialPasos.slice(0, historialIndice + 1);
    historialPasos.push({ etiqueta: etiqueta || 'Cambio en la obra', estado: nuevo });
    if (historialPasos.length > 60) historialPasos.shift();
    historialIndice = historialPasos.length - 1;
    actualizarBotonHistorial();
  }
  return promesa;
};

function actualizarBotonHistorial(){
  const b = document.getElementById('btnHistorial');
  if (b) b.title = 'Historial de cambios — Paso ' + (historialIndice + 1) + ' de ' + historialPasos.length;
}
/* línea base: se llama desde main.js cuando ya se cargó el estado inicial
   (Supabase o local), para que "Paso 1" sea la obra recién abierta */
function sembrarHistorialInicial(){
  historialPasos = [{ etiqueta: 'Obra inicial', estado: JSON.stringify(estadoActual()) }];
  historialIndice = 0;
  actualizarBotonHistorial();
}
function irAPasoHistorial(i){
  if (i < 0 || i >= historialPasos.length || i === historialIndice) return;
  historialIndice = i;
  aplicandoHistorial = true;
  aplicarEstado(JSON.parse(historialPasos[i].estado));
  guardarCompartido();
  aplicandoHistorial = false;
  actualizarBotonHistorial();
  seleccionado = null;
  mostrarPanelSinSeleccion();
  if (document.getElementById('historialOverlay').style.display === 'flex') renderHistorial();
}
function deshacer(){
  if (historialIndice <= 0){ avisoGuardado('No hay nada más para deshacer'); return; }
  const etiqueta = historialPasos[historialIndice].etiqueta;
  irAPasoHistorial(historialIndice - 1);
  avisoGuardado('Deshecho: ' + etiqueta);
}
function rehacer(){
  if (historialIndice >= historialPasos.length - 1){ avisoGuardado('No hay nada más para rehacer'); return; }
  irAPasoHistorial(historialIndice + 1);
  avisoGuardado('Rehecho (Ctrl+Shift+Z)');
}
function abrirHistorial(){
  renderHistorial();
  document.getElementById('historialOverlay').style.display = 'flex';
}
function renderHistorial(){
  document.getElementById('historialTitulo').textContent = 'Historial — Paso ' + (historialIndice + 1) + ' de ' + historialPasos.length;
  const filas = historialPasos.map((p, i) => {
    const activo = i === historialIndice;
    return '<div class="planoFila"' + (activo ? ' style="background:var(--sup-alta); border-radius:8px"' : '') + '>' +
      '<span class="planoNom">' + (activo ? '▶ ' : '') + '<b class="txtFuerte">Paso ' + (i + 1) + '</b> <small>· ' + esc(p.etiqueta) + '</small></span>' +
      (activo ? '<small class="txtAcento">actual</small>'
              : '<button class="planoBtn" style="width:auto; margin:0" onclick="irAPasoHistorial(' + i + ')">Volver aquí</button>') +
    '</div>';
  }).join('');
  document.getElementById('historialBody').innerHTML =
    '<div class="desc">Cada acción guardada queda registrada aquí. <b class="txtAcento">Importante:</b> esta obra se sincroniza en vivo ' +
    'con tu equipo — volver a un paso anterior también lo actualiza para todos, no solo para ti. Usa <b class="txtAcento">Ctrl+Z</b> / ' +
    '<b class="txtAcento">Ctrl+Shift+Z</b> para deshacer/rehacer rápido.</div>' +
    '<div style="display:flex; gap:6px; margin:10px 0">' +
      '<button style="flex:1; margin:0" onclick="deshacer()">' + icono('girarIzq') + 'Deshacer</button>' +
      '<button style="flex:1; margin:0" onclick="rehacer()">' + icono('girarDer') + 'Rehacer</button>' +
    '</div>' +
    '<div style="max-height:55vh; overflow-y:auto">' + filas + '</div>';
}
document.getElementById('btnHistorial').onclick = abrirHistorial;
document.getElementById('historialCerrar').onclick = () => { document.getElementById('historialOverlay').style.display = 'none'; };
document.getElementById('historialOverlay').addEventListener('click', e => { if (e.target.id === 'historialOverlay') e.target.style.display = 'none'; });
