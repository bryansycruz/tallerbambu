/* Configuracion general: Supabase, iconos SVG y dimensiones del proyecto (CFG) */

/* ============ CONEXIÓN COMPARTIDA (Supabase) ============
   Completa estos dos valores tras crear tu proyecto gratuito en supabase.com
   (Project Settings → API). Mientras estén vacíos, la app sigue funcionando
   en modo local (solo en este navegador), sin romperse. */
const CFG_SUPABASE = {
  url: '',      // ej: 'https://xxxxxxxx.supabase.co'
  anonKey: ''   // ej: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' (clave "anon public")
};
/* Para los planos AutoCAD compartidos: crea también en Supabase un bucket de
   Storage llamado "planos" (público). Sin Supabase, los planos se guardan
   solo en este navegador (IndexedDB). */

/* ============ ICONOS SVG (sin emojis ni dependencias) ============ */
const ICONOS = {
  edificio:      '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8.5 7h2M13.5 7h2M8.5 11h2M13.5 11h2M8.5 15h2M13.5 15h2M10 21v-3h4v3"/>',
  ruta:          '<path d="M4 12h13M13 6l6 6-6 6"/>',
  check:         '<path d="M4 12.5l5 5L20 6.5"/>',
  basura:        '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
  guardar:       '<path d="M5 3h11l3 3v15H5z M8 3v5h7V3M8 21v-7h8v7"/>',
  carpeta:       '<path d="M3 7V5h6l2 2h10v13H3z"/>',
  etiqueta:      '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.6"/>',
  equipo:        '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.2 2.3-5.2 5.5-5.2s5.5 2 5.5 5.2"/><circle cx="17.5" cy="9" r="2.4"/><path d="M16 14.6c2.8 0 4.5 1.8 4.5 4.6"/>',
  plano:         '<path d="M6 2h9l5 5v15H6z M15 2v5h5 M9.5 12h6M9.5 16h6"/>',
  subir:         '<path d="M12 16V5M6.5 10.5L12 5l5.5 5.5M4 20h16"/>',
  bajar:         '<path d="M12 4v11M6.5 9.5L12 15l5.5-5.5M4 20h16"/>',
  x:             '<path d="M6 6l12 12M18 6L6 18"/>',
  mas:           '<path d="M12 5v14M5 12h14"/>',
  pincel:        '<path d="M14 3l7 7-9.5 9.5a3 3 0 01-2 .9H5v-4.5a3 3 0 01.9-2z M12 5l7 7"/>',
  alerta:        '<path d="M12 3.5L2.5 20.5h19z M12 10v5M12 17.6h.01"/>',
  volver:        '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  candado:       '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7.5a4 4 0 018 0V11"/>',
  candadoAbierto:'<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7.5A4 4 0 0115.4 5.4"/>',
  abrir:         '<path d="M14 4h6v6M20 4l-9 9M20 13.5V20H4V4h6.5"/>',
  refrescar:     '<path d="M20 11a8 8 0 10.6 4.5M20 5v6h-6"/>',
  menu:          '<path d="M4 6h16M4 12h16M4 18h16"/>',
  flechaArriba:  '<path d="M12 19V5M6 11l6-6 6 6"/>',
  flechaAbajo:   '<path d="M12 5v14M6 13l6 6 6-6"/>',
  flechaIzq:     '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  flechaDer:     '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menos:         '<path d="M5 12h14"/>',
  ojo:           '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'
};
function icono(n){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONOS[n] || '') + '</svg>';
}
function aplicarIconos(){
  document.querySelectorAll('.ic[data-ic]').forEach(el => { el.innerHTML = icono(el.dataset.ic); });
}

/* =====================================================================
   PLANO 3D — OBRAS PROVISIONALES (según informe)
   Mirador de la Dalia · Etapa I — Torres 01 (49.73 m) + 02 (24.30 m)
   10 pisos de 2.65 m (26.50 m) + cubierta · Sótanos -3.40/-6.20/-9.00
   Fase: Cerramientos y Acabados (estructura existente)
   Lote: 163.00 × 47.00 m · Fondo de torres: 12.50 m
   Vía de acceso existente de 15.00 m · Cerramiento perimetral ~420 m
   Montacargas tipo cremallera (1.000 kg) al punto medio de la fachada.
   Estructura del código:
     1. CONFIG            8. PROVISIONALES (dimensiones reales del informe)
     2. ESCENA            9. PERSONAS
     3. TERRENO 3D       10. FLUJO DE MATERIALES
     4. TORRE            11. INTERACCIÓN
     5. MONTACARGAS      12. GUARDAR / CARGAR
     6. PISO 4           13. UI + LOOP
     7. HELPERS
   ===================================================================== */

/* ============ 1. CONFIG ============ */
const CFG = {
  largo: 49.73,         // Torre 01: 49.73 m
  fondo: 12.50,         // fondo de ambas torres (~620 m² y ~305 m² por piso, según README)
  torre2: { largo: 24.30, fondo: 12.50, gap: 0.9, dz: 1.2 }, // Torre 02 en línea, con junta y leve desfase
  pisos: 10,
  hPiso: 2.65,          // entrepiso 2.65 m → 10 × 2.65 = 26.50 m
  sotanos: 3,
  hSotano: 3.0,         // niveles: S1 -3.40 · S2 -6.20 · S3 -9.00 m
  malacateX: 0,         // montacargas al punto medio de la Torre 01
  lote: { x0:-81.5, x1:81.5, z0:-23.5, z1:23.5 },  // 163.00 × 47.00 m
  limites: { xMin:-80, xMax:80, zMin:-37, zMax:22 }
};
CFG.alto = CFG.pisos * CFG.hPiso; // 26.50 m
CFG.torre2.x0 = CFG.largo/2 + CFG.torre2.gap;            // arranque Torre 02
CFG.torre2.cx = CFG.torre2.x0 + CFG.torre2.largo/2;      // centro Torre 02
