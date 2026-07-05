/* Documentos por zona: planos AutoCAD, fichas técnicas y enlaces de página.
   También la hoja del Piso 5. */

/* ============ 12c. DOCUMENTOS POR ZONA ============
   Cada zona (provisional, torre, montacargas, cerramiento o sector del piso 4)
   puede tener adjuntos: planos (.dwg, .dxf), fichas técnicas (PDF, imagen,
   Word/Excel) y enlaces a páginas web (ej: catálogo de la maquinaria).
   Los archivos se comparten vía el almacenamiento en la nube (bucket "planos")
   o quedan en este navegador (IndexedDB) si aún no está configurado.
   Los enlaces viajan con el estado compartido, como las posiciones. */
const EXT_PLANOS = ['dwg', 'dxf', 'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
const MAX_PLANO_MB = 25;
let zonaPlanos = null;      // { nombre, slug }
let planosCache = [];       // lista de archivos mostrada actualmente
let enlaces = {};           // { zonaSlug: [{ titulo, url }] } — compartido con el equipo

function slugZona(nombre){
  return String(nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 60);
}
function tamanoLegible(b){
  if (!b && b !== 0) return '';
  return b > 1048576 ? (b/1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b/1024)) + ' KB';
}

/* -- respaldo local (IndexedDB) cuando no hay Supabase -- */
function idbPlanos(){
  return new Promise((res, rej) => {
    const r = indexedDB.open('planosObra', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('archivos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
function idbTx(modo, fn){
  return idbPlanos().then(db => new Promise((res, rej) => {
    const tx = db.transaction('archivos', modo);
    const req = fn(tx.objectStore('archivos'));
    tx.oncomplete = () => res(req && req.result);
    tx.onerror = () => rej(tx.error);
  }));
}

async function listarPlanos(){
  if (supabaseClient){
    const { data, error } = await supabaseClient.storage.from('planos')
      .list(zonaPlanos.slug, { sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    return (data || []).filter(f => f.name).map(f => ({
      nombre: f.name, ruta: zonaPlanos.slug + '/' + f.name,
      tam: f.metadata ? f.metadata.size : null,
      fecha: f.created_at ? f.created_at.slice(0, 10) : ''
    }));
  }
  const claves = await idbTx('readonly', st => st.getAllKeys());
  const pref = zonaPlanos.slug + '/';
  const propios = (claves || []).filter(k => k.startsWith(pref)).sort().reverse();
  const lista = [];
  for (const k of propios){
    const v = await idbTx('readonly', st => st.get(k));
    if (v) lista.push({ nombre: v.nombre, ruta: k, tam: v.tam, fecha: v.fecha });
  }
  return lista;
}
async function renderPlanos(){
  const cuerpo = document.getElementById('planosBody');
  document.getElementById('planosTitulo').textContent = 'Documentos — ' + zonaPlanos.nombre;
  cuerpo.innerHTML = '<div class="desc">Cargando documentos…</div>';
  let filas = '';
  try {
    planosCache = await listarPlanos();
    filas = planosCache.length
      ? planosCache.map((p, i) =>
          '<div class="planoFila">' +
            '<span class="planoNom">' + icono('plano') + ' ' + esc(p.nombre.replace(/^\d+_/, '')) +
              ' <small>' + [tamanoLegible(p.tam), p.fecha].filter(Boolean).join(' · ') + '</small></span>' +
            '<span>' +
              '<button class="planoBtn" title="Descargar" onclick="descargarPlano(' + i + ')">' + icono('bajar') + '</button> ' +
              '<button class="planoBtn peligro" title="Eliminar" onclick="eliminarPlano(' + i + ')">' + icono('basura') + '</button>' +
            '</span>' +
          '</div>').join('')
      : '<div class="desc">Esta zona aún no tiene archivos adjuntos.</div>';
  } catch (e) {
    filas = '<div class="desc">No se pudo cargar la lista (' + esc(e.message || 'error') + ').' +
      (supabaseClient ? ' Verifica la configuración del almacenamiento compartido.' : '') + '</div>';
  }
  const lst = enlaces[zonaPlanos.slug] || [];
  const filasEnlaces = lst.length
    ? lst.map((e2, i) =>
        '<div class="planoFila">' +
          '<span class="planoNom">' + icono('abrir') + ' ' + esc(e2.titulo || e2.url) +
            (e2.titulo ? ' <small>' + esc(e2.url.slice(0, 60)) + '</small>' : '') + '</span>' +
          '<span>' +
            '<button class="planoBtn" title="Abrir página" onclick="abrirEnlace(' + i + ')">' + icono('abrir') + '</button> ' +
            '<button class="planoBtn peligro" title="Quitar" onclick="quitarEnlace(' + i + ')">' + icono('basura') + '</button>' +
          '</span>' +
        '</div>').join('')
    : '<div class="desc">Sin enlaces todavía.</div>';
  cuerpo.innerHTML =
    '<div class="desc" style="margin-bottom:8px">' +
      (supabaseClient
        ? 'Los documentos de esta zona se comparten con todo el equipo.'
        : 'En este momento los archivos se guardan solo en este navegador; los enlaces sí se comparten al conectar el equipo.') +
    '</div>' +
    '<b>Ficha técnica y planos (archivos)</b>' + filas +
    '<button class="orgAccion primario" onclick="document.getElementById(\'planoArchivo\').click()">' +
      icono('subir') + 'Subir archivo (plano, PDF, imagen, Word/Excel · máx. ' + MAX_PLANO_MB + ' MB)</button>' +
    '<div style="margin-top:16px"><b>Enlaces de página</b></div>' + filasEnlaces +
    '<div style="display:flex; flex-direction:column; gap:6px; margin-top:10px">' +
      '<input id="enlNombre" maxlength="80" placeholder="Nombre (ej: Ficha técnica del montacargas)">' +
      '<div style="display:flex; gap:6px">' +
        '<input id="enlUrl" maxlength="300" placeholder="https://…" style="flex:1">' +
        '<button class="orgAccion primario" style="margin:0" onclick="agregarEnlace()">' + icono('mas') + 'Agregar</button>' +
      '</div>' +
    '</div>';
  const inpUrl = document.getElementById('enlUrl');
  inpUrl.addEventListener('keydown', e => { if (e.key === 'Enter') agregarEnlace(); });
}
function abrirPlanos(nombreZona){
  zonaPlanos = { nombre: nombreZona, slug: slugZona(nombreZona) };
  document.getElementById('planosOverlay').style.display = 'flex';
  renderPlanos();
}

/* ---- Enlaces de página por zona (ficha técnica online, catálogos, etc.) ---- */
function agregarEnlace(){
  const nom = (document.getElementById('enlNombre').value || '').trim().slice(0, 80);
  let url = (document.getElementById('enlUrl').value || '').trim().slice(0, 300);
  if (!url){ avisoGuardado('Escribe la dirección de la página'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); } catch (e) { avisoGuardado('La dirección no es válida'); return; }
  if (!enlaces[zonaPlanos.slug]) enlaces[zonaPlanos.slug] = [];
  enlaces[zonaPlanos.slug].push({ titulo: nom, url });
  guardarCompartido();
  renderPlanos();
  avisoGuardado('Enlace agregado' + (nom ? ': ' + nom : ''));
}
function abrirEnlace(i){
  const e2 = (enlaces[zonaPlanos.slug] || [])[i];
  if (!e2) return;
  if (!/^https?:\/\//i.test(e2.url)){ avisoGuardado('Dirección no permitida'); return; }
  window.open(e2.url, '_blank', 'noopener');
}
function quitarEnlace(i){
  if (!enlaces[zonaPlanos.slug]) return;
  enlaces[zonaPlanos.slug].splice(i, 1);
  guardarCompartido();
  renderPlanos();
}
async function subirPlano(archivo){
  const ext = (archivo.name.split('.').pop() || '').toLowerCase();
  if (!EXT_PLANOS.includes(ext)){ avisoGuardado('Solo se permiten planos (.dwg, .dxf), PDF, imágenes o documentos de Office'); return; }
  if (archivo.size > MAX_PLANO_MB * 1048576){ avisoGuardado('El plano supera los ' + MAX_PLANO_MB + ' MB'); return; }
  const nombre = Date.now() + '_' + archivo.name.replace(/[^\w.\-]+/g, '_');
  document.getElementById('planosBody').innerHTML = '<div class="desc">Subiendo ' + esc(archivo.name) + '…</div>';
  try {
    if (supabaseClient){
      const { error } = await supabaseClient.storage.from('planos').upload(zonaPlanos.slug + '/' + nombre, archivo);
      if (error) throw error;
    } else {
      await idbTx('readwrite', st => st.put(
        { nombre: archivo.name, tam: archivo.size, fecha: new Date().toISOString().slice(0, 10), blob: archivo },
        zonaPlanos.slug + '/' + nombre
      ));
    }
    avisoGuardado('Plano subido: ' + archivo.name);
  } catch (e) {
    avisoGuardado('No se pudo subir el plano (' + (e.message || 'error') + ')');
  }
  renderPlanos();
}
async function descargarPlano(i){
  const p = planosCache[i];
  if (!p) return;
  try {
    let blob;
    if (supabaseClient){
      const { data, error } = await supabaseClient.storage.from('planos').download(p.ruta);
      if (error) throw error;
      blob = data;
    } else {
      const v = await idbTx('readonly', st => st.get(p.ruta));
      blob = v && v.blob;
    }
    if (!blob) throw new Error('archivo no encontrado');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = p.nombre.replace(/^\d+_/, '');
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    avisoGuardado('No se pudo descargar (' + (e.message || 'error') + ')');
  }
}
async function eliminarPlano(i){
  const p = planosCache[i];
  if (!p) return;
  if (!confirm('¿Eliminar el plano "' + p.nombre.replace(/^\d+_/, '') + '"?' +
      (supabaseClient ? ' Se borrará para todo el equipo.' : ''))) return;
  try {
    if (supabaseClient){
      const { error } = await supabaseClient.storage.from('planos').remove([p.ruta]);
      if (error) throw error;
    } else {
      await idbTx('readwrite', st => st.delete(p.ruta));
    }
    avisoGuardado('Plano eliminado');
  } catch (e) {
    avisoGuardado('No se pudo eliminar (' + (e.message || 'error') + ')');
  }
  renderPlanos();
}
document.getElementById('planoArchivo').onchange = e => {
  const f = e.target.files[0];
  if (f) subirPlano(f);
  e.target.value = '';
};
document.getElementById('planosCerrar').onclick = () => {
  document.getElementById('planosOverlay').style.display = 'none';
};
document.getElementById('planosOverlay').addEventListener('click', e => {
  if (e.target.id === 'planosOverlay') e.target.style.display = 'none';
});

/* ---- Hoja de detalle del Piso 5 (se abre en otra pestaña) ---- */
function abrirHojaPiso5(){
  window.open('piso5.html', '_blank');
}
function esPiso5(o){
  while (o && o !== edificio){
    if (o === pisosMesh[4]) return true;
    o = o.parent;
  }
  return false;
}
