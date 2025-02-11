import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Riwayat() {
    const { id } = useParams(); // Tangkap ID dari URL
    
    useEffect(() => {
        // Jika tidak ada ID dan userToken, maka arahkan ke /login
        if (!id) {
            window.location.replace("*");
        }
    }, [id]); // Gunakan id dalam dependensi agar efek berjalan saat id berubah

    return (
        <div>
            <h1>Riwayat Presensi</h1>
            {id ? <p>Menampilkan data untuk ID: {id}</p> : <p>Menampilkan semua riwayat</p>}
        </div>
    );
}
