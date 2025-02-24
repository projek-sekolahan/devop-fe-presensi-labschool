import { detectSingleFace, validateFaceDetection } from "./faceUtils";

/**
 * Deteksi wajah dari elemen gambar.
 * @param {HTMLImageElement} imgElement
 * @returns {Promise<Object>} detectionResult
 */
export const detectFace = async (imgElement) => {
    if (!imgElement || !(imgElement instanceof HTMLImageElement)) {
        throw new Error("Invalid image element.");
    }
    const detection = await detectSingleFace(imgElement);
    if (!detection || typeof detection.descriptor === "undefined") {
        throw new Error("Face not detected.");
    }
    return detection;
};

/**
 * Bandingkan hasil deteksi wajah dengan token descriptor.
 * @param {Object} detectionResult
 * @param {Float32Array} tokenDescriptor
 * @returns {Promise<Float32Array>} descriptorResult
 */
export const compareFaces = async (detectionResult, tokenDescriptor) => {
    if (!detectionResult?.descriptor) {
        throw new Error("Invalid detection result.");
    }
    const isFaceMatched = await validateFaceDetection(detectionResult.descriptor, tokenDescriptor);
    if (typeof isFaceMatched !== "boolean" || !isFaceMatched) {
        throw new Error("Face match failed.");
    }
    return detectionResult.descriptor;
};
// Tidak perlu custom hook karena ini murni fungsi utility