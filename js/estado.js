/* Estado compartido: guardar/cargar, base de datos (tabla estado_obra) y sincronización en tiempo real */

/* ============ 12. GUARDAR / CARGAR DISTRIBUCIÓN ============ */
const rangoMalacate = document.getElementById('rangoMalacate');

function estadoActual(){
  const elementos = {};
  draggables.forEach(g => {
    elementos[g.userData.info.nombre] = {
      x: Math.round(g.position.x * 100) / 100,
      z: Math.round(g.position.z * 100) / 100,
      bloqueado: !!g.userData.bloqueado
    };
  });
  return {
    version: 3,
    proyecto: 'Obras provisionales — Torre 5 pisos + 3 sótanos (cerramientos y acabados)',
    fecha: new Date().toISOString(),
    elementos,
    rutas: rutas.map(r => r.puntos.map(p => [Math.round(p.x*100)/100, Math.round(p.z*100)/100])),
    malacate: parseFloat(rangoMalacate.value),
    malacatePos: [Math.round(malacate.position.x*100)/100, Math.round(malacate.position.z*100)/100],
    organigrama: funcionesExtra,
    enlaces: enlaces,
    camiones: camiones
  };
}
function guardarLocal(){
  try { localStorage.setItem('planoObra3D_v3', JSON.stringify(estadoActual())); } catch (e) {}
}
function aplicarEstado(d){
  if (!d) return;
  if (d.elementos){
    draggables.forEach(g => {
      const p = d.elementos[g.userData.info.nombre];
      if (!p) return;
      const inf = g.userData.info;
      if (Array.isArray(p)){
        g.position.set(p[0], alturaApoyo(p[0], p[1], inf.w, inf.d), p[1]);
        g.userData.bloqueado = false;
      } else {
        g.position.set(p.x, alturaApoyo(p.x, p.z, inf.w, inf.d), p.z);
        g.userData.bloqueado = !!p.bloqueado;
      }
      actualizarTinte(g);
    });
  }
  rutas.forEach(r => scene.remove(r.grupo));
  rutas.length = 0;
  (d.rutas || []).forEach(pts => {
    iniciarRuta();
    pts.forEach(pt => agregarPunto({ x:pt[0], z:pt[1] }));
    finalizarRuta();
  });
  if (d.malacate !== undefined) rangoMalacate.value = d.malacate;
  if (d.malacatePos){
    const s = ajustarMalacate(d.malacatePos[0], d.malacatePos[1]);
    malacate.position.set(s.x, 0, s.z);
    actualizarDescargue();
  }
  if (d.organigrama && typeof d.organigrama === 'object' && !Array.isArray(d.organigrama)){
    funcionesExtra = d.organigrama;
  }
  if (d.enlaces && typeof d.enlaces === 'object' && !Array.isArray(d.enlaces)){
    enlaces = d.enlaces;
  }
  if (Array.isArray(d.camiones)){
    camiones = d.camiones;
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
    local: 'Modo local (cambios solo en este dispositivo)',
    cargando: 'Cargando distribución del equipo…',
    ok: 'Sincronizado' + (detalle ? ' · ' + detalle : ''),
    error: 'Sin conexión (usando copia local)'
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
    [[-82,-14],[-45,-13.5],[-10,-13],[28,-13],[58,-12.5],[80,-11]].forEach(p => agregarPunto({ x:p[0], z:p[1] }));
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
