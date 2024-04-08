import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CardNotifikasiRiwayat from "../Components/CardNotifikasiRiwayat";
import CardNotifikasiBerita from "../Components/CardNotifikasiBerita";

export default function Notification() {
    const [type, setType] = useState(0);
    const history = [
        {
            date: "Rabu, 23 Februari 2024",
            status: "Terlambat",
            checkIn: "07:15:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Kamis, 24 Februari 2024",
            status: "Masuk",
            checkIn: "06:59:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Jumat, 25 Februari 2024",
            status: "Masuk",
            checkIn: "06:45:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Senin, 28 Februari 2024",
            status: "Izin",
            checkIn: "",
            checkOut: "",
        },
        {
            date: "Rabu, 23 Februari 2024",
            status: "Terlambat",
            checkIn: "07:15:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Kamis, 24 Februari 2024",
            status: "Masuk",
            checkIn: "06:59:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Jumat, 25 Februari 2024",
            status: "Masuk",
            checkIn: "06:45:00 WIB",
            checkOut: "15:00:00 WIB",
        },
        {
            date: "Senin, 28 Februari 2024",
            status: "Izin",
            checkIn: "",
            checkOut: "",
        },
    ];
    const news = [
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor ",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id sem et enim commodo eleifend vitae non libero. Nunc ut tincidunt leo. Nulla at imperdiet augue. Etiam volutpat lectus vitae ex pharetra, nec maximus dolor ",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id sem et enim commodo eleifend vitae non libero. Nunc ut tincidunt leo. Nulla at imperdiet augue. Etiam volutpat lectus vitae ex ",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id sem et enim commodo eleifend vitae non libero. pharetra, nec maximus dolor tincidunt. Integer mattis, eros non auctor aliquam, nibh justo venenatis orci, at iaculis leo metus in est.",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum Nunc ut tincidunt leo. Nulla at imperdiet augue. Etiam volutpat lectus vitae ex pharetra, nec maximus dolor tincidunt. Integer mattis, eros non auctor aliquam, nibh justo venenatis orci, at iaculis leo metus in est.",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id sem et enim commodo eleifend vitae non libero. Nunc ut tincidunt leo. Nulla at imperdiet augue. Etiam volutpat lectus vitae ex pharetra, nec maximus dolor tincidunt. Integer mattis, eros non auctor aliquam, nibh justo venenatis orci, at iaculis leo metus in est.",
        },
        {
            img: "https://source.unsplash.com/400x400?car",
            title: "Lorem ipsum dolor sit amet amet",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id sem et enim commodo eleifend vitae non libero. Nunc ut tincidunt leo. Nulla at imperdiet augue. Etiam volutpat lectus vitae ex pharetra, nec maximus dolor tincidunt. Integer mattis, eros non auctor aliquam, nibh justo venenatis orci, at iaculis leo metus in est.",
        },
    ];
    return (
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
            <header className="min-h-[60px] bg-primary-md relative p-6 flex justify-start items-center gap-3">
                <Link to="/home">
                    <ArrowLeftIcon className="size-7" />
                </Link>

                <h2 className="text-2xl font-bold">Notifikasi</h2>
            </header>
            <main className="w-full h-full relative bottom-0 left-0 px-8 pt-6 pb-4 text-black overflow-y-auto">
                <div className="bg-bg-3 w-full h-10 mb-4 relative text-white rounded-r-full rounded-l-full relative">
                    <div
                        className={`${type ? "translate-x-full" : "translate-x-0"} w-1/2 h-full absolute border-2 border-bg-3 bg-primary-low rounded-r-full rounded-l-full duration-500`}
                    ></div>
                    <div className="relative size-full flex justify-center items-center">
                        <label className="size-full text-center flex justify-center items-center">
                            <input
                                type="radio"
                                name="type"
                                id="berita"
                                onClick={() => setType(0)}
                                className="hidden peer"
                            />
                            <label htmlFor="berita" className="font-semibold">
                                Berita
                            </label>
                        </label>
                        <label className="size-full text-center flex justify-center items-center">
                            <input
                                type="radio"
                                name="type"
                                id="presensi"
                                onClick={() => setType(1)}
                                className="hidden"
                            />
                            <label htmlFor="presensi" className="font-semibold">
                                Presensi
                            </label>
                        </label>
                    </div>
                </div>
                {type ? (
                    <CardNotifikasiRiwayat datas={history} />
                ) : (
                    <CardNotifikasiBerita datas={news} />
                )}
            </main>
        </div>
    );
}
