/* Camiones de materiales: reloj de obra simulado y entregas programadas.
   Cada camión programado entra por la portería a su hora, pasa por el patio
   de maniobra, descarga en el almacén y sale por el lavado de llantas. */

/* ============ 12d. CAMIONES DE MATERIALES ============ */
let camiones = [];            // [{ hora:'08:30', material:'Cerámica' }] — compartido con el equipo
let horaObra = 6 * 60;        // minutos desde medianoche (la obra arranca a las 06:00)
let relojCorriendo = true;
const VEL_RELOJ = 60;         // 1 segundo real = 1 minuto de obra
const camionesActivos = [];   // camiones circulando en la escena

function minutosAHora(m){
  m = ((Math.floor(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
function horaAMinutos(h){
  const p = String(h || '').split(':');
  return ((parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0)) % 1440;
}

/* ---- camión 3D (cabina azul para distinguirlo del que posa en el patio) ---- */
function crearCamion3D(){
  const cam = new THREE.Group();
  caja(cam, 2.1, 1.7, 2, 0x2e6db8, 0, 0.95, 2.6);
  caja(cam, 2.2, 2.2, 5, 0xe8e4da, 0, 1.2, -1);
  [[-0.9,2.6],[0.9,2.6],[-0.9,-2.4],[0.9,-2.4],[-0.9,0.2],[0.9,0.2]].forEach(([x, z]) =>
    cilindro(cam, 0.42, 0.3, 0x22262b, x, 0.42, z).rotation.z = Math.PI/2);
  return cam;
}

/* ---- rutas: se calculan con la posición ACTUAL del patio, almacén y lavado ---- */
function puntosARuta(pares){
  return new THREE.CatmullRomCurve3(pares.map(([x, z]) =>
    new THREE.Vector3(x, alturaTerreno(x, z) + 0.15, z)));
}
function rutaEntradaCamion(){
  const alm = buscarProv('Almacén central');
  const patio = buscarProv('Patio de maniobra');
  const pAlm = alm ? [alm.position.x, alm.position.z - alm.userData.info.d/2 - 3.5] : [38, 4.5];
  const pPatio = patio ? [patio.position.x, patio.position.z] : [62, -12];
  return puntosARuta([[102, -28], [82, -26], [68, -22], pPatio, pAlm]);
}
function rutaSalidaCamion(){
  const alm = buscarProv('Almacén central');
  const lav = buscarProv('Lavado de llantas');
  const pAlm = alm ? [alm.position.x, alm.position.z - alm.userData.info.d/2 - 3.5] : [38, 4.5];
  const pLav = lav ? [lav.position.x, lav.position.z] : [76, 4];
  return puntosARuta([pAlm, pLav, [68, -22], [84, -27], [104, -29]]);
}

function lanzarCamion(c){
  const grupo = crearCamion3D();
  scene.add(grupo);
  camionesActivos.push({
    grupo,
    material: (c && c.material) || 'materiales',
    curva: rutaEntradaCamion(),
    t: 0, dur: 20, fase: 'entrando', espera: 0
  });
  avisoGuardado('Camión ingresando con ' + ((c && c.material) || 'materiales') +
    (c && c.hora ? ' (programado ' + c.hora + ')' : ''));
}

const camTmpP = new THREE.Vector3();
const camTmpT = new THREE.Vector3();
function moverCamion(a, dt){
  if (a.fase === 'descargando'){
    a.espera -= dt;
    if (a.espera <= 0){
      a.fase = 'saliendo';
      a.curva = rutaSalidaCamion();
      a.t = 0; a.dur = 18;
    }
    return;
  }
  a.t += dt / a.dur;
  if (a.t >= 1){
    if (a.fase === 'entrando'){
      a.fase = 'descargando';
      a.espera = 5;
      avisoGuardado('Camión descargando ' + a.material + ' en el almacén');
    } else {
      scene.remove(a.grupo);
      a.terminado = true;
    }
    return;
  }
  const u = Math.min(a.t, 0.9999);
  a.curva.getPointAt(u, camTmpP);
  a.curva.getTangentAt(u, camTmpT);
  a.grupo.position.copy(camTmpP);
  a.grupo.rotation.y = Math.atan2(camTmpT.x, camTmpT.z);
}

/* ---- avance del reloj + disparo de camiones programados (desde animar) ---- */
function actualizarCamiones(dt){
  if (relojCorriendo && dt > 0){
    const antes = horaObra;
    horaObra = (horaObra + dt * VEL_RELOJ) % 1440;
    camiones.forEach(c => {
      const m = horaAMinutos(c.hora);
      const disparado = antes <= horaObra
        ? (m > antes && m <= horaObra)
        : (m > antes || m <= horaObra);      // salto de medianoche
      if (disparado) lanzarCamion(c);
    });
    const hh = minutosAHora(horaObra);
    const txt = document.getElementById('horaObraTxt');
    if (txt.textContent !== hh){
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
function renderCamiones(){
  const lista = [...camiones].sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora));
  const filas = lista.length
    ? lista.map(c => {
        const i = camiones.indexOf(c);
        return '<div class="planoFila">' +
          '<span class="planoNom">' + icono('camion') + ' <b style="color:#e8ecf2">' + esc(c.hora) + '</b> · ' + esc(c.material) + '</span>' +
          '<span>' +
            '<button class="planoBtn" title="Enviar el camión ahora mismo" onclick="lanzarCamion(camiones[' + i + '])">' + icono('ruta') + '</button> ' +
            '<button class="planoBtn peligro" title="Quitar de la programación" onclick="quitarCamion(' + i + ')">' + icono('basura') + '</button>' +
          '</span></div>';
      }).join('')
    : '<div class="desc">Aún no hay camiones programados.</div>';
  document.getElementById('camBody').innerHTML =
    '<div class="desc">Programa la hora de entrada de cada camión: cuando el reloj de la obra llega a esa hora, ' +
      'el camión entra por la portería, pasa por el patio de maniobra, descarga en el almacén y sale por el lavado ' +
      'de llantas. El reloj corre acelerado: 1 segundo real = 1 minuto de obra.</div>' +
    '<div style="display:flex; align-items:center; gap:8px; margin:12px 0; flex-wrap:wrap">' +
      '<b>Reloj de obra:</b> <span id="camHoraActual" style="font-variant-numeric:tabular-nums">' + minutosAHora(horaObra) + '</span>' +
      '<button class="orgAccion" style="margin:0" onclick="toggleReloj()">' + (relojCorriendo ? 'Pausar' : 'Reanudar') + '</button>' +
      '<input type="time" id="camHoraSet" value="' + minutosAHora(horaObra) + '">' +
      '<button class="orgAccion" style="margin:0" onclick="fijarHoraObra()">Fijar hora</button>' +
    '</div>' +
    '<b>Camiones programados</b>' + filas +
    '<div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap">' +
      '<input type="time" id="camHora" value="08:00">' +
      '<input id="camMaterial" maxlength="60" placeholder="Material (ej: Cerámica)" style="flex:1; min-width:150px">' +
      '<button class="orgAccion primario" style="margin:0" onclick="agregarCamion()">' + icono('mas') + 'Agregar</button>' +
    '</div>';
}
function agregarCamion(){
  const hora = document.getElementById('camHora').value;
  const material = (document.getElementById('camMaterial').value || '').trim().slice(0, 60) || 'Materiales';
  if (!hora){ avisoGuardado('Elige la hora del camión'); return; }
  camiones.push({ hora, material });
  guardarCompartido();
  renderCamiones();
  avisoGuardado('Camión programado: ' + material + ' a las ' + hora);
}
function quitarCamion(i){
  camiones.splice(i, 1);
  guardarCompartido();
  renderCamiones();
}
function toggleReloj(){
  relojCorriendo = !relojCorriendo;
  renderCamiones();
}
function fijarHoraObra(){
  const v = document.getElementById('camHoraSet').value;
  if (!v) return;
  horaObra = horaAMinutos(v);
  document.getElementById('horaObraTxt').textContent = minutosAHora(horaObra);
  renderCamiones();
  avisoGuardado('Reloj de obra fijado en ' + v);
}

document.getElementById('btnCamiones').onclick = () => {
  renderCamiones();
  document.getElementById('camOverlay').style.display = 'flex';
};
document.getElementById('relojObra').onclick = document.getElementById('btnCamiones').onclick;
document.getElementById('camCerrar').onclick = () => {
  document.getElementById('camOverlay').style.display = 'none';
};
document.getElementById('camOverlay').addEventListener('click', e => {
  if (e.target.id === 'camOverlay') e.target.style.display = 'none';
});
