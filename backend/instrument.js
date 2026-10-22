// Sentry se inicializa ANTES de cargar express, para poder medir cada pedido.
// El DSN llega por el entorno: sólo producción lo tiene, así que en QA,
// en compose y en los tests Sentry queda apagado y la app anda igual.
const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || "production",
    tracesSampleRate: 1.0, // medir todos los pedidos (qué tarda y qué se usa)
  });
}

module.exports = Sentry;
