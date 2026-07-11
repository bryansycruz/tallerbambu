/* Espacios y edificios creados por el usuario: crear con sus medidas, listar,
   eliminar cuando ya no se necesiten y persistir junto al resto del estado.
   Los espacios creados se comportan como cualquier provisional: se arrastran,
   giran, bloquean y aparecen como destino de los camiones de materiales. */

/* ============ 14. ESPACIOS Y EDIFICIOS PERSONALIZADOS ============ */
let personalizados = [];   // defs: { clase:'espacio'|'edificio', nombre, w, d, h?, color?, muros?, techo?, pisos?, hPiso?, pos:[x,z] }

function numLim(v, defecto, min, max){
  v = parseFloat(String(v).replace(',', '.'));
  if (!isFinite(v)) v = defecto;
  return Math.min(max, Math.max(min, v));
}
/* id estable para espacios/edificios/equipos personalizados: se genera una
   sola vez al crearlos y nunca cambia, aunque el usuario renombre el elemento
   después desde la pestaña "Modificar" (interaccion.js usa este id, no el
   nombre, para saber a qué "def" aplicar el cambio) */
function nuevoId(){
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
/* nombre único: si ya existe una zona con ese nombre, se numera (Taller 2, 3…) */
function nombreDisponible(base){
  base = String(base || '').trim().slice(0, 40) || 'Espacio';
  let nombre = base, n = 2;
  while (draggables.some(g => g.userData.info.nombre === nombre)) nombre = base + ' ' + (n++);
  return nombre;
}
/* los nuevos aparecen en fila sobre la franja sur del lote (zona despejada) */
function posicionLibre(){
  const x = -20 + (personalizados.length % 6) * 18;
  const z = -28 - Math.floor(personalizados.length / 6) * 8;
  return [
    Math.min(CFG.limites.xMax - 10, Math.max(CFG.limites.xMin + 10, x)),
    Math.min(CFG.limites.zMax - 5, Math.max(CFG.limites.zMin + 5, z))
  ];
}
/* respeta el estado del botón Etiquetas al crear un elemento nuevo */
function ajustarEtiquetaNueva(g){
  const ocultas = (typeof etiquetasOn !== 'undefined' && !etiquetasOn) ||
                  (typeof vistaPiso4 !== 'undefined' && vistaPiso4);
  if (ocultas) g.traverse(n => { if (n.isSprite) n.visible = false; });
}

/* ---- Sistemas estructurales del edificio: nombre + descripción + dibujo ----
   Cada edificio se puede armar con uno de estos sistemas; el volumen se dibuja
   distinto según el sistema para que se reconozca a simple vista. */
const SISTEMAS_EDIF = {
  aporticado: { nombre:'Aporticado (pórticos)',
    desc:'Sistema Aporticado: red de vigas y columnas de concreto armado o acero conectadas rígidamente. Es flexible, ideal para distribución libre de espacios.' },
  muros: { nombre:'Muros estructurales / Mampostería',
    desc:'Sistema de Muros Estructurales (o Mampostería): muros o placas de concreto o ladrillo que soportan el peso y resisten fuerzas laterales. Alta rigidez, pero limita las modificaciones espaciales.' },
  dual: { nombre:'Dual / Combinado',
    desc:'Sistema Dual / Combinado: mezcla ambos. Las columnas soportan la gravedad y los muros de concreto absorben las fuerzas de sismos o vientos. Muy común en edificios de mediana y gran altura.' },
  acero: { nombre:'Acero',
    desc:'Sistema de Acero: usa perfiles metálicos. Más ligero y rápido de construir; frecuente en naves industriales y rascacielos.' },
  madera: { nombre:'Madera',
    desc:'Sistema de Madera: ecológico y flexible; usado sobre todo en construcciones de baja altura y viviendas residenciales.' }
};
function opcionesSistema(sel){
  return Object.keys(SISTEMAS_EDIF).map(k =>
    '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(SISTEMAS_EDIF[k].nombre) + '</option>').join('');
}
/* Dibuja UN piso del edificio según el sistema estructural (usa el helper caja
   global). Coordenadas locales centradas; el piso arranca en y (su base). */
function pisoSistemaEdificio(g, sis, w, d, hP, y){
  const t = 0.12;
  const grid = len => { const step = 6.5, n = Math.max(1, Math.round(len / step)), a = []; for (let i = 0; i <= n; i++) a.push(-len/2 + i*len/n); return a; };
  if (sis === 'muros'){
    const cm = 0xb0a99c, vent = 0x23262b;                       // muros macizos + ventanas pequeñas
    caja(g, w, hP, t, cm, 0, y + hP/2, -d/2, 0.99);
    caja(g, w, hP, t, cm, 0, y + hP/2,  d/2, 0.99);
    caja(g, t, hP, d, cm, -w/2, y + hP/2, 0, 0.99);
    caja(g, t, hP, d, cm,  w/2, y + hP/2, 0, 0.99);
    const nx = Math.max(2, Math.round(w / 4.5));
    for (let k = 0; k < nx; k++){ const x = -w/2 + (k + 0.5) * (w/nx);
      caja(g, Math.min(1.1, w/nx*0.45), hP*0.4, 0.06, vent, x, y + hP*0.58,  d/2 + 0.02, 0.9);
      caja(g, Math.min(1.1, w/nx*0.45), hP*0.4, 0.06, vent, x, y + hP*0.58, -d/2 - 0.02, 0.9);
    }
    const nz = Math.max(1, Math.round(d / 4.5));
    for (let k = 0; k < nz; k++){ const z = -d/2 + (k + 0.5) * (d/nz);
      caja(g, 0.06, hP*0.4, Math.min(1.1, d/nz*0.45), vent,  w/2 + 0.02, y + hP*0.58, z, 0.9);
      caja(g, 0.06, hP*0.4, Math.min(1.1, d/nz*0.45), vent, -w/2 - 0.02, y + hP*0.58, z, 0.9);
    }
    return;
  }
  // sistemas con columnas a la vista (aporticado / dual / acero / madera)
  let colC, vidC, vidO, cw;
  if (sis === 'acero'){ colC = 0x7f8c9a; vidC = 0x9fc4e8; vidO = 0.42; cw = 0.18; }
  else if (sis === 'madera'){ colC = 0xa97a4d; vidC = 0xd8c8a8; vidO = 0.9; cw = 0.26; }
  else { colC = 0x9a9d9c; vidC = 0xbdd6e2; vidO = 0.5; cw = 0.32; }   // aporticado / dual (concreto)
  const xs = grid(w);
  xs.forEach(x => [-d/2, d/2].forEach(z => caja(g, cw, hP, cw, colC, x, y + hP/2, z)));   // columnas
  grid(d).filter(z => Math.abs(z) < d/2 - 0.01).forEach(z => [-w/2, w/2].forEach(x => caja(g, cw, hP, cw, colC, x, y + hP/2, z)));
  caja(g, w - cw, hP*0.86, 0.05, vidC, 0, y + hP*0.52,  d/2, vidO);   // relleno traslúcido (fachada)
  caja(g, w - cw, hP*0.86, 0.05, vidC, 0, y + hP*0.52, -d/2, vidO);
  caja(g, 0.05, hP*0.86, d - cw, vidC,  w/2, y + hP*0.52, 0, vidO);
  caja(g, 0.05, hP*0.86, d - cw, vidC, -w/2, y + hP*0.52, 0, vidO);
  if (sis === 'dual'){                                              // muros de cortante en los extremos
    const cm = 0xb6b2a8;
    caja(g, t, hP, d*0.86, cm, -w/2 + 0.06, y + hP/2, 0, 0.99);
    caja(g, t, hP, d*0.86, cm,  w/2 - 0.06, y + hP/2, 0, 0.99);
  }
  if (sis === 'acero'){                                             // arriostramiento en X en las caras cortas
    [-w/2, w/2].forEach(x => {
      const len = Math.hypot(d, hP);
      const a = caja(g, 0.09, 0.09, len, colC, x, y + hP/2, 0); a.rotation.x = Math.atan2(hP, d); a.castShadow = false;
      const b = caja(g, 0.09, 0.09, len, colC, x, y + hP/2, 0); b.rotation.x = -Math.atan2(hP, d); b.castShadow = false;
    });
  }
}

/* ---- espacio en obra: reutiliza el constructor de provisionales ---- */
function construirEspacio(def){
  let color = parseInt(String(def.color || '#3f7fbf').replace('#', ''), 16);
  if (!isFinite(color)) color = 0x3f7fbf;
  const area = Math.round(def.w * def.d);
  const g = crearProvisional({
    nombre: def.nombre, w: def.w, d: def.d, h: def.h, color,
    muros: !!def.muros, techo: !!def.techo, pos: def.pos,
    aforo: '—',
    material: 'Espacio creado por el equipo — ' + def.w + ' × ' + def.d + ' m ≈ ' + area + ' m²',
    cerramiento: def.muros ? ('Con muros' + (def.techo ? ' y techo' : ', sin techo'))
      : (def.techo ? 'Cubierta sobre área abierta' : 'Área demarcada a cielo abierto'),
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Espacio creado desde el botón "Espacios". Arrástralo para ubicarlo, gíralo de a 45°, ' +
      'bloquéalo en su lugar o elimínalo cuando ya no se necesite en la obra. ' +
      'También aparece como destino en la programación de camiones.'
  });
  g.userData.personalizado = true;
  g.userData.idEstable = 'c:' + def.id;
  return g;
}

/* ---- edificio: pisos apilados, dibujados según su sistema estructural ---- */
function construirEdificio(def){
  const hP = def.hPiso || CFG.hPiso;
  const alto = def.pisos * hP;
  const sis = SISTEMAS_EDIF[def.sistema] ? def.sistema : 'aporticado';
  const S = SISTEMAS_EDIF[sis];
  const g = new THREE.Group();
  const colLosa = (sis === 'madera') ? 0xcaa06a : (sis === 'acero') ? 0xbfc6cd : 0xcfd3d8;
  for (let i = 0; i < def.pisos; i++){
    const y = i * hP;
    pisoSistemaEdificio(g, sis, def.w, def.d, hP, y);
    const losa = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.5, 0.2, def.d + 0.35),
      new THREE.MeshLambertMaterial({ color: colLosa }));
    losa.position.y = (i + 1) * hP;
    losa.castShadow = true; losa.receiveShadow = true;
    g.add(losa);
  }
  g.userData.esProvisional = true;
  g.userData.personalizado = true;
  g.userData.info = {
    nombre: def.nombre, w: def.w, d: def.d, h: alto,
    aforo: '—',
    dimensiones: def.w + ' × ' + def.d + ' m · ' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos'),
    altura: (Math.round(alto * 100) / 100) + ' m (' + def.pisos + ' × ' + hP + ' m de entrepiso)',
    material: 'Sistema estructural: ' + S.nombre,
    cerramiento: 'Volumen de referencia dibujado según su sistema estructural',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      '<b class="txtAcento">' + esc(S.nombre) + '.</b> ' + esc(S.desc) + '<br><br>' +
      'Edificio de ' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos') +
      ' creado por el equipo. Arrástralo para ubicarlo, gíralo de a 45°, bloquéalo ' +
      'o elimínalo cuando ya no lo necesites en la obra.'
  };
  // mismo tope que en provisionales.js: rótulo de tamaño normal, sin crecer
  // sin control con edificios anchos
  const et = crearEtiqueta(def.nombre, Math.max(9, Math.min(20, def.w * 0.6)));
  et.position.y = alto + 2.2;
  g.add(et);
  if (typeof agregarCotas === 'function') agregarCotas(g, def.w, def.d, alto);
  g.position.set(def.pos[0], 0, def.pos[1]);
  g.userData.idEstable = 'c:' + def.id;
  // el sistema estructural define el color por defecto; si el usuario lo
  // recoloreó a mano desde "Modificar", ese tono gana (aplicarColorATraves
  // vive en js/modificar.js, cargado después de este archivo)
  if (def.color && typeof aplicarColorATraves === 'function') aplicarColorATraves(g, def.color);
  scene.add(g);
  draggables.push(g);
  const opt = document.createElement('option');
  opt.value = draggables.length - 1;
  opt.textContent = def.nombre;
  selectorUI.appendChild(opt);
  return g;
}

