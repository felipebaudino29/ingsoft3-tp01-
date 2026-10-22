import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

// El DSN de un front no es secreto: sólo sirve para ENVIAR datos, no para leerlos.
Sentry.init({
  dsn: 'https://bf6ee2711625cadb266a3dc3218f2af5@o4512296959803392.ingest.us.sentry.io/4512296991588352',
  environment: window.location.hostname,   // de qué sitio vino: QA, producción o localhost
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
