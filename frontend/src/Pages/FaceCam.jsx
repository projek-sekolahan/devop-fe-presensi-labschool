import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getFormData, loading, alertMessage, addDefaultKeys, parseJwt, getCombinedValues } from "../utils/utils";
import ApiService from "../utils/ApiService";
import Swal from "sweetalert2";
import useCamera from "../utils/useCamera";
import { loadFaceModels } from "../utils/faceUtils";
import { detectFace, compareFaces } from "../utils/useFaceRecognition";
import Layout from "../Components/Layout";
import DetailModal from "../Components/DetailModal";

export default function FaceCam() {
    const imgRef = useRef();
    const [imgSrc, setImgSrc] = useState(null);
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { videoRef, canvasRef, startVideo, stopVideo, capturePhoto } =
        useCamera();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            console.error("Token not found, redirecting to login...");
            alertMessage(
                "Login Please",
                "Token not found, redirecting to login...",
                "error",
                () => {
                    window.location.replace("/login");
                }
            );
            return;
        }

        const initialize = async () => {
            setIsLoading(true);
            try {
                await loadFaceModels();
                setIsLoading(false);
                Swal.close();
                await startVideo();
            } catch (error) {
                console.error("Initialization error:", error);
                alertMessage(
                    "Initialization error",
                    "Failed to initialize FaceCam",
                    "error",
                    () => {
                        window.location.replace("/facecam");
                    }
                );
            }
        };
        initialize();
        return () => {
            stopVideo();
        };
    }, []);

    const detectFacecam = async () => {
        try {
            setIsLoading(true);
            setShowModal(false);
            loading("Loading", "Detecting face...");
            // Validasi elemen gambar
            if (!imgRef.current) {
                throw new Error("detectFacecam: imgRef.current is not set or invalid.");
            }
            // Ambil descriptor dari token
            const token = localStorage.getItem("token");
            const userData = token ? parseJwt(token) : null;
            const tokenDescriptor = userData?.facecam_id && typeof userData.facecam_id === "string"
            ? new Float32Array(userData.facecam_id.split(",").map(n => Number(n) || 0))
            : null;
            if (!tokenDescriptor) {
                throw new Error("detectFacecam: Invalid or missing face descriptor in token.");
            }
            // Deteksi wajah dari gambar
            const detectionResult = await detectFace(imgRef.current);
            if (!detectionResult?.descriptor) {
                throw new Error("detectFacecam: No face detected or descriptor is undefined.");
            }
            // Membandingkan wajah yang terdeteksi dengan token descriptor
            const isFaceMatched = await compareFaces(detectionResult.descriptor, tokenDescriptor);
            if (!isFaceMatched) {
                console.error("detectFacecam: No face matched or descriptor is undefined.");
                alertMessage(
                    "Pencocokan Gagal",
                    "Harap Ulangi Proses.",
                    "error",
                    () => window.location.replace("/facecam")
                );
                return;
            }
            // Jika wajah cocok, lanjutkan proses presensi
            setIsLoading(false);
            submitPresence(detectionResult.descriptor);
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
            alertMessage("Error", error.message, "error");
        }
    };

    const submitPresence = async (faceDescriptor) => {
        const keys = addDefaultKeys(["AUTH_KEY", "token"]);
		const formValues = [];
		const storedValues = getCombinedValues(keys.slice(0, 2));
		let updatedCombinedKeys = [...keys];
        updatedCombinedKeys.push("status_dinas", "status_kehadiran", "geolocation");
		if (localStorage.getItem("group_id") == "4") {
			formValues.push("non-dinas", ...state);
		} else {
			formValues.push(...state);
		}
        updatedCombinedKeys.push("facecam_id", "foto_presensi");
		formValues.push(faceDescriptor.join(", "),`["${imgSrc}"]`);
		const values = [...storedValues, ...formValues];
		const formData = getFormData(updatedCombinedKeys, values);
		const response = await ApiService.processApiRequest("presensi/process", formData, localStorage.getItem("AUTH_KEY"), true);
        if (response?.data) {
            Swal.close();
            setIsLoading(false);
            const hasil = parseJwt(response.data.token);
				alertMessage(hasil.title, hasil.message, hasil.info, () =>
					window.location.replace("/home"),
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
        <div className="presensi-container">
            <Layout
                link={
                    localStorage.getItem("group_id") == "4"
                        ? "/presensi"
                        : "/presensi/staff"
                }
                label="Presensi"
            >
                <div className="facecam-container mt-4 p-2">
                    {/* Video Stream */}
                    <div className="flex flex-col">
                        <video
                            ref={videoRef}
                            className="canvas-camera -scale-x-100"
                            autoPlay
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute z-[9] hidden"
                        ></canvas>
                        <img ref={imgRef} className="absolute z-10 hidden" />
                    </div>
                    {/* Tombol Konfirmasi */}
                    <div className="btn-facecam">
                        <button
                            className="btn-submit"
                            disabled={isLoading}
                            onClick={clickHandler}
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center gap-2">
                                    <span>Loading...</span>
                                    <span className="loading loading-spinner"></span>
                                </div>
                            ) : (
                                "Konfirmasi"
                            )}
                        </button>
                    </div>
                </div>
            </Layout>
            <DetailModal
                showModal={showModal}
                setShowModal={setShowModal}
                headerTitle="Hasil Potret"
                loading={isLoading}
                footerButtons={
                    <div className="flex gap-4">
                        <button
                            className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className={`py-2 px-6 btn-submit ${
                                isLoading ? "loading" : ""
                            }`}
                            onClick={detectFacecam}
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
                <p className="text-semibold mt-2 text-gray-600">
                    Cek Hasil Gambar
                </p>
                {imgSrc && (
                    <img
                        src={imgSrc}
                        alt="Captured"
                        className="w-full rounded-lg shadow-md mt-4"
                    />
                )}
            </DetailModal>
        </div>
    );
}