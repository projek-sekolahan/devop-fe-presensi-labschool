let firebaseConfig = null;

// Tunggu pesan dari aplikasi utama untuk menerima konfigurasi Firebase
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    firebaseConfig = event.data.config;

    // Inisialisasi Firebase setelah menerima konfigurasi
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js");
    importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js");

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
      );

      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});
