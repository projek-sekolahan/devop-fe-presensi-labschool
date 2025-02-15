import { useRef, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import useCamera from "../utils/useCamera";
import { loadFaceModels } from "../utils/faceUtils";
import { detectFace } from "../utils/useFaceRecognition";
import apiXML from "../utils/apiXML";
import { alertMessage, loading, getFormData } from "../utils/utils";
import DetailModal from "../Components/DetailModal";

export default function RegisterFace({ isOpen, onToggle }) {
    const imgRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { videoRef, canvasRef, startVideo, stopVideo, capturePhoto } = useCamera();

    useEffect(() => {
        const init = async () => {
            loading("Loading", "Getting camera access...");
            await loadFaceModels(); // Preload Face API models
            setIsLoading(false);
            Swal.close();
            await startVideo();
        };
        init();
        return () => {
            stopVideo();
        };
    }, []);

    // Fungsi untuk mendeteksi wajah dan mencocokkan data
    const detectAndRegisterFace = async () => {
        setIsLoading(true);
        setShowModal(false);
        loading("Loading", "Starting face registration...");
        try {
            const faceData = await detectFace(imgRef.current);
            if (!faceData) {
                throw new Error("No face detected or descriptor is undefined.");
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
                `["${imageResult}"]`,
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

    const clickHandler = async () => {
        setShowModal(true);
        const imageResult = await capturePhoto();
        if (!imageResult) {
            throw new Error("No image created.");
        } else {
            setImgSrc(imageResult);
            imgRef.current.src = imageResult;
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
                <div className="relative z-10 face-detector"></div>
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
                    onClick={clickHandler}
                    className="btn-submit"
                >
                    Ambil Gambar
                </button>
                {/* Modal */}
                <DetailModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    headerTitle="Hasil Potret"
                    loading={isLoading}
                    footerButtons={
                        <div className="flex gap-4">
                            <button className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={`py-2 px-6 btn-submit ${
                                    isLoading ? "loading" : ""
                                }`}
                                onClick={detectAndRegisterFace}
                                disabled={isLoading}
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
                        </div>
                    }
                >
                    <p className="text-semibold mt-2 text-gray-600">Cek Hasil Gambar</p>
                    {imgSrc && <img src={imgSrc} alt="Captured" className="w-full rounded-lg shadow-md mt-4"/>}
                </DetailModal>
            </div>
        </div>
    );
}