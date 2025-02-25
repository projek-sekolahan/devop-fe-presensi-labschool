import * as faceapi from "face-api.js";

const MODEL_URL = "/frontend/models";
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;
const FACE_DESCRIPTOR_LENGTH = 128;
const DEFAULT_THRESHOLD = 0.6;

export const loadFaceModels = async () => {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
    } catch (error) {
        console.error("Failed to load face models:", error);
        throw new Error("Model loading error");
    }
};

/* export const detectSingleFace = async (imgElement) => {
    if (!imgElement?.src) {
        console.error("Invalid image element.");
        return null;
    }

    if (!imgElement.complete) {
        console.warn("Image not fully loaded. Waiting...");
        await new Promise((resolve) => (imgElement.onload = resolve));
    }

    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 640,
        scoreThreshold: 0.6,
    });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const detection = await faceapi
                .detectSingleFace(imgElement, options)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection?.descriptor) {
                return {
                    descriptor: new Float32Array(detection.descriptor),
                    detection,
                };
            }

            console.warn(`No face detected. Attempt ${attempt} of ${MAX_RETRIES}`);
        } catch (error) {
            console.error("Face detection error:", error);
            return null;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }

    console.warn("Max attempts reached. No face detected.");
    return null;
}; */

export const detectSingleFace = async (imgElement) => {
    if (!imgElement?.src) {
        console.error("Invalid image element.");
        return null;
    }

    if (!imgElement.complete) {
        console.warn("Image not fully loaded. Waiting...");
        await new Promise((resolve) => (imgElement.onload = resolve));
    }

    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 640,
        scoreThreshold: 0.6,
    });

    try {
        const detection = await faceapi
            .detectSingleFace(imgElement, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        return detection?.descriptor ? { 
            descriptor: new Float32Array(detection.descriptor), 
            detection 
        } : null;

    } catch (error) {
        console.error("Face detection error:", error);
        return null;
    }
};

export const validateFaceDetection = (faceData, tokenDescriptor, threshold = DEFAULT_THRESHOLD) => {
    if (!faceData) {
        console.warn("Missing face data.");
        return false;
    }

    const descriptor = faceData instanceof Float32Array ? faceData : faceData?.descriptor;
    if (!(descriptor instanceof Float32Array) || descriptor.length !== FACE_DESCRIPTOR_LENGTH) {
        console.warn("Invalid descriptor format.");
        return false;
    }

    if (tokenDescriptor instanceof Float32Array && tokenDescriptor.length === FACE_DESCRIPTOR_LENGTH) {
        if (faceapi.euclideanDistance([...tokenDescriptor], [...descriptor]) <= threshold) {
            return true;
        }
    } else {
        console.warn("Invalid token descriptor format.");
    }

    const isMatched = Array.from(facecamCache.values()).some(
        (cachedDescriptor) =>
            cachedDescriptor instanceof Float32Array &&
            cachedDescriptor.length === FACE_DESCRIPTOR_LENGTH &&
            faceapi.euclideanDistance([...cachedDescriptor], [...descriptor]) <= threshold
    );

    if (isMatched) return true;

    console.warn("Face did not match token or cache.");
    return false;
};