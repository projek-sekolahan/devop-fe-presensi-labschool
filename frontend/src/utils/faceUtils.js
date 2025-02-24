import * as faceapi from "face-api.js";

export const loadFaceModels = async () => {
    const MODEL_URL = "/frontend/models";
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
    } catch (error) {
        console.error("Error loading face models:", error);
        throw new Error("Failed to load face models");
    }
};

export const detectSingleFace = async (imgElement) => {
    if (!imgElement || !imgElement.src) {
        console.error("Image element is empty or invalid.");
        return null;
    }

    console.log("Checking if image is loaded...");
    if (!imgElement.complete) {
        console.warn("Image is not fully loaded yet.");
        await new Promise((resolve) => (imgElement.onload = resolve));
    }

    console.log("Image successfully loaded:", imgElement.src);
    
    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 640,
        scoreThreshold: 0.3,
    });

    try {
        console.log("Detecting face...");
        const detection = await faceapi.detectSingleFace(imgElement, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        console.log("Detection result:", detection);
        if (!detection) {
            console.warn("No face detected.");
            return null;
        }

        return detection;
    } catch (error) {
        console.error("Error during face detection:", error);
        return null;
    }
};

export const validateFaceDetection = (
    faceData,
    tokenDescriptor,
    facecamCache = new Map(),
    threshold = 0.5
) => {
    // Validasi dengan token
    console.log(tokenDescriptor,faceData.descriptor)
    if (tokenDescriptor) {
        const distanceWithToken = faceapi.euclideanDistance(
            tokenDescriptor,
            faceData.descriptor
        );
        if (distanceWithToken <= threshold) {
            return true;
        }
    }
    // Validasi dengan cache
    if (facecamCache && facecamCache.size > 0) {
        const isMatched = Array.from(facecamCache.values()).some(
            (descriptor) =>
                faceapi.euclideanDistance(descriptor, faceData.descriptor) <=
                threshold
        );
        if (isMatched) {
            return true;
        }
    }

    console.warn("Face did not match token or cache.");
    return false;
};
