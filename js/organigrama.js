/* Organigrama de la obra: roles, funciones editables, resaltado por rol y zonas de riesgo */

/* ============ 12b. ORGANIGRAMA DE LA OBRA ============ */
const ORG = {
  coordinador: {
    titulo:'Coordinadora General', nombre:'Manuela Garcia', color:'#b06ad4', emissive:0x3a1d4d, pinta:null,
    resumen:'Encargada de todo el proyecto: responde por el resultado global ante la gerencia.',
    funciones:[
      'Representa a la gerencia y responde por el resultado global del proyecto',
      'Aprueba el presupuesto maestro, el cronograma general y los cambios mayores',
      'Coordina diseño, construcción, ventas y entregas entre etapas',
      'Gestiona licencias, pólizas y contratos marco',
      'Preside los comités de obra y reporta a la junta directiva'
    ]
  },
  interventor: {
    titulo:'Interventor', nombre:'Jorge Pineda', color:'#16a085', emissive:0x0b4d40, pinta:'todo', punteado:true,
    resumen:'Revisa todo el proyecto en términos de ejecución: verifica que lo construido cumpla lo contratado.',
    funciones:[
      'Verifica que la ejecución cumpla planos y especificaciones',
      'Revisa y aprueba actas de avance y cortes de obra',
      'Avala pagos según la obra realmente ejecutada',
      'Exige correcciones cuando encuentra no conformidades',
      'Informa al contratante sobre el estado real del proyecto'
    ]
  },
  director: {
    titulo:'Director de Obra', nombre:'Carlos Holguin', color:'#f0a340', emissive:0x664411, pinta:'todo',
    resumen:'Encargado de todo lo que se hace en obra.',
    funciones:[
      'Dirige toda la ejecución en obra: programación semanal y frentes de trabajo',
      'Administra contratistas y mano de obra',
      'Controla calidad, plazos y rendimientos',
      'Aprueba requisiciones de materiales y equipos',
      'Es el interlocutor con la interventoría y la coordinación'
    ]
  },
  resAdmin: {
    titulo:'Residente Administrativo', nombre:'Bryan Yama', auxiliar:'Sofía Delgado', color:'#4da3ff', emissive:0x123a66, pinta:'costos',
    resumen:'Encargado de todo lo que genera dinero o aumenta los gastos de la obra.',
    funciones:[
      'Controla costos, presupuesto y flujo de caja de la obra',
      'Maneja el almacén, los inventarios y las compras (requisiciones)',
      'Administra nómina, contratos y seguridad social del personal',
      'Elabora cortes de obra y facturación',
      'Controla los gastos generales del campamento'
    ]
  },
  resEstructura: {
    titulo:'Residente de Estructura', nombre:'Bryan Yama', auxiliar:'Julián Mora', color:'#9fb6c9', emissive:0x2c3f52, pinta:'estructura',
    resumen:'Encargado de toda la estructura.',
    funciones:[
      'Supervisa armado de acero, formaleta y vaciados de concreto',
      'Controla resistencias (cilindros) y calidad del concreto',
      'Hace el replanteo y control topográfico de la estructura',
      'Coordina izajes y el uso del montacargas para estructura',
      'Revisa juntas, desplomes y tolerancias'
    ]
  },
  resCerramiento: {
    titulo:'Residente de Cerramiento y Acabados', nombre:'Laura Cardona', auxiliar:'Esteban Ruiz', color:'#58b368', emissive:0x1d5b2a, pinta:'acabados',
    resumen:'Encargada de los acabados y de las cuadrillas de mamposteros.',
    funciones:[
      'Dirige mampostería, pañetes y cerramientos de fachada',
      'Coordina las cuadrillas de mamposteros y acabados',
      'Controla enchapes, estuco, pintura y carpinterías',
      'Recibe apartamentos y gestiona los remates',
      'Solicita los materiales de acabados al almacén'
    ]
  },
  sst: {
    titulo:'Residente SST', nombre:'Camila Ríos', color:'#e74c3c', emissive:0x661111, pinta:null, riesgos:true,
    resumen:'Seguridad y salud en el trabajo de toda la obra: identifica y señaliza las zonas de mayor riesgo (semáforo rojo / amarillo / verde).',
    funciones:[
      'Implementa el plan SST y la matriz de riesgos de la obra',
      'Autoriza permisos de trabajo en altura y espacios confinados',
      'Inspecciona andamios, arneses, líneas de vida y montacargas',
      'Capacita al personal e investiga incidentes',
      'Señaliza y controla las zonas de riesgo (estilo semáforo)'
    ]
  }
};
let funcionesExtra = {};   // funciones agregadas por el equipo → se comparten vía Supabase
let rolPintado = null;     // rol cuya área está resaltada en el 3D
let zonasRiesgo = null;    // grupo de zonas semáforo del SST

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function nodoOrg(id){
  const r = ORG[id];
  return '<div class="orgNodo' + (r.punteado ? ' punteado' : '') + '" style="border-color:' + r.color + '" onclick="abrirRol(\'' + id + '\')">' +
    '<div class="rol" style="color:' + r.color + '">' + r.titulo + '</div>' +
    '<div class="nom">' + r.nombre + '</div>' +
    (r.auxiliar ? '<div class="aux">Auxiliar: ' + r.auxiliar + '</div>' : '') +
    '</div>';
}
function renderOrganigrama(){
  document.getElementById('orgTitulo').textContent = 'Organigrama de la obra';
  document.getElementById('orgBody').innerHTML =
    '<div class="orgNivel">' + nodoOrg('coordinador') + nodoOrg('interventor') + '</div>' +
    '<div class="orgConector"></div>' +
    '<div class="orgNivel">' + nodoOrg('director') + '</div>' +
    '<div class="orgConector"></div>' +
    '<div class="orgNivel">' + nodoOrg('resAdmin') + nodoOrg('resEstructura') + nodoOrg('resCerramiento') + nodoOrg('sst') + '</div>' +
    '<div class="desc" style="margin-top:12px">Haz clic sobre cualquier rol para ver sus funciones, agregarle trabajos, resaltar su área en el 3D o ver las zonas de riesgo (SST). Cada residente cuenta con un auxiliar de residente en campo.</div>';
}
function abrirRol(id){
  const r = ORG[id];
  if (!r) return;
  const extra = funcionesExtra[id] || [];
  document.getElementById('orgTitulo').textContent = r.titulo + ' — ' + r.nombre;
  document.getElementById('orgBody').innerHTML =
    '<div style="border-left:4px solid ' + r.color + '; padding-left:10px; margin-bottom:10px">' +
      '<b style="color:' + r.color + '">' + r.titulo + '</b> · ' + r.nombre +
      (r.auxiliar ? '<br><small>Auxiliar de residente: ' + r.auxiliar + '</small>' : '') +
      '<div class="desc">' + r.resumen + '</div>' +
    '</div>' +
    '<b>Funciones:</b>' +
    r.funciones.map(f => '<div class="orgFn"><span>• ' + f + '</span></div>').join('') +
    extra.map((f, i) =>
      '<div class="orgFn"><span>' + icono('mas') + ' ' + esc(f) + '</span><span class="fnX" title="Quitar" onclick="quitarFuncion(\'' + id + '\',' + i + ')">✕</span></div>'
    ).join('') +
    '<div id="orgAgregar">' +
      '<input id="fnNueva" maxlength="140" placeholder="Agregar otro trabajo / función a este rol…">' +
      '<button class="orgAccion primario" style="margin:0" onclick="agregarFuncion(\'' + id + '\')">' + icono('mas') + 'Agregar</button>' +
    '</div>' +
    '<div style="margin-top:6px">' +
      (r.pinta ? '<button class="orgAccion" onclick="pintarRol(\'' + id + '\')">' +
        icono('pincel') + (rolPintado === id ? 'Quitar resaltado del 3D' : 'Resaltar su área en el 3D') + '</button>' : '') +
      (r.riesgos ? '<button class="orgAccion" onclick="toggleRiesgos()">' +
        icono('alerta') + (zonasRiesgo ? 'Ocultar zonas de riesgo' : 'Ver zonas de riesgo en 3D') + '</button>' : '') +
      '<button class="orgAccion" onclick="renderOrganigrama()">' + icono('volver') + 'Volver al organigrama</button>' +
    '</div>';
  const inp = document.getElementById('fnNueva');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') agregarFuncion(id); });
}
function agregarFuncion(id){
  const inp = document.getElementById('fnNueva');
  const txt = (inp.value || '').trim().slice(0, 140);
  if (!txt) return;
  if (!funcionesExtra[id]) funcionesExtra[id] = [];
  funcionesExtra[id].push(txt);
  guardarCompartido();
  abrirRol(id);
  avisoGuardado('Función agregada a ' + ORG[id].titulo);
}
function quitarFuncion(id, i){
  if (!funcionesExtra[id]) return;
  funcionesExtra[id].splice(i, 1);
  guardarCompartido();
  abrirRol(id);
}

