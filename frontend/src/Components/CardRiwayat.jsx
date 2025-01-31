import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import { parseJwt, getFormData, addDefaultKeys, alertMessage } from "../utils/utils";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function CardRiwayat({ index, history, biodata }) {
    const [datas, setDatas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cardLoading, setCardLoading] = useState(true); // State untuk animasi card
    const [pulsing, setPulsing] = useState(true); // State untuk efek pulsing
    const closeBtn = useRef(null);

    const clickHandler = () => {
        document.getElementById(`my_modal_${index}`).showModal();
        setDatas(null);
        setCardLoading(true); // Set card loading saat modal dibuka
        setPulsing(true); // Set pulsing saat modal dibuka
        const keys = ["AUTH_KEY", "token", "param"];
        const combinedKeys = addDefaultKeys(keys);
        let values = [
            localStorage.getItem("AUTH_KEY"),
            localStorage.getItem("login_token"),
            biodata.id.concat(",", history["Tanggal Presensi"]),
            localStorage.getItem("devop-sso"),
            Cookies.get("csrf"),
        ];

        loading &&
            !datas &&
            apiXML
                .presensiPost("detail_presensi", localStorage.getItem("AUTH_KEY"), getFormData(combinedKeys, values))
                .then((res) => {
                    res = JSON.parse(res);
                    Cookies.set("csrf", res.csrfHash); console.log(parseJwt(res.data.token));
                    setDatas(parseJwt(res.data.token).result);
                    setLoading(false);
                    setCardLoading(false); // Matikan card loading setelah data dimuat
                    setTimeout(() => setPulsing(false), 600); // Matikan efek pulsing setelah animasi selesai
                })
                .catch((e) => {
                    const res = JSON.parse(e.responseText);
                    Cookies.set("csrf", res.csrfHash);
                    setLoading(false);
                    setCardLoading(false); // Matikan card loading jika terjadi error
                    setPulsing(false); // Matikan efek pulsing jika terjadi error
                    closeBtn.current.click();
                    alertMessage(res.data.title, res.data.message, res.data.info, () => Swal.close());
                });
    };

    return (
        <>
            <motion.button
                onClick={clickHandler}
                className="btn w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <img src={biodata.img_location} alt="photo_profile" className="size-12 rounded-full bg-white" />
                <p className="font-bold text-base">{history["Nama Lengkap"]}</p>
                <div className="w-full flex gap-2 justify-between">
                    <div className="flex flex-col">
                        <p className="font-medium text-xs">{formatDate(history["Tanggal Presensi"])}</p>
                        <p className="text-xs font-normal">
                            <span className="text-secondary-green">Masuk : </span>
                            {history["Jam Masuk"]}
                        </p>
                        <p className="text-xs font-normal">
                            <span className="text-secondary-red">Keluar : </span>
                            {history["Jam Pulang"]}
                        </p>
                    </div>
                    <div
                        className={`${
                            history["Status Masuk"] == "Masuk Normal" && history["Status Pulang"] == "Pulang Normal"
                                ? "bg-secondary-green"
                                : history["Status Masuk"] == "Terlambat Masuk" || history["Status Pulang"] == "Pulang Cepat"
                                ? "bg-secondary-red"
                                : history["Status Masuk"] == null && history["Status Pulang"] == null && history["Keterangan"] == "Dinas Luar"
                                ? "bg-gray-600"
                                : "bg-secondary-yellow"
                        } row-span-3 justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
                    >
                        {`${
                            history["Status Masuk"] == "Masuk Normal" && history["Status Pulang"] == "Pulang Normal"
                                ? "Normal"
                                : history["Status Masuk"] == "Terlambat Masuk" || history["Status Pulang"] == "Pulang Cepat"
                                ? "Tidak Normal"
                                : history["Keterangan"] == "Dinas Luar"
                                ? "Dinas Luar"
                                : "Izin/Sakit"
                        }`}
                    </div>
                </div>
            </motion.button>
            <dialog id={`my_modal_${index}`} className="modal">
                <div className="modal-box overflow-y-auto">
                    {loading ? (
                        <div className="size-full flex justify-center items-center">
                            <span className="loading-spinner"></span>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-semibold text-xl mb-4">Detail</h3>
                            <AnimatePresence>
                                {datas.map((data, i) => (
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
                                                    src={`${data.foto_presensi}`}
                                                    alt="foto_presensi"
                                                    className="rounded-xl border-4 border-white"
                                                />
                                                <div>
                                                    <p className="font-medium text-md">{formatDate(data.tanggal_presensi)}</p>
                                                    <p className="text-sm font-normal">{data.waktu_presensi}</p>
                                                    <div
                                                        className={`${
                                                            data.keterangan.split(" ")[1] === "Normal"
                                                                ? "bg-secondary-green"
                                                                : "bg-secondary-red"
                                                        } justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
                                                    >
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
                    <div className="modal-action">
                        <form method="dialog">
                            <button
                                onClick={() => {
                                    setDatas(null);
                                    setLoading(true);
                                    setCardLoading(true); // Reset state card loading saat modal ditutup
                                    setPulsing(true); // Reset state pulsing saat modal ditutup
                                }}
                                className="btn"
                                ref={closeBtn}
                            >
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}