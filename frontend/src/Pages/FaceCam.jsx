/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
import * as faceapi from "face-api.js";
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
import { loadFaceModels } from "../utils/loadModels";

export default function FaceCam() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const imgRef = useRef();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    console.log("Initializing FaceCam component...");

    let userData = {};
    if (localStorage.getItem("token")) {
        console.log("Token found in localStorage, parsing...");
        userData = parseJwt(localStorage.getItem("token"));
        console.log("User data parsed:", userData);
    } else {
        console.error("Token not found, redirecting to login...");
        window.location.replace("/login");
    }

    const descriptor = new Float32Array(userData.facecam_id.split(", "));
    console.log("Face descriptor initialized:", descriptor);

    useEffect(() => {
        const init = async () => {
            console.log("Loading face models...");
            loading("Loading", "Getting camera access...");
            await loadFaceModels();
            console.log("Face models loaded, starting video...");
            startVideo();
        };

        init();
    }, []);

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
    console.log("Combined keys initialized:", combinedKeys);

    let values = [];
    if (localStorage.getItem("group_id") == "4") {
        console.log("User is in group 4, adding non-dinas status...");
        values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            "non-dinas",
            ...state,
        ];
    } else {
        console.log("User is not in group 4, skipping non-dinas status...");
        values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            ...state,
        ];
    }

    console.log("Values initialized:", values);

    const startVideo = () => {
        console.log("Attempting to access user camera...");
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
                if (err.name === "NotAllowedError") {
                    alertMessage(
                        "Error",
                        "Izin akses kamera ditolak oleh pengguna",
                        "error"
                    );
                } else if (err.name === "NotFoundError") {
                    alertMessage(
                        "Error",
                        "Tidak ada kamera yang tersedia pada perangkat",
                        "error"
                    );
                }
            });
    };

    function clickPhoto() {
        console.log("Capturing photo...");
        loading("Loading", "Mendapatkan data wajah...");
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
        console.log("Photo captured successfully.",imgRef.current);
    }

    const detectFace = () => {
        // Menutup modal sebelum memulai proses
        const modal = document.getElementById("my_modal_1");
        if (modal) {
            modal.close();
        }
        console.log("Starting face detection...");
        loading("Loading", "Starting face detection and registration...");
        let attempts = 0;
        const maxAttempts = 20;
        setIsLoading(true);

        async function attemptMatch() {
            if (attempts >= maxAttempts) {
                console.warn("Maximum face detection attempts reached.");
                setIsLoading(false);
                alertMessage(
                    "Deteksi Gagal",
                    "Wajah tidak terdeteksi, pastikan pencahayaan memadai",
                    "error"
                );
                return;
            }
            attempts++;
            console.log(`Face detection attempt #${attempts}...`);

            try {
                const faceData = await faceapi
                    .detectSingleFace(
                        imgRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (faceData) {
                    console.log("Face detected:", faceData);
                    const distance = faceapi.euclideanDistance(
                        descriptor,
                        faceData.descriptor
                    );
                    console.log("Face distance calculated:", distance);

                    if (distance <= 0.6) {
                        console.log("Face matched successfully.");
                        const stringDescriptor = Array.from(faceData.descriptor).join(", ");
                        values.push(
                            stringDescriptor,
                            `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
                            localStorage.getItem("devop-sso"),
                            Cookies.get("csrf")
                        );
                        Swal.close();
                        loading("Loading", "Mengirim data presensi...");
                        console.log("Loading Mengirim data presensi...", values);
                        apiXML
                            .presensiPost(
                                "process",
                                localStorage.getItem("AUTH_KEY"),
                                getFormData(combinedKeys, values)
                            )
                            .then((res) => {
                                console.log("Presence data submitted successfully:", res);
                                Swal.close();
                                res = JSON.parse(res);
                                Cookies.set("csrf", res.csrfHash);
                                const parsedToken = parseJwt(res.data.token);
                                alertMessage(
                                    parsedToken.title,
                                    parsedToken.message,
                                    parsedToken.info,
                                    () => {
                                        setIsLoading(false);
                                        window.location.replace("/home");
                                    }
                                );
                            })
                            .catch((err) => {
                                console.error("Presence submission error:", err);
                                setIsLoading(false);
                                handleSessionError(err, "/facecam");
                            });
                    } else {
                        console.warn("Face match failed. Distance too large.");
                        setIsLoading(false);
                        alertMessage(
                            "Pencocokan Gagal",
                            "Wajah tidak terdaftar, harap ulangi proses",
                            "error"
                        );
                    }
                } else {
                    console.log("No face detected, retrying...");
                    setTimeout(attemptMatch, 100);
                }
            } catch (err) {
                console.error("Error during face detection:", err);
                setIsLoading(false);
                handleSessionError(err, "/login");
            }
        }

        attemptMatch();
    };

    return (
        <div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] items-center overflow-hidden">
            <video
                ref={videoRef}
                crossOrigin="anonymous"
                className={`-scale-x-100 translate-500 fixed w-auto max-w-screen-2xl h-[75vh]`}
            />
            <canvas ref={canvasRef} className="absolute z-[9] hidden"></canvas>
            <img ref={imgRef} className="absolute z-10 hidden" />

            <div
                className={`relative top-[15vh] left-[calc(50vw/2 - 125)] size-[250px] z-50`}
            >
                <span className="border-white border-t-2 border-l-2 rounded-tl-xl size-14 absolute top-0 left-0"></span>
                <span className="border-white border-t-2 border-r-2 rounded-tr-xl size-14 absolute top-0 right-0"></span>
                <span className="border-white border-b-2 border-l-2 rounded-bl-xl size-14 absolute bottom-0 left-0"></span>
                <span className="border-white border-b-2 border-r-2 rounded-br-xl size-14 absolute bottom-0 right-0"></span>
            </div>
            <div className="fixed bottom-0 -left-[calc(300px-50vw)] w-[600px] h-[300px] bg-white rounded-t-[65%] z-[6]"></div>
            <div className="fixed bottom-24 left-0 w-screen h-fit flex flex-col g-white text-center text-primary-md px-10 items-center gap-3 z-[7]">
                <div>
                    <p className="font-medium text-base">
                        {" "}
                        Tekan tombol untuk melakukan presensi{" "}
                    </p>
                </div>
                <button
                    className="btn"
                    onClick={() => {
                        document.getElementById("my_modal_1").showModal();
                        clickPhoto();
                    }}
                >
                    Presensi
                </button>
                <dialog id="my_modal_1" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Hasil Potret</h3>
                        <img ref={imgRef} className="w-full" />
                        <div className="modal-action flex justify-center">
                            <form method="dialog" className="flex gap-2">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn">Cancel</button>
                                <button
                                    className="btn bg-secondary-green"
                                    onClick={detectFace}
                                    disabled={isLoading} // Nonaktifkan tombol jika sedang loading
                                >
                                    {isLoading ? "Loading..." : "Proses"}
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
                <small>
                    Pastikan pencahayaan memadai agar proses dapat berjalan
                    lancar
                </small>
            </div>
        </div>
    );
}
