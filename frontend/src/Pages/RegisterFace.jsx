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
                alertMessage("Error", errorMessage, "error");
            });
    };

    // Fungsi untuk mengambil gambar dari video
    function clickPhoto() {
        // loading("Loading", "Mendapatkan data wajah...");
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
            cropY,
            canvasWidth,
            canvasHeight,
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        context.restore(); // Mengembalikan state konteks canvas ke semula

        let image_data_url = canvasRef.current.toDataURL("image/jpeg");

        // Mengatur gambar hasil di img element
        imgRef.current.src = image_data_url;
    }

    // Fungsi utama untuk mendeteksi wajah dan mendaftarkan
    const detectAndRegisterFace = async () => {
        loading("Loading", "Sedang melakukan deteksi wajah...");
        const maxAttempts = 10;
        let attempts = 0;
        setIsLoading(true);
        try {
            const keys = ["devop-sso", "csrf_token"];
            const values = [
                localStorage.getItem("regist_token"),
                Cookies.get("csrf"),
            ];

            const response = await apiXML.postInput(
                "loadFace",
                getFormData(keys, values)
            );
            if (!response.status) throw new Error("Gagal memuat data wajah.");

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
                alertMessage("Error", "Gagal mendaftarkan wajah", "error", () =>
                    window.location.replace("/facereg")
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
            <div className="capture-form-container flex flex-col items-center justify-center gap-4 mt-auto p-6">
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
                                            <span className="loading loading-spinner text-white size-7"></span>
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
