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

export default function FaceCam() {
    
    const videoRef = useRef();
    const canvasRef = useRef();
    const imgRef = useRef();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const workerRef = useRef(null); // Ref for Web Worker
  
    useEffect(() => {
      console.log("useEffect triggered"); // Log awal saat useEffect dipanggil
    
      if (!localStorage.getItem("token")) {
        console.error("Token not found, redirecting to login...");
        window.location.replace("/login");
        return;
      }
    
      const initialize = async () => {
        try {
          console.log("Starting video...");
          startVideo(); // Tambahkan log di dalam fungsi startVideo jika diperlukan
        } catch (error) {
          console.error("Initialization error:", error);
        }
      };
    
      initialize();
    
// Initialize Web Worker
console.log("Checking environment...");

// Pengecekan apakah di dalam Browser atau Node.js
const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";
const isNode =
  typeof global !== "undefined" && typeof global.process !== "undefined";

console.log("isBrowser:", isBrowser);
console.log("isNode:", isNode);

// Fungsi untuk memeriksa keberadaan file
const checkPath = async (url) => {
  console.log(`Checking file path: ${url}`);
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      throw new Error(`File not found at ${url} (Status: ${response.status})`);
    }
    console.log(`File path verified: ${url}`);
  } catch (error) {
    console.error(`Error verifying file path: ${url}`, error);
  }
};

// Jika di dalam Browser
if (isBrowser) {
  console.log("Environment detected: Browser");
  try {
    if (typeof Worker !== "undefined") {
      console.log("Web Worker supported in this browser.");

      // Verifikasi file worker.js
      const workerPath = new URL("/faceWorker.js", import.meta.url).href;
      checkPath(workerPath).then(() => {
        workerRef.current = new Worker(workerPath, { type: "module" });
        console.log("Web Worker initialized.");

        workerRef.current.onmessage = (event) => {
          console.log("Message received from Web Worker:", event.data);

          // Validasi data yang diterima
          if (!event.data || typeof event.data !== "object") {
            console.error("Invalid message format received from Web Worker:", event.data);
            return;
          }

          const { type, payload } = event.data;
          if (!type || !payload) {
            console.error("Missing 'type' or 'payload' in message:", event.data);
            return;
          }

          if (type === "FACE_DETECTED") {
            console.log("Face detected with payload:", payload);
            handleFaceDetection(payload);
          } else if (type === "ERROR") {
            console.error("Worker error:", payload);
          } else {
            console.warn("Unknown message type received:", type);
          }
        };
        workerRef.current.onerror = (error) => {
          console.error("Worker error (caught in main thread):", error.message || "Unknown error");
        };
      }).catch((error) => {
        console.error("Failed to verify Web Worker path:", error);
      });
    } else {
      console.error("Web Worker is not supported in this browser.");
    }
  } catch (error) {
    console.error("Error initializing Web Worker:", error);
  }
}
// Jika di dalam Node.js
else if (isNode) {
  console.log("Environment detected: Node.js");
  const { Worker } = require("worker_threads");

  try {
    const workerPath = "/faceWorker.js";
    checkPath(workerPath).then(() => {
      const worker = new Worker(workerPath);
      console.log("Node.js Worker initialized.");

      worker.on("message", (message) => {
        console.log("Message received from Node.js Worker:", message);
        const { type, payload } = message;
        if (type === "FACE_DETECTED") {
          console.log("Face detected with payload:", payload);
          handleFaceDetection(payload);
        } else if (type === "ERROR") {
          console.error("Worker error:", payload);
        }
      });
    }).catch((error) => {
      console.error("Failed to verify Web Worker path in Node.js:", error);
    });
  } catch (error) {
    console.error("Error initializing Worker in Node.js:", error);
  }
} else {
  console.error("Unknown environment. Unable to initialize Web Worker.");
}
    
      return () => {
        console.log("Cleaning up Web Worker...");
        if (workerRef.current) {
          workerRef.current.terminate();
          console.log("Web Worker terminated.");
        }
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
      alertMessage("Error", messages[err.name] || "Terjadi kesalahan pada kamera", "error");
    };
  
    const clickPhoto = () => {
      console.log("Capturing photo...");
    //   loading("Loading", "Mendapatkan data wajah...");
      const context = canvasRef.current.getContext("2d");
      const video = videoRef.current;
  
      const canvasWidth = 400;
      const canvasHeight = 400;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const cropX = videoWidth / 2 - canvasWidth / 2;
      const cropY = videoHeight / 2 - canvasHeight / 2;
  
      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
  
      context.save();
      context.scale(-1, 1);
      context.translate(-canvasWidth, 0);
      context.drawImage(video, cropX, cropY, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
      context.restore();
  
      imgRef.current.src = canvasRef.current.toDataURL("image/jpeg");
      console.log("Photo captured successfully.", imgRef.current);
    };
  
    const detectFace = () => {
      console.log("Starting face detection...");
      const modal = document.getElementById("my_modal_1");
      if (modal) modal.close();
      setIsLoading(true);
      loading("Loading", "Starting face detection and registration...");
      
      const userData = parseJwt(localStorage.getItem("token"));
      const descriptor = new Float32Array(userData.facecam_id.split(", "));
      console.log("Data Found.", descriptor);  
      if (workerRef.current) {
        console.log("Web Worker initialized, sending face detection request...");
        console.log("Image data URL:", imgRef.current.src);
        console.log("Image data URL length:", imgRef.current.src.length);
        console.log("Image data URL type:", typeof imgRef.current.src);
        console.log("Sending message with image:", imgRef.current.src);
        console.log("Sending message with descriptor:", Array.from(descriptor));
        if (imgRef.current.src.length < 1000) {
          console.error("Invalid image data URL");
        }
        workerRef.current.postMessage({
          type: "DETECT_FACE",
          payload: {
            image: imgRef.current.src,
            descriptor: Array.from(descriptor),
          },
        });
      } else {
        console.error("Web Worker not initialized");
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
          "error"
        );
      }
      setIsLoading(false);
    };
  
    const submitPresence = async (faceDescriptor, canvasRef, state) => {

      if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
        console.error("Invalid face descriptor provided.");
        return;
      }
    
      if (!canvasRef.current) {
        console.error("Canvas reference is null.");
        return;
      }
    
      const compressImage = (dataURL, quality = 0.8) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = dataURL;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", quality));
          };
        });
      };

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

        try {
          const compressedImage = await compressImage(canvasRef.current.toDataURL());
          values.push(
            faceDescriptor.join(", "),
            compressedImage,
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf")
          );
      
          console.log("Values initialized:", values);
          console.log("Submitting presence data...");
      
          const response = await apiXML.presensiPost(
            "process",
            localStorage.getItem("AUTH_KEY"),
            getFormData(combinedKeys, values)
          );
      
          console.log("Presence data submitted successfully:", response);
          Swal.close();
          setIsLoading(false);
          const parsedToken = parseJwt(res.data.token);
          alertMessage(parsedToken.title, parsedToken.message, parsedToken.info, () => {
            window.location.replace("/home");
          });
        } catch (err) {
          console.error("Failed to submit presence data:", err);
          saveOffline(values);
          setIsLoading(false);
          handleSessionError(err, "/facecam");
        }
      
        const saveOffline = (data) => {
          const offlineData = JSON.parse(localStorage.getItem("offlinePresence") || "[]");
          offlineData.push(data);
          localStorage.setItem("offlinePresence", JSON.stringify(offlineData));
          console.log("Presence data saved offline:", data);
        };

        /* values.push(
            faceDescriptor.join(", "),
            `["${canvasRef.current.toDataURL("image/jpeg")}"]`,
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf")
        ); */

      /* console.log("Values initialized:", values);
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
        }); */
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
                <small>Pastikan pencahayaan memadai agar proses dapat berjalan lancar</small>
            </div>
        </div>
    );
}