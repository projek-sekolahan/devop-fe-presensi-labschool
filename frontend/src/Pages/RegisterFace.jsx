import { useRef, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import * as faceapi from "face-api.js";
import { loadFaceModels, detectSingleFace } from "../utils/faceUtils";
import apiXML from "../utils/apiXML";
import {
    alertMessage,
    loading,
    handleSessionError,
    getFormData,
} from "../utils/utils";
import ToggleButton from "../Components/ToggleButton";

export default function RegisterFace({ isOpen, onToggle }) {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [facecamCache, setFacecamCache] = useState(new Map());
    
    useEffect(() => {
        const init = async () => {
            console.log("Initializing...");
            loading("Loading", "Getting camera access...");
            await loadFaceModels(); // Preload Face API models
            console.log("Face models loaded.");
            await preloadFacecamData(); // Preload and cache facecam data
            startVideo();
        };
        init();
    }, []);
    
    // Fungsi untuk preload data facecam dan caching
    const preloadFacecamData = async () => {
        try {
            console.log("Preloading facecam data...");
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
    
            if (res.status && Array.isArray(res.data.data)) {
                const cache = new Map();
                res.data.data.forEach((facecam) => {
                    const descriptor = new Float32Array(
                        facecam.facecam_id.split(", ").map(Number)
                    );
                    cache.set(facecam.id, descriptor);
                });
                setFacecamCache(cache);
                console.log("Facecam data cached successfully.", cache);
            } else {
                console.error("Failed to preload facecam data.");
            }
        } catch (err) {
            console.error("Error preloading facecam data:", err);
            handleSessionError(err, "/login");
        }
    };
    
    // Fungsi untuk memulai kamera
    const startVideo = () => {
        console.log("Starting video...");
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                console.log("Camera access granted.");
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
                alertMessage("Error", errorMessage, "error");
            });
    };
    
    // Fungsi untuk mendeteksi wajah dan mencocokkan data
    const detectAndRegisterFace = async () => {
        const modal = document.getElementById("my_modal_1");
        if (modal) modal.close();
        loading("Loading", "Starting face detection and registration...");
        console.log("Starting face detection and registration...");
    
        const maxAttempts = 10;
        let attempts = 0;
        setIsLoading(true);
    
        try {
            const attemptMatch = async () => {
                console.log(`Attempt ${attempts + 1} to detect face...`);
    
                if (attempts >= maxAttempts) {
                    setIsLoading(false);
                    console.error("Max attempts reached. Face detection failed.");
                    alertMessage(
                        "Deteksi Gagal",
                        "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                        "error",
                    );
                    return;
                }
    
                attempts++;
                const faceData = await detectSingleFace(imgRef.current);
                if (!faceData) {
                    console.log("Face tidak terdeteksi");
                    alertMessage(
                        "Deteksi Gagal",
                        "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                        "error",
                    );
                    return;
                }
    
                const isMatched = Array.from(facecamCache.values()).some(
                    (descriptor) => {
                        const distance = faceapi.euclideanDistance(
                            descriptor,
                            faceData.descriptor
                        );
                        return distance <= 0.6;
                    }
                );
    
                if (isMatched) {
                    setIsLoading(false);
                    console.warn("Face already registered.");
                    alertMessage(
                        "Error",
                        "Wajah sudah terdaftar, gunakan wajah lain",
                        "error",
                    );
                    return;
                }
    
                console.log("Registering new face...");
                registerNewFace(faceData);
            };
    
            await Promise.all([attemptMatch()]);
        } catch (err) {
            console.error("Error during face detection/registration:", err);
            handleSessionError(err, "/login");
        }
    };
    
    // Fungsi untuk mendaftarkan wajah baru
    const registerNewFace = async (faceData) => {
        console.log("Preparing data for new face registration...");
        try {
            let keys = ["param", "img", "devop-sso", "csrf_token"];
            let values = [
                Array.from(faceData.descriptor).join(", "),
                `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
                localStorage.getItem("regist_token"),
                Cookies.get("csrf"),
            ];
            console.log("Sending registration data to server...");
            const response = await apiXML.postInput(
                "facecam",
                getFormData(keys, values)
            );
            const res = JSON.parse(response);
            Cookies.set("csrf", res.csrfHash);
    
            if (res.status) {
                setIsLoading(false);
                console.log("Face registration successful.");
                alertMessage(
                    res.data.title,
                    res.data.message,
                    res.data.info,
                    () => onToggle("/setpassword")
                );
            } else {
                setIsLoading(false);
                console.error("Failed to register face.");
                alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                    onToggle("/facereg")
                );
            }
        } catch (err) {
            setIsLoading(false);
            console.error("Error during face registration:", err);
            handleSessionError(err, "/facereg");
        }
    };

    return (
<div className="capture-container">
    {/* Title and Subtitle */}
    <div className="text-center mt-6 mb-6">
        <h1 className="text-2xl font-bold">Pendaftaran Wajah</h1>
        <p className="text-sm mt-2">Ambil Gambar Wajah Untuk Verifikasi</p>
    </div>

    {/* Video Feed with Frame Overlay */}
    <div className="relative">
        <video
            ref={videoRef}
            className="h-2/3 w-full object-cover mt-4"
            autoPlay
            playsInline
        />
        {/* Frame Overlay */}
        <div
            className="absolute inset-0 flex justify-center items-center pointer-events-none"
        >
            <div
                className="border-4 border-green-500 rounded-lg w-2/3 h-2/3"
                style={{
                    boxShadow: "0 0 10px 2px rgba(0, 255, 0, 0.6)",
                }}
            ></div>
        </div>
    </div>

    {/* Canvas and Captured Image (Hidden) */}
    <canvas ref={canvasRef} className="absolute z-[9] hidden"></canvas>
    <img ref={imgRef} className="absolute z-10 hidden" />

    {/* Controls Section */}
    <div className={`capture-form-container ${isOpen ? "open" : "closed"}`}>
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
                <p className="text-semibold mt-2 text-gray-600">Cek Hasil Gambar</p>
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