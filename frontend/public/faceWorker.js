import * as faceapi from "face-api.js";
import { loadFaceModels } from "../src/utils/loadModels";

let modelsLoaded = false;

onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "DETECT_FACE") {
    if (!modelsLoaded) {
      await loadFaceModels(); // Menggunakan loadFaceModels dari import
      modelsLoaded = true;
    }
    detectFace(payload);
  }
};

const detectFace = async ({ image, descriptor }) => {
  try {
    const img = await faceapi.fetchImage(image);
    const faceData = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceData) {
      const distance = faceapi.euclideanDistance(descriptor, faceData.descriptor);
      postMessage({ type: "FACE_DETECTED", payload: { success: true, distance, descriptor: faceData.descriptor } });
    } else {
      postMessage({ type: "FACE_DETECTED", payload: { success: false } });
    }
  } catch (error) {
    postMessage({ type: "ERROR", payload: error.message });
  }
};