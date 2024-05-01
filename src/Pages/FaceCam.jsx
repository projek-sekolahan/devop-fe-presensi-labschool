import * as faceapi from "face-api.js";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
	getFormData,
	getFaceUrl,
	loading,
	alert,
	parseJwt,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";

export default function RegisterFace() {
	const videoRef = useRef();
	const barRef = useRef();
	const textRef = useRef();
	const { state } = useLocation();

	let userData = {};
	if (localStorage.getItem("token")) {
		userData = parseJwt(localStorage.getItem("token"));
	} else {
		window.location.replace("/login");
	}

	const descriptor = new Float32Array(userData.facecam_id.split(", "));

	loading("Loading", "Getting camera access...");

	const keys = [
		"AUTH_KEY",
		"devop-sso",
		"csrf_token",
		"token",
		"status_dinas",
		"status_kehadiran",
		"geolocation",
		"facecam_id",
		"foto_presensi",
	];
	let values = []; // Dengan asumsi Anda ingin mengakumulasi hasil

	if (localStorage.getItem("group_id") == "4") {
		values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("devop-sso"),
			localStorage.getItem("csrf"),
			localStorage.getItem("login_token"),
			"non-dinas",
			...state,
		];
	} else {
		values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("devop-sso"),
			localStorage.getItem("csrf"),
			localStorage.getItem("login_token"),
			...state,
		];
	}

	const startVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				videoRef.current.srcObject = stream;
				Swal.close();
			})
			.catch(function (err) {
				if (err.name === "NotAllowedError") {
					alert("Error","Error","Izin akses kamera ditolak oleh pengguna");
				} else if (err.name === "NotFoundError") {
					alert("Error","Error","Tidak ada kamera yang tersedia pada perangkat");
				} else {
					alert("Error","Error","Gagal mengakses webcam!");
				}
			});
	};

	//LOAD MODELS

	Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
		faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
		faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
	]).then(() => {
		startVideo();
	});

	const faceMyDetect = () => {
		loading("Loading", "Tetap arahkan wajah ke kamera...");
		let matchFace; // Penempatan yang benar jika unik untuk setiap panggilan
		
		function startFaceMatching() {
			// Bersihkan interval yang ada sebelumnya
			if (matchFace) {
				clearInterval(matchFace);
			}
	
			let attempts = 0; // Menghitung jumlah upaya deteksi
			const maxAttempts = 10; // Jumlah maksimal upaya yang diizinkan
	
			matchFace = setInterval(async () => {
				if (attempts >= maxAttempts) {
					clearInterval(matchFace);
					alert("error", "Matching Failed", "Failed to match face after several attempts.");
					return;
				}
				attempts++;
	
				const faceData = await faceapi
					.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
					.withFaceLandmarks()
					.withFaceDescriptor();
	
				if (faceData) {
					const distance = faceapi.euclideanDistance(descriptor, faceData.descriptor);
					const percentage = `${Math.round(((1 - distance) / 0.4) * 100)}%`;
	
					if (distance <= 0.6) {
						clearInterval(matchFace);
						barRef.current.style.width = "100%";
						textRef.current.innerText = "100%";
	
						const { x, y, width, height } = faceData.detection.box;
						const imgUrl = getFaceUrl(videoRef.current, x - 50, y - 75, height + 125);
						const stringDescriptor = Array.from(faceData.descriptor).join(", ");
						values.push(stringDescriptor, `["${imgUrl}"]`);
	
						apiXML.process(localStorage.getItem("AUTH_KEY"), getFormData(keys, values))
							.then((res) => {
								res = JSON.parse(res);
								localStorage.setItem("csrf", res.csrfHash);
								res = parseJwt(res);
								console.log(res);
								alert(res.info, res.title, res.message,() => window.location.replace(res.location));
							}).catch((err) => {
								if (err.status === 403) {
									alert("error", "Credential Expired", "Your credentials have expired. Please try again later.", () => window.location.replace("/home"));
								} else {
									err = JSON.parse(err.responseText);
									localStorage.setItem("csrf", err.csrfHash);
									console.log(err);
									alert(err.data.info, err.data.title, err.data.message,() => window.location.replace("/home"));
								}
							});
					} else {
						barRef.current.style.width = percentage;
						textRef.current.innerText = percentage;
					}
				}
			}, 1000);
		}
	
		startFaceMatching(); // Panggil fungsi untuk memulai proses pencocokan
	};
	

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] items-center overflow-hidden">
			<video
				ref={videoRef}
				crossOrigin="anonymous"
				autoPlay
				onPlay={faceMyDetect}
				className={`-scale-x-100 fixed w-auto max-w-screen-2xl h-[75vh]`}
			/>
			<div
				className={`relative top-[15vh] left-[calc(50vw/2 - 125)] size-[250px] z-50`}
			>
				<span className="border-white border-t-2 border-l-2 rounded-tl-xl size-14 absolute top-0 left-0"></span>
				<span className="border-white border-t-2 border-r-2 rounded-tr-xl size-14 absolute top-0 right-0"></span>
				<span className="border-white border-b-2 border-l-2 rounded-bl-xl size-14 absolute bottom-0 left-0"></span>
				<span className="border-white border-b-2 border-r-2 rounded-br-xl size-14 absolute bottom-0 right-0"></span>
			</div>

			<div className="fixed bottom-0 -left-[calc(300px-50vw)] w-[600px] h-[300px] bg-white rounded-t-[65%] z-[6]"></div>
			<div className="fixed bottom-24 left-0 w-screen h-fit flex flex-col g-white text-center text-primary-md px-10 items-center gap-3 z-[7]">
				<div>
					<p className="font-bold text-4xl" ref={textRef}>
						0%
					</p>
					<p className="font-medium text-base">
						Melakukan Registrasi Wajah Anda...
					</p>
				</div>
				<div className="flex justify-start items-center w-full rounded-r-full rounded-l-full border-2 border-primary-md h-4">
					<span
						id="bar"
						style={{ transition: "width 0.5s" }}
						className={`h-full rounded-r-full rounded-l-full bg-primary-md`}
						ref={barRef}
					></span>
				</div>
				<small>
					Harap bersabar karena sistem kami sedang memproses wajah
					anda. Pastikan anda melihat kamera
				</small>
			</div>
		</div>
	);
}
