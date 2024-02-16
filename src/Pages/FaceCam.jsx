import * as faceapi from "face-api.js";
import React from "react";
import { useState, useRef, useEffect } from "react";

export default function FaceCam() {
	const [modelsLoaded, setModelsLoaded] = useState(false);
	console.log("app rendered");

	const videoRef = useRef();
	const imgRef = useRef();
	// const videoHeight = 400;
	// const videoWidth = 800;
	const canvasRef = useRef();

	useEffect(() => {
		startVideo();
		videoRef && loadModels();
	}, []);
	// useEffect(() => {
	// 	const loadModels = async () => {
	// 		const MODEL_URL = "/models";

	// 		Promise.all([
	// 			faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
	// 			faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
	// 			faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
	// 			faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
	// 		]).then(setModelsLoaded(true));
	// 	};
	// 	loadModels();
	// }, []);

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

	const loadModels = () => {
		Promise.all([
			faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
			faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
			faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
			faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
			faceapi.nets.faceExpressionNet.loadFromUri("/models"),
		]).then(() => {
			faceMyDetect();
			setModelsLoaded(true)
		});
	};

	const faceMyDetect = () => {
		setInterval(async () => {
			const referenceImage = await faceapi
				.detectSingleFace(imgRef.current)
				.withFaceLandmarks()
				.withFaceDescriptor();

			if (referenceImage) {
				console.log(referenceImage)
			}
			// create FaceMatcher with automatically assigned labels
			// from the detection results for the reference image
			const faceMatcher = new faceapi.FaceMatcher(referenceImage);

			const singleResult = await faceapi
				.detectSingleFace(videoRef.current)
				.withFaceLandmarks()
				.withFaceDescriptor();

			if (singleResult) {
				const bestMatch = faceMatcher.findBestMatch(
					singleResult.descriptor
				);
				alert(bestMatch.toString());
			}
		}, 100);
	};

	// const handleVideoOnPlay = () => {
	// 	setInterval(async () => {
	// 	if (canvasRef && canvasRef.current) {
	// 					canvasRef.current.innerHTML = faceapi.createCanvas(
	// 						videoRef.current
	// 					);
	// 		const displaySize = {
	// 			width: videoWidth,
	// 			height: videoHeight,
	// 		};

	// 					faceapi.matchDimensions(canvasRef.current, displaySize);

	// 		const detections = await faceapi
	// 			.detectAllFaces(
	// 				videoRef.current,
	// 				new faceapi.TinyFaceDetectorOptions()
	// 			)
	// 			.withFaceLandmarks()
	// 			.withFaceExpressions();

	// 		console.log(detections);

	// 		const resizedDetections = faceapi.resizeResults(
	// 			detections,
	// 			displaySize
	// 		);
	// 		console.log(resizedDetections);

	// 					canvasRef &&
	// 						canvasRef.current &&
	// 						canvasRef.current
	// 							.getContext("2d")
	// 							.clearRect(0, 0, videoWidth, videoHeight);
	// 					canvasRef &&
	// 						canvasRef.current &&
	// 						faceapi.draw.drawDetections(
	// 							canvasRef.current,
	// 							resizedDetections
	// 						);
	// 					canvasRef &&
	// 						canvasRef.current &&
	// 						faceapi.draw.drawFaceLandmarks(
	// 							canvasRef.current,
	// 							resizedDetections
	// 						);
	// 					canvasRef &&
	// 						canvasRef.current &&
	// 						faceapi.draw.drawFaceExpressions(
	// 							canvasRef.current,
	// 							resizedDetections
	// 						);
	// 	}
	// 	}, 100);
	// };

	const [counter, setCounter] = useState(0);
	const add = () => {
		counter < 100 ? setCounter((count) => count + 10) : setCounter(0);
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] items-center overflow-hidden">
			{modelsLoaded ? (
					<video
						ref={videoRef}
						crossOrigin="anonymous"
						autoPlay
						// height={videoHeight}
						// width={videoWidth}
						// onPlay={handleVideoOnPlay}
						className={`-scale-x-100 fixed w-auto max-w-screen-2xl h-[75vh]`}
					/>
	
			) : (
				<div>loading...</div>
			)}
			{/* <div className="flex items-center -scale-x-100 fixed w-auto max-w-screen-2xl h-[75vh]">
				<video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
			</div> */}
			<img src="/img/test.jpg" ref={imgRef} className="hidden" />
			<canvas
				ref={canvasRef}
				className="relative z-10 top-0"
				width="300"
				height="600"
			></canvas>

			<div className="fixed bottom-0 -left-[calc(300px-50vw)] w-[600px] h-[300px] bg-white rounded-t-[65%] z-[6]"></div>
			<div className="fixed bottom-24 left-0 w-screen h-fit flex flex-col g-white text-center text-primary-md px-10 items-center gap-3 z-[7]">
				<div>
					<p className="font-bold text-4xl">100%</p>
					<p className="font-medium text-base">
						Memverifikasi Wajah Anda...
					</p>
				</div>
				<div className="flex justify-start items-center w-full rounded-r-full rounded-l-full border-2 border-primary-md h-4">
					<span
						id="bar"
						style={{ transform: `scaleX(${counter}%)` }}
						className={`w-full h-full rounded-r-full rounded-l-full bg-primary-md origin-left duration-500`}
					></span>
				</div>
				<button onClick={add} className="btn">
					btn
				</button>
				<small>
					Harap bersabar karena sistem kami sedang memproses wajah
					anda. Pastikan anda melihat kamera
				</small>
			</div>
		</div>
	);
}
