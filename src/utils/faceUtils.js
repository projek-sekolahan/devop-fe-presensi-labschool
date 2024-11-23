import * as faceapi from "face-api.js";

export const loadFaceModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
};

export const detectSingleFace = async (imgElement) => {
    if (!imgElement || imgElement.src === "") {
        console.error("Image element is empty or invalid.");
        return null;
    }

    return await faceapi
        .detectSingleFace(imgElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
};