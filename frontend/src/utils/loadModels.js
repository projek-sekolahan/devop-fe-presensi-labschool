// faceModels.js
import * as faceapi from "face-api.js";

let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (!modelsLoaded) {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
  }
};
