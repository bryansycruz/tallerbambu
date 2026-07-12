/* Vías de obra dibujadas por el usuario: a diferencia de las "rutas de
   materiales" (flechas decorativas), estas SÍ definen por dónde pueden
   circular los camiones. Se guardan como un grafo (nodos + aristas) y el
   recorrido de cada camión (camiones.js) intenta seguir ese grafo de verdad
   con Dijkstra; si el usuario no ha dibujado ninguna vía, o un punto no
   está cerca de ninguna, se cae de vuelta a la línea recta de siempre —
   así esta función nunca rompe el comportamiento anterior. */

/* ============ 11b. VÍAS DE OBRA ============ */
let modoVia = false;
let viaActual = null;        // { puntos:[{x,z}] } — solo mientras se dibuja
const viasSegmentos = [];    // [[x1,z1,x2,z2], ...] — lo que viaja en el JSON guardado
const viasNodos = [];        // [{x,z}] nodos únicos del grafo (se fusionan por cercanía)
const viasAristas = [];      // [{a, b, dist}] conexiones entre nodos (índices en viasNodos)
const viasGrupos = [];       // THREE.Group de cada tramo dibujado (para poder borrarlos)

const VIA_ANCHO = 6;    // ancho visual del tramo (m) — igual al mínimo recomendado de doble sentido
const VIA_SNAP = 4;     // radio (m) para fusionar el extremo de un tramo nuevo con un nodo existente
const VIA_CONEXION = 22; // radio (m) para conectar un punto fijo (portería, zona…) al nodo más cercano

function nodoIndiceOCrear(p){
  for (let i = 0; i < viasNodos.length; i++){
    if (Math.hypot(viasNodos[i].x - p.x, viasNodos[i].z - p.z) <= VIA_SNAP) return i;
  }
  viasNodos.push({ x: p.x, z: p.z });
  return viasNodos.length - 1;
}
function agregarAristaGrafo(ia, ib){
  if (ia === ib) return;
  const dist = Math.hypot(viasNodos[ia].x - viasNodos[ib].x, viasNodos[ia].z - viasNodos[ib].z);
  viasAristas.push({ a: ia, b: ib, dist });
}
/* tramo dibujado: franja gris plana + línea central clara, igual de ancho
   en toda su longitud (misma técnica de caja orientada que tramoCerr() en
   escena.js — nunca THREE.Line, ya causó un bug de líneas invisibles) */
function dibujarSegmentoVia(x1, z1, x2, z2){
  const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
  if (len < 0.5) return null;
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, rotY = -Math.atan2(dz, dx);
  const y = alturaTerreno(cx, cz);
  const grp = new THREE.Group();
  const piso = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.07, VIA_ANCHO),
    new THREE.MeshLambertMaterial({ color: 0x55585e })
  );
  piso.position.set(cx, y + 0.05, cz);
  piso.rotation.y = rotY;
  piso.receiveShadow = true;
  grp.add(piso);
  if (len > 1.5){
    const linea = new THREE.Mesh(
      new THREE.BoxGeometry(len - 1.2, 0.01, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xd8d8d0 })
    );
    linea.position.set(cx, y + 0.09, cz);
    linea.rotation.y = rotY;
    grp.add(linea);
  }
  scene.add(grp);
  return grp;
}
function agregarSegmentoVia(x1, z1, x2, z2, guardar){
  if (Math.hypot(x2 - x1, z2 - z1) < 0.5) return;
  const grp = dibujarSegmentoVia(x1, z1, x2, z2);
  if (grp) viasGrupos.push(grp);
  agregarAristaGrafo(nodoIndiceOCrear({ x: x1, z: z1 }), nodoIndiceOCrear({ x: x2, z: z2 }));
  viasSegmentos.push([Math.round(x1 * 100) / 100, Math.round(z1 * 100) / 100, Math.round(x2 * 100) / 100, Math.round(z2 * 100) / 100]);
  if (guardar !== false) guardarCompartido();
}

