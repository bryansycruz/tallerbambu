/* Camiones de materiales: reloj de obra simulado y entregas programadas POR zona.
   Cada camión programado entra por la vía de acceso a su hora, recorre la obra
   hasta la zona elegida (mostrando su recorrido), descarga y sale por el lavado
   de llantas. Escala 1:1 y altura pegada al terreno (no se hunde en pendientes). */

/* ============ 12d. CAMIONES DE MATERIALES ============ */
let camiones = [];            // [{ hora:'08:00', material:'Cerámica', zona:'Almacén central' }]
let horaObra = 6 * 60;        // minutos desde medianoche (la obra arranca a las 06:00)
let relojCorriendo = true;
const VEL_RELOJ = 1;          // 1 segundo real = 1 minuto de obra
const camionesActivos = [];   // camiones circulando en la escena
let zonaCamionSel = 'Almacén central';  // destino preseleccionado en la ventana

function minutosAHora(m){
  m = ((Math.floor(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function horaAMinutos(h){
  const p = String(h || '').split(':');
  return ((parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0)) % 1440;
}

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

/* ---- ubicación de cualquier zona por su nombre (para el destino del camión) ---- */
function posicionZona(nombre){
  const g = draggables.find(d => d.userData.info.nombre === nombre);
  if (g) return { x: g.position.x, z: g.position.z, w: g.userData.info.w, d: g.userData.info.d };
  if (nombre && /torre|piso|edificio/i.test(nombre)) return { x: 0, z: 0, w: CFG.largo, d: CFG.fondo };
  if (nombre && /malacate/i.test(nombre)) return { x: malacate.position.x, z: malacate.position.z, w: 3, d: 3 };
  const alm = draggables.find(d => d.userData.info.nombre === 'Almacén central');
  return alm ? { x: alm.position.x, z: alm.position.z, w: alm.userData.info.w, d: alm.userData.info.d }
             : { x: 38, z: 15, w: 38, d: 13.9 };
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
  const autop = [124, -40];   // ingreso desde la autopista
  // los camiones SIEMPRE entran y salen por la portería
  const ida = [autop, pPort, pPatio, aprox];
  const vuelta = [aprox, pLav, pPort, autop];
  return { ida, vuelta, descarga: aprox };
}

function lanzarCamion(c){
  const nombreZona = (c && c.zona) || 'Almacén central';
  const material = (c && c.material) || 'materiales';
  const rec = recorridoCamion(nombreZona);
  const grupo = crearCamion3D();
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
  avisoGuardado('Camión ingresando con ' + material + ' → ' + nombreZona);
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

/* ---- avance del reloj + disparo de camiones programados (desde animar) ---- */
function actualizarCamiones(dt){
  if (relojCorriendo && dt > 0){
    const antes = horaObra;
    horaObra = (horaObra + dt * VEL_RELOJ) % 1440;
    camiones.forEach(c => {
      const m = horaAMinutos(c.hora);
      const disparado = antes <= horaObra ? (m > antes && m <= horaObra) : (m > antes || m <= horaObra);
      if (disparado) lanzarCamion(c);
    });
    const hh = minutosAHora(horaObra);
    const txt = document.getElementById('horaObraTxt');
    if (txt && txt.textContent !== hh){
      txt.textContent = hh;
      const enOverlay = document.getElementById('camHoraActual');
      if (enOverlay) enOverlay.textContent = hh;
    }
  }
  for (let i = camionesActivos.length - 1; i >= 0; i--){
    moverCamion(camionesActivos[i], dt);
    if (camionesActivos[i].terminado) camionesActivos.splice(i, 1);
  }
}

/* ---- ventana de programación ---- */
function opcionesZonas(sel){
  return draggables.map(g => {
    const n = g.userData.info.nombre;
    return '<option value="' + esc(n) + '"' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>';
  }).join('');
}
function renderCamiones(){
  const lista = [...camiones].sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora));
  const filas = lista.length
    ? lista.map(c => {
        const i = camiones.indexOf(c);
        return '<div class="planoFila">' +
          '<span class="planoNom">' + icono('camion') + ' <b style="color:#e8ecf2">' + esc(c.hora) + '</b> · ' +
            esc(c.material) + ' <small>→ ' + esc(c.zona || 'Almacén central') + '</small></span>' +
          '<span>' +
            '<button class="planoBtn" title="Enviar el camión ahora mismo" onclick="lanzarCamion(camiones[' + i + '])">' + icono('ruta') + '</button> ' +
            '<button class="planoBtn peligro" title="Quitar de la programación" onclick="quitarCamion(' + i + ')">' + icono('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no hay camiones programados.</div>';
  document.getElementById('camBody').innerHTML =
    '<div class="desc">Programa a qué hora entra cada camión y a qué zona lleva el material. Al llegar la hora ' +
      'en el reloj de la obra, el camión entra por la vía, recorre la obra hasta esa zona (se dibuja su recorrido), ' +
      'descarga y sale por el lavado de llantas. Reloj acelerado: 1 segundo real = 1 minuto de obra.</div>' +
    '<div style="display:flex; align-items:center; gap:8px; margin:12px 0; flex-wrap:wrap">' +
      '<b>Reloj de obra:</b> <span id="camHoraActual" style="font-variant-numeric:tabular-nums">' + minutosAHora(horaObra) + '</span>' +
      '<button class="orgAccion" style="margin:0" onclick="toggleReloj()">' + (relojCorriendo ? 'Pausar' : 'Reanudar') + '</button>' +
      '<input type="time" id="camHoraSet" value="' + minutosAHora(horaObra) + '">' +
      '<button class="orgAccion" style="margin:0" onclick="fijarHoraObra()">Fijar hora</button>' +
    '</div>' +
    '<b>Camiones programados</b>' + filas +
    '<div style="margin-top:12px; display:flex; flex-direction:column; gap:6px">' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap">' +
        '<input type="time" id="camHora" value="08:00">' +
        '<input id="camMaterial" maxlength="60" placeholder="Material (ej: Cerámica)" style="flex:1; min-width:140px">' +
      '</div>' +
      '<div style="display:flex; gap:6px; align-items:center">' +
        '<span style="color:#9aa5b5">Destino:</span>' +
        '<select id="camZona" style="flex:1">' + opcionesZonas(zonaCamionSel) + '</select>' +
        '<button class="orgAccion primario" style="margin:0" onclick="agregarCamion()">' + icono('mas') + 'Agregar</button>' +
      '</div>' +
    '</div>';
}
function agregarCamion(){
  const hora = document.getElementById('camHora').value;
  const material = (document.getElementById('camMaterial').value || '').trim().slice(0, 60) || 'Materiales';
  const zona = document.getElementById('camZona').value || 'Almacén central';
  if (!hora){ avisoGuardado('Elige la hora del camión'); return; }
  camiones.push({ hora, material, zona });
  zonaCamionSel = zona;
  guardarCompartido();
  renderCamiones();
  avisoGuardado('Camión programado: ' + material + ' a las ' + hora + ' → ' + zona);
}
function quitarCamion(i){
  camiones.splice(i, 1);
  guardarCompartido();
  renderCamiones();
}
function toggleReloj(){ relojCorriendo = !relojCorriendo; renderCamiones(); }
function fijarHoraObra(){
  const v = document.getElementById('camHoraSet').value;
  if (!v) return;
  horaObra = horaAMinutos(v);
  document.getElementById('horaObraTxt').textContent = minutosAHora(horaObra);
  renderCamiones();
  avisoGuardado('Reloj de obra fijado en ' + v);
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