/* ---- utilidades de limpieza ---- */
function quitarGrupoEscena(g){
  g.traverse(n => {
    if (n.isSprite){
      const k = etiquetasTodas.indexOf(n);
      if (k >= 0) etiquetasTodas.splice(k, 1);
    }
    if (n.userData && n.userData.esCota){
      const k = gruposCotas.indexOf(n);
      if (k >= 0) gruposCotas.splice(k, 1);
    }
    if (n.geometry) n.geometry.dispose();
    if (n.material){
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    }
  });
  scene.remove(g);
}
/* el selector "Ir a elemento" guarda índices de draggables: se rearma completo */
function reconstruirSelector(){
  while (selectorUI.options.length > 1) selectorUI.remove(1);
  draggables.forEach((g, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = g.userData.info.nombre;
    selectorUI.appendChild(opt);
  });
}

function eliminarPersonalizado(nombre){
  const i = draggables.findIndex(g => g.userData.personalizado && g.userData.info.nombre === nombre);
  const j = personalizados.findIndex(p => p.nombre === nombre);
  if (i < 0 && j < 0) return;
  if (i >= 0){
    const g = draggables[i];
    if (seleccionado === g){
      seleccionado = null;
      mostrarPanelSinSeleccion();
    }
    quitarGrupoEscena(g);
    draggables.splice(i, 1);
  }
  if (j >= 0) personalizados.splice(j, 1);
  reconstruirSelector();
  guardarCompartido();
  if (document.getElementById('espOverlay').style.display === 'flex') renderEspacios();
  avisoGuardado('"' + nombre + '" eliminado de la obra');
}

