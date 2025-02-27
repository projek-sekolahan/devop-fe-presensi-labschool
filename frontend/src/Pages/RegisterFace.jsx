import { useRef, useEffect, useState, useCallback } from "react";
import useCamera from "../utils/useCamera";
import { loadFaceModels } from "../utils/faceUtils";
import { detectFace } from "../utils/useFaceRecognition";
import ApiService from "../utils/ApiService";
import { alertMessage, getFormData, getCombinedValues, addDefaultKeys } from "../utils/utils";
import DetailModal from "../Components/DetailModal";

export default function RegisterFace({ isOpen, onToggle }) {
    const imgRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { videoRef, canvasRef, startVideo, stopVideo, capturePhoto } = useCamera();

    useEffect(() => {
        const initCamera = async () => {
            setIsLoading(true);
            await loadFaceModels();
            await startVideo();
            setIsLoading(false);
        };
        initCamera();
        return () => stopVideo(); // Cleanup kamera saat komponen unmount
    }, [startVideo, stopVideo]);

    const detectAndRegisterFace = useCallback(async () => {
        setIsLoading(true);
        setShowModal(false); // Tutup modal sebelum proses berjalan agar responsif
        try {
            const faceData = await detectFace(imgRef.current);
            if (!faceData) throw new Error("Wajah tidak terdeteksi, coba lagi.");
            const keys = ["param", "img"];
            const formValues = [Array.from(faceData.descriptor).join(","), `["${imgSrc}"]`];
            const values = [...formValues, ...getCombinedValues([])];
            const sanitizedKeys = addDefaultKeys(keys);
            const formData = getFormData(sanitizedKeys, values);
            const res = await ApiService.processApiRequest("facecam", formData, null, true);
            if (res?.data) {
                alertMessage(res.data.title, res.data.message, res.data.info, () => onToggle("setpassword"));
            }
        } catch (error) {
            alertMessage("Error", error.message || "Terjadi kesalahan", "error");
        } finally {
            setIsLoading(false);
        }
    }, [imgSrc, onToggle]);

    const clickHandler = async () => {
        setShowModal(true);
        setIsLoading(true);
        const imageResult = await capturePhoto();
        if (!imageResult) {
            setIsLoading(false);
            alertMessage("Error", "Tidak ada gambar yang dibuat", "error");
            return;
        }
        setImgSrc(imageResult);
        if (imgRef.current) imgRef.current.src = imageResult;
        setIsLoading(false);
    };

    return (
        <div className="capture-container">
            <div className="text-center mt-6 mb-6">
                <h1 className="text-2xl font-bold">Pendaftaran Wajah</h1>
                <p className="text-sm font-semibold mt-2">Ambil Gambar Wajah Untuk Verifikasi</p>
            </div>
            
            <div className="relative w-full h-[400px] flex justify-center items-center">
                <video ref={videoRef} className="absolute w-full h-full object-cover mt-8 -scale-x-100" autoPlay playsInline />
            </div>
            
            <canvas ref={canvasRef} className="absolute hidden"></canvas>
            <img ref={imgRef} className="absolute hidden" />
            
            <div className={`capture-form-container ${isOpen ? "open" : "closed"}`}>
                <button onClick={clickHandler} className="btn-submit" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Ambil Gambar"}
                </button>
                
                <DetailModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    headerTitle="Hasil Potret"
                    loading={isLoading}
                    footerButtons={
                        <div className="flex gap-4">
                            <button
                                className="py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button
                                className={`py-2 px-6 btn-submit ${isLoading ? "loading" : ""}`}
                                onClick={detectAndRegisterFace}
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Proses"}
                            </button>
                        </div>
                    }
                >
                    <p className="text-semibold mt-2 text-gray-600">Cek Hasil Gambar</p>
                    {imgSrc && <img src={imgSrc} alt="Captured" className="w-full rounded-lg shadow-md mt-4" />}
                </DetailModal>
            </div>
        </div>
    );
}