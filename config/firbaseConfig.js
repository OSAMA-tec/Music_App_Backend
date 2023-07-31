// firebaseConfig.js
const admin = require("firebase-admin");

const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
}
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET_URL,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket,admin };