/* ---- editar las dimensiones (y nombre/descripción) de un elemento creado ----
   Reconstruye el elemento con las medidas nuevas conservando su posición,
   rotación y bloqueo; los cambios se guardan con el resto del estado. */
let editandoNombre = null;
function abrirEditorPersonalizado(nombre){
  const def = personalizados.find(p => p.nombre === nombre);
  if (!def) return;
  editandoNombre = nombre;
  renderEditorEspacio(def);
  document.getElementById('espOverlay').style.display = 'flex';
}
function renderEditorEspacio(def){
  const esEd = def.clase === 'edificio';
  const num = (id, lbl, val, min, max, step) =>
    '<label>' + lbl + ' <input type="number" id="' + id + '" value="' + val + '" min="' + min + '" max="' + max + '" step="' + step + '" style="width:70px"></label>';
  document.getElementById('espBody').innerHTML =
    '<div class="desc">Editando <b class="txtAcento">' + esc(def.nombre) + '</b> (' + (esEd ? 'Edificio' : 'Espacio') + '). ' +
      'Cambia sus medidas y guarda; conserva su posición y rotación en la obra.</div>' +
    '<div style="display:flex; flex-direction:column; gap:8px; margin-top:10px">' +
      '<input id="edNombre" maxlength="40" value="' + esc(def.nombre) + '" placeholder="Nombre">' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">' +
        num('edAncho', 'Ancho (m)', def.w, 2, 80, 0.1) +
        num('edFondo', 'Fondo (m)', def.d, 2, 60, 0.1) +
        (esEd
          ? num('edPisos', 'Pisos', def.pisos, 1, 30, 1) + num('edHPiso', 'Entrepiso (m)', def.hPiso, 2, 5, 0.05) +
            '<label style="width:100%">Sistema estructural <select id="edSistema" style="flex:1">' + opcionesSistema(def.sistema || 'aporticado') + '</select></label>'
          : num('edAlto', 'Altura (m)', def.h, 1, 12, 0.1) +
            '<label>Color <input type="color" id="edColor" value="' + (def.color || '#3f7fbf') + '"></label>' +
            '<label><input type="checkbox" id="edMuros"' + (def.muros ? ' checked' : '') + '> Muros</label>' +
            '<label><input type="checkbox" id="edTecho"' + (def.techo ? ' checked' : '') + '> Techo</label>') +
      '</div>' +
      '<textarea id="edDesc" maxlength="400" rows="2" placeholder="Descripción (opcional)">' + esc(def.descripcion || '') + '</textarea>' +
      '<div style="display:flex; gap:6px">' +
        '<button class="orgAccion primario" style="margin:0" onclick="guardarEdicionEspacio()">Guardar cambios</button>' +
        '<button class="orgAccion" style="margin:0" onclick="cancelarEdicionEspacio()">Cancelar</button>' +
      '</div>' +
    '</div>';
}
function cancelarEdicionEspacio(){ editandoNombre = null; renderEspacios(); }
function guardarEdicionEspacio(){
  const def = personalizados.find(p => p.nombre === editandoNombre);
  const g = draggables.find(x => x.userData.personalizado && x.userData.info.nombre === editandoNombre);
  if (!def || !g){ editandoNombre = null; renderEspacios(); return; }
  // conservar lo que no se edita
  const pos = { x: g.position.x, z: g.position.z };
  const rot = g.rotation.y;
  const bloqueado = !!g.userData.bloqueado;
  const antiguo = def.nombre;
  // nombre nuevo (único, sin chocar con OTROS elementos)
  let nuevo = (document.getElementById('edNombre').value || '').trim().slice(0, 40) || antiguo;
  if (nuevo !== antiguo){
    let base = nuevo, n = 2;
    while (draggables.some(x => x !== g && x.userData.info.nombre === nuevo)) nuevo = base + ' ' + (n++);
  }
  def.nombre = nuevo;
  def.descripcion = (document.getElementById('edDesc').value || '').trim().slice(0, 400);
  def.w = numLim(document.getElementById('edAncho').value, def.w, 2, 80);
  def.d = numLim(document.getElementById('edFondo').value, def.d, 2, 60);
  if (def.clase === 'edificio'){
    def.pisos = Math.round(numLim(document.getElementById('edPisos').value, def.pisos, 1, 30));
    def.hPiso = numLim(document.getElementById('edHPiso').value, def.hPiso, 2, 5);
    const sisEl = document.getElementById('edSistema');
    if (sisEl && SISTEMAS_EDIF[sisEl.value]) def.sistema = sisEl.value;
  } else {
    def.h = numLim(document.getElementById('edAlto').value, def.h, 1, 12);
    def.color = document.getElementById('edColor').value || def.color;
    def.muros = document.getElementById('edMuros').checked;
    def.techo = document.getElementById('edTecho').checked;
  }
  // reconstruir el elemento con las medidas nuevas
  quitarGrupoEscena(g);
  draggables.splice(draggables.indexOf(g), 1);
  const ng = (def.clase === 'edificio') ? construirEdificio(def) : construirEspacio(def);
  ng.position.set(pos.x, 0, pos.z);
  ng.rotation.y = rot;
  ng.userData.bloqueado = bloqueado;
  ajustarEtiquetaNueva(ng);
  actualizarTinte(ng);
  reconstruirSelector();
  // si se renombró, mantener el destino de los camiones que apuntaban a él
  if (antiguo !== nuevo && typeof camiones !== 'undefined' && Array.isArray(camiones)){
    camiones.forEach(c => { if (c && c.zona === antiguo) c.zona = nuevo; });
  }
  editandoNombre = null;
  guardarCompartido();
  document.getElementById('espOverlay').style.display = 'none';
  seleccionar(ng);
  avisoGuardado('Dimensiones actualizadas: ' + nuevo);
}