function iniciarVia(){
  viaActual = { puntos: [] };
}
function agregarPuntoVia(p){
  if (!viaActual) return;
  if (viaActual.puntos.length){
    const ult = viaActual.puntos[viaActual.puntos.length - 1];
    agregarSegmentoVia(ult.x, ult.z, p.x, p.z, false);
  }
  viaActual.puntos.push({ x: p.x, z: p.z });
}
function finalizarVia(){
  if (!viaActual) return;
  const tenia = viaActual.puntos.length > 1;
  viaActual = null;
  if (tenia) guardarCompartido();
}
function borrarVias(){
  viasGrupos.forEach(g => {
    scene.remove(g);
    g.traverse(n => { if (n.isMesh){ n.geometry.dispose(); n.material.dispose(); } });
  });
  viasGrupos.length = 0;
  viasSegmentos.length = 0;
  viasNodos.length = 0;
  viasAristas.length = 0;
  viaActual = null;
  guardarCompartido();
  avisoGuardado('Vías eliminadas');
}
/* reconstruye el grafo completo a partir de la lista guardada — se usa al
   cargar el estado (estado.js) */
function reconstruirGrafoVias(lista){
  viasGrupos.forEach(g => scene.remove(g));
  viasGrupos.length = 0; viasSegmentos.length = 0; viasNodos.length = 0; viasAristas.length = 0;
  (Array.isArray(lista) ? lista : []).forEach(seg => {
    if (Array.isArray(seg) && seg.length >= 4 && seg.every(n => typeof n === 'number' && isFinite(n))){
      agregarSegmentoVia(seg[0], seg[1], seg[2], seg[3], false);
    }
  });
}

/* ---- pathfinding (Dijkstra) sobre el grafo de vías ---- */
function nodoMasCercano(p, radio){
  let mejor = -1, mejorD = radio;
  for (let i = 0; i < viasNodos.length; i++){
    const d = Math.hypot(viasNodos[i].x - p[0], viasNodos[i].z - p[1]);
    if (d <= mejorD){ mejorD = d; mejor = i; }
  }
  return mejor;
}
function dijkstraVias(origen, destino){
  const n = viasNodos.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visitado = new Array(n).fill(false);
  const adj = viasNodos.map(() => []);
  viasAristas.forEach(ar => { adj[ar.a].push([ar.b, ar.dist]); adj[ar.b].push([ar.a, ar.dist]); });
  dist[origen] = 0;
  for (let it = 0; it < n; it++){
    let u = -1, mejorD = Infinity;
    for (let i = 0; i < n; i++) if (!visitado[i] && dist[i] < mejorD){ mejorD = dist[i]; u = i; }
    if (u === -1 || u === destino) break;
    visitado[u] = true;
    adj[u].forEach(([v, w]) => { if (dist[u] + w < dist[v]){ dist[v] = dist[u] + w; prev[v] = u; } });
  }
  if (dist[destino] === Infinity) return null;
  const camino = [];
  for (let cur = destino; cur !== -1; cur = prev[cur]) camino.unshift(cur);
  return camino;
}
/* si hay una red de vías que conecte "desde" con "hasta" (ambos [x,z]),
   devuelve el camino real por esa red; si no hay red, o alguno de los dos
   puntos queda demasiado lejos de cualquier tramo, devuelve null */
function rutaPorVias(desde, hasta){
  if (!viasNodos.length) return null;
  const iDesde = nodoMasCercano(desde, VIA_CONEXION);
  const iHasta = nodoMasCercano(hasta, VIA_CONEXION);
  if (iDesde === -1 || iHasta === -1) return null;
  const camino = dijkstraVias(iDesde, iHasta);
  if (!camino) return null;
  return [desde, ...camino.map(i => [viasNodos[i].x, viasNodos[i].z]), hasta];
}
/* usada por camiones.js para unir cada tramo fijo de su recorrido (p.ej.
   portería→patio): sigue la red de vías si existe una que los conecte, o
   traza línea directa si no — este segundo caso es EXACTAMENTE el
   comportamiento de siempre, así que sin vías dibujadas nada cambia */
function tramoConVias(desde, hasta){
  return rutaPorVias(desde, hasta) || [desde, hasta];
}
