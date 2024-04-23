import * as faceapi from "face-api.js";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { getFormData, getImageUrl, loading, alert } from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";

export default function RegisterFace() {
	const videoRef = useRef();
	const barRef = useRef();
	const textRef = useRef();
	loading("Loading", "Getting camera access...");

	const key = ["param", "img", "devop-sso", "csrf_token"];

	const startVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				videoRef.current.srcObject = stream;
				Swal.close();
			})
			.catch(function (err) {
				if (err.name === "NotAllowedError") {
					console.log("Izin akses kamera ditolak oleh pengguna");
				} else if (err.name === "NotFoundError") {
					console.log(
						"Tidak ada kamera yang tersedia pada perangkat",
					);
				} else {
					console.log("Gagal mengakses webcam!", err);
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
		const registerFace = setInterval(async () => {
			const faceData = await faceapi
				.detectSingleFace(
					videoRef.current,
					new faceapi.TinyFaceDetectorOptions(),
				)
				.withFaceLandmarks()
				.withFaceDescriptor();

			if (faceData) {
				Swal.close();
				const percentage = `${Math.round(
					(faceData.detection.score / 0.9) * 100,
				)}%`;
				if (faceData.detection.score >= 0.9) {
					clearInterval(registerFace);
					barRef.current.style.width = "100%";
					textRef.current.innerText = "100%";

					const { x, y, width, height } = faceData.detection.box;
					const imgUrl = getImageUrl(
						videoRef.current,
						x - 50,
						y - 75,
						height + 125,
					);

					// Float 32 Array to String
					const stringDescriptor = Array.from(
						faceData.descriptor,
					).join(", ");
					const values = [
						stringDescriptor,
						`["${imgUrl}"]`,
						localStorage.getItem("regist_token"),
						localStorage.getItem("csrf")
					];
					apiXML.facecam(getFormData(key, values)).then((res) => {
						res = JSON.parse(res);
						localStorage.setItem("csrf", res.csrfHash);
						res.status
							? alert(
									res.data.info,
									res.data.title,
									res.data.message,
									() =>
										window.location.replace("setpassword"),
								)
							: alert(res.info, res.title, res.message, () =>
									window.location.replace(res.location),
								);
					});
				} else {
					barRef.current.style.width = percentage;
					textRef.current.innerText = percentage;
				}
			}
		}, 1000);
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
