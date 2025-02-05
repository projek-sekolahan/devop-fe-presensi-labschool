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
import { loadFaceModels, detectSingleFace, validateFaceDetection } from "../utils/faceUtils";
import Layout from "../Components/Layout";

export default function FaceCam() {

  const videoRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
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
      setIsLoading(true);
      try {
        await loadFaceModels();
        startVideo();
      } catch (error) {
        console.error("Initialization error:", error);
        alertMessage(
          "Initialization error",
          "Failed to initialize FaceCam",
          "error",
          () => {window.location.replace("/home")}
        );
      }
    };
    initialize();
    return () => {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startVideo = () => {
    setIsLoading(false);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then((stream) => {
        Swal.close();
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("autoplay", "");
        videoRef.current.setAttribute("muted", "");
        videoRef.current.setAttribute("playsinline", "");
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
  };

  const detectFace = async () => {
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
        const tokenDescriptor = new Float32Array(userData.facecam_id.split(", ").map(Number));
        // Deteksi wajah dari gambar
        const detectionResult = await detectSingleFace(imgRef.current);
        if (!detectionResult || !detectionResult.descriptor) {
          console.warn("No face detected or descriptor is undefined.");
          alertMessage("Pencocokan Gagal", "Harap Ulangi Proses.", "error", () => {window.location.replace("/home")});
          return;
        }
        // Validasi dengan data token
        const isFaceMatched = validateFaceDetection(detectionResult, tokenDescriptor);
        if (isFaceMatched) {
          submitPresence(detectionResult.descriptor);
        } else {
          console.warn("Face match failed.");
          alertMessage("Pencocokan Gagal", "Harap Ulangi Proses.", "error", () => {window.location.replace("/home")});
        }
      } catch (error) {
        console.error("Face detection error:", error);
        alertMessage("Pencocokan Gagal", "Harap Ulangi Proses.", "error", () => {window.location.replace("/home")});
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
      `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
      localStorage.getItem("devop-sso"),
      Cookies.get("csrf")
    );
    apiXML
      .presensiPost("process", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
      .then((res) => {
        Swal.close();
        setIsLoading(false);
        Cookies.set("csrf", JSON.parse(res).csrfHash);
        const parsedToken = parseJwt(JSON.parse(res).data.token);
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
    <div className="presensi-container">
      <Layout link={
						localStorage.getItem("group_id") == "4"
							? "/presensi"
							: "/presensi/staff"
					} label="Presensi">
        <div className="facecam-container mt-10">
          <video
              ref={videoRef}
              className="canvas-camera"
              autoPlay
              playsInline
          />
          <canvas ref={canvasRef} className="absolute z-[9] hidden"></canvas>
          <img ref={imgRef} className="absolute z-10 hidden" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full px-6 absolute bottom-10">
            <button
              className="btn-submit"
              disabled={isLoading}
              onClick={() => {
                document.getElementById("my_modal_1").showModal();
                clickPhoto();
              }}
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
		</div>
    );
}