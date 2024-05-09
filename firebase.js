var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://app-node-js-fatec-01-default-rtdb.firebaseio.com"
});


module.exports = admin;