/* recrea los personalizados al cargar estado (local, respaldo o Supabase) */
function aplicarPersonalizados(lista){
  for (let i = draggables.length - 1; i >= 0; i--){
    if (draggables[i].userData.personalizado){
      if (seleccionado === draggables[i]) seleccionado = null;
      quitarGrupoEscena(draggables[i]);
      draggables.splice(i, 1);
    }
  }
  personalizados = [];
  (Array.isArray(lista) ? lista : []).forEach(def => {
    if (!def || !def.nombre) return;
    const d2 = {
      clase: def.clase === 'edificio' ? 'edificio' : 'espacio',
      nombre: String(def.nombre).slice(0, 40),
      w: numLim(def.w, 10, 2, 80),
      d: numLim(def.d, 8, 2, 60),
      pos: Array.isArray(def.pos) ? [numLim(def.pos[0], 0, CFG.limites.xMin, CFG.limites.xMax),
                                     numLim(def.pos[1], -28, CFG.limites.zMin, CFG.limites.zMax)] : posicionLibre(),
      descripcion: String(def.descripcion || '').slice(0, 400),
      id: (def.id && String(def.id)) || nuevoId()
    };
    if (d2.clase === 'edificio'){
      d2.pisos = Math.round(numLim(def.pisos, 5, 1, 30));
      d2.hPiso = numLim(def.hPiso, CFG.hPiso, 2, 5);
      d2.sistema = SISTEMAS_EDIF[def.sistema] ? def.sistema : 'aporticado';
      d2.color = def.color || null;   // override opcional (recoloreado a mano)
    } else {
      d2.h = numLim(def.h, 2.5, 1, 12);
      d2.color = def.color || '#3f7fbf';
      d2.muros = !!def.muros;
      d2.techo = !!def.techo;
    }
    personalizados.push(d2);
    const g = (d2.clase === 'edificio') ? construirEdificio(d2) : construirEspacio(d2);
    ajustarEtiquetaNueva(g);
  });
  reconstruirSelector();
}

