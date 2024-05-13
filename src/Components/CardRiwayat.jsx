import { formatDate } from "../utils/utils";

export default function CardRiwayat({ history, biodata }) {
	return (
		<button className="btn w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2">
			<img
				src={`https://devop-sso.smalabschoolunesa1.sch.id/${biodata.img_location}`}
				alt="photo_profile"
				className="size-12 rounded-full bg-white"
			/>
			<p className="font-bold text-base">{history["Nama Lengkap"]}</p>
			<div className="w-full flex gap-2 justify-between">
				<div className="flex flex-col">
					<p className="font-medium text-xs">
						{formatDate(history["Tanggal Presensi"])}
					</p>
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
						history["Status Masuk"] == "Masuk Normal" &&
						history["Status Pulang"] == "Pulang Normal"
							? "bg-secondary-green"
							: history["Status Masuk"] == "Terlambat Masuk" ||
							  history["Status Pulang"] == "Pulang Cepat"
							? "bg-secondary-red"
							: history["Status Masuk"] == NULL &&
							  history["Status Pulang"] == NULL &&
							  history["Keterangan"] == "Dinas Luar"
							? "bg-gray-600"
							: "bg-secondary-yellow"
					} row-span-3 justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
				>
					{`${
						history["Status Masuk"] == "Masuk Normal" &&
						history["Status Pulang"] == "Pulang Normal"
							? "Normal"
							: history["Status Masuk"] == "Terlambat Masuk" ||
							  history["Status Pulang"] == "Pulang Cepat"
							? "Tidak Normal"
							: history["Status Masuk"] == NULL &&
							  history["Status Pulang"] == NULL &&
							  history["Keterangan"] == "Dinas Luar"
							? "Dinas Luar"
							: "Izin/Sakit"
					}`}
				</div>
			</div>
		</button>
	);
}
