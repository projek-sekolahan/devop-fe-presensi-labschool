import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Card, Button } from "flowbite-react";
import { formatDate, parseJwt, getFormData, addDefaultKeys, alertMessage, getCombinedValues } from "../utils/utils";
import ApiService from "../utils/ApiService";
import DetailModal from "../Components/DetailModal";

const STATUS_COLORS = {
    "Normal": "bg-green-500 text-white",
    "Hadir": "bg-green-500 text-white",
    "Tidak Normal": "bg-red-500 text-white",
    "Dinas Luar": "bg-gray-600 text-white",
    "Izin/Sakit": "bg-yellow-500 text-black",
};

export default function CardRiwayat({ index, history, biodata }) {
    const [datas, setDatas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pulsing, setPulsing] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const getStatusLabel = () => {
        if (history["Keterangan"] === "Dinas Luar") {
            return "Dinas Luar";
        }
        
        if (history["Status Masuk"] === "Masuk Normal" && history["Status Pulang"] === "Pulang Normal") {
            return "Normal";
        }
        
        if (history["Status Masuk"] === "Terlambat Masuk" || history["Status Pulang"] === "Pulang Cepat" || 
            history["Status Masuk"] === "---" || history["Status Pulang"] === "---") {
            return "Tidak Normal";
        }
        
        return "Izin/Sakit";
    };

    const statusLabel = getStatusLabel();
    
    const fetchDetailPresensi = () => {
        const keys = addDefaultKeys(["param", "AUTH_KEY", "token"]);
        const formValues = [`${biodata.user_id},${history["Tanggal Presensi"]}`];
        const storedValues = getCombinedValues(keys.slice(1, 3));
        const values = [...formValues, ...storedValues];
        const formData = getFormData(keys, values);
        const response = ApiService.processApiRequest("presensi/detail_presensi", formData, localStorage.getItem("AUTH_KEY"), false);
        console.log("✅ selected Keys:", keys.slice(1, 3));
        console.log("✅ Final keys:", keys);
        console.log("✅ Final values:", values);
        console.log("✅ Final formData:", formData);
        console.log("✅ Final response:", response);
        if (response) {
            setDatas(parseJwt(response.data.token).result);
        } 
        setLoading(false);
        setTimeout(() => setPulsing(false), 600);
    };

    const clickHandler = () => {
        setShowModal(true);
        setDatas(null);
        setPulsing(true);
        fetchDetailPresensi();
    };

    return (
        <div className="flex flex-col gap-4">
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <Card className="card-history" key={index}>
                    <div className="flex items-center gap-3 border-b pb-2">
                        <img
                            src={biodata.img_location}
                            alt="photo_profile"
                            className="w-12 h-12 rounded-full bg-white border"
                        />
                        <p className="font-semibold text-lg">{history["Nama Lengkap"]}</p>
                    </div>
                    <p className="font-medium text-gray-600 mt-3">{formatDate(history["Tanggal Presensi"])}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <p><span className="text-green-600 font-medium">Masuk: </span>{history["Jam Masuk"]}</p>
                        <p><span className="text-red-600 font-medium">Keluar: </span>{history["Jam Pulang"]}</p>
                    </div>
                    <Button className={`w-full mt-3 px-4 py-2 rounded-md font-semibold text-sm ${STATUS_COLORS[statusLabel]}`} onClick={clickHandler}>
                        {statusLabel}
                    </Button>
                </Card>
            </motion.div>

            <DetailModal showModal={showModal} setShowModal={setShowModal} headerTitle="Detail Presensi" loading={loading}>
                {loading && (
                    <div className="animate-pulse bg-gray-400 h-32 w-full rounded-md"></div>
                )}
                {!loading && datas?.length > 0 && (
                    <AnimatePresence>
                        {datas?.map((data, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ delay: i * 0.1 }}>
                                <div className={`${pulsing ? "pulse" : ""} loadable`}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <img src={data.foto_presensi} alt="foto_presensi" className="rounded-xl border-4 border-white" />
                                        <div>
                                            <p className="font-medium text-md">{formatDate(data.tanggal_presensi)}</p>
                                            <p className="text-sm font-normal">{data.waktu_presensi}</p>
                                            <div className={`text-center w-full max-w-28 mt-3 py-1 text-sm font-bold text-white rounded-md ${data.keterangan.includes("Normal") ? "bg-secondary-green" : "bg-secondary-red"}`}>
                                                {data.keterangan}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                {!loading && (!datas || datas.length === 0) && (
                    <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                            <h4 className="text-lg font-semibold">Warning</h4>
                        </div>
                        <p className="mt-2 text-sm">Tidak ada data detail presensi yang tersedia. Harap coba lagi nanti.</p>
                    </div>
                )}
            </DetailModal>

        </div>
    );
}