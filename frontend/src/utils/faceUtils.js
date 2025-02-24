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
    threshold = 0.3
) => {
    // Cek apakah faceData valid
    if (!faceData || !faceData.descriptor) {
        console.warn("Invalid faceData: descriptor is missing.");
        return false;
    }

    console.log("Validating face with tokenDescriptor:", tokenDescriptor);
    console.log("Face descriptor:", faceData.descriptor);

    // Validasi dengan token
    if (tokenDescriptor && Array.isArray(tokenDescriptor)) {
        const distanceWithToken = faceapi.euclideanDistance(
            tokenDescriptor,
            faceData.descriptor
        );
        console.log("Distance with token:", distanceWithToken);
        if (distanceWithToken <= threshold) {
            console.log("Face match with token.");
            return true;
        }
    } else {
        console.warn("Invalid tokenDescriptor: It must be an array.");
    }

    // Validasi dengan cache
    if (facecamCache instanceof Map && facecamCache.size > 0) {
        const isMatched = Array.from(facecamCache.values()).some(
            (descriptor) =>
                Array.isArray(descriptor) &&
                faceapi.euclideanDistance(descriptor, faceData.descriptor) <= threshold
        );
        if (isMatched) {
            console.log("Face match with cache.");
            return true;
        }
    } else {
        console.warn("Facecam cache is empty or invalid.");
    }

    console.warn("Face did not match token or cache.");
    return false;
};

