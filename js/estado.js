/* Estado compartido: guardar/cargar, base de datos (tabla estado_obra) y sincronización en tiempo real */

/* ============ 12. GUARDAR / CARGAR DISTRIBUCIÓN ============ */
const rangoMalacate = document.getElementById('rangoMalacate');

/* ---- Fases de obra: la MISMA obra con distinta implantación por etapa.
   Cada fase guarda su propio mapa de posiciones (misma forma que "elementos");
   al cambiar de fase se toma un snapshot de la actual y se aplican las
   posiciones guardadas de la nueva (o se siembra con las actuales si es la
   primera vez que se visita). Los elementos existen en todas las fases: solo
   cambian posición, rotación y bloqueo. ---- */
const NOMBRES_FASE = { excavacion: 'Excavación', estructura: 'Estructura', acabados: 'Acabados' };
let faseActual = 'acabados';   // fase real del proyecto (cerramientos y acabados)
let fases = {};                // { [fase]: mapaPosiciones }

function posicionesActuales(){
  const elementos = {};
  draggables.forEach(g => {
    elementos[g.userData.info.nombre] = {
      x: Math.round(g.position.x * 100) / 100,
      z: Math.round(g.position.z * 100) / 100,
      rot: Math.round((g.rotation.y || 0) * 180 / Math.PI),
      bloqueado: !!g.userData.bloqueado
    };
  });
  return elementos;
}
/* aplica un mapa de posiciones sobre los draggables (por nombre); es el mismo
   loop que usa aplicarEstado con d.elementos, extraído para que cambiarFase
   lo reutilice. Respeta yFija (pluma grúa sobre cubierta). */
function aplicarElementos(mapa){
  draggables.forEach(g => {
    const p = mapa[g.userData.info.nombre];
    if (!p) return;
    const inf = g.userData.info;
    const yFija = g.userData.yFija;
    if (Array.isArray(p)){
      g.position.set(p[0], yFija !== undefined ? yFija : alturaApoyo(p[0], p[1], inf.w, inf.d), p[1]);
      g.rotation.y = 0;
      g.userData.bloqueado = false;
    } else {
      g.position.set(p.x, yFija !== undefined ? yFija : alturaApoyo(p.x, p.z, inf.w, inf.d), p.z);
      g.rotation.y = (typeof p.rot === 'number' && isFinite(p.rot)) ? p.rot * Math.PI / 180 : 0;
      g.userData.bloqueado = !!p.bloqueado;
    }
    actualizarTinte(g);
  });
}
function sincronizarSelectorFase(){
  const s = document.getElementById('selFase');
  if (s) s.value = faseActual;
}
function cambiarFase(nueva){
  if (!NOMBRES_FASE[nueva] || nueva === faseActual){ sincronizarSelectorFase(); return; }
  fases[faseActual] = posicionesActuales();
  const primeraVez = !fases[nueva];
  faseActual = nueva;
  if (primeraVez) fases[nueva] = posicionesActuales();   // arranca igual a la fase anterior
  else aplicarElementos(fases[nueva]);
  sincronizarSelectorFase();
  if (seleccionado) actualizarUbicacion(seleccionado);
  guardarCompartido();
  avisoGuardado('Fase de obra: ' + NOMBRES_FASE[nueva] +
    (primeraVez ? ' — reubica los provisionales para esta etapa' : ''));
}

function estadoActual(){
  // el snapshot de la fase actual se refresca en cada guardado, así "fases"
  // siempre lleva las posiciones vigentes de la fase en que se está trabajando
  fases[faseActual] = posicionesActuales();
  const elementos = fases[faseActual];
  return {
    version: 4,
    proyecto: 'Obras provisionales — Torre 5 pisos + 3 sótanos (cerramientos y acabados)',
    fecha: new Date().toISOString(),
    elementos,
    fases,
    faseActual,
    personalizados: (typeof personalizados !== 'undefined') ? personalizados : [],
    equipos: (typeof equiposCreados !== 'undefined') ? equiposCreados : [],
    overridesProvisionales: (typeof overridesProvisionales !== 'undefined') ? overridesProvisionales : {},
    rutas: rutas.map(r => r.puntos.map(p => [Math.round(p.x*100)/100, Math.round(p.z*100)/100])),
    cerramientoPos: [Math.round(cerramiento.position.x*100)/100, Math.round(cerramiento.position.z*100)/100],
    cerramientoColor: cerramiento.userData.colorPersonalizado || null,
    cerramientoBloqueado: !!cerramiento.userData.bloqueado,
    malacate: parseFloat(rangoMalacate.value),
    malacates: malacates.map(m => ({
      nombre: m.userData.info.nombre,
      x: Math.round(m.position.x*100)/100,
      z: Math.round(m.position.z*100)/100
    })),
    organigrama: funcionesExtra,
    enlaces: enlaces,
    camiones: camiones,
    fechaObra: fechaObra,
    velReloj: VEL_RELOJ
  };
}
function guardarLocal(){
  try { localStorage.setItem('planoObra3D_v3', JSON.stringify(estadoActual())); } catch (e) {}
}
/* límites defensivos al cargar un JSON externo (archivo "Cargar" o Supabase):
   una lista corrupta o manipulada no debe poder congelar la pestaña creando
   miles de objetos 3D de golpe */
