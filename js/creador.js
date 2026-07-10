/* Espacios y edificios creados por el usuario: crear con sus medidas, listar,
   eliminar cuando ya no se necesiten y persistir junto al resto del estado.
   Los espacios creados se comportan como cualquier provisional: se arrastran,
   giran, bloquean y aparecen como destino de los camiones de materiales. */

/* ============ 14. ESPACIOS Y EDIFICIOS PERSONALIZADOS ============ */
let personalizados = [];   // defs: { clase:'espacio'|'edificio', nombre, w, d, h?, color?, muros?, techo?, pisos?, hPiso?, pos:[x,z] }

function numLim(v, defecto, min, max){
  v = parseFloat(v);
  if (!isFinite(v)) v = defecto;
  return Math.min(max, Math.max(min, v));
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
  return g;
}

/* ---- edificio: pisos apilados con la fachada tipo del proyecto ---- */
function construirEdificio(def){
  const hP = def.hPiso || CFG.hPiso;
  const alto = def.pisos * hP;
  const g = new THREE.Group();
  for (let i = 0; i < def.pisos; i++){
    const matF = new THREE.MeshLambertMaterial({ map: texFach.clone() });
    matF.map.needsUpdate = true;
    matF.map.repeat.set(Math.max(1, Math.round(def.w / 6.2)), 1);
    const mats = [matLado.clone(), matLado.clone(), matTecho.clone(), matTecho.clone(), matF, matF.clone()];
    const piso = new THREE.Mesh(new THREE.BoxGeometry(def.w, hP, def.d), mats);
    piso.position.y = i * hP + hP / 2;
    piso.castShadow = true; piso.receiveShadow = true;
    g.add(piso);
    const losa = new THREE.Mesh(new THREE.BoxGeometry(def.w + 0.5, 0.2, def.d + 0.35), matLosaT.clone());
    losa.position.y = (i + 1) * hP;
    g.add(losa);
  }
  g.userData.esProvisional = true;
  g.userData.personalizado = true;
  g.userData.info = {
    nombre: def.nombre, w: def.w, d: def.d, h: alto,
    aforo: '—',
    dimensiones: def.w + ' × ' + def.d + ' m · ' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos'),
    altura: (Math.round(alto * 100) / 100) + ' m (' + def.pisos + ' × ' + hP + ' m de entrepiso)',
    material: 'Edificio creado por el equipo desde el botón "Espacios"',
    cerramiento: 'Volumen de referencia con la fachada tipo del proyecto',
    descripcion: (def.descripcion ? esc(def.descripcion).replace(/\n/g, '<br>') + '<br><br>' : '') +
      'Edificio de ' + def.pisos + (def.pisos === 1 ? ' piso' : ' pisos') +
      ' creado por el equipo. Arrástralo para ubicarlo, gíralo de a 45°, bloquéalo ' +
      'o elimínalo cuando ya no lo necesites en la obra.'
  };
  const et = crearEtiqueta(def.nombre, Math.max(10, Math.min(26, def.w * 0.9)));
  et.position.y = alto + 2.2;
  g.add(et);
  g.position.set(def.pos[0], 0, def.pos[1]);
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
      pTitulo.textContent = 'Panel de obra';
      pBody.innerHTML = '<b>' + esc(nombre) + '</b> se eliminó de la obra. Haz clic sobre cualquier elemento para ver su ficha.';
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
      descripcion: String(def.descripcion || '').slice(0, 400)
    };
    if (d2.clase === 'edificio'){
      d2.pisos = Math.round(numLim(def.pisos, 5, 1, 30));
      d2.hPiso = numLim(def.hPiso, CFG.hPiso, 2, 5);
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
            ' <b style="color:#e8ecf2">' + esc(p.nombre) + '</b> <small>· ' + dims + '</small></span>' +
          '<span>' +
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
        '</span>' +
      '</div>' +
      '<button class="orgAccion primario" style="margin:0; align-self:flex-start" onclick="agregarPersonalizado()">' +
        icono('mas') + 'Crear y ubicar en la obra</button>' +
    '</div>';
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
  const def = { clase, nombre, descripcion, pos: posicionLibre() };
  if (clase === 'edificio'){
    def.w = numLim(document.getElementById('espAncho').value, 20, 2, 80);
    def.d = numLim(document.getElementById('espFondo').value, 12, 2, 60);
    def.pisos = Math.round(numLim(document.getElementById('espPisos').value, 5, 1, 30));
    def.hPiso = numLim(document.getElementById('espHPiso').value, CFG.hPiso, 2, 5);
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
