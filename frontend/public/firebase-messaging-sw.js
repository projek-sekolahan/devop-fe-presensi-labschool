try {
  importScripts('/firebase-app.js');
  console.log("firebase-app.js berhasil dimuat");
  importScripts('/firebase-messaging.js');
  console.log("firebase-messaging.js berhasil dimuat");
} catch (error) {
  console.error("Error memuat Firebase SDK:", error);
}
