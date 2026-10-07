// frontend/src/lib/materias.js

// 1. Formateador de contadores ("CURSADAS ACTIVAS: 03")
export function formatearContadorCursadas(cantidad) {
  if (typeof cantidad !== 'number' || cantidad < 0 || isNaN(cantidad)) {
    return 'CURSADAS ACTIVAS: 00';
  }
  const pad = String(cantidad).padStart(2, '0');
  return `CURSADAS ACTIVAS: ${pad}`;
}

// 2. Filtro y ordenamiento de materias según estado
export function filtrarMateriasPorEstado(materias, estadoFiltro) {
  if (!Array.isArray(materias)) {
    throw new Error('La lista de materias debe ser un arreglo válido');
  }
  if (!estadoFiltro) {
    return materias;
  }
  return materias.filter(
    (m) => m && m.estado && m.estado.toLowerCase() === estadoFiltro.toLowerCase()
  );
}

// 3. Cliente de API con inyección de dependencia para MOCK (igual a §3.0 de la guía)
export async function obtenerCursadasActivas(clienteFetch) {
  if (typeof clienteFetch !== 'function') {
    throw new Error('Se requiere un cliente fetch inyectado');
  }
  const respuesta = await clienteFetch('/api/materias?estado=cursando');
  const datos = await respuesta.json();
  return datos.filter((m) => m.estado === 'Cursando');
}