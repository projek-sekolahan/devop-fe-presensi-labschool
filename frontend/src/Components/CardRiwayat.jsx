import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Card, Button, Modal } from "flowbite-react";
import { formatDate, parseJwt, getFormData, addDefaultKeys, alertMessage } from "../utils/utils";
import apiXML from "../utils/apiXML";

const STATUS_COLORS = {
    "Normal": "bg-green-500 text-white",
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
        if (history["Status Masuk"] === "Masuk Normal" && history["Status Pulang"] === "Pulang Normal") return "Normal";
        if (history["Status Masuk"] === "Terlambat Masuk" || history["Status Pulang"] === "Pulang Cepat") return "Tidak Normal";
        return history["Keterangan"] === "Dinas Luar" ? "Dinas Luar" : "Izin/Sakit";
    };

    const statusLabel = getStatusLabel();

    const fetchDetailPresensi = () => {
        const keys = addDefaultKeys(["AUTH_KEY", "token", "param"]);
        const values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            `${biodata.id},${history["Tanggal Presensi"]}`,
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf"),
        ];

        apiXML
            .presensiPost("detail_presensi", localStorage.getItem("AUTH_KEY"), getFormData(keys, values))
            .then((res) => {
                const parsedRes = JSON.parse(res);
                Cookies.set("csrf", parsedRes.csrfHash);
                setDatas(parseJwt(parsedRes.data.token).result);
                setLoading(false);
                setTimeout(() => setPulsing(false), 600);
            })
            .catch((e) => {
                const res = JSON.parse(e.responseText);
                Cookies.set("csrf", res.csrfHash);
                setLoading(false);
                setPulsing(false);
                alertMessage(res.data.title, res.data.message, res.data.info, () => Swal.close());
            });
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

            <Modal dismissible position="center" show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Detail</Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="flex justify-center items-center"><span className="loading-spinner"></span></div>
                    ) : (
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
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setShowModal(false)}>{loading ? "Loading" : "Close"}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}