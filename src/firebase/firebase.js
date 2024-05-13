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
const messaging = getMessaging(app)

export const generateToken = async () => {
    const permission = await Notification.requestPermission();
    console.log(permission)
}
