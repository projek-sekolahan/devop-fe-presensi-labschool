import { useRef, useEffect } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import * as faceapi from "face-api.js";
import { loadFaceModels, detectSingleFace } from "../utils/faceUtils";
import { apiXML } from "../utils/apiXML";
import { alertMessage, loading, handleSessionError } from "../utils/utils";

export default function RegisterFace() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

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
                alertMessage("error", "Error", errorMessage);
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

        try {
            // Ambil data awal dari server
            const formData = {
                "devop-sso": localStorage.getItem("regist_token"),
                csrf_token: Cookies.get("csrf"),
            };

            const response = await apiXML.postInput("loadFace", formData);
            if (!response.status) throw new Error("Gagal memuat data wajah.");

            const facecamData = response.data.facecam;

            const attemptMatch = async () => {
                if (attempts >= maxAttempts) {
                    alertMessage(
                        "error",
                        "Deteksi Gagal",
                        "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                        () => resetForm()
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
                    alertMessage(
                        "error",
                        "Error",
                        "Wajah sudah terdaftar, gunakan wajah lain.",
                        () => resetForm()
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
            if (response.status) {
                alertMessage(
                    response.data.info,
                    response.data.title,
                    response.data.message,
                    () => window.location.replace("/setpassword")
                );
            } else {
                throw new Error("Gagal mendaftarkan wajah.");
            }
        } catch (err) {
            console.error(err);
            handleSessionError(err, "/facereg");
        }
    };

    const resetForm = () => {
        imgRef.current.src = "";
    };

    return (
        <div className="bg-primary-low text-white flex flex-col h-screen w-screen">
            <video ref={videoRef} className="video-feed" />
            <canvas ref={canvasRef} className="hidden" />
            <img ref={imgRef} className="hidden" alt="Captured face" />

            <div className="controls">
                <button onClick={clickPhoto}>Ambil Gambar</button>
                <button onClick={detectAndRegisterFace}>Proses</button>
            </div>
        </div>
    );
}
