import { expect, test } from '@playwright/test'

// Completa el formulario progresivo (nombre → cátedra → estado) y confirma.
async function registrarMateria (page, nombre) {
  await page.getByRole('button', { name: /REGISTRAR NUEVA MATERIA/ }).click()
  await page.getByLabel('Nombre de la materia').fill(nombre)
  await page.getByRole('button', { name: /CONTINUAR/ }).click()
  await page.getByLabel('Profesor de la materia').fill('E2E')
  await page.getByRole('button', { name: /CONTINUAR/ }).click()
  await page.getByRole('button', { name: /CONFIRMAR REGISTRO/ }).click()
}

async function purgarMateria (page, nombre) {
  await page.getByRole('button', { name: `Purgar ${nombre}` }).click()
  await page.getByRole('button', { name: 'PURGAR DEFINITIVAMENTE' }).click()
  await expect(page.getByRole('heading', { name: nombre })).toHaveCount(0)
}

test('registrar una materia la muestra en el índice, y purgarla la saca', async ({ page }) => {
  await page.goto('/')
  const nombre = `e2e ${Date.now()}`

  await registrarMateria(page, nombre)
  await expect(page.getByRole('heading', { name: nombre })).toBeVisible()

  await purgarMateria(page, nombre)
})

test('un nombre demasiado largo muestra el error y no registra nada', async ({ page }) => {
  await page.goto('/')
  const nombre = `e2e ${Date.now()} ${'x'.repeat(100)}`   // supera el máximo de 100

  await registrarMateria(page, nombre)

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('heading', { name: nombre })).toHaveCount(0)
})

test('la materia registrada sigue ahí al recargar la página', async ({ page }) => {
  await page.goto('/')
  const nombre = `e2e-recarga ${Date.now()}`

  await registrarMateria(page, nombre)
  await expect(page.getByRole('heading', { name: nombre })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: nombre })).toBeVisible()

  await purgarMateria(page, nombre)
})
