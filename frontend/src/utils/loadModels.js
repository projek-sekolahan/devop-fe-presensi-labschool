import * as faceapi from "face-api.js";

let modelsLoaded = false;

export const loadFaceModels = async () => {
    if (!modelsLoaded) {
        console.log("loading model");
        const MODEL_URL = "/frontend/models";
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            console.log("tinyFaceDetector loaded");

            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            console.log("faceLandmark68Net loaded");

            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            console.log("faceRecognitionNet loaded");

            console.log("finished loaded model");
            modelsLoaded = true;
        } catch (error) {
            console.error("Error loading models:", error);
        }
        modelsLoaded = true;
    }
    console.log("model loaded");
};
