import { detectSingleFace, validateFaceDetection } from "./faceUtils";

export const detectFace = async (imgElement) => {
    try {
        const detection = await detectSingleFace(imgElement);
        if (!detection || !detection.descriptor) {
            throw new Error("Face not detected.");
        }
        return detection;
    } catch (err) {
        console.error("Face detection failed:", err);
        throw err;
    }
};

export const compareFaces = async (detectionResult, tokenDescriptor) => {
    try {
        if (!detectionResult?.descriptor) {
            throw new Error("Invalid detection result.");
        }
        const isFaceMatched = await validateFaceDetection(detectionResult.descriptor, tokenDescriptor);
        if (!isFaceMatched) throw new Error("Face match failed.");
        return detectionResult.descriptor;
    } catch (err) {
        console.error("Face match failed:", err);
        throw err;
    }
};

// Tetap ekspor sebagai hook untuk opsi lain
const useFaceRecognition = () => {
    return { detectFace, compareFaces };
};

export default useFaceRecognition;