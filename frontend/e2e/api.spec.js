import { expect, test } from '@playwright/test'

// La api tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:3001'

async function listarMaterias (request) {
  const r = await request.get(`${API}/materias`)
  expect(r.status()).toBe(200)
  return r.json()
}

test('alta de una materia: se crea, se lista, se borra y deja de listarse', async ({ request }) => {
  const nombre = `int ${Date.now()}`

  const alta = await request.post(`${API}/materias`, {
    data: { nombre, profesor: 'Integración', estado: 'Cursando' },
  })
  expect(alta.status()).toBe(201)
  const creada = await alta.json()

  expect((await listarMaterias(request)).some((m) => m.nombre === nombre)).toBe(true)

  const baja = await request.delete(`${API}/materias/${creada.id}`)
  expect(baja.ok()).toBe(true)

  expect((await listarMaterias(request)).some((m) => m.nombre === nombre)).toBe(false)
})

test('alta inválida: nombre vacío devuelve 400 y no crea nada', async ({ request }) => {
  const profesor = `int-invalida ${Date.now()}`

  const alta = await request.post(`${API}/materias`, {
    data: { nombre: '', profesor, estado: 'Cursando' },
  })

  expect(alta.status()).toBe(400)
  expect((await listarMaterias(request)).some((m) => m.profesor === profesor)).toBe(false)
})

test('una actividad queda guardada en su materia, y se va con ella al borrarla', async ({ request }) => {
  const nombre = `int-act ${Date.now()}`
  const materia = await (await request.post(`${API}/materias`, {
    data: { nombre, profesor: 'Integración', estado: 'Cursando' },
  })).json()

  const alta = await request.post(`${API}/actividades`, {
    data: { titulo: 'Parcial 1', fecha_entrega: '2026-11-15', materia_id: materia.id },
  })
  expect(alta.status()).toBe(201)

  const actividades = await (await request.get(`${API}/materias/${materia.id}/actividades`)).json()
  expect(actividades.map((a) => a.titulo)).toContain('Parcial 1')

  // borrar la materia borra sus actividades (ON DELETE CASCADE en la base de verdad)
  expect((await request.delete(`${API}/materias/${materia.id}`)).ok()).toBe(true)
  const despues = await (await request.get(`${API}/materias/${materia.id}/actividades`)).json()
  expect(despues).toHaveLength(0)
})
