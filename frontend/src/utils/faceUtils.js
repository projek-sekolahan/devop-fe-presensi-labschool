import * as faceapi from "face-api.js";

export const loadFaceModels = async () => {
    console.log("loading model");
    const MODEL_URL = "/frontend/models";
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
        console.log("finished loaded model");
    });
};

export const detectSingleFace = async (imgElement) => {
    if (!imgElement || imgElement.src === "") {
        console.error("Image element is empty or invalid.");
        return null;
    }

    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      });
    
      const detection = await faceapi
        .detectSingleFace(imgElement, options)
        .withFaceLandmarks()
        .withFaceDescriptor();
    
      return detection;
};
