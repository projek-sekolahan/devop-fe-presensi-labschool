import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/loadModels";
import { useRef, useEffect } from "react";
import {
	getFormData,
	getFaceUrl,
	loading,
	alert,
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
	}

	const detectFace = () => {
		loading("Loading", "Sedang melakukan deteksi wajah...");
		let attempts = 0; // Menghitung jumlah upaya deteksi
		const maxAttempts = 5; // Maksimal upaya deteksi yang diizinkan

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
				Cookies.set("csrf", res.csrfHash); // Update csrf token
				if (res.status) {
					// Akses data facecam
					const facecamData = res.data.facecam;
					async function attemptMatch() {
						if (attempts >= maxAttempts) {
							alert(
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
							const faceData = await faceapi
								.detectSingleFace(
									imgRef.current,
									new faceapi.TinyFaceDetectorOptions(),
								)
								.withFaceLandmarks()
								.withFaceDescriptor();

							if (faceData) {
								if (facecamData.length > 1) {
									let isFaceMatched = false;

									for (const facecam of facecamData) {
										const facecamDescriptor =
											new Float32Array(
												facecam.facecam_id
													.split(", ")
													.map(Number),
											);
										const distance =
											faceapi.euclideanDistance(
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
								} else {
									if (
										facecamData[0] === undefined ||
										facecamData[0] === "undefined"
									) {
										registerNewFace(faceData);
									} else {
										const facecamDescriptor =
											new Float32Array(
												facecamData[0].facecam_id
													.split(", ")
													.map(Number),
											);
										const distance =
											faceapi.euclideanDistance(
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
												() => {
													btnRef.current.disabled = false;
													setLoad(false);
												},
											);
											return;
										}
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

						loading("Loading", "Registering Face...");
						apiXML
							.postInput(
								"facecam",
								getFormData(combinedKeys, registerValues),
							)
							.then((response) => {
								const res = JSON.parse(response); console.log(res);
								Cookies.set("csrf", res.csrfHash); // Update csrf token

								if (res.status) {
									alert(
										res.data.info,
										res.data.title,
										res.data.message,
										() =>
											window.location.replace(
												"/setpassword",
											),
									);
								} else {
									alert(
										res.info,
										res.title,
										res.message,
										() =>
											window.location.replace("/facereg"),
									);
								}
							})
							.catch((err) => {
								handleSessionError(err, "/facereg");
							});
					};
					attemptMatch(); // Memulai percobaan pertama
				} else {
					alert(res.data.info, res.data.title, res.data.message, () =>
						window.location.replace("/" + res.data.location),
					);
				}
			})
			.catch((err) => {
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

				{/*<button className="btn" onClick={clickPhoto}>
					Ambil Gambar
				</button>*/}
				{/* Open the modal using document.getElementById('ID').showModal() method */}
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
