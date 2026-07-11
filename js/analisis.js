/* Análisis de la implantación: validaciones visuales (alcance de grúa, ancho
   de vías), calculadora de dotación mínima según personal pico (Res. 2400/79)
   y exportación del plano a PDF/imagen con cuadro de áreas.
   Se apoya en los globales ya existentes: draggables, renderer/scene/camera,
   camCtrl/actualizarCamara (cámara orbital), esc(), icono(), avisoGuardado(),
   NOMBRES_FASE/faseActual (estado.js). */

/* ============ 18. VALIDACIONES DE IMPLANTACIÓN ============ */
/* Devuelve una lista de alertas (strings) sobre la distribución actual:
   - acopios/patios de hierro fuera del alcance de toda pluma grúa
   - vías internas más angostas que el mínimo recomendado */
function validarObra(){
  const alertas = [];
  const gruas = draggables.filter(g => g.userData.tipoEquipo === 'plumaGrua' && typeof g.userData.radioGrua === 'number');
  if (gruas.length){
    draggables.forEach(z => {
      const n = (z.userData.info && z.userData.info.nombre) || '';
      if (!/acopio|hierro/i.test(n)) return;
      let mejorDist = Infinity, mejorRadio = 0;
      const cubierto = gruas.some(gr => {
        const dist = Math.hypot(gr.position.x - z.position.x, gr.position.z - z.position.z);
        if (dist < mejorDist){ mejorDist = dist; mejorRadio = gr.userData.radioGrua; }
        return dist <= gr.userData.radioGrua;
      });
      if (!cubierto){
        alertas.push('"' + n + '" queda fuera del alcance de la grúa: está a ' +
          Math.round(mejorDist) + ' m y el radio de barrido es ' + Math.round(mejorRadio) + ' m');
      }
    });
  }
  draggables.forEach(z => {
    const inf = z.userData.info || {};
    const n = inf.nombre || '';
    if (!/v[ií]a/i.test(n)) return;
    if (typeof inf.w !== 'number' || typeof inf.d !== 'number') return;
    const ancho = Math.round(Math.min(inf.w, inf.d) * 10) / 10;
    if (ancho < 6){
      alertas.push('"' + n + '" es angosta: ' + ancho + ' m de ancho (mínimo recomendado 6 m para doble sentido, 3.5 m para un solo sentido)');
    }
  });
  return alertas;
}

/* ============ 19. DOTACIÓN MÍNIMA SEGÚN PERSONAL (Res. 2400/79) ============ */
function calcularDotacion(){
  const nEl = document.getElementById('dotN');
  const tEl = document.getElementById('dotTurnos');
  const salida = document.getElementById('dotResultado');
  if (!nEl || !tEl || !salida) return;
  const N = Math.max(1, Math.round(parseFloat(nEl.value) || 305));
  const turnos = Math.min(6, Math.max(1, Math.round(parseFloat(tEl.value) || 3)));
  const sanitarios = Math.ceil(N / 15);          // Res. 2400/79 art. 17: 1 c/15
  const fuentesAgua = Math.ceil(N / 50);         // 1 fuente de agua potable c/50
  const porTurno = Math.ceil(N / turnos);
  const areaComedor = Math.round(porTurno * 1.2);   // 1.2 m²/comensal por turno
  const areaVestier = Math.round(N * 0.5);          // ≈0.5 m²/trabajador
  const fila = (concepto, valor) =>
    '<div class="planoFila"><span class="planoNom">' + concepto + '</span>' +
    '<small style="white-space:nowrap"><b class="txtFuerte">' + valor + '</b></small></div>';
  salida.innerHTML =
    fila('Inodoros (1 c/15, separados por sexo)', sanitarios + ' und') +
    fila('Lavamanos (1 c/15)', sanitarios + ' und') +
    fila('Orinales (1 c/15)', sanitarios + ' und') +
    fila('Duchas (1 c/15)', sanitarios + ' und') +
    fila('Fuentes de agua potable (1 c/50)', fuentesAgua + ' und') +
    fila('Comedor: ' + porTurno + ' personas/turno × 1.2 m²', '≈ ' + areaComedor + ' m²') +
    fila('Vestieres: ' + N + ' casilleros · ≈0.5 m²/trab.', '≈ ' + areaVestier + ' m²') +
    '<div class="desc" style="margin-top:8px">Valores de referencia pedagógicos según la Resolución 2400 de 1979 (art. 17 y 22) y prácticas del SG-SST; verifica siempre la norma vigente y las condiciones del proyecto.</div>';
}

/* Secciones extra del modal "Zonas y aforo": validaciones + dotación.
   renderZonas (equipos.js) las concatena al final y llama calcularDotacion. */
