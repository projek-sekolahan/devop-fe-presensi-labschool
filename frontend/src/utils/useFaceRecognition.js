import {
    loadFaceModels,
    detectSingleFace,
    validateFaceDetection,
} from "./faceUtils";

const useFaceRecognition = () => {
    const detectFace = async (imgElement) => {
        try {
            const detection = await detectSingleFace(imgElement).withFaceDescriptor();
            if (!detection) throw new Error('Face not detected');
            return detection;
        } catch (err) {
            console.error('Face detection failed:', err);
            throw err;
        }
    };

    const compareFaces = async (detectionResult,tokenDescriptor) => {
        try {
            const isFaceMatched = await validateFaceDetection(detectionResult,tokenDescriptor);
            if (!isFaceMatched) throw new Error('Face match failed.');
            return detection.descriptor;
        } catch (err) {
            console.error('Face match failed.:', err);
            throw err;
        }
    };

    /* const compareFaces = (descriptor1, descriptor2) => {
        const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
        return distance < 0.6; // Threshold bisa disesuaikan
    }; */

    return { detectFace, compareFaces };
};

export default useFaceRecognition;
