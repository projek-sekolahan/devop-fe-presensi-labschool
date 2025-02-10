import { useRef, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import {
    loadFaceModels,
    detectSingleFace,
    validateFaceDetection,
} from "../utils/faceUtils";
import apiXML from "../utils/apiXML";
import { alertMessage, loading, getFormData } from "../utils/utils";

export default function RegisterFace({ isOpen, onToggle }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            loading("Loading", "Getting camera access...");
            await loadFaceModels(); // Preload Face API models
            await preloadFacecamData(); // Preload and cache facecam data
            startVideo();
        };
        init();
    }, []);

    // Fungsi untuk preload data facecam dan caching
    const preloadFacecamData = async () => {
        try {
            let keys = ["devop-sso", "csrf_token"];
            let values = [
                localStorage.getItem("regist_token"),
                Cookies.get("csrf"),
            ];
            const response = await apiXML.postInput(
                "loadFace",
                getFormData(keys, values)
            );
            const res = JSON.parse(response);
            Cookies.set("csrf", res.csrfHash);
        } catch (err) {
            console.error("Error preloading facecam data:", err);
            alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                onToggle("login")
            );
        }
    };

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
                console.error("Camera access error:", err);
                const errorMessage =
                    err.name === "NotAllowedError"
                        ? "Izin akses kamera ditolak oleh pengguna"
                        : "Tidak ada kamera yang tersedia pada perangkat";
                alertMessage("Error", errorMessage, "error", () =>
                    onToggle("login")
                );
            });
    };

    // Fungsi untuk mengambil gambar dari video
    function clickPhoto() {
        const context = canvasRef.current.getContext("2d");
        const video = videoRef.current;
        const canvasWidth = 400;
        const canvasHeight = 400;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const videoCenterX = videoWidth / 2;
        const videoCenterY = videoHeight / 2;
        const cropX = videoCenterX - canvasWidth / 2;
        const cropY = videoCenterY - canvasHeight / 2;
        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        context.save();
        context.scale(-1, 1);
        context.translate(-canvasWidth, 0);
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
        imgRef.current.src = image_data_url;
    }

    // Fungsi untuk mendeteksi wajah dan mencocokkan data
    const detectAndRegisterFace = async () => {
        setIsLoading(true);
        const modal = document.getElementById("my_modal_1");
        if (modal) modal.close();
        loading("Loading", "Starting face registration...");
        try {
            const faceData = await detectSingleFace(imgRef.current);
            if (!faceData) {
                setIsLoading(false);
                console.error("Face not detected.");
                alertMessage(
                    "Deteksi Gagal",
                    "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                    "error",
                    () => onToggle("facereg")
                );
                return;
            }
            registerNewFace(faceData);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error("Error during face detection/registration:", err);
            alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                onToggle("login")
            );
        }
    };

    // Fungsi untuk mendaftarkan wajah baru
    const registerNewFace = async (faceData) => {
        try {
            let keys = ["param", "img", "devop-sso", "csrf_token"];
            let values = [
                Array.from(faceData.descriptor).join(", "),
                `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
                localStorage.getItem("regist_token"),
                Cookies.get("csrf"),
            ];
            const response = await apiXML.postInput(
                "facecam",
                getFormData(keys, values)
            );
            const res = JSON.parse(response);
            Cookies.set("csrf", res.csrfHash);
            if (res.status) {
                setIsLoading(false);
                alertMessage(
                    res.data.title,
                    res.data.message,
                    res.data.info,
                    () => onToggle("setpassword")
                );
            } else {
                setIsLoading(false);
                console.error("Failed to register face.");
                alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                    onToggle("login")
                );
            }
        } catch (err) {
            setIsLoading(false);
            console.error("Error during face registration:", err);
            alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                onToggle("login")
            );
        }
    };

    return (
        <div className="capture-container">
            {/* Title and Subtitle */}
            <div className="text-center mt-6 mb-6">
                <h1 className="text-2xl font-bold">Pendaftaran Wajah</h1>
                <p className="text-sm font-semibold mt-2">
                    Ambil Gambar Wajah Untuk Verifikasi
                </p>
            </div>

            {/* Video Feed with Frame Overlay */}
            <div className="relative w-full h-[400px] flex justify-center items-center">
                <video
                    ref={videoRef}
                    className="absolute w-full h-full object-cover mt-8 -scale-x-100"
                    autoPlay
                    playsInline
                />
                {/* Frame Overlay */}
                <div
                    className="relative z-10"
                    style={{
                        width: "300px", // Lebar bingkai
                        height: "300px", // Tinggi bingkai
                        border: "4px solid #00FF00", // Warna bingkai hijau
                        borderRadius: "16px", // Membuat sudut membulat
                        boxShadow: "0 0 15px rgba(0, 255, 0, 0.8)", // Efek glowing hijau
                    }}
                ></div>
            </div>

            {/* Canvas and Captured Image (Hidden) */}
            <canvas ref={canvasRef} className="absolute z-[9] hidden"></canvas>
            <img ref={imgRef} className="absolute z-10 hidden" />

            {/* Controls Section */}
            <div
                className={`capture-form-container ${
                    isOpen ? "open" : "closed"
                }`}
            >
                <button
                    onClick={() => {
                        document.getElementById("my_modal_1").showModal();
                        clickPhoto();
                    }}
                    className="btn-submit"
                >
                    Ambil Gambar
                </button>

                {/* Modal */}
                <dialog
                    id="my_modal_1"
                    className="modal text-black shadow-lg transition transform z-0"
                >
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Hasil Potret</h3>
                        <p className="text-semibold mt-2 text-gray-600">
                            Cek Hasil Gambar
                        </p>
                        <img
                            ref={imgRef}
                            className="w-full rounded-lg shadow-md mt-4"
                            alt="Captured face"
                        />
                        <div className="modal-action flex justify-center mt-4 gap-4">
                            <form method="dialog" className="flex gap-4">
                                <button className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400">
                                    Cancel
                                </button>
                                <button
                                    disabled={isLoading}
                                    onClick={detectAndRegisterFace}
                                    className={`py-2 px-6 btn-submit ${
                                        isLoading ? "loading" : ""
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center items-center gap-2">
                                            <span>Loading...</span>
                                            <span className="loading loading-spinner text-black"></span>
                                        </div>
                                    ) : (
                                        "Proses"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
}