function seccionesZonasExtra(){
  const alertas = validarObra();
  const listaAlertas = alertas.length
    ? alertas.map(a =>
        '<div class="planoFila"><span class="planoNom" style="white-space:normal"><span class="ic" style="color:var(--rojo)">' + icono('alerta') + '</span>' + esc(a) + '</span></div>'
      ).join('')
    : '<div class="desc">Sin alertas: los acopios quedan dentro del alcance de la grúa (si la hay) y las vías cumplen el ancho mínimo.</div>';
  return '' +
    '<div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--linea)">' +
      '<b>Validaciones de implantación</b>' +
      listaAlertas +
    '</div>' +
    '<div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--linea)">' +
      '<b>Dotación mínima según personal (Res. 2400/79)</b>' +
      '<div class="desc">Ingresa el personal en pico de obra y los turnos del comedor: la herramienta sugiere la dotación mínima de bienestar.</div>' +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin:8px 0 10px">' +
        '<label style="display:inline-flex; align-items:center; gap:5px; color:var(--texto-2); font-size:12.5px">Personal pico ' +
          '<input id="dotN" type="number" value="305" min="1" max="5000" step="1" style="width:74px"></label>' +
        '<label style="display:inline-flex; align-items:center; gap:5px; color:var(--texto-2); font-size:12.5px">Turnos comedor ' +
          '<input id="dotTurnos" type="number" value="3" min="1" max="6" step="1" style="width:56px"></label>' +
        '<button class="orgAccion primario" style="margin:0" onclick="calcularDotacion()">Calcular</button>' +
      '</div>' +
      '<div id="dotResultado"></div>' +
    '</div>';
}

/* ============ 20. EXPORTAR PLANO (PDF / imagen) ============ */
/* Captura una vista en planta (cenital) de la obra. El renderer no usa
   preserveDrawingBuffer, así que hay que renderizar en el MISMO instante
   antes de leer el canvas; después se restaura la cámara del usuario. */
function capturarPlanta(){
  const prev = {
    x: camCtrl.target.x, y: camCtrl.target.y, z: camCtrl.target.z,
    r: camCtrl.radius, t: camCtrl.theta, p: camCtrl.phi
  };
  // fuerza etiquetas y cotas visibles para la captura, sin tocar la
  // preferencia del usuario (se restauran tal cual estaban después)
  const etiquetasPrev = etiquetasTodas.map(s => s.visible);
  etiquetasTodas.forEach(s => { s.visible = true; });
  const cotasPrev = gruposCotas.map(gr => gr.visible);
  gruposCotas.forEach(gr => { gr.visible = true; });

  camCtrl.target.set(10, 0, -2);
  camCtrl.radius = 165;
  camCtrl.theta = 0;      // norte arriba: el lote (163 m E-O) queda horizontal
  camCtrl.phi = 0.14;     // casi cenital (el clamp de la órbita permite hasta 0.12)
  actualizarCamara();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');

  camCtrl.target.set(prev.x, prev.y, prev.z);
  camCtrl.radius = prev.r; camCtrl.theta = prev.t; camCtrl.phi = prev.p;
  actualizarCamara();
  etiquetasTodas.forEach((s, i) => { s.visible = etiquetasPrev[i]; });
  gruposCotas.forEach((gr, i) => { gr.visible = cotasPrev[i]; });
  renderer.render(scene, camera);
  return url;
}
/* filas del resumen de rutas para la hoja exportada: puntos dibujados y
   longitud aproximada (suma de distancias entre puntos consecutivos) */
