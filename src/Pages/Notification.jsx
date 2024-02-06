import {Link} from "react-router-dom";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";

export default function Notification(){
    return(
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
            <header className="min-h-[60px] bg-primary-md relative p-6 flex justify-start items-center gap-3">
				<Link to="/home">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-2xl font-bold">
					Notifikasi
				</h2>
			</header>
            <main className="w-full h-full relative bottom-0 left-0 px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
                <div className="bg-secondary-red w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span className="text-secondary-red">07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-yellow w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span>07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-green w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span>07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-red w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span className="text-secondary-red">07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-red w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span className="text-secondary-red">07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-red w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span className="text-secondary-red">07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
                <div className="bg-secondary-red w-full rounded-xl">
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Ananda, </h2>
                    <div className="bg-white pl-3 py-1 text-sm font-normal">
                        <p>Hari, Tanggal : Rabu, 23 Februari 2024</p>
                        <p>Jam Masuk : <span className="text-secondary-red">07:15 WIB (Terlambat)</span></p>
                        <p>Jam Pulang : 15:00 WIB</p>
                    </div>
                    <h2 className="font-bold text-lg text-white pl-3 py-1">Status Presensi : </h2>
                </div>
            </main>
        </div>
    )
}