/* ---- Resaltar en el 3D el área de cada rol ---- */
function esObjetivoRol(rol, obj){
  if (!rol || !rol.pinta) return false;
  if (rol.pinta === 'todo') return true;
  const nom = (obj.userData.info && obj.userData.info.nombre) || '';
  if (rol.pinta === 'costos') return /Almacén|paletizado|Portería|Campamento|Acometida/i.test(nom);
  if (rol.pinta === 'estructura') return obj === edificio || obj === malacate;
  if (rol.pinta === 'acabados') return obj === edificio || /Almacén central/i.test(nom);
  return false;
}
function repintarTodo(){
  [...draggables, edificio, cerramiento, malacate].forEach(actualizarTinte);
}
function pintarRol(id){
  rolPintado = (rolPintado === id) ? null : id;
  repintarTodo();
  document.getElementById('orgOverlay').style.display = 'none';
  avisoGuardado(rolPintado ? 'Resaltado: área de ' + ORG[id].titulo : 'Resaltado quitado');
}

/* ---- Zonas de riesgo estilo semáforo (SST) ---- */
function buscarProv(sub){
  return draggables.find(g => g.userData.info.nombre.toLowerCase().includes(sub.toLowerCase()));
}
function crearZonaRiesgo(x, z, w, d, color, rgba, texto){
  const caja = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2.4, d),
    new THREE.MeshLambertMaterial({ color, transparent:true, opacity:0.25, depthWrite:false })
  );
  caja.position.set(x, 1.2, z);
  zonasRiesgo.add(caja);
  const et = crearEtiqueta(texto, 22, rgba);
  et.position.set(x, 4.6, z);
  zonasRiesgo.add(et);
}
function zonaProv(sub, color, rgba, texto){
  const p = buscarProv(sub);
  if (p) crearZonaRiesgo(p.position.x, p.position.z, p.userData.info.w + 3, p.userData.info.d + 3, color, rgba, texto);
}
function toggleRiesgos(){
  if (zonasRiesgo){
    scene.remove(zonasRiesgo);
    zonasRiesgo = null;
    avisoGuardado('Zonas de riesgo ocultas');
    if (document.getElementById('orgOverlay').style.display === 'flex') abrirRol('sst');
    return;
  }
  zonasRiesgo = new THREE.Group();
  const ROJO = 0xd63030, AMAR = 0xe0b020, VERDE = 0x35a04a;
  const cR = 'rgba(160,25,25,0.88)', cA = 'rgba(150,110,10,0.88)', cV = 'rgba(20,110,45,0.88)';
  // ALTO
  crearZonaRiesgo(0, 0, CFG.largo + 5, CFG.fondo + 5, ROJO, cR, 'ALTO · Trabajo en altura / caída de objetos — Torre 01');
  crearZonaRiesgo(CFG.torre2.cx, CFG.torre2.dz, CFG.torre2.largo + 5, CFG.torre2.fondo + 5, ROJO, cR, 'ALTO · Trabajo en altura — Torre 02');
  crearZonaRiesgo(malacate.position.x, malacate.position.z, 7, 7, ROJO, cR, 'ALTO · Izaje de cargas (montacargas)');
  zonaProv('maniobra', ROJO, cR, 'ALTO · Maquinaria y volquetas en movimiento');
  // MEDIO
  zonaProv('Almacén central', AMAR, cA, 'MEDIO · Manipulación y acopio de cargas');
  zonaProv('paletizado', AMAR, cA, 'MEDIO · Acopio de materiales');
  zonaProv('Acometida eléctrica', AMAR, cA, 'MEDIO · Riesgo eléctrico');
  zonaProv('Lavado', AMAR, cA, 'MEDIO · Piso húmedo');
  // BAJO
  zonaProv('Campamento', VERDE, cV, 'BAJO · Zona administrativa');
  zonaProv('Comedor', VERDE, cV, 'BAJO · Bienestar');
  zonaProv('Casilleros', VERDE, cV, 'BAJO · Bienestar');
  zonaProv('vestieres', VERDE, cV, 'BAJO · Bienestar');
  zonaProv('Portería', VERDE, cV, 'BAJO · Control de acceso');
  scene.add(zonasRiesgo);
  document.getElementById('orgOverlay').style.display = 'none';
  avisoGuardado('Zonas de riesgo visibles (SST)');
}

document.getElementById('btnOrg').onclick = () => {
  renderOrganigrama();
  document.getElementById('orgOverlay').style.display = 'flex';
};
document.getElementById('orgCerrar').onclick = () => {
  document.getElementById('orgOverlay').style.display = 'none';
};
document.getElementById('orgOverlay').addEventListener('click', e => {
  if (e.target.id === 'orgOverlay') e.target.style.display = 'none';
});
