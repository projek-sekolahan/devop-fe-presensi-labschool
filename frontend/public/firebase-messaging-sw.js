try {
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
  console.log("firebase-app-compat.js berhasil dimuat");
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
  console.log("firebase-messaging-compat.js berhasil dimuat");
} catch (error) {
  console.error("Error memuat Firebase SDK:", error);
}