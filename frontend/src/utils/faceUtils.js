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
        inputSize: 640,
        scoreThreshold: 0.6,
    });

    let maxTries = 10; // Set max retries
    let attempts = 0;

    while (attempts < maxTries) {
        try {
            const detection = await faceapi
                .detectSingleFace(imgElement, options)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection && detection.descriptor) {
                console.log("Face detected:", detection);
                return {
                    descriptor: new Float32Array(detection.descriptor),
                    detection,
                };
            }

            console.warn(
                `No face detected. Attempt ${attempts + 1} of ${maxTries}`
            );
        } catch (error) {
            console.error("Error during face detection:", error);
            return null;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }

    console.warn("Max attempts reached. No face detected.");
    return null;
};

export const validateFaceDetection = (
    faceData,
    tokenDescriptor,
    facecamCache = new Map(),
    threshold = 0.6
) => {
    console.log("Raw faceData received:", faceData);
    console.log("Type of faceData:", typeof faceData);
    console.log("Instance of Float32Array:", faceData instanceof Float32Array);

    if (!faceData) {
        console.warn("faceData is missing or null.");
        return false;
    }

    const descriptor =
        faceData instanceof Float32Array ? faceData : faceData?.descriptor;

    if (!(descriptor instanceof Float32Array) || descriptor.length !== 128) {
        console.warn(
            "Invalid descriptor: Expected Float32Array with length 128 but got",
            descriptor
        );
        return false;
    }

    console.log("Valid descriptor found. Proceeding to validation...");

    if (
        tokenDescriptor instanceof Float32Array &&
        tokenDescriptor.length === 128
    ) {
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
        console.warn(
            "Invalid tokenDescriptor: It must be a Float32Array of length 128."
        );
    }

    if (!(facecamCache instanceof Map)) {
        console.warn("facecamCache is not a valid Map. Initializing empty cache.");
        facecamCache = new Map();
    }

    if (facecamCache.size === 0) {
        console.warn("Facecam cache is empty.");
        return false;
    }

    console.log("Checking face match with cache...");
    console.log("Facecam cache content:", Array.from(facecamCache.entries()));

    const isMatched = Array.from(facecamCache.values()).some(
        (cachedDescriptor) =>
            cachedDescriptor instanceof Float32Array &&
            cachedDescriptor.length === 128 &&
            faceapi.euclideanDistance(
                Array.from(cachedDescriptor),
                Array.from(descriptor)
            ) <= threshold
    );

    if (isMatched) {
        console.log("Face match with cache.");
        return true;
    }

    console.warn("Face did not match token or cache.");
    return false;
};