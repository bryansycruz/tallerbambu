/* Modificar cualquier elemento seleccionado (provisional de fábrica, espacio
   o edificio creado, o equipo): renombrar, cambiar color o eliminar — desde
   la pestaña "Modificar" del panel. Usa "idEstable" (asignado al construir
   cada elemento: 'p:' fábrica, 'c:' espacio/edificio, 'q:' equipo) para saber
   en qué lista guardar el cambio, sin depender del nombre visible (que puede
   cambiar). Los provisionales de fábrica no tienen una "def" propia, así que
   sus cambios se guardan en overridesProvisionales, indexados por su nombre
   ORIGINAL (userData.nombreOriginal, fijo, definido en provisionales.js). */

/* ============ 17. RENOMBRAR / RECOLOREAR (genérico) ============ */
let overridesProvisionales = {};   // { [nombreOriginal]: { nombre?, color?, eliminado? } }

/* reconstruye la etiqueta flotante de un grupo con un texto nuevo,
   conservando su tamaño, altura y color de fondo */
function regenerarEtiqueta(g, nuevoTexto){
  let vieja = null;
  g.traverse(n => { if (n.isSprite && !vieja) vieja = n; });
  const ancho = vieja ? vieja.scale.x : 12;
  const y = vieja ? vieja.position.y : 2.2;
  const visible = vieja ? vieja.visible : true;
  if (vieja){
    g.remove(vieja);
    const idx = etiquetasTodas.indexOf(vieja);
    if (idx >= 0) etiquetasTodas.splice(idx, 1);
  }
  const colorFondo = g.userData.esEquipo ? 'rgba(70,120,45,0.9)' : undefined;
  const nueva = crearEtiqueta(nuevoTexto, ancho, colorFondo);
  nueva.position.y = y;
  nueva.visible = visible;
  g.add(nueva);
}
/* repinta TODOS los materiales del grupo con un único color (recoloreado
   genérico: funciona igual para un provisional, un edificio o un equipo) */
function aplicarColorATraves(g, hex){
  let color;
  try { color = new THREE.Color(hex); } catch (e) { return; }
  g.traverse(n => {
    if (n.isMesh && n.material){
      (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => { if (m.color) m.color.copy(color); });
    }
  });
}

function renombrarSeleccionado(){
  if (!seleccionado) return;
  const input = document.getElementById('modNombre');
  if (!input) return;
  const actual = seleccionado.userData.info.nombre;
  let nuevo = String(input.value || '').trim().slice(0, 40);
  if (!nuevo || nuevo === actual) return;
  let base = nuevo, n = 2;
  while (draggables.some(g => g !== seleccionado && g.userData.info.nombre === nuevo)) nuevo = base + ' ' + (n++);
  const id = seleccionado.userData.idEstable || '';
  if (id.indexOf('p:') === 0){
    const original = seleccionado.userData.nombreOriginal;
    overridesProvisionales[original] = overridesProvisionales[original] || {};
    overridesProvisionales[original].nombre = nuevo;
  } else if (id.indexOf('c:') === 0){
    const def = personalizados.find(p => p.id === id.slice(2));
    if (def) def.nombre = nuevo;
  } else if (id.indexOf('q:') === 0){
    const def = equiposCreados.find(e => e.id === id.slice(2));
    if (def) def.nombre = nuevo;
  } else {
    return;
  }
  seleccionado.userData.info.nombre = nuevo;
  regenerarEtiqueta(seleccionado, nuevo);
  // el destino de camiones ya programados sigue apuntando al mismo lugar
  if (typeof camiones !== 'undefined' && Array.isArray(camiones)){
    camiones.forEach(c => { if (c && c.zona === actual) c.zona = nuevo; });
  }
  reconstruirSelector();
  guardarCompartido();
  seleccionar(seleccionado);
  avisoGuardado('Renombrado a "' + nuevo + '"');
}
function recolorearSeleccionado(){
  if (!seleccionado) return;
  const input = document.getElementById('modColor');
  if (!input) return;
  const hex = input.value;
  const id = seleccionado.userData.idEstable || '';
  if (!id){ avisoGuardado('Este elemento no tiene color editable'); return; }
  aplicarColorATraves(seleccionado, hex);
  if (id.indexOf('p:') === 0){
    const original = seleccionado.userData.nombreOriginal;
    overridesProvisionales[original] = overridesProvisionales[original] || {};
    overridesProvisionales[original].color = hex;
  } else if (id.indexOf('c:') === 0){
    const def = personalizados.find(p => p.id === id.slice(2));
    if (def) def.color = hex;
  } else if (id.indexOf('q:') === 0){
    const def = equiposCreados.find(e => e.id === id.slice(2));
    if (def) def.color = hex;
  }
  guardarCompartido();
  avisoGuardado('Color actualizado');
}
/* recolorea solo los paneles de lámina del cerramiento perimetral (no los
   postes ni el portón) — pintarCerramiento() vive en escena.js junto a su
   construcción, y guarda el color elegido en userData para persistirlo */
function recolorearCerramiento(){
  const input = document.getElementById('modColorCerr');
  if (!input) return;
  pintarCerramiento(input.value);
  guardarCompartido();
  avisoGuardado('Color del cerramiento actualizado');
}
function eliminarSeleccionado(){
  if (!seleccionado) return;
  const id = seleccionado.userData.idEstable || '';
  const nombre = seleccionado.userData.info.nombre;
  if (id.indexOf('c:') === 0){
    eliminarPersonalizado(nombre);        // creador.js
  } else if (id.indexOf('q:') === 0){
    eliminarEquipo(nombre);               // equipos.js
  } else if (id.indexOf('p:') === 0){
    const original = seleccionado.userData.nombreOriginal;
    overridesProvisionales[original] = overridesProvisionales[original] || {};
    overridesProvisionales[original].eliminado = true;
    quitarGrupoEscena(seleccionado);
    const idx = draggables.indexOf(seleccionado);
    if (idx >= 0) draggables.splice(idx, 1);
    seleccionado = null;
    mostrarPanelSinSeleccion();
    reconstruirSelector();
    guardarCompartido();
    avisoGuardado('"' + nombre + '" eliminado de la obra');
  } else {
    avisoGuardado('Este elemento no se puede eliminar');
  }
}

/* aplica los overrides guardados sobre los provisionales de fábrica recién
   reconstruidos (llamado desde estado.js, después de que todo ya existe en
   draggables con su nombre original de fábrica) */
function aplicarOverridesProvisionales(dict){
  overridesProvisionales = (dict && typeof dict === 'object' && !Array.isArray(dict)) ? dict : {};
  Object.keys(overridesProvisionales).forEach(nombreOriginal => {
    const ov = overridesProvisionales[nombreOriginal];
    if (!ov) return;
    const g = draggables.find(x => x.userData.nombreOriginal === nombreOriginal);
    if (!g) return;
    if (ov.eliminado){
      quitarGrupoEscena(g);
      const idx = draggables.indexOf(g);
      if (idx >= 0) draggables.splice(idx, 1);
      return;
    }
    if (ov.color) aplicarColorATraves(g, ov.color);
    if (ov.nombre && ov.nombre !== g.userData.info.nombre){
      g.userData.info.nombre = ov.nombre;
      regenerarEtiqueta(g, ov.nombre);
    }
  });
}
