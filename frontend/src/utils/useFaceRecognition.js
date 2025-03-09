import { detectSingleFace, validateFaceDetection } from "./faceUtils";

export const detectFace = async (imgElement) => {
    if (!(imgElement instanceof HTMLImageElement)) {
        throw new Error("detectFace: Parameter harus berupa elemen gambar (HTMLImageElement).");
    }
    const detection = await detectSingleFace(imgElement); console.log("detection", detection);
    if (!detection?.descriptor) {
        throw new Error("detectFace: Wajah tidak terdeteksi.");
    }
    return detection;
};
export const compareFaces = async (detectionResult, tokenDescriptor) => {
    if (!detectionResult) {
        throw new Error("compareFaces: Hasil deteksi wajah tidak valid.");
    }
    const isFaceMatched = await validateFaceDetection(detectionResult, tokenDescriptor);
    if (!isFaceMatched) {
        throw new Error("compareFaces: Wajah tidak cocok dengan referensi.");
    }
    return detectionResult;
};