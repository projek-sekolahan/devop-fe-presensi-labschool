import {Link} from "react-router-dom";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";

export default function Riwayat(){
    return(
        <div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
            <header className="h-1/5 min-h-[130px] bg-primary-md relative p-6">
				<Link to="/home" className="absolute top-5">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-4xl font-bold absolute bottom-5">
					Riwayat Presensi
				</h2>
			</header>
            <main className="w-full h-4/5 relative bottom-0 left-0 px-8 pt-10 pb-4 text-black flex flex-col gap-4 overflow-y-auto">
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