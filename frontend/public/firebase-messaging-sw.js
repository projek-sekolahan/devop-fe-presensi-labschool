try {
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
  console.log("firebase-app.js berhasil dimuat");
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');
  console.log("firebase-messaging.js berhasil dimuat");
} catch (error) {
  console.error("Error memuat Firebase SDK:", error);
}