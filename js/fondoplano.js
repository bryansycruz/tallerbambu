/* Imagen de fondo para calcar (plano de AutoCAD u otro): se acuesta sobre el
   terreno para poder guiarte y ubicar elementos encima. Se ajusta a mano
   (tamaño/posición/rotación/opacidad) porque cada imagen trae su propia
   escala; NO se guarda con el estado compartido (dura solo en esta pestaña,
   igual que las mediciones de la regla). */

const fondoGrupo = new THREE.Group(); scene.add(fondoGrupo);
let fondoImg = null;

function vaciarGrupoFondo(g){
  g.children.slice().forEach(n => {
    g.remove(n);
    if (n.geometry) n.geometry.dispose();
    if (n.material){ if (n.material.map) n.material.map.dispose(); n.material.dispose(); }
  });
}
function cargarFondoPlanoArchivo(file){
  if (!file) return;
  const lector = new FileReader();
  lector.onload = () => {
    const img = new Image();
    img.onload = () => {
      vaciarGrupoFondo(fondoGrupo);
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      const aspecto = img.width / img.height;
      const anchoM = Math.round(CFG.lote.x1 - CFG.lote.x0) || 100;
      const altoM = Math.round(anchoM / aspecto);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(anchoM, altoM, 1);
      fondoGrupo.add(mesh);
      fondoGrupo.position.set((CFG.lote.x0 + CFG.lote.x1) / 2, 0.03, (CFG.lote.z0 + CFG.lote.z1) / 2);
      fondoGrupo.rotation.y = 0;
      fondoImg = { mesh, anchoM, altoM, opacidad: 0.6, rotDeg: 0 };
      renderFondoPlano();
      avisoGuardado('Imagen de fondo cargada — ajusta tamaño, posición y rotación para calzarla con el lote');
    };
    img.src = lector.result;
  };
  lector.readAsDataURL(file);
}
function actualizarFondoPlano(){
  if (!fondoImg) return;
  fondoImg.mesh.scale.set(fondoImg.anchoM, fondoImg.altoM, 1);
  fondoImg.mesh.material.opacity = fondoImg.opacidad;
  fondoGrupo.rotation.y = fondoImg.rotDeg * Math.PI / 180;
}
function quitarFondoPlano(){
  vaciarGrupoFondo(fondoGrupo);
  fondoImg = null;
  avisoGuardado('Imagen de fondo quitada');
  abrirFondoPlano();
}
function abrirFondoPlano(){
  document.getElementById('fondoTitulo').textContent = 'Imagen de fondo (calcar plano)';
  if (!fondoImg){
    document.getElementById('fondoBody').innerHTML =
      '<div class="desc">Sube una foto o captura de tu plano (por ejemplo exportado de AutoCAD como PNG o JPG) para calcarlo sobre ' +
      'el terreno. Después de cargarla podrás ajustar tamaño, posición, rotación y opacidad para que calce con el lote. ' +
      '<b>No se guarda con la obra</b> — solo dura mientras tengas esta pestaña abierta.</div>' +
      '<label style="display:block; margin-top:10px">Imagen (PNG/JPG)<input type="file" id="fondoArchivo" accept="image/png,image/jpeg" style="width:100%; margin-top:4px"></label>';
    document.getElementById('fondoOverlay').style.display = 'flex';
    document.getElementById('fondoArchivo').onchange = e => { const f = e.target.files[0]; if (f) cargarFondoPlanoArchivo(f); };
    return;
  }
  renderFondoPlano();
  document.getElementById('fondoOverlay').style.display = 'flex';
}
function renderFondoPlano(){
  document.getElementById('fondoBody').innerHTML =
    '<div class="desc">Ajusta tamaño, posición y rotación hasta que la imagen calce con el lote. No se guarda con la obra.</div>' +
    '<div style="display:flex; gap:8px; margin-top:10px">' +
      '<label style="flex:1">Ancho (m)<input type="number" id="fdAncho" value="' + fondoImg.anchoM + '" min="1" max="1000" step="0.5" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
      '<label style="flex:1">Alto (m)<input type="number" id="fdAlto" value="' + fondoImg.altoM + '" min="1" max="1000" step="0.5" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '</div>' +
    '<div style="display:flex; gap:8px; margin-top:8px">' +
      '<label style="flex:1">Centro X (m)<input type="number" id="fdX" value="' + Math.round(fondoGrupo.position.x) + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
      '<label style="flex:1">Centro Z (m)<input type="number" id="fdZ" value="' + Math.round(fondoGrupo.position.z) + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '</div>' +
    '<label style="display:block; margin-top:8px">Rotación (°)<input type="number" id="fdRot" value="' + fondoImg.rotDeg + '" step="1" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '<label style="display:block; margin-top:8px">Opacidad<input type="range" id="fdOp" min="10" max="100" value="' + Math.round(fondoImg.opacidad * 100) + '" style="width:100%; margin-top:3px" oninput="cambiarFondoPlano()"></label>' +
    '<div style="margin-top:14px; display:flex; gap:6px; flex-wrap:wrap">' +
      '<label class="orgAccion" style="margin:0; cursor:pointer">' + icono('carpeta') + 'Cambiar imagen<input type="file" id="fondoArchivo2" accept="image/png,image/jpeg" style="display:none"></label>' +
      '<button class="btnEliminar" onclick="quitarFondoPlano()">' + icono('basura') + 'Quitar imagen</button>' +
    '</div>';
  document.getElementById('fondoArchivo2').onchange = e => { const f = e.target.files[0]; if (f) cargarFondoPlanoArchivo(f); };
}
function cambiarFondoPlano(){
  if (!fondoImg) return;
  fondoImg.anchoM = numLim((document.getElementById('fdAncho') || {}).value, fondoImg.anchoM, 1, 1000);
  fondoImg.altoM = numLim((document.getElementById('fdAlto') || {}).value, fondoImg.altoM, 1, 1000);
  fondoImg.rotDeg = numLim((document.getElementById('fdRot') || {}).value, fondoImg.rotDeg, -360, 360);
  fondoImg.opacidad = numLim((document.getElementById('fdOp') || {}).value, fondoImg.opacidad * 100, 10, 100) / 100;
  const x = numLim((document.getElementById('fdX') || {}).value, fondoGrupo.position.x, -100000, 100000);
  const z = numLim((document.getElementById('fdZ') || {}).value, fondoGrupo.position.z, -100000, 100000);
  fondoGrupo.position.set(x, 0.03, z);
  actualizarFondoPlano();
}
document.getElementById('btnFondoPlano').onclick = abrirFondoPlano;
document.getElementById('fondoCerrar').onclick = () => { document.getElementById('fondoOverlay').style.display = 'none'; };
document.getElementById('fondoOverlay').addEventListener('click', e => { if (e.target.id === 'fondoOverlay') e.target.style.display = 'none'; });
