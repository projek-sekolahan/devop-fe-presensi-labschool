import { useRef, useCallback } from "react";

const useCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startVideo = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("autoplay", "");
                videoRef.current.setAttribute("muted", "");
                videoRef.current.setAttribute("playsinline", "");
            }
        } catch (err) {
            console.error("Camera error:", err);
            throw err;
        }
    }, []);

    const stopVideo = useCallback(() => {
        try {
            const stream = videoRef.current?.srcObject;
            if (!stream) return; // Hindari error jika tidak ada stream
            stream?.getTracks().forEach((track) => track.stop());
        } catch (err) {
            console.error("Camera error:", err);
            throw err;
        }
    }, []);

    const capturePhoto = useCallback(() => {
        try {
            const context = canvasRef.current?.getContext("2d");
            const video = videoRef.current;
            if (context && video) {
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;

                // Define the crop area (center 400x400)
                const cropSize = 400;
                const startX = (videoWidth - cropSize) / 2;
                const startY = (videoHeight - cropSize) / 2;

                canvasRef.current.width = cropSize;
                canvasRef.current.height = cropSize;

                context.save();
                context.scale(-1, 1); // Mirror effect
                context.translate(-cropSize, 0);
                context.drawImage(
                    video,
                    startX,
                    startY,
                    cropSize,
                    cropSize,
                    0,
                    0,
                    cropSize,
                    cropSize
                );
                context.restore();

                let imageData = canvasRef.current.toDataURL("image/jpeg");
                return imageData;
            }
            return null;
        } catch (err) {
            console.error("Image error:", err);
            throw err;
        }
    }, []);

    return { videoRef, canvasRef, startVideo, stopVideo, capturePhoto };
};

export default useCamera;
