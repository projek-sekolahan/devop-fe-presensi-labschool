import { detectSingleFace, validateFaceDetection } from "./faceUtils";

/**
 * Mendeteksi wajah dalam elemen gambar.
 * @param {HTMLImageElement} imgElement - Elemen gambar yang akan diproses.
 * @returns {Promise<Object>} - Hasil deteksi wajah.
 * @throws {Error} - Jika elemen tidak valid atau wajah tidak terdeteksi.
 */
export const detectFace = async (imgElement) => {
    if (!(imgElement instanceof HTMLImageElement)) {
        throw new Error("detectFace: Parameter harus berupa elemen gambar (HTMLImageElement).");
    }

    const detection = await detectSingleFace(imgElement);
    console.log("Face recognition result:", detection);

    if (!detection?.descriptor) {
        throw new Error("detectFace: Wajah tidak terdeteksi.");
    }

    return detection;
};

/**
 * Membandingkan hasil deteksi wajah dengan token descriptor.
 * @param {Object} detectionResult - Hasil deteksi wajah dari `detectFace`.
 * @param {Object} tokenDescriptor - Data referensi wajah yang akan dibandingkan.
 * @returns {Promise<Object>} - Hasil deteksi jika wajah cocok.
 * @throws {Error} - Jika hasil deteksi tidak valid atau wajah tidak cocok.
 */
export const compareFaces = async (detectionResult, tokenDescriptor) => {
    if (!detectionResult) {
        throw new Error("compareFaces: Hasil deteksi wajah tidak valid.");
    }

    console.log("Detection result in compareFaces:", detectionResult);

    const isFaceMatched = await validateFaceDetection(detectionResult, tokenDescriptor);

    if (!isFaceMatched) {
        throw new Error("compareFaces: Wajah tidak cocok dengan referensi.");
    }

    return detectionResult;
};