const admin = require("firebase-admin");
require("dotenv").config();

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // En producción (Render): la service account viene como JSON string en variable de entorno
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // En desarrollo local: carga desde archivo
    const path = require("path");
    const serviceAccountPath = path.resolve(__dirname, "..", process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(require(serviceAccountPath));
  } else {
    throw new Error(
      "No se encontró configuración de Firebase. Define FIREBASE_SERVICE_ACCOUNT_JSON en las variables de entorno de Render."
    );
  }

  admin.initializeApp({ credential });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
