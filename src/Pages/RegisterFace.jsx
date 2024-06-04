import * as faceapi from "face-api.js";
import { useRef } from "react";
import {
	getFormData,
	getFaceUrl,
	loading,
	alert,
	handleSessionError,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function RegisterFace() {
	const videoRef = useRef();
	const barRef = useRef();
	const textRef = useRef();
	const key = ["param", "img", "devop-sso", "csrf_token"];
	let oldFaceData;

	loading("Loading", "Getting camera access...");

	const startVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				videoRef.current.srcObject = stream;
				videoRef.current.setAttribute("autoplay", "");
				videoRef.current.setAttribute("muted", "");
				videoRef.current.setAttribute("playsinline", "");
				Swal.close();
			})
			.catch(function (err) {
				if (err.name === "NotAllowedError") {
					alert(
						"error",
						"Error",
						"Izin akses kamera ditolak oleh pengguna",
						() => {
							window.location.reload(true);
						}
					);
				} else if (err.name === "NotFoundError") {
					alert(
						"error",
						"Error",
						"Tidak ada kamera yang tersedia pada perangkat",
						() => {
							window.location.reload(true);
						}
					);
				} else {
					alert("error", "Error", "Gagal mengakses webcam!",
					() => {
						window.location.reload(true);
					});
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
		let attempts = 0; // Menghitung jumlah upaya deteksi
		const maxAttempts = 10; // Maksimal upaya deteksi yang diizinkan

		const keys = ["devop-sso", "csrf_token"];
		const values = [
			localStorage.getItem("regist_token"),
			Cookies.get("csrf"),
		];

		// Panggil API untuk loadFace satu kali sebelum interval
		apiXML
			.postInput("loadFace", getFormData(keys, values))
			.then((res) => {
				res = JSON.parse(res); // Parse JSON response

				// Akses data facecam
				const facecamData = res.data.facecam;
				Cookies.set("csrf", res.csrfHash); // Update csrf token

				async function attemptMatch() {
					if (attempts >= maxAttempts) {
						alert(
							"error",
							"Matching Failed",
							"Failed to match face after several attempts.",
							() => {
								window.location.reload(true);
							},
						);
						return;
					}
					attempts++;

					try {
						const faceData = await faceapi
							.detectSingleFace(
								videoRef.current,
								new faceapi.TinyFaceDetectorOptions(),
							)
							.withFaceLandmarks()
							.withFaceDescriptor();

						if (faceData) {
							if (facecamData.length > 1) {
								let isFaceMatched = false;

								for (const facecam of facecamData) {
									const facecamDescriptor = new Float32Array(
										facecam.facecam_id
											.split(", ")
											.map(Number),
									);
									const distance = faceapi.euclideanDistance(
										facecamDescriptor,
										faceData.descriptor,
									);
									if (
										faceData.detection.score >= 0.9 &&
										distance <= 0.6
									) {
										isFaceMatched = true;
										alert(
											"error",
											"Error",
											"Wajah sudah terdaftar, harap gunakan wajah lain.",
											() =>
												window.location.replace(
													"/facereg",
												),
										);
										return;
									}
								}

								if (!isFaceMatched) {
									registerNewFace(faceData);
								}
							} else {
								const facecamDescriptor = new Float32Array(
									facecamData[0].facecam_id
										.split(", ")
										.map(Number),
								);
								const distance = faceapi.euclideanDistance(
									facecamDescriptor,
									faceData.descriptor,
								);

								if (
									faceData.detection.score >= 0.9 &&
									distance <= 0.6
								) {
									registerNewFace(faceData);
								} else {
									alert(
										"error",
										"Error",
										"Wajah tidak cocok, harap coba lagi.",
										() =>
											window.location.replace("/facereg"),
									);
									return;
								}
							}
						} else {
							setTimeout(attemptMatch, 1000); // No face detected, retry
						}
					} catch (err) {
						handleSessionError(err, "/login");
					}
				}

				const registerNewFace = (faceData) => {
					barRef.current.style.width = "100%";
					textRef.current.innerText = "100%";

					const { x, y, width, height } = faceData.detection.box;
					const imgUrl = getFaceUrl(
						videoRef.current,
						x - 50,
						y - 75,
						height + 125,
					);

					const stringDescriptor = Array.from(
						faceData.descriptor,
					).join(", ");
					const registerKeys = [
						"param",
						"img",
						"devop-sso",
						"csrf_token",
					];
					const registerValues = [
						stringDescriptor,
						`["${imgUrl}"]`,
						localStorage.getItem("regist_token"),
						Cookies.get("csrf"),
					];

					loading("Loading", "Registering Face...");
					apiXML
						.postInput(
							"facecam",
							getFormData(registerKeys, registerValues),
						)
						.then((response) => {
							const res = JSON.parse(response);
							Cookies.set("csrf", res.csrfHash); // Update csrf token

							if (res.status) {
								alert(
									res.data.info,
									res.data.title,
									res.data.message,
									() =>
										window.location.replace("/setpassword"),
								);
							} else {
								alert(res.info, res.title, res.message, () =>
									window.location.replace("/facereg"),
								);
							}
						})
						.catch((err) => {
							handleSessionError(err, "/facereg");
						});
				};
				attemptMatch(); // Memulai percobaan pertama
			})
			.catch((err) => {
				handleSessionError(err, "/facereg");
			});
	};
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] items-center overflow-hidden">
			<video
				ref={videoRef}
				crossOrigin="anonymous"
				autoPlay={+true}
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
