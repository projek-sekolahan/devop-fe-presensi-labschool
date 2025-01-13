import { nets, fetchImage } from "face-api.js"; // Hanya impor bagian yang dibutuhkan
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
    const img = await fetchImage(image);
    const faceData = await nets.tinyFaceDetector.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceData) {
        const distance = nets.euclideanDistance(descriptor, faceData.descriptor);
        postMessage({ type: "FACE_DETECTED", payload: { success: true, distance, descriptor: faceData.descriptor } });
    } else {
        postMessage({ type: "FACE_DETECTED", payload: { success: false } });
    }
  } catch (error) {
    postMessage({ type: "ERROR", payload: error.message });
  }
};
