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
        <div className="card-history" key={index}>
          ini history ke {index}
        </div>
    </div>
    );
}