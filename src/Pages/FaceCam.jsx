import * as faceapi from "face-api.js";
import React from "react";
import { useState, useRef, useEffect } from "react";

export default function FaceCam() {
	console.log("app rendered");

	const videoRef = useRef();
	const barRef = useRef();
	const textRef = useRef();

	const startVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				videoRef.current.srcObject = stream;
			})
			.catch(function (err) {
				if (err.name === "NotAllowedError") {
					console.log("Izin akses kamera ditolak oleh pengguna");
				} else if (err.name === "NotFoundError") {
					console.log(
						"Tidak ada kamera yang tersedia pada perangkat"
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
		faceapi.nets.faceExpressionNet.loadFromUri("/models"),
	]).then(() => {
		console.log("models loaded");
		startVideo();
	});

	const faceMyDetect = () => {
		console.log("run detect");
		setInterval(async () => {
			console.log("run loop");
			// alert(`${videoRef.current.clientWidth}, ${videoRef.current.clientHeight}, ${window.screen.width}, ${window.screen.height}`)
			const faceData = await faceapi
				.detectSingleFace(
					videoRef.current,
					new faceapi.TinyFaceDetectorOptions()
				)
				.withFaceLandmarks()
				.withFaceDescriptor();

			if (faceData) {
				console.log(faceData);
				const percentage = `${Math.round(
					(faceData.detection.score / 0.8) * 100
				)}%`;
				if (faceData.detection.score >= 0.8) {
					barRef.current.style.width = "100%";
					textRef.current.innerText = "100%";
					const floatString = Array.from(faceData.descriptor).join(
						", "
					);
					alert(floatString);
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
						Memverifikasi Wajah Anda...
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
