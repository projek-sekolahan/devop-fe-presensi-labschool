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

export default function RegisterFace() {
const videoRef = useRef(null);
const canvasRef = useRef(null);
const imgRef = useRef(null);
const [isLoading, setIsLoading] = useState(false);
const [isOpen, setIsOpen] = useState(false);

const toggleForm = () => {
    setIsOpen(!isOpen);
};

// Inisialisasi komponen
useEffect(() => {
    const init = async () => {
        console.log("Initializing...");
        loading("Loading", "Getting camera access...");
        await loadFaceModels(); // Load model Face API
        console.log("Face models loaded.");
        startVideo();
    };
    init();
}, []);

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

// Fungsi untuk mengambil gambar dari video
function clickPhoto() {
    console.log("Capturing photo...");
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

    console.log("Photo captured successfully.");
}

// Fungsi utama untuk mendeteksi wajah dan mendaftarkan
const detectAndRegisterFace = async () => {
    console.log("Starting face detection and registration...");
    const maxAttempts = 10;
    let attempts = 0;
    setIsLoading(true);
    try {
        console.log("Fetching facecam data...");
        const keys = ["devop-sso", "csrf_token"];
        const values = [
            localStorage.getItem("regist_token"),
            Cookies.get("csrf"),
        ];

        const response = await apiXML.postInput(
            "loadFace",
            getFormData(keys, values)
        );
        console.log("Full API response:", response);
        if (!response?.status) throw new Error("Failed to load face data.");
        console.log("Facecam data fetched successfully.");

const facecamData = response.data.data || []; // Mengakses data wajah dari response.data.data

const attemptMatch = async () => {
    console.log(`Attempt ${attempts + 1} to detect face...`);

    if (attempts >= maxAttempts) {
        setIsLoading(false);
        console.error("Max attempts reached. Face detection failed.");
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
        console.log("Face not detected. Retrying...");
        setTimeout(attemptMatch, 1000);
        return;
    }

    console.log("Face detected. Checking match...");

    if (facecamData.length === 0) {
        console.warn("No existing face data found. Proceeding to register new face.");
        registerNewFace(faceData);
        return;
    }

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
        console.warn("Face already registered.");
        alertMessage(
            "Error",
            "Wajah sudah terdaftar, gunakan wajah lain",
            "error",
            () => window.location.replace("/facereg")
        );
        return;
    }

    console.log("Registering new face...");
    registerNewFace(faceData);
};

        attemptMatch();
    } catch (err) {
        console.error("Error during face detection/registration:", err);
        handleSessionError(err, "/login");
    }
};

// Fungsi untuk mendaftarkan wajah baru
const registerNewFace = async (faceData) => {
    console.log("Preparing data for new face registration...");
    const formData = {
        param: Array.from(faceData.descriptor).join(", "),
        img: canvasRef.current.toDataURL("image/jpeg"),
        "devop-sso": localStorage.getItem("regist_token"),
        csrf_token: Cookies.get("csrf"),
    };

    try {
        console.log("Sending registration data to server...");
        const response = await apiXML.postInput("facecam", formData);
        const res = JSON.parse(response);
        Cookies.set("csrf", res.csrfHash);
        if (response.status) {
            setIsLoading(false);
            console.log("Face registration successful.");
            alertMessage(
                response.data.title,
                response.data.message,
                response.data.info,
                () => window.location.replace("/setpassword")
            );
        } else {
            setIsLoading(false);
            console.error("Failed to register face.");
            alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                window.location.replace("/facereg")
            );
        }
    } catch (err) {
        setIsLoading(false);
        console.error("Error during face registration:", err);
        handleSessionError(err, "/facereg");
    }
};


    return (
        <div className="capture-container ">
            {/* Title and Subtitle */}
            <div className="text-center mt-6 mb-6">
                <h1 className="text-2xl font-bold">Pendaftaran Wajah</h1>
                <p className="text-sm mt-2">
                    Ambil Gambar Wajah Untuk Verifikasi
                </p>
            </div>

            {/* Video Feed */}
            <video
                ref={videoRef}
                className="h-2/3 w-full object-cover mt-4"
                autoPlay
                playsInline
            />

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
            {/* Toggle Button */}
            <ToggleButton isOpen={isOpen} onToggle={toggleForm} />
        </div>
    );
}
