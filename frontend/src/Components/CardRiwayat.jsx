import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import { parseJwt, getFormData, addDefaultKeys, alertMessage } from "../utils/utils";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Card } from "flowbite-react";
import { HiOutlineClock } from "react-icons/hi";

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
                    Cookies.set("csrf", res.csrfHash);
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
      <div className="flex justify-between items-center mt-3">
        <div className="text-sm">
          <p className="font-medium text-gray-600 flex items-center gap-1">
            <HiOutlineClock /> {formatDate(history["Tanggal Presensi"])}
          </p>
          <p>
            <span className="text-green-600 font-medium">Masuk: </span>
            {history["Jam Masuk"]}
          </p>
          <p>
            <span className="text-red-600 font-medium">Keluar: </span>
            {history["Jam Pulang"]}
          </p>
        </div>
        <span 
          className={`px-3 py-1 rounded-md font-semibold text-sm cursor-pointer ${statusColors[statusLabel]}`} 
          onClick={() => clickHandler(statusLabel)}
        >
          {statusLabel}
        </span>
      </div>
    </Card>
        </motion.div>
        <dialog id={`my_modal_${index}`} className="modal">
        <div className="modal-box">
        {loading ? (
            <div className="flex justify-center items-center">
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
                    {loading ? "Loading":"Close"}
                </button>
            </form>
        </div>
        </div>
        </dialog>
    </div>
    
    );
}