// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
	"https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
	apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
	authDomain: "projek-sekolah-1acb4.firebaseapp.com",
	projectId: "projek-sekolah-1acb4",
	storageBucket: "projek-sekolah-1acb4.appspot.com",
	messagingSenderId: "796889279454",
	appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
	measurementId: "G-NWG3GGV7DF",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
	console.log(
		"[firebase-messaging-sw.js] Received background message ",
		payload
	);
	// Customize notification here
	const notificationTitle = "Background Message Title";
	const notificationOptions = {
		body: "Background Message body.",
		icon: "/firebase-logo.png",
	};

	self.registration.showNotification(notificationTitle, notificationOptions);
});