function limitarArray(a, max){ return Array.isArray(a) ? a.slice(0, max) : []; }

function aplicarEstado(d){
  if (!d) return;
  // espacios y edificios creados por el usuario: se recrean ANTES de aplicar
  // las posiciones de "elementos" (que también los incluye por su nombre)
  if (typeof aplicarPersonalizados === 'function'){
    aplicarPersonalizados(limitarArray(d.personalizados, 300));
  }
  if (typeof aplicarEquipos === 'function'){
    aplicarEquipos(limitarArray(d.equipos, 300));
  }
  // renombres/recoloreos/eliminaciones de provisionales de fábrica: se
  // aplican DESPUÉS de reconstruir todo (arriba) y ANTES del bloque de abajo,
  // que restaura posición/rotación por el nombre YA renombrado
  if (typeof aplicarOverridesProvisionales === 'function'){
    aplicarOverridesProvisionales(d.overridesProvisionales);
  }
  // fases de obra: restaurar los mapas de posiciones por etapa y la fase activa
  if (d.fases && typeof d.fases === 'object' && !Array.isArray(d.fases)) fases = d.fases;
  else fases = {};
  if (typeof d.faseActual === 'string' && NOMBRES_FASE[d.faseActual]) faseActual = d.faseActual;
  sincronizarSelectorFase();
  if (d.elementos){
    // migración: la zona "Paletizado" pasó a llamarse "Acopio de materiales"
    if (d.elementos['Paletizado'] && !d.elementos['Acopio de materiales']){
      d.elementos['Acopio de materiales'] = d.elementos['Paletizado'];
    }
    aplicarElementos(d.elementos);
  }
  rutas.forEach(r => scene.remove(r.grupo));
  rutas.length = 0;
  limitarArray(d.rutas, 50).forEach(pts => {
    if (!Array.isArray(pts)) return;
    iniciarRuta();
    limitarArray(pts, 500).forEach(pt => {
      if (Array.isArray(pt) && pt.length >= 2) agregarPunto({ x:pt[0], z:pt[1] });
    });
    finalizarRuta();
  });
  if (Array.isArray(d.cerramientoPos) && d.cerramientoPos.length >= 2 &&
      isFinite(d.cerramientoPos[0]) && isFinite(d.cerramientoPos[1])){
    cerramiento.position.set(d.cerramientoPos[0], cerramiento.position.y, d.cerramientoPos[1]);
  }
  if (typeof d.cerramientoColor === 'string' && d.cerramientoColor) pintarCerramiento(d.cerramientoColor);
  cerramiento.userData.bloqueado = !!d.cerramientoBloqueado;
  if (d.malacate !== undefined) rangoMalacate.value = d.malacate;
  if (Array.isArray(d.malacates) && d.malacates.length){
    const listaMalacates = limitarArray(d.malacates, 30);
    listaMalacates.forEach((info, i) => {
      if (!malacates[i]) crearMalacate(info.nombre || nombreMalacateDisponible(), info.x || 0, info.z || 0);
      const s = ajustarMalacate(info.x, info.z);
      malacates[i].position.set(s.x, 0, s.z);
    });
    while (malacates.length > listaMalacates.length){
      quitarGrupoEscena(malacates[malacates.length - 1]);
      malacates.pop();
    }
    actualizarDescargue();
  } else if (d.malacatePos){
    // compatibilidad con respaldos antiguos (un solo malacate, sin lista)
    const s = ajustarMalacate(d.malacatePos[0], d.malacatePos[1]);
    malacate.position.set(s.x, 0, s.z);
    actualizarDescargue();
  }
  if (d.organigrama && typeof d.organigrama === 'object' && !Array.isArray(d.organigrama)){
    funcionesExtra = d.organigrama;
  }
  if (d.enlaces && typeof d.enlaces === 'object' && !Array.isArray(d.enlaces)){
    enlaces = d.enlaces;
    if (enlaces['paletizado'] && !enlaces['acopio-de-materiales']){
      enlaces['acopio-de-materiales'] = enlaces['paletizado'];   // nombre antiguo de la zona
    }
  }
  if (d.fechaObra) fechaObra = d.fechaObra;
  if (d.velReloj) VEL_RELOJ = d.velReloj;
  if (Array.isArray(d.camiones)){
    camiones = limitarArray(d.camiones, 200).map(c => {
      if (!c) return c;
      const c2 = (c.zona === 'Paletizado') ? Object.assign({}, c, { zona: 'Acopio de materiales' }) : c;
      // migración: pedidos guardados antes de tener fecha quedan en el día simulado actual
      return c2.fecha ? c2 : Object.assign({}, c2, { fecha: d.fechaObra || fechaObra });
    });
  }
}

