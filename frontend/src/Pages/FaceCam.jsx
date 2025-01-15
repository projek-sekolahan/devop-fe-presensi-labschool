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
import { loadFaceModels, detectSingleFace } from "../utils/faceUtils";

export default function FaceCam() {

  const videoRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log("useEffect triggered");

    if (!localStorage.getItem("token")) {
      console.error("Token not found, redirecting to login...");
      alertMessage(
        "Login Please",
        "Token not found, redirecting to login...",
        "error",
        () => {window.location.replace("/login")}
      );
      return;
    }

    const initialize = async () => {
      try {
        console.log("Initializing FaceCam...");
        await loadFaceModels();
        console.log("Face models loaded successfully.");
        startVideo();
        console.log("Starting video...");
      } catch (error) {
        console.error("Initialization error:", error);
        alertMessage(
          "Initialization error",
          "Failed to initialize FaceCam",
          "error",
          () => {window.location.replace("/login")}
        );
      }
    };

    initialize();

    return () => {
      console.log("Cleaning up resources...");
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then((stream) => {
        console.log("Camera access granted.");
        Swal.close();
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("autoplay", "");
        videoRef.current.setAttribute("muted", "");
        videoRef.current.setAttribute("playsinline", "");
        console.log("Camera started successfully.");
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        handleCameraError(err);
      });
  };

  const handleCameraError = (err) => {
    const messages = {
      NotAllowedError: "Izin akses kamera ditolak oleh pengguna",
      NotFoundError: "Tidak ada kamera yang tersedia pada perangkat",
    };
    alertMessage("Error", messages[err.name] || "Terjadi kesalahan pada kamera", "error",() => {window.location.replace("/home")});
  };

  const clickPhoto = () => {
    console.log("Capturing photo...");
    const context = canvasRef.current.getContext("2d");
    const video = videoRef.current;

    const canvasWidth = 400;
    const canvasHeight = 400;
    const cropX = video.videoWidth / 2 - canvasWidth / 2;
    const cropY = video.videoHeight / 2 - canvasHeight / 2;

    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    context.save();
    context.scale(-1, 1);
    context.translate(-canvasWidth, 0);
    context.drawImage(video, cropX, cropY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    context.restore();

    imgRef.current.src = canvasRef.current.toDataURL("image/jpeg");
    console.log("Photo captured successfully.", imgRef.current);
    console.log("Photo captured data.",imgRef.current.src);
  };

  const detectFace = async () => {
    console.log("Starting face detection...");
    setIsLoading(true);
    const modal = document.getElementById("my_modal_1");
    if (modal) modal.close();
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
        const descriptor = new Float32Array(userData.facecam_id.split(", ").map(Number));
        console.log("Parsed descriptor from token:", descriptor);

        // Deteksi wajah dari gambar
        const detectionResult = await detectSingleFace(imgRef.current);
        if (!detectionResult || !detectionResult.descriptor) {
          console.warn("No face detected or descriptor is undefined.");
          handleFaceDetection({ success: false });
          return;
        }
        console.log("Detection Descriptor result:", detectionResult.descriptor);

        // Validasi dengan data token
        const distanceWithToken = faceapi.euclideanDistance(descriptor, detectionResult.descriptor);
        const isMatchedToken = distanceWithToken <= 0.6;
        console.log("Token match distance:", distanceWithToken, "Matched:", isMatchedToken);

        // Evaluasi hasil
        if (isMatchedToken) {
          console.log("Face matched successfully.");
          handleFaceDetection({
            success: true,
            distance: distanceWithToken,
            descriptor: detectionResult.descriptor,
        });
        } else {
          console.warn("Face match failed.");
          handleFaceDetection({ success: false });
        }
      } catch (error) {
        console.error("Face detection error:", error);
        handleFaceDetection({ success: false });
      } finally {
        setIsLoading(false);
      }
  };
  
  const handleFaceDetection = (result) => {
    console.log("Handle face detection result:", result);
    const { success, distance, descriptor } = result;
  
    if (success && distance <= 0.6) {
      console.log("Face matched successfully.");
      submitPresence(descriptor);
    } else {
      console.warn("Face match failed. Distance too large or no match found.");
      alertMessage(
        "Pencocokan Gagal",
        "Wajah tidak terdaftar, harap ulangi proses",
        "error",
        () => {window.location.replace("/home")}
      );
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
    console.log("Combined keys initialized:", combinedKeys);

    let values = [];
    if (localStorage.getItem("group_id") === "4") {
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

    values.push(
      faceDescriptor.join(", "),
      `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
      localStorage.getItem("devop-sso"),
      Cookies.get("csrf")
    );

    console.log("Values initialized:", values);
    console.log("Submitting presence data...");
    apiXML
      .presensiPost("process", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
      .then((res) => {
        console.log("Presence data submitted successfully:", res);
        Swal.close();
        setIsLoading(false);
        const parsedToken = parseJwt(res.data.token);
        alertMessage(parsedToken.title, parsedToken.message, parsedToken.info, () => {
          window.location.replace("/home");
        });
      })
      .catch((err) => {
        console.error("Presence submission error:", err);
        setIsLoading(false);
        handleSessionError(err, "/facecam");
      });
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
                        Tekan Tombol{" "}
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
                <dialog id="my_modal_1" className="modal text-black shadow-lg transition transform z-0">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Hasil Potret</h3>
                        <p className="text-semibold mt-2 text-gray-600">Cek Hasil Gambar</p>
                        <img ref={imgRef} className="w-full rounded-lg shadow-md mt-4" />
                        <div className="modal-action flex justify-center mt-4 gap-4">
                            <form method="dialog" className="flex gap-4">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400">
                                    Cancel
                                </button>
                                <button
                                    className="py-2 px-6 btn-submit"
                                    onClick={detectFace}
                                    disabled={isLoading} // Nonaktifkan tombol jika sedang loading
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
                <small>Pastikan Cahaya Terang</small>
            </div>
        </div>
    );
}