function resumenRutas(){
  return rutas.map((r, i) => {
    let largo = 0;
    for (let k = 1; k < r.puntos.length; k++) largo += r.puntos[k].distanceTo(r.puntos[k - 1]);
    return {
      nombre: 'Ruta ' + (i + 1),
      color: '#' + coloresRuta[i % coloresRuta.length].toString(16).padStart(6, '0'),
      puntos: r.puntos.length,
      largo: Math.round(largo)
    };
  });
}
/* filas del cuadro de áreas para la hoja exportada (mismos datos que Zonas) */
function filasCuadroAreas(){
  return draggables.map(g => {
    const inf = g.userData.info || {};
    const tieneArea = typeof inf.w === 'number' && typeof inf.d === 'number';
    return {
      nombre: inf.nombre || '—',
      dimensiones: inf.dimensiones || (tieneArea ? (inf.w + ' × ' + inf.d + ' m') : '—'),
      area: tieneArea ? Math.round(inf.w * inf.d * 10) / 10 : null,
      aforo: inf.aforo || '—'
    };
  });
}
function exportarPlano(){
  const img = capturarPlanta();
  const filas = filasCuadroAreas();
  const totalArea = Math.round(filas.reduce((s, f) => s + (f.area || 0), 0) * 10) / 10;
  const alertas = validarObra();
  const rts = resumenRutas();
  const fase = (typeof NOMBRES_FASE !== 'undefined' && NOMBRES_FASE[faseActual]) ? NOMBRES_FASE[faseActual] : '—';
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const rutasHtml = '<h2>Rutas de materiales programadas</h2>' + (rts.length
    ? '<table><tr><th>Ruta</th><th class="num">Puntos</th><th class="num">Longitud aprox.</th></tr>' +
      rts.map(r => '<tr><td><span style="display:inline-block;width:10px;height:10px;background:' + r.color +
        ';border-radius:2px;margin-right:6px;vertical-align:middle"></span>' + esc(r.nombre) + '</td>' +
        '<td class="num">' + r.puntos + '</td><td class="num">' + r.largo + ' m</td></tr>').join('') +
      '</table>'
    : '<p style="color:#6a7260; font-size:11.5px; margin:4px 0">No hay rutas dibujadas todavía.</p>');
  const filasHtml = filas.map(f =>
    '<tr><td>' + esc(f.nombre) + '</td><td>' + esc(String(f.dimensiones)) + '</td>' +
    '<td class="num">' + (f.area !== null ? f.area : '—') + '</td><td>' + esc(String(f.aforo)) + '</td></tr>'
  ).join('');
  const alertasHtml = alertas.length
    ? '<h2>Validaciones</h2><ul>' + alertas.map(a => '<li>⚠ ' + esc(a) + '</li>').join('') + '</ul>'
    : '';
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
    '<title>Plano de obra — Proyecto Bambú</title>' +
    '<style>' +
      '@page { size: A4 landscape; margin: 12mm; }' +
      'body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #1f241b; margin: 24px; }' +
      'header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 14px; }' +
      'h1 { font-family: "JetBrains Mono", monospace; font-size: 19px; margin: 0; color: #047857; text-transform: uppercase; letter-spacing: 1px; }' +
      'h2 { font-family: "JetBrains Mono", monospace; font-size: 13px; margin: 18px 0 6px; color: #047857; text-transform: uppercase; letter-spacing: 1px; }' +
      'header small { color: #6a7260; font-size: 12px; }' +
      'img.planta { width: 100%; max-height: 58vh; object-fit: contain; border: 1px solid #d9ddd1; }' +
      'table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px; }' +
      'th { text-align: left; color: #6a7260; border-bottom: 2px solid #c3c9b8; padding: 4px 6px; text-transform: uppercase; font-size: 10px; letter-spacing: .6px; }' +
      'td { border-bottom: 1px solid #e4e8dd; padding: 4px 6px; }' +
      'td.num, th.num { text-align: right; }' +
      'tr.total td { font-weight: bold; color: #047857; border-top: 2px solid #c3c9b8; }' +
      'ul { font-size: 11.5px; color: #a12d22; margin: 4px 0; padding-left: 18px; }' +
      '.acciones { margin: 14px 0; display: flex; gap: 10px; }' +
      '.acciones button, .acciones a { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 16px; border: 1px solid #059669; background: #059669; color: #fff; cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: .5px; }' +
      '.acciones a { background: transparent; color: #047857; }' +
      '@media print { .acciones { display: none; } body { margin: 0; } }' +
    '</style></head><body>' +
    '<header><div><h1>Proyecto Bambú — Plano de obra</h1>' +
      '<small>Marinilla, Antioquia · Taller II · Universidad Nacional de Colombia</small></div>' +
      '<small>Fase: <b>' + esc(fase) + '</b> · ' + esc(fecha) + '</small></header>' +
    '<div class="acciones">' +
      '<button onclick="window.print()">Imprimir / Guardar PDF</button>' +
      '<a href="' + img + '" download="plano_obra_bambu.png">Descargar PNG</a>' +
    '</div>' +
    '<img class="planta" src="' + img + '" alt="Vista en planta de la obra">' +
    '<h2>Cuadro de áreas</h2>' +
    '<table><tr><th>Zona / equipo</th><th>Dimensiones</th><th class="num">Área (m²)</th><th>Aforo máximo</th></tr>' +
      filasHtml +
      '<tr class="total"><td>Total (' + filas.length + ' elementos)</td><td></td><td class="num">' + totalArea + '</td><td></td></tr>' +
    '</table>' +
    rutasHtml +
    alertasHtml +
    '<script>window.addEventListener("load", function(){ setTimeout(function(){ window.print(); }, 400); });<\/script>' +
    '</body></html>';
  const w = window.open('', '_blank');
  if (!w){
    avisoGuardado('Permite las ventanas emergentes para exportar el plano');
    return;
  }
  w.document.write(html);
  w.document.close();
}
(function(){
  const b = document.getElementById('btnExportar');
  if (b) b.onclick = exportarPlano;
})();
