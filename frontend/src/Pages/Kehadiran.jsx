import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Kehadiran() {
    const { id } = useParams(); // Tangkap ID dari URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("ID dari useParams:", id);
        if (id === undefined) return; // Tunggu sampai ID tersedia

        if (!id) {
            navigate("*"); // Redirect ke login jika ID kosong
        } else {
            setLoading(false); // ID valid, hentikan loading
        }
    }, [id, navigate]);

    if (loading) return <p>Loading...halaman kehadiran</p>;

    return (
        <div>
            <h1>Riwayat Presensi</h1>
            {id ? <p>Sedang Menampilkan data...</p> : <p>Sedang Menampilkan...</p>}
        </div>
    );
}
