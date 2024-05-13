import { getMessaging } from "firebase/messaging/sw";
import { onBackgroundMessage } from "firebase/messaging/sw";
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
	apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
	authDomain: "projek-sekolah-1acb4.firebaseapp.com",
	projectId: "projek-sekolah-1acb4",
	storageBucket: "projek-sekolah-1acb4.appspot.com",
	messagingSenderId: "796889279454",
	appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
	measurementId: "G-NWG3GGV7DF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const CACHE = "pwabuilder-offline-page";

importScripts(
	"https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

self.addEventListener("install", async (event) => {
	event.waitUntil(
		caches.open(CACHE).then((cache) => cache.add(offlineFallbackPage))
	);
});

if (workbox.navigationPreload.isSupported()) {
	workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
	new RegExp("/*"),
	new workbox.strategies.StaleWhileRevalidate({
		cacheName: CACHE,
	})
);

self.addEventListener("fetch", (event) => {
	if (event.request.mode === "navigate") {
		event.respondWith(
			(async () => {
				try {
					const preloadResp = await event.preloadResponse;

					if (preloadResp) {
						return preloadResp;
					}

					const networkResp = await fetch(event.request);
					return networkResp;
				} catch (error) {
					const cache = await caches.open(CACHE);
					const cachedResp = await cache.match(offlineFallbackPage);
					return cachedResp;
				}
			})()
		);
	}
});

const messaging = getMessaging(app);
onBackgroundMessage(messaging, (payload) => {
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
