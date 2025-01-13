import { nets, fetchImage } from "face-api.js"; // Hanya impor bagian yang dibutuhkan

let modelsLoaded = false;

// Fungsi untuk memuat model
const loadFaceModels = async () => {
  if (!modelsLoaded) {
    console.log("Loading models in Web Worker...");
    const MODEL_URL = "/frontend/models";

    try {
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
      postMessage({ type: "ERROR", payload: error.message });
    }
  }
};

// Fungsi untuk mendeteksi wajah
const detectFace = async ({ image, descriptor }) => {
  try {
    const img = await fetchImage(image);
    const faceData = await nets.tinyFaceDetector
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceData) {
      const distance = nets.euclideanDistance(descriptor, faceData.descriptor);
      postMessage({
        type: "FACE_DETECTED",
        payload: { success: true, distance, descriptor: faceData.descriptor },
      });
    } else {
      postMessage({ type: "FACE_DETECTED", payload: { success: false } });
    }
  } catch (error) {
    postMessage({ type: "ERROR", payload: error.message });
  }
};

// Tangani pesan yang diterima oleh Web Worker
onmessage = async (event) => {
  const { type, payload } = event.data;
  if (type === "DETECT_FACE") {
    try {
      if (!modelsLoaded) {
        await loadFaceModels();
      }
      await detectFace(payload);
    } catch (error) {
      postMessage({ type: "ERROR", payload: error.message });
    }
  }
};
