/* Enlaces por zona (fichas técnicas online, catálogos, planos publicados) y
   la hoja del Piso 5. */

/* ============ 12c. ENLACES POR ZONA ============
   Cada zona (provisional, torre, malacate, cerramiento o sector del piso 4)
   guarda una lista de enlaces con nombre + URL. Los enlaces viajan DENTRO
   del JSON de "Guardar" (estadoActual().enlaces), así que al compartir el
   archivo por WhatsApp/correo y abrirlo con "Cargar" en otro PC, llegan
   completos. (La subida de archivos al navegador se eliminó a propósito:
   esos archivos NO viajaban en el JSON y se perdían al cambiar de equipo —
   todo documento debe publicarse como enlace.) */
let zonaPlanos = null;      // { nombre, slug }
let enlaces = {};           // { zonaSlug: [{ titulo, url }] } — viaja en el JSON guardado

function slugZona(nombre){
  return String(nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 60);
}

function renderPlanos(){
  const cuerpo = document.getElementById('planosBody');
  document.getElementById('planosTitulo').textContent = 'Enlaces — ' + zonaPlanos.nombre;
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
    '<div class="desc" style="margin-bottom:8px">Guarda aquí el nombre y la dirección de la ficha técnica, el catálogo o el plano publicado de esta zona. ' +
      'Los enlaces se incluyen en el archivo JSON al dar "Guardar", así que viajan con la distribución al compartirla.</div>' +
    '<b>Enlaces de página</b>' + filasEnlaces +
    '<div style="display:flex; flex-direction:column; gap:6px; margin-top:10px">' +
      '<input id="enlNombre" maxlength="80" placeholder="Nombre (ej: Ficha técnica del malacate)">' +
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
