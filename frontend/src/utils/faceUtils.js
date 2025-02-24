import * as faceapi from "face-api.js";

const MODEL_URL = "/frontend/models"; // Sesuaikan jika perlu

export const loadFaceModels = async () => {
    try {
        console.log("Loading face models...");
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Face models loaded successfully.");
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

    if (!imgElement.complete) {
        console.warn("Image is not fully loaded. Waiting...");
        await new Promise((resolve) => (imgElement.onload = resolve));
    }

    console.log("Detecting face in image:", imgElement.src);
    
    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.4,
    });

    try {
        const detection = await faceapi.detectSingleFace(imgElement, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            console.warn("No face detected.");
            return null;
        }

        console.log("Face detected:", detection);
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
    threshold = 0.4
) => {
    console.log("Raw faceData received:", faceData);
    console.log("Type of faceData:", typeof faceData);
    console.log("Instance of Float32Array:", faceData instanceof Float32Array);
    console.log("Has descriptor property:", faceData?.descriptor ? "Yes" : "No");

    // Pastikan faceData valid
    if (!faceData) {
        console.warn("faceData is missing or null.");
        return false;
    }

    // Cek apakah faceData punya deteksi wajah yang valid
    if (faceData?.detection && typeof faceData.detection._score === "number") {
        if (faceData.detection._score < 0.5) {
            console.warn("Face detection confidence too low:", faceData.detection._score);
            return false;
        }
    } else {
        console.warn("Face detection confidence is missing or invalid:", faceData?.detection?._score);
        return false;
    }

    // Ambil descriptor: bisa dari Float32Array langsung atau dari properti faceData
    const descriptor =
        faceData instanceof Float32Array ? faceData : faceData?.descriptor;

    if (!(descriptor instanceof Float32Array) || descriptor.length !== 128) {
        console.warn("Invalid descriptor: Expected Float32Array with length 128 but got", descriptor);
        return false;
    }

    console.log("Valid descriptor found. Proceeding to validation...");

    // Bandingkan dengan token descriptor
    if (Array.isArray(tokenDescriptor) && tokenDescriptor.length === 128) {
        const distanceWithToken = faceapi.euclideanDistance(
            Array.from(tokenDescriptor), 
            Array.from(descriptor)
        );
        console.log("Distance with token:", distanceWithToken);
        if (distanceWithToken <= threshold) {
            console.log("Face match with token.");
            return true;
        }
    } else {
        console.warn("Invalid tokenDescriptor: It must be an array of length 128.");
    }

    // Validasi cache
    if (!(facecamCache instanceof Map) || facecamCache.size === 0) {
        console.warn("Facecam cache is empty or invalid.");
        return false;
    }

    console.log("Checking face match with cache...");

    const isMatched = Array.from(facecamCache.values()).some(
        (cachedDescriptor) =>
            Array.isArray(cachedDescriptor) &&
            cachedDescriptor.length === 128 &&
            faceapi.euclideanDistance(Array.from(cachedDescriptor), Array.from(descriptor)) <= threshold
    );

    if (isMatched) {
        console.log("Face match with cache.");
        return true;
    }

    console.warn("Face did not match token or cache.");
    return false;
};