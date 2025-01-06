try {
  importScripts('https://smartapps.smalabschoolunesa1.sch.id/frontend/public/firebase-app.js');
  console.log("firebase-app.js berhasil dimuat");
  importScripts('https://smartapps.smalabschoolunesa1.sch.id/frontend/public/firebase-messaging.js');
  console.log("firebase-messaging.js berhasil dimuat");
} catch (error) {
  console.error("Error memuat Firebase SDK:", error);
}