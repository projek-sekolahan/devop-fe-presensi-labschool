import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    getFormData,
    loading,
    alertMessage,
    handleSessionError,
    addDefaultKeys,
    parseJwt,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { videoRef, canvasRef, startVideo, stopVideo, capturePhoto } from "../utils/useCamera";
import { loadFaceModels } from "../utils/faceUtils";
import { detectFace, compareFaces} from "../utils/useFaceRecognition";
import Layout from "../Components/Layout";
import DetailModal from "../Components/DetailModal";

export default function FaceCam() {
    const imgRef = useRef();
    const [imgSrc, setImgSrc] = useState(null);
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
                        window.location.replace("/home");
                    }
                );
            }
        };

        initialize();
        return () => {
            stopVideo();
        };
    }, []);

    const detectFace = async () => {
        setIsLoading(true);
        setShowModal(false);
        loading("Loading", "Detecting face...");
        try {
            // Validasi elemen gambar
            if (!imgRef.current) {
                throw new Error("imgRef.current is not set or invalid.");
            }
            // Ambil descriptor dari token
            const userData = parseJwt(localStorage.getItem("token"));
            if (!userData || !userData.facecam_id) {
                throw new Error("Invalid or missing face descriptor in token.");
            }
            const tokenDescriptor = new Float32Array(
                userData.facecam_id.split(", ").map(Number)
            );
            // Deteksi wajah dari gambar
            const detectionResult = await detectFace(imgRef.current);
            if (!detectionResult) {
                throw new Error("No face detected or descriptor is undefined.");
            }
            // Validasi dengan data token
            const isFaceMatched = await compareFaces(detectionResult,tokenDescriptor);
            if (isFaceMatched) {
                submitPresence(detectionResult.descriptor);
            } else {
                throw new Error("No face matched or descriptor is undefined.");
            }
        } catch (error) {
            console.error("Face detection error:", error);
            alertMessage(
                "Pencocokan Gagal",
                "Harap Ulangi Proses.",
                "error",
                () => {
                    window.location.replace("/home");
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const submitPresence = (faceDescriptor) => {
        const keys = [
            "AUTH_KEY",
            "token",
            "status_dinas",
            "status_kehadiran",
            "geolocation",
            "facecam_id",
            "foto_presensi",
        ];
        const combinedKeys = addDefaultKeys(keys);
        let values = [];
        if (localStorage.getItem("group_id") === "4") {
            values = [
                localStorage.getItem("AUTH_KEY"),
                localStorage.getItem("login_token"),
                "non-dinas",
                ...state,
            ];
        } else {
            values = [
                localStorage.getItem("AUTH_KEY"),
                localStorage.getItem("login_token"),
                ...state,
            ];
        }
        values.push(
            faceDescriptor.join(", "),
            `["${imageData}"]`,
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf")
        );
        apiXML
            .presensiPost(
                "process",
                localStorage.getItem("AUTH_KEY"),
                getFormData(combinedKeys, values)
            )
            .then((res) => {
                Swal.close();
                setIsLoading(false);
                Cookies.set("csrf", JSON.parse(res).csrfHash);
                const parsedToken = parseJwt(JSON.parse(res).data.token);
                alertMessage(
                    parsedToken.title,
                    parsedToken.message,
                    parsedToken.info,
                    () => {
                        window.location.replace("/home");
                    }
                );
            })
            .catch((err) => {
                console.error("Presence submission error:", err);
                setIsLoading(false);
                handleSessionError(err, "/facecam");
            });
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
                        <button className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button
                            className={`py-2 px-6 btn-submit ${
                                isLoading ? "loading" : ""
                            }`}
                            onClick={detectFace}
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
    );
}