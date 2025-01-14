import { env, nets, fetchImage } from "face-api.js";

let modelsLoaded = false;

// Override environment detection untuk mendukung Web Worker
env.setEnv({
  isBrowser: true, // Paksa mode browser
  isNodejs: false, // Nonaktifkan mode Node.js
  getEnv: () => "browser",
});

// Fungsi untuk memeriksa keberadaan file model
const checkModelPath = async (url) => {
  console.log(`Start checking model path: ${url}`); // Debugging log awal
  try {
    const response = await fetch(url, { method: "HEAD" }); // Cek keberadaan file tanpa mendownload
    if (!response.ok) {
      throw new Error(`Model not found at ${url} (Status: ${response.status})`);
    }
    console.log(`Model path verified: ${url}`); // Log berhasil
  } catch (error) {
    console.error(`Error verifying model path: ${url}`, error); // Log error
  }
  console.log(`Finished checking model path: ${url}`); // Debugging log akhir
};

// Fungsi untuk memuat model
const loadFaceModels = async () => {
  if (!modelsLoaded) {
    console.log("Loading models in Web Worker...");
    const MODEL_URL = "/frontend/models";

    try {
      // Verifikasi path model sebelum memuat
      await checkModelPath(`${MODEL_URL}/tiny_face_detector_model-weights_manifest.json`);
      await checkModelPath(`${MODEL_URL}/face_landmark_68_model-weights_manifest.json`);
      await checkModelPath(`${MODEL_URL}/face_recognition_model-weights_manifest.json`);

      // Muat model face-api.js
      await nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log("tinyFaceDetector loaded");

      await nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log("faceLandmark68Net loaded");

      await nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("faceRecognitionNet loaded");

      console.log("Models loaded successfully in Web Worker.");
      modelsLoaded = true;
    } catch (error) {
      console.error("Error loading models in Web Worker:", error);
      postMessage({ type: "ERROR", payload: `Model loading failed: ${error.message}` });
    }
  }
};

// Fungsi untuk mendeteksi wajah
const detectFace = async ({ image, descriptor }) => {
  try {
    console.log("Fetching image for face detection...");
    const img = await fetchImage(image);

    console.log("Running face detection...");
    const faceData = await nets.tinyFaceDetector
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceData) {
      console.log("Face detected, calculating distance...");
      const distance = nets.euclideanDistance(descriptor, faceData.descriptor);

      postMessage({
        type: "FACE_DETECTED",
        payload: { success: true, distance, descriptor: faceData.descriptor },
      });
    } else {
      console.log("No face detected.");
      postMessage({ type: "FACE_DETECTED", payload: { success: false } });
    }
  } catch (error) {
    console.error("Error during face detection:", error);
    postMessage({ type: "ERROR", payload: error.message });
  }
};

// Tangani pesan yang diterima oleh Web Worker
onmessage = async (event) => {
  const { type, payload } = event.data;

  // Validasi struktur pesan
  if (!event.data || typeof event.data !== "object") {
    console.error("Invalid message format received from Web Worker:", event.data);
    return;
  }

  if (!type || !payload) {
    console.error("Missing 'type' or 'payload' in message:", event.data);
    return;
  }

  if (type === "DETECT_FACE") {
    try {
      console.log("Received DETECT_FACE message, initializing...");
      if (!modelsLoaded) {
        await loadFaceModels();
      }
      await detectFace(payload);
    } catch (error) {
      console.error("Error handling DETECT_FACE message:", error);
      postMessage({ type: "ERROR", payload: error.message });
    }
  } else {
    console.error("Unknown message type received in Web Worker:", type);
    postMessage({ type: "ERROR", payload: `Unknown message type: ${type}` });
  }
};

// Log untuk memastikan worker berjalan
console.log("Face Worker initialized");
