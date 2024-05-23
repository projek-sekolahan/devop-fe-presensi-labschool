import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Konfigurasi Firebase
const firebaseConfig = {
	apiKey: "AIzaSyANCfphvM408UXtVutV3s3JUWcv50Wox4s",
	authDomain: "projek-sekolah-1acb4.firebaseapp.com",
	projectId: "projek-sekolah-1acb4",
	storageBucket: "projek-sekolah-1acb4.appspot.com",
	messagingSenderId: "796889279454",
	appId: "1:796889279454:web:b9c53d12f01f3551f38b4f",
	measurementId: "G-NWG3GGV7DF",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export const generateToken = async () => {
	const token = await getToken(messaging, {
		vapidKey:
			"BLLw96Dsif69l4B9zOjil0_JLfwJn4En4E7FRz5n1U8jgWebZ-pWi7B0z7MTehhYZ7jM1c2sXo6E8J7ldrAAngw",
	});
};
