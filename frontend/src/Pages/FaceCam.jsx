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
      setIsLoading(true);
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
          () => {window.location.replace("/home")}
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
    setIsLoading(false);
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
        const tokenDescriptor = new Float32Array(userData.facecam_id.split(", ").map(Number));
        console.log("Parsed descriptor from token:", tokenDescriptor);

        // Deteksi wajah dari gambar
        const detectionResult = await detectSingleFace(imgRef.current);
        if (!detectionResult || !detectionResult.descriptor) {
          console.warn("No face detected or descriptor is undefined.");
          alertMessage("Pencocokan Gagal", "Harap Ulangi Proses.", "error", () => {window.location.replace("/home")});
          return;
        }
        console.log("Detection Descriptor result:", detectionResult.descriptor);

        // Validasi dengan data token
        const isFaceMatched = validateFaceDetection(detectionResult, tokenDescriptor);
        if (isFaceMatched) {
          console.log("Face match successful.");
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
			<header>
				<Link to="/home">
					<ArrowLeftIcon className="w-6 h-6 text-white" />
				</Link>
				<h1 className="presensi-section-container">Presensi</h1>
			</header>
			<main>
				<div className="custom-card">
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
        </div>
      </main>
		</div>
    );
}