import { detectSingleFace, validateFaceDetection } from "./faceUtils";

export const detectFace = async (imgElement) => {
    if (!imgElement || !(imgElement instanceof HTMLImageElement)) {
        throw new Error("Invalid image element.");
    }
    const detection = await detectSingleFace(imgElement);
    console.log("face recognis", detection);
    if (!detection || typeof detection.descriptor === "undefined") {
        throw new Error("Face not detected.");
    }
    return detection;
};

export const compareFaces = async (detectionResult, tokenDescriptor) => {
    console.log("Detection Resul on Compare : ", detectionResult);
    if (!detectionResult) {
        throw new Error("Invalid detection result.");
    }
    const isFaceMatched = await validateFaceDetection(
        detectionResult,
        tokenDescriptor
    );
    if (typeof isFaceMatched !== "boolean" || !isFaceMatched) {
        throw new Error("Face match failed.");
    }
    return detectionResult;
};
// Tidak perlu custom hook karena ini murni fungsi utility
