importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
    authDomain: "projek-sekolah-1acb4.firebaseapp.com",
    projectId: "projek-sekolah-1acb4",
    storageBucket: "projek-sekolah-1acb4.appspot.com",
    messagingSenderId: "796889279454",
    appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
    measurementId: "G-NWG3GGV7DF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});