import { useRef } from 'react';

const videoRef = useRef(null);
const canvasRef = useRef(null);

const startVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("autoplay", "");
        videoRef.current.setAttribute("muted", "");
        videoRef.current.setAttribute("playsinline", "");
    } catch (err) {
        console.error('Camera error:', err);
        throw err;
    }
};

const stopVideo = async () => {
    try {
        const stream = videoRef.current?.srcObject;
        stream?.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.error('Camera error:', err);
        throw err;
    }
};

const capturePhoto = async () => {
    try {
        const context = canvasRef.current.getContext('2d');
        const video = videoRef.current;
        canvasRef.current.width = 400;
        canvasRef.current.height = 400;
        context.save();
        context.scale(-1, 1);
        context.translate(-400, 0);
        context.drawImage(video, 0, 0, 400, 400);
        context.restore();
        let imageData = canvasRef.current.toDataURL('image/jpeg');
        return imageData;
    } catch (err) {
        console.error('Image error:', err);
        throw err;
    }
};

// **Ekspor semua fungsi secara langsung**
export { videoRef, canvasRef, startVideo, stopVideo, capturePhoto };
