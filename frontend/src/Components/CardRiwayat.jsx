import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import { parseJwt, getFormData, addDefaultKeys, alertMessage } from "../utils/utils";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Card, Button, Modal } from "flowbite-react"; // Mengimpor Modal dari Flowbite

export default function CardRiwayat({ index, history, biodata }) {
    const statusColors = {
        "Normal": "bg-green-500 text-white",
        "Tidak Normal": "bg-red-500 text-white",
        "Dinas Luar": "bg-gray-600 text-white",
        "Izin/Sakit": "bg-yellow-500 text-black",
    };

    const statusMasuk = history["Status Masuk"];
    const statusPulang = history["Status Pulang"];
    const keterangan = history["Keterangan"];

    const statusLabel =
        statusMasuk === "Masuk Normal" && statusPulang === "Pulang Normal"
            ? "Normal"
            : statusMasuk === "Terlambat Masuk" || statusPulang === "Pulang Cepat"
                ? "Tidak Normal"
                : keterangan === "Dinas Luar"
                    ? "Dinas Luar"
                    : "Izin/Sakit";

    const [datas, setDatas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pulsing, setPulsing] = useState(true);
    const [showModal, setShowModal] = useState(false); // Menyimpan state modal

    const clickHandler = () => {
        setShowModal(true); // Menampilkan modal saat tombol diklik
        setDatas(null);
        setPulsing(true);

        const keys = ["AUTH_KEY", "token", "param"];
        const combinedKeys = addDefaultKeys(keys);
        const values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            `${biodata.id},${history["Tanggal Presensi"]}`,
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf"),
        ];

        if (loading && !datas) {
            apiXML
                .presensiPost("detail_presensi", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
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
        }
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
                    <p className="font-medium text-gray-600 flex items-center gap-1 mt-3">
                        {formatDate(history["Tanggal Presensi"])}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <p>
                            <span className="text-green-600 font-medium">Masuk: </span>
                            {history["Jam Masuk"]}
                        </p>
                        <p>
                            <span className="text-red-600 font-medium">Keluar: </span>
                            {history["Jam Pulang"]}
                        </p>
                    </div>
                    <Button
                        className={`w-full mt-3 px-4 py-2 rounded-md font-semibold text-sm cursor-pointer ${statusColors[statusLabel]}`}
                        onClick={clickHandler}
                    >
                        {statusLabel}
                    </Button>
                </Card>
            </motion.div>

            {/* Modal menggunakan Flowbite */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)} // Menutup modal
            >
                <Modal.Header>Detail</Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <span className="loading-spinner"></span>
                        </div>
                    ) : (
                        <>
                            <AnimatePresence>
                                {datas?.map((data, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className={`${pulsing ? "pulse" : ""} loadable`}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <img
                                                    src={data.foto_presensi}
                                                    alt="foto_presensi"
                                                    className="rounded-xl border-4 border-white"
                                                />
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
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}