/* ---- Estado compartido (Supabase): guardar/cargar visible para todo el equipo ---- */
const supabaseClient = (window.supabase && CFG_SUPABASE.url && CFG_SUPABASE.anonKey)
  ? window.supabase.createClient(CFG_SUPABASE.url, CFG_SUPABASE.anonKey)
  : null;
let sincronizandoDesdeFuera = false;

function obtenerAutor(){
  let autor = null;
  try { autor = localStorage.getItem('planoObra3D_autor'); } catch (e) {}
  if (!autor){
    autor = (prompt('¿Cuál es tu nombre? (se recuerda en este equipo, para saber quién hizo cada cambio)') || '').trim().slice(0, 40) || 'Anónimo';
    try { localStorage.setItem('planoObra3D_autor', autor); } catch (e) {}
  }
  return autor;
}
function actualizarEstadoSync(estado, detalle){
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncTxt');
  if (!dot || !txt) return;
  const textos = {
    local: 'Local',
    cargando: 'Cargando…',
    ok: 'Sincronizado' + (detalle ? ' · ' + detalle : ''),
    error: 'Sin conexión'
  };
  dot.className = 'sDot' + (estado === 'ok' ? ' ok' : estado === 'error' ? ' error' : estado === 'cargando' ? ' cargando' : '');
  txt.textContent = textos[estado] || textos.local;
}
async function guardarCompartido(){
  guardarLocal();
  if (!supabaseClient) { actualizarEstadoSync('local'); return; }
  if (sincronizandoDesdeFuera) return;
  try {
    const payload = estadoActual();
    const autor = obtenerAutor();
    const { error } = await supabaseClient.from('estado_obra').upsert({
      id: 1, data: payload, autor, actualizado_en: new Date().toISOString()
    });
    if (error) throw error;
    actualizarEstadoSync('ok', 'guardado por ' + autor);
  } catch (e) {
    actualizarEstadoSync('error');
  }
}
function cargarLocalOEjemplo(){
  let hayEstado = null;
  try { hayEstado = localStorage.getItem('planoObra3D_v3'); } catch (e) {}
  if (hayEstado){
    try { aplicarEstado(JSON.parse(hayEstado)); } catch (e) {}
  } else {
    iniciarRuta();
    [[-74,-13],[-35,-13],[5,-12.5],[45,-13],[78,8],[104,28]].forEach(p => agregarPunto({ x:p[0], z:p[1] }));
    finalizarRuta();
  }
}
async function cargarCompartido(){
  if (!supabaseClient){ actualizarEstadoSync('local'); cargarLocalOEjemplo(); return; }
  actualizarEstadoSync('cargando');
  try {
    const { data, error } = await supabaseClient.from('estado_obra').select('data, autor').eq('id', 1).maybeSingle();
    if (error) throw error;
    if (data && data.data){
      aplicarEstado(data.data);
      guardarLocal();
      actualizarEstadoSync('ok', 'último cambio: ' + (data.autor || '—'));
    } else {
      cargarLocalOEjemplo();
      actualizarEstadoSync('ok', 'primera vez');
    }
  } catch (e) {
    cargarLocalOEjemplo();
    actualizarEstadoSync('error');
  }
  if (supabaseClient){
    supabaseClient
      .channel('estado_obra_cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estado_obra', filter: 'id=eq.1' }, payload => {
        if (!payload.new || !payload.new.data) return;
        sincronizandoDesdeFuera = true;
        aplicarEstado(payload.new.data);
        guardarLocal();
        sincronizandoDesdeFuera = false;
        actualizarEstadoSync('ok', 'actualizado por ' + (payload.new.autor || 'un compañero'));
        avisoGuardado('Actualizado por ' + (payload.new.autor || 'un compañero'));
      })
      .subscribe();
  }
}
function avisoGuardado(msj){
  const a = document.getElementById('avisoGuardado');
  a.textContent = msj;
  a.style.display = 'block';
  clearTimeout(a._t);
  a._t = setTimeout(() => { a.style.display = 'none'; }, 2500);
}
document.getElementById('btnGuardar').onclick = () => {
  guardarCompartido();
  const blob = new Blob([JSON.stringify(estadoActual(), null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'distribucion_obra.json';
  a.click();
  URL.revokeObjectURL(a.href);
  avisoGuardado('Guardado para el equipo (+ respaldo distribucion_obra.json)');
};
document.getElementById('btnCargar').onclick = () => document.getElementById('fileCarga').click();
/* selector de fase de obra (excavación → estructura → acabados) */
(function(){
  const s = document.getElementById('selFase');
  if (s) s.onchange = () => cambiarFase(s.value);
})();
document.getElementById('fileCarga').onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      aplicarEstado(JSON.parse(lector.result));
      guardarCompartido();
      avisoGuardado('Distribución cargada');
    } catch (err) { avisoGuardado('Archivo no válido'); }
  };
  lector.readAsText(f);
  e.target.value = '';
};
