/* Regla: mide distancias con clics sobre el terreno — herramienta nueva,
   igual de simple que "Dibujar ruta"/"Dibujar vía" pero las mediciones son
   solo de apoyo (no se guardan con el estado compartido de la obra). Un
   clic marca el primer punto, el siguiente mide y encadena otra medición.
   Con el trazo en curso vacío, un clic cerca del extremo de una medición ya
   hecha la BORRA (en vez de empezar una nueva); Esc quita la última. */

let modoRegla = false;
let trazoRegla = null;   // {x,z} último punto marcado (encadena mediciones)
let mediciones = [];
const reglaGrupo = new THREE.Group(); scene.add(reglaGrupo);

function vaciarGrupoRegla(g){
  g.children.slice().forEach(n => {
    g.remove(n);
    if (n.geometry) n.geometry.dispose();
    if (n.material){ if (n.material.map) n.material.map.dispose(); n.material.dispose(); }
  });
}

function clicRegla(pRaw){
  const p = { x: Math.round(pRaw.x * 100) / 100, z: Math.round(pRaw.z * 100) / 100 };
  if (!trazoRegla){
    for (let i = 0; i < mediciones.length; i++){
      const m = mediciones[i];
      if (Math.hypot(p.x - m.x1, p.z - m.z1) < 1 || Math.hypot(p.x - m.x2, p.z - m.z2) < 1){
        mediciones.splice(i, 1);
        redibujarMediciones();
        avisoGuardado('Medición eliminada');
        return;
      }
    }
    trazoRegla = p;
    redibujarMediciones();
    avisoGuardado('Punto inicial marcado — haz clic en el otro extremo para medir');
    return;
  }
  if (Math.hypot(p.x - trazoRegla.x, p.z - trazoRegla.z) < 0.3) return;
  mediciones.push({ x1: trazoRegla.x, z1: trazoRegla.z, x2: p.x, z2: p.z });
  trazoRegla = p;   // el final queda como inicio de la siguiente medición
  redibujarMediciones();
}
function redibujarMediciones(){
  vaciarGrupoRegla(reglaGrupo);
  const AMARILLO = 0xffd23e;
  const disco = (x, z) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 14), new THREE.MeshBasicMaterial({ color: AMARILLO }));
    m.position.set(x, 0.16, z);
    reglaGrupo.add(m);
  };
  mediciones.forEach(me => {
    const dx = me.x2 - me.x1, dz = me.z2 - me.z1, len = Math.hypot(dx, dz);
    if (len < 0.2) return;
    const linea = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, 0.18), new THREE.MeshBasicMaterial({ color: AMARILLO }));
    linea.position.set((me.x1 + me.x2) / 2, 0.2, (me.z1 + me.z2) / 2);
    linea.rotation.y = -Math.atan2(dz, dx);
    reglaGrupo.add(linea);
    disco(me.x1, me.z1); disco(me.x2, me.z2);
    const et = crearEtiqueta(Math.round(len * 100) / 100 + ' m', 9, 'rgba(120,85,10,0.88)');
    et.position.set((me.x1 + me.x2) / 2, 1.8, (me.z1 + me.z2) / 2);
    const idx = etiquetasTodas.indexOf(et);
    if (idx >= 0) etiquetasTodas.splice(idx, 1);   // siempre visible, no depende del botón "Etiquetas"
    reglaGrupo.add(et);
  });
  if (trazoRegla) disco(trazoRegla.x, trazoRegla.z);
}
/* Esc con la regla activa: primero quita el punto en curso o la última
   medición; con todo limpio, un Esc más apaga la herramienta (js/atajos.js) */
function escRegla(){
  if (trazoRegla){ trazoRegla = null; redibujarMediciones(); avisoGuardado('Punto en curso cancelado'); return true; }
  if (mediciones.length){ mediciones.pop(); redibujarMediciones(); avisoGuardado('Última medición eliminada'); return true; }
  return false;
}
function borrarMediciones(){
  mediciones = []; trazoRegla = null;
  redibujarMediciones();
  avisoGuardado('Mediciones borradas');
}
function toggleRegla(){
  modoRegla = !modoRegla;
  if (modoRegla){
    if (typeof modoFlujo !== 'undefined' && modoFlujo) document.getElementById('btnFlujo').click();
    if (typeof modoVia !== 'undefined' && modoVia) document.getElementById('btnVia').click();
  } else {
    trazoRegla = null;
    redibujarMediciones();
  }
  document.getElementById('btnRegla').classList.toggle('activo', modoRegla);
  document.getElementById('modoAviso').textContent = 'Regla: clic sobre el terreno para medir · clic cerca de un extremo existente lo borra · Esc quita el último paso';
  document.getElementById('modoAviso').style.display = modoRegla ? 'block' : 'none';
  if (modoRegla && typeof posicionarBanner === 'function') posicionarBanner();
}
document.getElementById('btnRegla').onclick = toggleRegla;
document.getElementById('btnBorrarRegla').onclick = borrarMediciones;