/* ---- ventana de creación ---- */
function renderEspacios(){
  const filas = personalizados.length
    ? personalizados.map((p, i) => {
        const dims = p.clase === 'edificio'
          ? p.w + ' × ' + p.d + ' m · ' + p.pisos + (p.pisos === 1 ? ' piso' : ' pisos')
          : p.w + ' × ' + p.d + ' m · h ' + p.h + ' m';
        return '<div class="planoFila">' +
          '<span class="planoNom">' + icono(p.clase === 'edificio' ? 'edificio' : 'etiqueta') +
            ' <b class="txtFuerte">' + esc(p.nombre) + '</b> <small>· ' + dims + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Editar dimensiones" onclick="editarPersonalizadoIdx(' + i + ')">' + icono('editar') + '</button> ' +
            '<button class="planoBtn" title="Llevar la cámara hasta este elemento" onclick="irAPersonalizadoIdx(' + i + ')">' + icono('ojo') + '</button> ' +
            '<button class="planoBtn peligro" title="Eliminar de la obra" onclick="eliminarPersonalizadoIdx(' + i + ')">' + icono('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no has creado espacios ni edificios.</div>';
  document.getElementById('espBody').innerHTML =
    '<div class="desc">Crea tus propios <b>espacios de obra</b> (nombre, área y altura) o <b>edificios</b> ' +
      '(dimensiones y cantidad de pisos). Aparecen en la franja sur del lote: arrástralos para ubicarlos, ' +
      'gíralos de a 45°, bloquéalos y elimínalos cuando ya no los necesites. Cada espacio creado también ' +
      'aparece como destino en la programación de camiones.</div>' +
    '<b>Creados en la obra</b>' + filas +
    '<div style="margin-top:14px; display:flex; flex-direction:column; gap:8px">' +
      '<b>Crear nuevo</b>' +
      '<label style="width:100%">Plantilla predeterminada ' +
        '<select id="espPreset" onchange="aplicarPresetEspacio()" style="flex:1; min-width:180px">' +
          '<option value="">Personalizado (definir medidas)</option>' +
          opcionesPresetEspacio() +
        '</select></label>' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<select id="espTipo" onchange="cambiarTipoEspacio()">' +
          '<option value="espacio">Espacio en obra</option>' +
          '<option value="edificio">Edificio</option>' +
        '</select>' +
        '<input id="espNombre" maxlength="40" placeholder="Nombre (ej: Taller de hierro)" style="flex:1; min-width:150px">' +
      '</div>' +
      '<textarea id="espDescripcion" maxlength="400" rows="2" placeholder="Descripción (opcional): para qué se usa, quién la maneja, notas…" style="width:100%; resize:vertical; font-family:inherit"></textarea>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">' +
        '<label>Ancho (m) <input type="number" id="espAncho" value="10" min="2" max="80" step="0.1" style="width:68px"></label>' +
        '<label>Fondo (m) <input type="number" id="espFondo" value="8" min="2" max="60" step="0.1" style="width:68px"></label>' +
        '<span id="espSoloEspacio" style="display:inline-flex; gap:8px; flex-wrap:wrap; align-items:center">' +
          '<label>Altura (m) <input type="number" id="espAlto" value="2.5" min="1" max="12" step="0.1" style="width:62px"></label>' +
          '<label>Color <input type="color" id="espColor" value="#3f7fbf"></label>' +
          '<label><input type="checkbox" id="espMuros" checked> Muros</label>' +
          '<label><input type="checkbox" id="espTecho" checked> Techo</label>' +
        '</span>' +
        '<span id="espSoloEdificio" style="display:none; gap:8px; flex-wrap:wrap; align-items:center">' +
          '<label>Pisos <input type="number" id="espPisos" value="5" min="1" max="30" step="1" style="width:56px"></label>' +
          '<label>Entrepiso (m) <input type="number" id="espHPiso" value="2.65" min="2" max="5" step="0.05" style="width:68px"></label>' +
          '<label style="width:100%">Sistema estructural <select id="espSistema" style="flex:1">' + opcionesSistema('aporticado') + '</select></label>' +
        '</span>' +
      '</div>' +
      '<button class="orgAccion primario" style="margin:0; align-self:flex-start" onclick="agregarPersonalizado()">' +
        icono('mas') + 'Crear y ubicar en la obra</button>' +
    '</div>';
}
/* plantillas predeterminadas: mismas medidas y color que los provisionales
   de fábrica (provisionales.js), para agregar otro igual sin volver a
   escribir las medidas a mano */
const PRESETS_ESPACIO = {
  campamento: { nombre:'Campamento', w:19.8, d:17.6, h:2.5, color:'#3f7fbf', muros:true,  techo:true,
    descripcion:'Campamento de oficinas en casetas prefabricadas: dirección, coordinación, interventoría, oficina técnica, sala de reuniones y archivo. Ubicarlo lejos del polvo y del tránsito de camiones.' },
  almacen:    { nombre:'Almacén',    w:37.5, d:13.9, h:4,   color:'#d9a521', muros:true,  techo:true,
    descripcion:'Almacén cubierto y ventilado para material delicado (cerámica, pintura, grifería, aparatos). Ubicarlo cerca de la torre para minimizar acarreos.' },
  acopio:     { nombre:'Acopio de materiales', w:21.4, d:16,   h:1.6, color:'#b08f5a', muros:false, techo:false,
    descripcion:'Superficie afirmada con estibas para recepción y organización de material a granel o paletizado. Debe quedar dentro del alcance de la grúa o junto al malacate.' },
  maniobra:   { nombre:'Patio de maniobra',    w:14.8, d:17.5, h:2.4, color:'#e0c040', muros:false, techo:false,
    descripcion:'Placa afirmada y señalizada con radio de giro suficiente para camión sencillo/turbo (radio mínimo ≈12 m).' },
  lavado:     { nombre:'Lavado de llantas',    w:11.6, d:15.7, h:1,   color:'#4a9ec9', muros:false, techo:false,
    descripcion:'Lavado obligatorio de llantas antes de salir a la vía pública, con poceta de sedimentación y trampa de grasas.' },
  porteria:   { nombre:'Portería', w:10,   d:4,    h:2.5, color:'#b8371f', muros:false, techo:false,
    descripcion:'Único punto de control de acceso vehicular y peatonal, con portón del ancho de la vía y puerta peatonal separada.' },
  comedor:    { nombre:'Comedor',  w:12,   d:6.4,  h:2.7, color:'#5fae4a', muros:true,  techo:true,
    descripcion:'Comedor/casino del personal: ≈1.2 m² por comensal por turno. Ubicarlo en la zona de bienestar, lejos del polvo y el ruido.' },
  casilleros: { nombre:'Casilleros', w:15.5, d:13.8, h:2.5, color:'#8a6a3a', muros:true,  techo:true,
    descripcion:'Guardarropa del personal: 1 casillero por trabajador, junto a baños y vestidores.' },
  banos:      { nombre:'Baños y vestidores', w:15.8, d:17.5, h:2.5, color:'#4f66c9', muros:true, techo:true,
    descripcion:'Batería de baños, duchas y vestidores. Res. 2400/79 art. 17: 1 inodoro, 1 lavamanos, 1 orinal y 1 ducha por cada 15 trabajadores.' },
  contenedorOficina: { nombre:'Contenedor oficina 20 ft', w:6.06, d:2.44, h:2.59, color:'#2e6db8', muros:true, techo:true,
    descripcion:'Contenedor marítimo estándar de 20 pies (6.06 × 2.44 × 2.59 m) adecuado como oficina, portería o cuarto técnico. Requiere apoyo nivelado.' },
  bateriaSanitaria: { nombre:'Batería sanitaria (4 und)', w:5, d:1.5, h:2.4, color:'#4a9ec9', muros:true, techo:true,
    descripcion:'Módulo de 4 unidades sanitarias portátiles (≈1.2 × 1.2 m c/u). Res. 2400/79: 1 inodoro por cada 15 trabajadores, separados por sexo; requiere mantenimiento y vaciado periódico.' },
  patioHierros: { nombre:'Patio de hierros', w:24, d:10, h:1.2, color:'#8a5a3a', muros:false, techo:false,
    descripcion:'Zona de figuración y almacenamiento de acero de refuerzo: bancos de corte/doblado y estibas por diámetro. Debe quedar dentro del alcance de la grúa y cerca del acceso de camiones.' },
  zonaResiduos: { nombre:'Zona de residuos', w:8, d:6, h:1.8, color:'#6f7a2f', muros:true, techo:false,
    descripcion:'Punto ecológico y acopio temporal de RCD con contención: separación por tipo (ordinarios, reciclables, peligrosos, escombro) según el plan de manejo ambiental.' },
  escombros: { nombre:'Zona de escombros', w:8, d:6, h:1.5, color:'#8f7d6b', muros:false, techo:false,
    descripcion:'Acopio temporal de escombros (concreto, mampostería y material pétreo de demoliciones o sobrantes), separado de la basura ordinaria. Debe quedar accesible para el camión volqueta y evacuarse periódicamente a una escombrera autorizada.' },
  parqueadero: { nombre:'Parqueadero (6 celdas)', w:15, d:11, h:1, color:'#6d7075', muros:false, techo:false,
    descripcion:'Parqueadero interno de 6 celdas de 2.5 × 5 m con circulación central de 6 m. Ubicarlo sin interferir el patio de maniobra ni las rutas de material.' },
  senalizacion: { nombre:'Punto de señalización', w:2, d:2, h:2, color:'#e0c040', muros:false, techo:false,
    descripcion:'Punto de señalización SST: señales reflectivas de obligación, prevención y prohibición (casco, ruta de evacuación, riesgo eléctrico, velocidad máxima).' },
  cerramientoTramo: { nombre:'Cerramiento provisional (tramo)', w:12, d:0.5, h:2.4, color:'#9aa0a6', muros:true, techo:false,
    descripcion:'Tramo de cerramiento provisional de 12 m (teja galvanizada o polisombra sobre estructura), altura mínima 2.0 m. Repetir tramos para cerrar frentes o desviar circulaciones peatonales.' },
  viaInterna: { nombre:'Vía interna (tramo)', w:30, d:6, h:1, color:'#55585e', muros:false, techo:false,
    descripcion:'Tramo de vía interna afirmada de 6 m de ancho: mínimo recomendado 6 m para doble sentido o 3.5 m para un solo sentido, con radio de giro ≥12 m para camión sencillo. La validación de "Zonas y aforo" alerta si queda más angosta.' }
};
function opcionesPresetEspacio(){
  return Object.keys(PRESETS_ESPACIO).map(k => '<option value="' + k + '">' + esc(PRESETS_ESPACIO[k].nombre) + '</option>').join('');
}
function aplicarPresetEspacio(){
  const k = document.getElementById('espPreset').value;
  document.getElementById('espTipo').value = 'espacio';
  cambiarTipoEspacio();
  const p = PRESETS_ESPACIO[k];
  if (!p) return;
  document.getElementById('espNombre').value = p.nombre;
  document.getElementById('espAncho').value = p.w;
  document.getElementById('espFondo').value = p.d;
  document.getElementById('espAlto').value = p.h;
  document.getElementById('espColor').value = p.color;
  document.getElementById('espMuros').checked = p.muros;
  document.getElementById('espTecho').checked = p.techo;
  document.getElementById('espDescripcion').value = p.descripcion || '';
}
function cambiarTipoEspacio(){
  const esEdificio = document.getElementById('espTipo').value === 'edificio';
  document.getElementById('espSoloEspacio').style.display = esEdificio ? 'none' : 'inline-flex';
  document.getElementById('espSoloEdificio').style.display = esEdificio ? 'inline-flex' : 'none';
  document.getElementById('espNombre').placeholder = esEdificio ? 'Nombre (ej: Torre 03)' : 'Nombre (ej: Taller de hierro)';
  if (esEdificio){
    document.getElementById('espAncho').value = 20;
    document.getElementById('espFondo').value = 12;
  } else {
    document.getElementById('espAncho').value = 10;
    document.getElementById('espFondo').value = 8;
  }
}
function agregarPersonalizado(){
  const clase = document.getElementById('espTipo').value === 'edificio' ? 'edificio' : 'espacio';
  const nombre = nombreDisponible(document.getElementById('espNombre').value || (clase === 'edificio' ? 'Edificio' : 'Espacio'));
  const descripcion = (document.getElementById('espDescripcion').value || '').trim().slice(0, 400);
  const def = { clase, nombre, descripcion, pos: posicionLibre(), id: nuevoId() };
  if (clase === 'edificio'){
    def.w = numLim(document.getElementById('espAncho').value, 20, 2, 80);
    def.d = numLim(document.getElementById('espFondo').value, 12, 2, 60);
    def.pisos = Math.round(numLim(document.getElementById('espPisos').value, 5, 1, 30));
    def.hPiso = numLim(document.getElementById('espHPiso').value, CFG.hPiso, 2, 5);
    const sisEl = document.getElementById('espSistema');
    def.sistema = (sisEl && SISTEMAS_EDIF[sisEl.value]) ? sisEl.value : 'aporticado';
  } else {
    def.w = numLim(document.getElementById('espAncho').value, 10, 2, 80);
    def.d = numLim(document.getElementById('espFondo').value, 8, 2, 60);
    def.h = numLim(document.getElementById('espAlto').value, 2.5, 1, 12);
    def.color = document.getElementById('espColor').value || '#3f7fbf';
    def.muros = document.getElementById('espMuros').checked;
    def.techo = document.getElementById('espTecho').checked;
  }
  personalizados.push(def);
  const g = (clase === 'edificio') ? construirEdificio(def) : construirEspacio(def);
  ajustarEtiquetaNueva(g);
  guardarCompartido();
  document.getElementById('espOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, 2, g.position.z, clase === 'edificio' ? 95 : 55, camCtrl.theta, 1.05);
  avisoGuardado((clase === 'edificio' ? 'Edificio' : 'Espacio') + ' "' + nombre + '" creado — arrástralo para ubicarlo');
}
function eliminarPersonalizadoIdx(i){
  const p = personalizados[i];
  if (p) eliminarPersonalizado(p.nombre);
}
function editarPersonalizadoIdx(i){
  const p = personalizados[i];
  if (p) abrirEditorPersonalizado(p.nombre);
}
function irAPersonalizadoIdx(i){
  const p = personalizados[i];
  if (!p) return;
  const g = draggables.find(g2 => g2.userData.personalizado && g2.userData.info.nombre === p.nombre);
  if (!g) return;
  document.getElementById('espOverlay').style.display = 'none';
  seleccionar(g);
  irA(g.position.x, 2, g.position.z, p.clase === 'edificio' ? 95 : 55, camCtrl.theta, 1.05);
}

function abrirEspacios(){
  renderEspacios();
  document.getElementById('espOverlay').style.display = 'flex';
}
document.getElementById('btnEspacios').onclick = abrirEspacios;
document.getElementById('espCerrar').onclick = () => {
  document.getElementById('espOverlay').style.display = 'none';
};
document.getElementById('espOverlay').addEventListener('click', e => {
  if (e.target.id === 'espOverlay') e.target.style.display = 'none';
});
