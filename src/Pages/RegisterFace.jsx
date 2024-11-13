import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/loadModels";
import { useRef, useEffect } from "react";
import {
	getFormData,
	getFaceUrl,
	loading,
	alertMessage,
	handleSessionError,
	addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function RegisterFace() {
	const videoRef = useRef();
	const canvasRef = useRef();
	const imgRef = useRef();
	const key = ["param", "img", "devop-sso", "csrf_token"];
	let oldFaceData;

	useEffect(() => {
		const init = async () => {
			loading("Loading", "Getting camera access...");
			await loadFaceModels(); // Load face models sebelum memulai video
			startVideo();
		};

		init();
	}, []);

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
					alertMessage(
						"error",
						"Error",
						"Izin akses kamera ditolak oleh pengguna",
					);
				} else if (err.name === "NotFoundError") {
					alertMessage(
						"error",
						"Error",
						"Tidak ada kamera yang tersedia pada perangkat",
					);
				}
			});
	};

	function clickPhoto() {
		console.log("Starting photo capture...");
		const context = canvasRef.current.getContext("2d");
		const video = videoRef.current;
	 
		const canvasWidth = 400;
		const canvasHeight = 400;
		console.log("Canvas size:", canvasWidth, canvasHeight);
	 
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;
		console.log("Video size:", videoWidth, videoHeight);
	 
		const videoCenterX = videoWidth / 2;
		const videoCenterY = videoHeight / 2;
		const cropX = videoCenterX - canvasWidth / 2;
		const cropY = videoCenterY - canvasHeight / 2;
		console.log("Crop coordinates:", cropX, cropY);
	 
		canvasRef.current.width = canvasWidth;
		canvasRef.current.height = canvasHeight;
	 
		context.save();
		context.scale(-1, 1);
		context.translate(-canvasWidth, 0);
		console.log("Drawing and flipping image on canvas...");
	 
		context.drawImage(
			video,
			cropX,
			cropY,
			canvasWidth,
			canvasHeight,
			0,
			0,
			canvasWidth,
			canvasHeight
		);
	 
		context.restore();
		let image_data_url = canvasRef.current.toDataURL("image/jpeg");
		console.log("Captured image data URL:", image_data_url);
	 
		imgRef.current.src = image_data_url;
		console.log("Photo capture complete. Image set to img element.");
	 }	 

	const detectFace = () => {
		loading("Loading", "Sedang melakukan deteksi wajah...");
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
				console.log("API loadFace response:", res); // Debug respons API awal
				res = JSON.parse(res); // Parse JSON response
				Cookies.set("csrf", res.csrfHash); // Update csrf token
				if (res.status) {
					const facecamData = res.data.facecam; 
					console.log("Loaded facecamData:", facecamData); // Debug data facecam dari respons
	
					// Fungsi percobaan mencocokkan wajah
					async function attemptMatch() {
						console.log("Attempt number:", attempts); // Debug jumlah percobaan
						
						if (attempts >= maxAttempts) {
							alertMessage(
								"error",
								"Deteksi Gagal",
								"Wajah tidak terdeteksi, pastikan pencahayaan memadai",
								() => {
									btnRef.current.disabled = false;
									setLoad(false);
								},
							);
							return;
						}
						attempts++;
	
						try {
							if (!imgRef.current || imgRef.current.src === "") {
								console.error("Image reference is invalid or missing.");
								return;
							}
							console.log("Attempting to detect face on image element:", imgRef.current); // Debug elemen gambar
							const faceData = await faceapi
								.detectSingleFace(
									imgRef.current,
									new faceapi.TinyFaceDetectorOptions(),
								)
								.withFaceLandmarks()
								.withFaceDescriptor();
							console.log("Detected faceData:", faceData); // Debug hasil deteksi wajah
	
							if (faceData) {
								if (
									!facecamData || facecamData.length === 0
								) {
									console.log("No existing facecamData found, registering new face"); // Debug kondisi tanpa data wajah
									registerNewFace(faceData);
								} else {
									console.log("Checking against existing facecamData:", facecamData); // Debug data facecam yang ada
									let isFaceMatched = false;
	
									for (const facecam of facecamData) { 
										const facecamDescriptor = new Float32Array(
											facecam.facecam_id.split(", ").map(Number)
										);
										const distance = faceapi.euclideanDistance(
											facecamDescriptor,
											faceData.descriptor
										);
										console.log("Comparing with facecam:", facecam, "Distance:", distance); // Debug perbandingan jarak
	
										if (faceData.detection.score >= 0.99 && distance <= 0.6) {
											isFaceMatched = true;
											alertMessage(
												"error",
												"Error",
												"Wajah sudah terdaftar, harap gunakan wajah lain.",
												() => {
													btnRef.current.disabled = false;
													setLoad(false);
												},
											);
											return;
										}
									}
	
									if (!isFaceMatched) {
										registerNewFace(faceData);
									}
								}
							} else {
								console.warn("Face detection failed on attempt", attempts);
								console.log("No face detected, retrying..."); // Debug jika wajah tidak terdeteksi
								setTimeout(attemptMatch, 1000); // No face detected, retry
							}
						} catch (err) {
							console.error("Error during face detection:", err); // Debug kesalahan deteksi wajah
							handleSessionError(err, "/login");
						}
					}
	
					// Fungsi untuk mendaftarkan wajah baru
					const registerNewFace = (faceData) => {
						const stringDescriptor = Array.from(
							faceData.descriptor,
						).join(", ");
						const registerKeys = ["param", "img"];
						const combinedKeys = addDefaultKeys(registerKeys);
						const registerValues = [
							stringDescriptor,
							`["${canvasRef.current.toDataURL("image/jpeg")}"]`,
							localStorage.getItem("regist_token"),
							Cookies.get("csrf"),
						];
						console.log("Registering new face with values:", registerValues); // Debug nilai saat pendaftaran wajah
						loading("Loading", "Registering Face...");
	
						apiXML
							.postInput(
								"facecam",
								getFormData(combinedKeys, registerValues),
							)
							.then((response) => {
								const res = JSON.parse(response);
								console.log("Face registration response:", res); // Debug respons pendaftaran wajah
	
								if (res.status) {
									alertMessage(
										res.data.info,
										res.data.title,
										res.data.message,
										() =>
											window.location.replace(
												"/setpassword",
											),
									);
								} else {
									alertMessage(
										res.info,
										res.title,
										res.message,
										() =>
											window.location.replace("/facereg"),
									);
								}
							})
							.catch((err) => {
								console.error("Error during face registration:", err); // Debug kesalahan saat pendaftaran wajah
								handleSessionError(err, "/facereg");
							});
					};
	
					// Mulai percobaan pertama
					attemptMatch(); 
				} else {
					alertMessage(
						res.data.info,
						res.data.title,
						res.data.message,
						() => window.location.replace("/" + res.data.location),
					);
				}
			})
			.catch((err) => {
				console.error("Error during API call to loadFace:", err); // Debug kesalahan saat memanggil loadFace API
				handleSessionError(err, "/login");
			});
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
				<button
					className="btn"
					onClick={() => {
						document.getElementById("my_modal_1").showModal();
						clickPhoto();
					}}
				>
					Ambil Gambar
				</button>
				<dialog id="my_modal_1" className="modal">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Hasil Potret</h3>
						<img ref={imgRef} className="w-full" />
						<div className="modal-action flex justify-center">
							<form method="dialog" className="flex gap-2">
								{/* if there is a button in form, it will close the modal */}
								<button className="btn">Cancel</button>
								<button
									className="btn bg-secondary-green"
									onClick={detectFace}
								>
									Proses
								</button>
							</form>
						</div>
					</div>
				</dialog>
				<small>
					Pastikan pencahayaan memadai untuk hasil gambar yang
					maksimal dan dapat dideteksi
				</small>
			</div>
		</div>
	);
}
