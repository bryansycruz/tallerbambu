/* Camiones de materiales: reloj de obra simulado y entregas programadas POR zona.
   Cada camión programado entra por la vía de acceso a su hora, recorre la obra
   hasta la zona elegida (mostrando su recorrido), descarga y sale por el lavado
   de llantas. Escala 1:1 y altura pegada al terreno (no se hunde en pendientes). */

/* ============ 12d. CAMIONES DE MATERIALES ============ */
let camiones = [];            // [{ fecha:'2026-07-10', hora:'08:00', material:'Cerámica', zona:'Almacén central' }]
let horaObra = 6 * 60;        // minutos desde medianoche (la obra arranca a las 06:00)
let relojCorriendo = true;
let VEL_RELOJ = 12;           // minutos de obra por segundo real (ajustable: ver selector de velocidad)
const camionesActivos = [];   // camiones circulando en la escena
let zonaCamionSel = 'Almacén central';  // destino preseleccionado en la ventana
let elHoraObraTxt = null;     // cache del nodo del reloj (se consulta en cada cuadro)

function minutosAHora(m){
  m = ((Math.floor(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function horaAMinutos(h){
  const p = String(h || '').split(':');
  return ((parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0)) % 1440;
}
/* ---- fecha simulada de la obra (calendario, no solo hora del día) ---- */
function fechaISO(d){
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function sumarDiaISO(iso){
  const p = String(iso || '').split('-').map(Number);
  const d = new Date(p[0] || 1970, (p[1] || 1) - 1, p[2] || 1);
  d.setDate(d.getDate() + 1);
  return fechaISO(d);
}
let fechaObra = fechaISO();   // día simulado de la obra (avanza con el reloj acelerado)

/* ---- camión de materiales a escala 1:1 (~9 m largo · 2,6 m ancho · 3,6 m alto) ---- */
function crearCamion3D(){
  const cam = new THREE.Group();
  caja(cam, 2.5, 0.5, 9, 0x2b2f36, 0, 0.75, 0);          // chasis
  caja(cam, 2.5, 2.4, 2.4, 0x2e6db8, 0, 1.95, 3.1);      // cabina (frente en +z)
  caja(cam, 2.32, 1.0, 0.08, 0x9fc4e8, 0, 2.55, 4.28);   // parabrisas
  caja(cam, 2.6, 2.6, 6.0, 0xe6e2d8, 0, 2.35, -1.2);     // furgón / volco
  [[-1.2,3.0],[1.2,3.0],[-1.2,-1.4],[1.2,-1.4],[-1.2,-3.2],[1.2,-3.2]].forEach(([x, z]) => {
    const r = cilindro(cam, 0.55, 0.45, 0x15181c, x, 0.55, z);
    r.rotation.z = Math.PI/2;
  });
  return cam;
}
/* cono truncado (para el tanque de la pipa cementera): r1 = radio de la
   base, r2 = radio de la punta */
function conoTruncadoCam(g, r1, r2, h, color, x, y, z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, h, 16), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
}
/* ---- camión planchón: plataforma plana para acero, formaleta y maquinaria menor ---- */
function crearCamionPlanchon(){
  const cam = new THREE.Group();
  caja(cam, 2.3, 0.5, 11.4, 0x2b2f36, 0, 0.85, 0);
  caja(cam, 2.4, 1.9, 2.1, 0x2e6db8, 0, 2.0, 4.55);
  caja(cam, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 5.62);
  caja(cam, 2.55, 0.22, 8.8, 0xa97a4d, 0, 1.25, -1.1);
  [-1.22, 1.22].forEach(x => caja(cam, 0.08, 0.35, 8.8, 0x6d7075, x, 1.5, -1.1));
  [4.5, 3.3, -2.6, -3.9].forEach(z => [-1.1, 1.1].forEach(x => {
    const r = cilindro(cam, 0.6, 0.45, 0x15181c, x, 0.6, z); r.rotation.z = Math.PI / 2;
  }));
  return cam;
}
/* ---- pipa cementera: cisterna que transporta cemento a granel ---- */
function crearPipaCementera(){
  const cam = new THREE.Group();
  const c = 0xd9dde0;
  caja(cam, 2.3, 0.5, 9.4, 0x2b2f36, 0, 0.85, 0);
  caja(cam, 2.4, 1.9, 2.0, 0xc9581e, 0, 2.0, 3.6);
  caja(cam, 2.2, 0.8, 0.06, 0x9fc4e8, 0, 2.45, 4.62);
  const tanque = cilindro(cam, 1.25, 6.2, c, 0, 2.45, -0.9); tanque.rotation.x = Math.PI / 2;
  const c1 = conoTruncadoCam(cam, 1.25, 0.35, 0.9, c, 0, 2.45, 2.6); c1.rotation.x = Math.PI / 2;
  const c2 = conoTruncadoCam(cam, 1.25, 0.35, 0.9, c, 0, 2.45, -4.4); c2.rotation.x = -Math.PI / 2;
  [0.4, -2.2].forEach(z => cilindro(cam, 0.28, 0.35, 0x8a8f96, 0, 3.8, z));
  cilindro(cam, 0.12, 2.2, 0x8a8f96, 0.95, 1.5, -4.4);
  [3.4, -2.4, -3.7].forEach(z => [-1.1, 1.1].forEach(x => {
    const r = cilindro(cam, 0.6, 0.45, 0x15181c, x, 0.6, z); r.rotation.z = Math.PI / 2;
  }));
  return cam;
}
/* catálogo de vehículos disponibles al programar un camión */
const TIPOS_CAMION = {
  volqueta: { nombre: 'Volqueta', fabrica: crearCamion3D },
  planchon: { nombre: 'Camión planchón (acero/formaleta)', fabrica: crearCamionPlanchon },
  pipa:     { nombre: 'Pipa cementera', fabrica: crearPipaCementera }
};
function opcionesTipoCamion(sel){
  return Object.keys(TIPOS_CAMION).map(k =>
    '<option value="' + k + '"' + (k === (sel || 'volqueta') ? ' selected' : '') + '>' + esc(TIPOS_CAMION[k].nombre) + '</option>').join('');
}

/* ---- ubicación de cualquier zona por su nombre (para el destino del camión) ---- */
function posicionZona(nombre){
  const g = draggables.find(d => d.userData.info.nombre === nombre);
  if (g) return { x: g.position.x, z: g.position.z, w: g.userData.info.w, d: g.userData.info.d };
  if (nombre && /torre|piso|edificio/i.test(nombre)) return { x: 0, z: 0, w: CFG.largo, d: CFG.fondo };
  if (nombre){
    const m = malacates.find(mm => mm.userData.info.nombre === nombre);
    if (m) return { x: m.position.x, z: m.position.z, w: 3, d: 3 };
    if (/malacate/i.test(nombre)) return { x: malacate.position.x, z: malacate.position.z, w: 3, d: 3 };
  }
  const alm = draggables.find(d => d.userData.info.nombre === 'Almacén central');
  return alm ? { x: alm.position.x, z: alm.position.z, w: alm.userData.info.w, d: alm.userData.info.d }
             : { x: 38, z: 15, w: 37.5, d: 13.9 };
}

/* Construye una polilínea de puntos [x,z] en una curva suave, pegada al terreno */
function curvaTerreno(paresXZ, altura){
  const base = new THREE.CatmullRomCurve3(paresXZ.map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const n = Math.max(40, paresXZ.length * 14);
  const pts = [];
  for (let i = 0; i <= n; i++){
    const p = base.getPointAt(i / n);
    pts.push(new THREE.Vector3(p.x, alturaTerreno(p.x, p.z) + (altura || 0.05), p.z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/* une cada tramo consecutivo [puntos[i]→puntos[i+1]] siguiendo la red de
   vías dibujada por el usuario (js/vias.js) si existe una que los conecte;
   si no hay vías (o no llegan a esos puntos), queda la línea recta de
   siempre — por eso un proyecto sin vías dibujadas se comporta idéntico */
function encadenarConVias(puntos){
  let out = [puntos[0]];
  for (let i = 0; i < puntos.length - 1; i++){
    const tramo = (typeof tramoConVias === 'function') ? tramoConVias(puntos[i], puntos[i + 1]) : [puntos[i], puntos[i + 1]];
    out = out.concat(tramo.slice(1));
  }
  return out;
}

/* Recorrido completo de un camión hacia una zona: entrada → patio → zona → lavado → salida */
function recorridoCamion(nombreZona){
  const zona = posicionZona(nombreZona);
  const aprox = [zona.x, zona.z - zona.d/2 - 4.5];           // se aproxima desde el frente (lado vía)
  const patio = buscarProv('Patio de maniobra');
  const pPatio = patio ? [patio.position.x, patio.position.z + patio.userData.info.d/2 + 2] : [62, -3];
  const lav = buscarProv('Lavado de llantas');
  const pLav = lav ? [lav.position.x, lav.position.z] : [76, 4];
  const port = buscarProv('Portería');
  const pPort = port ? [port.position.x, port.position.z] : [84, -24];
  const autop = [118, 33];   // ingreso desde la autopista (final de la vía corta)
  // los camiones SIEMPRE entran y salen por la portería; si el usuario dibujó
  // vías que conectan estos puntos, el camión las recorre de verdad
  const ida = encadenarConVias([autop, pPort, pPatio, aprox]);
  const vuelta = encadenarConVias([aprox, pLav, pPort, autop]);
  return { ida, vuelta, descarga: aprox };
}

/* ---- Fila de acceso: los camiones NUNCA se chocan entre sí ----
   Todos comparten el mismo tramo de vía (autopista → portería → patio) y,
   si van a la misma zona, también el mismo punto de descargue. En vez de
   moverlos y luego revisar distancias cuadro a cuadro (costoso y frágil),
   se evita el choque desde el origen: un camión programado entra a una
   cola y solo se despacha (aparece su modelo 3D) cuando (a) ya pasó un
   tiempo mínimo desde el último despacho — así nunca hay dos ocupando la
   vía compartida al mismo tiempo — y (b) ningún camión activo va HACIA
   la misma zona todavía (si no, esperaría su turno ahí mismo). */
const colaCamiones = [];       // pedidos esperando salir (aún sin modelo 3D en escena)
let ultimoDespacho = -Infinity;
const SEPARACION_CAMIONES = 8; // segundos reales mínimos entre salidas

function lanzarCamion(c){
  colaCamiones.push(c);
}
function zonaOcupada(nombreZona){
  return camionesActivos.some(a => a.zona === nombreZona);
}
function procesarColaCamiones(){
  if (!colaCamiones.length) return;
  if (performance.now() - ultimoDespacho < SEPARACION_CAMIONES * 1000) return;
  const idx = colaCamiones.findIndex(c => !zonaOcupada((c && c.zona) || 'Almacén central'));
  if (idx === -1) return;   // todos los de la fila van a zonas con un camión adentro: esperan
  const c = colaCamiones.splice(idx, 1)[0];
  ultimoDespacho = performance.now();
  despacharCamion(c);
}
function despacharCamion(c){
  const nombreZona = (c && c.zona) || 'Almacén central';
  const material = (c && c.material) || 'materiales';
  const tipoVeh = (c && TIPOS_CAMION[c.vehiculo]) ? c.vehiculo : 'volqueta';
  const rec = recorridoCamion(nombreZona);
  const grupo = TIPOS_CAMION[tipoVeh].fabrica();
  scene.add(grupo);

  // recorrido visible sobre el suelo
  const rutaG = new THREE.Group();
  dibujarRecorrido(rutaG, [...rec.ida, ...rec.vuelta.slice(1)]);
  scene.add(rutaG);

  camionesActivos.push({
    grupo, rutaG, material, zona: nombreZona,
    curva: curvaTerreno(rec.ida, 0.05), rec,
    t: 0, dur: 26, fase: 'entrando', espera: 0
  });
  avisoGuardado(TIPOS_CAMION[tipoVeh].nombre + ' ingresando con ' + material + ' → ' + nombreZona);
}

/* línea punteada del recorrido + banderines de descarga */
function dibujarRecorrido(grupo, paresXZ){
  const curva = curvaTerreno(paresXZ, 0.25);
  const pts = curva.getPoints(160);
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const linea = new THREE.Line(geo, new THREE.LineDashedMaterial({ color:0x2e9bff, dashSize:2.4, gapSize:1.6 }));
  linea.computeLineDistances();
  grupo.add(linea);
}

const camTmpP = new THREE.Vector3();
const camTmpT = new THREE.Vector3();
function moverCamion(a, dt){
  if (a.fase === 'descargando'){
    a.espera -= dt;
    if (a.espera <= 0){
      a.fase = 'saliendo';
      a.curva = curvaTerreno(a.rec.vuelta, 0.05);
      a.t = 0; a.dur = 24;
    }
    return;
  }
  a.t += dt / a.dur;
  if (a.t >= 1){
    if (a.fase === 'entrando'){
      a.fase = 'descargando';
      a.espera = 6;
      avisoGuardado('Camión descargando ' + a.material + ' en ' + a.zona);
    } else {
      scene.remove(a.grupo);
      scene.remove(a.rutaG);
      a.terminado = true;
    }
    return;
  }
  const u = Math.min(a.t, 0.9999);
  a.curva.getPointAt(u, camTmpP);
  a.curva.getTangentAt(u, camTmpT);
  // altura pegada al terreno en el punto exacto (no se hunde en pendientes)
  a.grupo.position.set(camTmpP.x, alturaTerreno(camTmpP.x, camTmpP.z) + 0.05, camTmpP.z);
  a.grupo.rotation.y = Math.atan2(camTmpT.x, camTmpT.z);
}

/* ---- avance del reloj + disparo de camiones programados (desde animar) ----
   El reloj avanza rápido (VEL_RELOJ minutos de obra por segundo real) para que
   se note cómo entran los camiones a medida que pasan los días programados;
   al pasar medianoche, fechaObra avanza un día y el camión del día siguiente
   queda disponible para dispararse. */
function actualizarCamiones(dt){
  if (relojCorriendo && dt > 0){
    // se avanza de a lo sumo un día por vuelta: así, aunque la velocidad sea muy
    // alta y dt cubra varios días de una vez, ningún día intermedio se salta
    // sin revisar sus camiones programados.
    let restante = dt * VEL_RELOJ;
    while (restante > 0){
      const antes = horaObra;
      const paso = Math.min(restante, 1440 - antes);
      horaObra = antes + paso;
      camiones.forEach(c => {
        const m = horaAMinutos(c.hora);
        if (c.fecha === fechaObra && m > antes && m <= horaObra) lanzarCamion(c);
      });
      restante -= paso;
      if (horaObra >= 1440){ horaObra -= 1440; fechaObra = sumarDiaISO(fechaObra); }
    }
    const hh = minutosAHora(horaObra);
    // nodo cacheado: esto corre en cada cuadro (60/s) y buscarlo en el DOM
    // cada vez es trabajo inútil — el elemento nunca cambia
    const txt = elHoraObraTxt || (elHoraObraTxt = document.getElementById('horaObraTxt'));
    if (txt && txt.textContent !== hh){
      txt.textContent = hh;
      txt.parentElement.title = fechaObra;
      const enOverlay = document.getElementById('camHoraActual');
      if (enOverlay) enOverlay.textContent = hh;
      const fechaOverlay = document.getElementById('camFechaActual');
      if (fechaOverlay) fechaOverlay.textContent = fechaObra;
    }
  }
  for (let i = camionesActivos.length - 1; i >= 0; i--){
    moverCamion(camionesActivos[i], dt);
    if (camionesActivos[i].terminado) camionesActivos.splice(i, 1);
  }
  procesarColaCamiones();
}

/* ---- ventana de programación ---- */
function opcionesZonas(sel){
  return draggables.map(g => {
    const n = g.userData.info.nombre;
    return '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>';
  }).join('');
}
const VELOCIDADES = [4, 12, 30, 60, 120];
function opcionesVelocidad(){
  return VELOCIDADES.map(v => '<option value="' + v + '"' + (v === VEL_RELOJ ? ' selected' : '') + '>' +
    v + ' min/s' + '</option>').join('');
}
/* resumen de todos los pedidos programados: total, por día y por zona */
function resumenCamiones(){
  if (!camiones.length) return '';
  const porFecha = {}, porZona = {};
  camiones.forEach(c => {
    const f = c.fecha || fechaObra, z = c.zona || 'Almacén central';
    porFecha[f] = (porFecha[f] || 0) + 1;
    porZona[z] = (porZona[z] || 0) + 1;
  });
  const chips = (obj) => Object.entries(obj).sort((a, b) => a[0] < b[0] ? -1 : 1)
    .map(([k, n]) => '<span class="chipEspacio">' + esc(k) + ' · ' + n + '</span>').join('');
  return '<div class="desc" style="margin:6px 0 12px">' +
    '<b class="txtAcento">Resumen:</b> ' + camiones.length + ' ' + (camiones.length === 1 ? 'camión' : 'camiones') + ' programado' + (camiones.length === 1 ? '' : 's') + '.<br>' +
    '<div style="margin-top:5px; display:flex; flex-wrap:wrap; gap:5px">' + chips(porFecha) + '</div>' +
    '<div style="margin-top:5px; display:flex; flex-wrap:wrap; gap:5px">' + chips(porZona) + '</div>' +
  '</div>';
}
function renderCamiones(){
  const lista = [...camiones].sort((a, b) =>
    (a.fecha || '') !== (b.fecha || '') ? ((a.fecha || '') < (b.fecha || '') ? -1 : 1) : horaAMinutos(a.hora) - horaAMinutos(b.hora));
  const filas = lista.length
    ? lista.map(c => {
        const i = camiones.indexOf(c);
        return '<div class="planoFila">' +
          '<span class="planoNom">' + icono('camion') + ' <b class="txtFuerte">' + esc(c.fecha || fechaObra) + ' ' + esc(c.hora) + '</b> · ' +
            esc((TIPOS_CAMION[c.vehiculo] || TIPOS_CAMION.volqueta).nombre) + ' · ' +
            esc(c.material) + ' <small>→ ' + esc(c.zona || 'Almacén central') + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Enviar el camión a la fila de acceso" onclick="lanzarCamion(camiones[' + i + '])">' + icono('ruta') + '</button> ' +
            '<button class="planoBtn peligro" title="Quitar de la programación" onclick="quitarCamion(' + i + ')">' + icono('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no hay camiones programados.</div>';
  document.getElementById('camBody').innerHTML =
    '<div class="desc">Programa el día y la hora en que entra cada camión y a qué zona lleva el material. ' +
      'Al llegar ese momento en el reloj de la obra, el camión entra por la portería, recorre la obra hasta esa zona ' +
      '(se dibuja su recorrido), descarga y SIEMPRE sale por el lavado de llantas antes de salir por la portería. ' +
      'Si dos camiones coinciden, esperan su turno en la fila de acceso: nunca se cruzan ni se encima uno con otro. ' +
      'El reloj corre acelerado y avanza de día para que se note la entrada de camiones programados a futuro.</div>' +
    '<div style="display:flex; align-items:center; gap:8px; margin:12px 0; flex-wrap:wrap">' +
      '<b>Reloj de obra:</b> <span id="camFechaActual" class="txtSuave">' + fechaObra + '</span>' +
      '<span id="camHoraActual" style="font-variant-numeric:tabular-nums">' + minutosAHora(horaObra) + '</span>' +
      '<button class="orgAccion" style="margin:0" onclick="toggleReloj()">' + (relojCorriendo ? 'Pausar' : 'Reanudar') + '</button>' +
      '<label class="txtSuave" style="font-size:12.5px">Velocidad ' +
        '<select id="camVelocidad" onchange="cambiarVelocidad()">' + opcionesVelocidad() + '</select></label>' +
    '</div>' +
    '<div style="display:flex; align-items:center; gap:6px; margin:0 0 14px; flex-wrap:wrap">' +
      '<input type="date" id="camFechaSet" value="' + fechaObra + '">' +
      '<input type="time" id="camHoraSet" value="' + minutosAHora(horaObra) + '">' +
      '<button class="orgAccion" style="margin:0" onclick="fijarHoraObra()">Fijar día y hora</button>' +
    '</div>' +
    resumenCamiones() +
    '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap">' +
      '<b>Camiones programados</b>' +
      '<button class="orgAccion" style="margin:0" title="Descarga los pedidos en un archivo que abre Excel" onclick="descargarCamiones()">' +
        icono('bajar') + 'Descargar Excel</button>' +
    '</div>' + filas +
    '<div style="margin-top:12px; display:flex; flex-direction:column; gap:6px">' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<input type="date" id="camFecha" value="' + fechaObra + '">' +
        '<input type="time" id="camHora" value="08:00">' +
        '<input id="camMaterial" maxlength="60" placeholder="Material (ej: Cerámica)" style="flex:1; min-width:140px">' +
      '</div>' +
      '<div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap">' +
        '<span class="txtSuave">Vehículo:</span>' +
        '<select id="camVehiculo">' + opcionesTipoCamion('volqueta') + '</select>' +
        '<span class="txtSuave">Destino:</span>' +
        '<select id="camZona" style="flex:1">' + opcionesZonas(zonaCamionSel) + '</select>' +
        '<button class="orgAccion primario" style="margin:0" onclick="agregarCamion()">' + icono('mas') + 'Agregar</button>' +
      '</div>' +
    '</div>';
}
function cambiarVelocidad(){
  VEL_RELOJ = parseFloat(document.getElementById('camVelocidad').value) || 12;
  guardarCompartido();
}
function agregarCamion(){
  const fecha = document.getElementById('camFecha').value || fechaObra;
  const hora = document.getElementById('camHora').value;
  const material = (document.getElementById('camMaterial').value || '').trim().slice(0, 60) || 'Materiales';
  const vehiculo = TIPOS_CAMION[(document.getElementById('camVehiculo') || {}).value] ? document.getElementById('camVehiculo').value : 'volqueta';
  const zona = document.getElementById('camZona').value || 'Almacén central';
  if (!hora){ avisoGuardado('Elige la hora del camión'); return; }
  camiones.push({ fecha, hora, material, zona, vehiculo });
  zonaCamionSel = zona;
  guardarCompartido();
  renderCamiones();
  avisoGuardado(TIPOS_CAMION[vehiculo].nombre + ' programado: ' + material + ' el ' + fecha + ' ' + hora + ' → ' + zona);
}
function quitarCamion(i){
  camiones.splice(i, 1);
  guardarCompartido();
  renderCamiones();
}
/* ---- descarga de los pedidos programados en CSV (abre directo en Excel) ---- */
function descargarCamiones(){
  if (!camiones.length){ avisoGuardado('No hay camiones programados para descargar'); return; }
  const lista = [...camiones].sort((a, b) =>
    (a.fecha || '') !== (b.fecha || '') ? ((a.fecha || '') < (b.fecha || '') ? -1 : 1) : horaAMinutos(a.hora) - horaAMinutos(b.hora));
  const celda = v => {
    v = String(v == null ? '' : v);
    return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const filas = [
    ['Pedidos de camiones de materiales — Proyecto Bambú · Marinilla'],
    ['Generado', new Date().toLocaleString()],
    [],
    ['#', 'Fecha', 'Hora de entrada', 'Vehículo', 'Material', 'Zona de destino'],
    ...lista.map((c, i) => [i + 1, c.fecha || fechaObra, c.hora, (TIPOS_CAMION[c.vehiculo] || TIPOS_CAMION.volqueta).nombre, c.material, c.zona || 'Almacén central'])
  ];
  // BOM UTF-8 + separador ";": Excel en español lo abre con tildes y columnas correctas
  const csv = String.fromCharCode(0xFEFF) + filas.map(f => f.map(celda).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = 'pedidos_camiones_' + fecha + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  avisoGuardado('Pedidos descargados: pedidos_camiones_' + fecha + '.csv (ábrelo con Excel)');
}

function toggleReloj(){ relojCorriendo = !relojCorriendo; renderCamiones(); }
function fijarHoraObra(){
  const v = document.getElementById('camHoraSet').value;
  const f = document.getElementById('camFechaSet').value;
  if (!v) return;
  horaObra = horaAMinutos(v);
  if (f) fechaObra = f;
  document.getElementById('horaObraTxt').textContent = minutosAHora(horaObra);
  document.getElementById('horaObraTxt').parentElement.title = fechaObra;
  guardarCompartido();
  renderCamiones();
  avisoGuardado('Reloj de obra fijado en ' + fechaObra + ' ' + v);
}

function abrirCamiones(){
  renderCamiones();
  document.getElementById('camOverlay').style.display = 'flex';
}
/* llamada desde la ficha de una zona: preselecciona ese destino */
function programarCamionZona(nombreZona){
  zonaCamionSel = nombreZona;
  abrirCamiones();
}

document.getElementById('btnCamiones').onclick = () => { zonaCamionSel = 'Almacén central'; abrirCamiones(); };
document.getElementById('relojObra').onclick = document.getElementById('btnCamiones').onclick;
document.getElementById('camCerrar').onclick = () => {
  document.getElementById('camOverlay').style.display = 'none';
};
document.getElementById('camOverlay').addEventListener('click', e => {
  if (e.target.id === 'camOverlay') e.target.style.display = 'none';
});
