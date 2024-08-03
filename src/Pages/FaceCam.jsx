import * as faceapi from "face-api.js";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
	getFormData,
	getFaceUrl,
	loading,
	alert,
	parseJwt,
	handleSessionError,
	addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { loadFaceModels } from "../utils/loadModels";

export default function RegisterFace() {
	const videoRef = useRef();
	const canvasRef = useRef();
	const imgRef = useRef();
	const { state } = useLocation();

	let userData = {};
	if (localStorage.getItem("token")) {
		userData = parseJwt(localStorage.getItem("token"));
	} else {
		window.location.replace("/login");
	}

	const descriptor = new Float32Array(userData.facecam_id.split(", "));

	useEffect(() => {
		const init = async () => {
			loading("Loading", "Getting camera access...");
			await loadFaceModels(); // Load face models sebelum memulai video
			startVideo();
		};

		init();
	}, []);

	const keys = [
		"AUTH_KEY",
		"token",
		"status_dinas",
		"status_kehadiran",
		"geolocation",
		"facecam_id",
		"foto_presensi",
	];
	const combinedKeys = addDefaultKeys(keys);
	let values = []; // Dengan asumsi Anda ingin mengakumulasi hasil

	if (localStorage.getItem("group_id") == "4") {
		values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("login_token"),
			"non-dinas",
			...state,
			localStorage.getItem("devop-sso"),
			Cookies.get("csrf"),
		];
	} else {
		values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("login_token"),
			...state,
			localStorage.getItem("devop-sso"),
			Cookies.get("csrf"),
		];
	}

	const startVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: false })
			.then((stream) => {
				Swal.close();
				videoRef.current.srcObject = stream;
				videoRef.current.setAttribute("autoplay", "");
				videoRef.current.setAttribute("muted", "");
				videoRef.current.setAttribute("playsinline", "");
			})
			.catch(function (err) {
				if (err.name === "NotAllowedError") {
					alert(
						"error",
						"Error",
						"Izin akses kamera ditolak oleh pengguna",
					);
				} else if (err.name === "NotFoundError") {
					alert(
						"error",
						"Error",
						"Tidak ada kamera yang tersedia pada perangkat",
					);
				}
			});
	};

	function clickPhoto() {
		const context = canvasRef.current.getContext("2d");
		const video = videoRef.current;

		// Ukuran canvas untuk gambar akhir
		const canvasWidth = 400;
		const canvasHeight = 400;

		// Ukuran asli video
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;

		// Menentukan titik tengah dari video
		const videoCenterX = videoWidth / 2;
		const videoCenterY = videoHeight / 2;

		// Menentukan titik awal untuk memotong gambar (crop)
		const cropX = videoCenterX - canvasWidth / 2;
		const cropY = videoCenterY - canvasHeight / 2;

		// Mengatur ukuran canvas
		canvasRef.current.width = canvasWidth;
		canvasRef.current.height = canvasHeight;

		// Membalik gambar secara horizontal untuk menghindari mirror effect
		context.save(); // Menyimpan state konteks canvas
		context.scale(-1, 1); // Membalik gambar secara horizontal
		context.translate(-canvasWidth, 0); // Memindahkan gambar ke posisi yang benar

		// Mengambil gambar dari video dan memotongnya tepat di tengah
		context.drawImage(
			video,
			cropX,
			50,
			canvasWidth,
			canvasHeight, // Area dari video yang akan diambil
			0,
			0,
			canvasWidth,
			canvasHeight, // Area di canvas tempat gambar akan digambar
		);

		context.restore(); // Mengembalikan state konteks canvas ke semula

		let image_data_url = canvasRef.current.toDataURL("image/jpeg");

		// Mengatur gambar hasil di img element
		imgRef.current.src = image_data_url;
		detectFace();
	}

	const detectFace = () => {
		loading("Loading", "Sedang melakukan deteksi wajah...");
		let attempts = 0; // Menghitung jumlah upaya deteksi
		const maxAttempts = 5; // Maksimal upaya deteksi yang diizinkan

		async function attemptMatch() {
			if (attempts >= maxAttempts) {
				alert(
					"error",
					"Matching Failed",
					"Failed to match face after several attempts.",
				);
			}
			attempts++;

			try {
				const faceData = await faceapi
					.detectSingleFace(
						imgRef.current,
						new faceapi.TinyFaceDetectorOptions(),
					)
					.withFaceLandmarks()
					.withFaceDescriptor();

				if (faceData) {
					const distance = faceapi.euclideanDistance(
						descriptor,
						faceData.descriptor,
					);

					if (distance <= 0.6) {
						const stringDescriptor = Array.from(
							faceData.descriptor,
						).join(", ");
						values.push(
							stringDescriptor,
							`["${canvasRef.current.toDataURL("image/jpeg")}"]`,
						);
						Swal.close();
						loading("Loading", "Mengirim data presensi...");

						const response = await apiXML.presensiPost(
							"process",
							localStorage.getItem("AUTH_KEY"),
							getFormData(combinedKeys, values),
						);
						const res = JSON.parse(response);
						Cookies.set("csrf", res.csrfHash);
						const jwt = parseJwt(res.data);
						Swal.close();
						alert(jwt.info, jwt.title, jwt.message, () =>
							window.location.replace("/home"),
						);
					} else {
						alert(
							"error",
							"Matching Failed",
							"Face not match with registered before",
						);
					}
				} else {
					setTimeout(attemptMatch, 100);
				}
			} catch (err) {
				handleSessionError(err, "/login");
			}
		}
		attemptMatch();
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] items-center overflow-hidden">
			<video
				ref={videoRef}
				crossOrigin="anonymous"
				className={`-scale-x-100 translate-500 fixed w-auto max-w-screen-2xl h-[75vh]`}
			/>
			<canvas ref={canvasRef} className="absolute z-[9] hidden"></canvas>
			<img ref={imgRef} className="absolute z-10 hidden" />

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
					<p className="font-medium text-base">
						{" "}
						Melakukan Registrasi Wajah Anda...{" "}
					</p>
				</div>
				<button className="btn" onClick={clickPhoto}>
					Presensi
				</button>
				<small>
					Pastikan pencahayaan bagus untuk hasil gambar yang maksimal
				</small>
			</div>
		</div>
	);
}
