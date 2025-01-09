import { useRef, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import * as faceapi from "face-api.js";
import { loadFaceModels, detectSingleFace } from "../utils/faceUtils";
import apiXML from "../utils/apiXML";
import { alertMessage, loading, handleSessionError } from "../utils/utils";

export default function RegisterFace() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    // Inisialisasi komponen
    useEffect(() => {
        const init = async () => {
            loading("Loading", "Getting camera access...");
            await loadFaceModels(); // Load model Face API
            startVideo();
        };
        init();
    }, []);

    // Fungsi untuk memulai kamera
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
            .catch((err) => {
                const errorMessage =
                    err.name === "NotAllowedError"
                        ? "Izin akses kamera ditolak oleh pengguna"
                        : "Tidak ada kamera yang tersedia pada perangkat";
                alertMessage("Error", errorMessage, "error",);
            });
    };

    // Fungsi untuk mengambil gambar dari video
    const clickPhoto = () => {
        const context = canvasRef.current.getContext("2d");
        const video = videoRef.current;
        const canvasSize = 400;

        canvasRef.current.width = canvasSize;
        canvasRef.current.height = canvasSize;

        const cropX = (video.videoWidth - canvasSize) / 2;
        const cropY = (video.videoHeight - canvasSize) / 2;

        context.save();
        context.scale(-1, 1); // Flip horizontal
        context.translate(-canvasSize, 0);
        context.drawImage(
            video,
            cropX,
            cropY,
            canvasSize,
            canvasSize,
            0,
            0,
            canvasSize,
            canvasSize
        );
        context.restore();

        const imageUrl = canvasRef.current.toDataURL("image/jpeg");
        imgRef.current.src = imageUrl;
    };

    // Fungsi utama untuk mendeteksi wajah dan mendaftarkan
    const detectAndRegisterFace = async () => {
        loading("Loading", "Sedang melakukan deteksi wajah...");
        const maxAttempts = 10;
        let attempts = 0;
        setIsLoading(true);
        try {
            // Ambil data awal dari server
            const formData = {
                "devop-sso": localStorage.getItem("regist_token"),
                csrf_token: Cookies.get("csrf"),
            };

            const response = await apiXML.postInput("loadFace", formData);
            if (!response.status) {
                setIsLoading(false);
                alertMessage(
                    "Gagal memuat data wajah",
                    "Wajah tidak terdeteksi pada database",
                    "error"
                );
                return;
            }

            const facecamData = response.data.facecam;

            const attemptMatch = async () => {
                if (attempts >= maxAttempts) {
                    setIsLoading(false);
                    alertMessage(
                        "Deteksi Gagal",
                        "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                        "error",
                        () => window.location.replace("/facereg")
                    );
                    return;
                }

                attempts++;
                const faceData = await detectSingleFace(imgRef.current);

                if (!faceData) {
                    setTimeout(attemptMatch, 1000); // Retry
                    return;
                }

                // Periksa apakah wajah sudah terdaftar
                const isMatched = facecamData.some((facecam) => {
                    const descriptor = new Float32Array(
                        facecam.facecam_id.split(", ").map(Number)
                    );
                    const distance = faceapi.euclideanDistance(
                        descriptor,
                        faceData.descriptor
                    );
                    return distance <= 0.6;
                });

                if (isMatched) {
                    setIsLoading(false);
                    alertMessage(
                        "Error",
                        "Wajah sudah terdaftar, gunakan wajah lain",
                        "error",
                        () => window.location.replace("/facereg")
                    );
                    return;
                }

                // Daftarkan wajah baru
                registerNewFace(faceData);
            };

            attemptMatch();
        } catch (err) {
            console.error(err);
            handleSessionError(err, "/login");
        }
    };

    // Fungsi untuk mendaftarkan wajah baru
    const registerNewFace = async (faceData) => {
        const formData = {
            param: Array.from(faceData.descriptor).join(", "),
            img: canvasRef.current.toDataURL("image/jpeg"),
            "devop-sso": localStorage.getItem("regist_token"),
            csrf_token: Cookies.get("csrf"),
        };

        try {
            const response = await apiXML.postInput("facecam", formData);
            const res = JSON.parse(response);
            Cookies.set("csrf", res.csrfHash);
            if (response.status) {
                setIsLoading(false);
                alertMessage(
                    response.data.title,
                    response.data.message,
                    response.data.info,
                    () => window.location.replace("/setpassword")
                );
            } else {
                setIsLoading(false);
                alertMessage(
                    "Error",
                    "Gagal mendaftarkan wajah",
                    "error",
                    () => window.location.replace("/facereg")
                );
            }
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            handleSessionError(err, "/facereg");
        }
    };

    return (
<div className="capture-container bg-primary-low text-white flex flex-col h-screen w-screen">
    {/* Title and Subtitle */}
    <div className="text-center mt-6">
        <h1 className="text-2xl font-bold">Pendaftaran Wajah</h1>
        <p className="text-sm mt-2">Silakan ambil gambar wajah Anda untuk keperluan verifikasi</p>
    </div>

    {/* Video Feed */}
    <video
        ref={videoRef}
        className="h-2/3 w-full object-cover mt-4"
        autoPlay
        playsInline
    />

    {/* Canvas and Captured Image (Hidden) */}
    <canvas ref={canvasRef} className="hidden" />
    <img ref={imgRef} className="hidden" alt="Captured face" />

    {/* Controls Section */}
    <div className="capture-form-container flex flex-col items-center justify-center gap-4 mt-auto p-6">
        <button
            onClick={clickPhoto}
            className="bg-white text-primary-md font-semibold py-2 px-6 rounded-lg hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300"
        >
            Ambil Gambar
        </button>
        <button
            disabled={isLoading}
            onClick={detectAndRegisterFace}
            className={`bg-primary-md text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading ? "loading" : ""
            }`}
        >
            {isLoading ? (
                <div className="flex justify-center items-center gap-2">
                    <span>Loading...</span>
                    <span className="loading loading-spinner text-white"></span>
                </div>
            ) : (
                "Proses"
            )}
        </button>
    </div>
</div>

    );
}
