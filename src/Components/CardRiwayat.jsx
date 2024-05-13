import { formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import { parseJwt, getFormData } from "../utils/utils";
import { useState } from "react";

export default function CardRiwayat({ history, biodata }) {
	const [data, setData] = useState(null);
	const [load, setLoad] = useState(true);

	const clickHandler = () => {
		document.getElementById("my_modal_1").showModal();

		const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token", "param"];
		let values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("devop-sso"),
			localStorage.getItem("csrf"),
			localStorage.getItem("login_token"),
			biodata.id.concat(",", history["Tanggal Presensi"]),
		];

		load &&
			!data &&
			apiXML
				.details(
					localStorage.getItem("AUTH_KEY"),
					getFormData(keys, values)
				)
				.then((res) => {
					res = JSON.parse(res);
					localStorage.removeItem("csrf");
					localStorage.setItem("csrf", res.csrfHash);
					setLoad(false);
					setData(parseJwt(res.data).result);
				});
	};
	return (
		<>
			<button
				onClick={clickHandler}
				className="btn w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2"
			>
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
							<span className="text-secondary-green">
								Masuk :{" "}
							</span>
							{history["Jam Masuk"]}
						</p>
						<p className="text-xs font-normal">
							<span className="text-secondary-red">
								Keluar :{" "}
							</span>
							{history["Jam Pulang"]}
						</p>
					</div>
					<div
						className={`${
							history["Status Masuk"] == "Masuk Normal" &&
							history["Status Pulang"] == "Pulang Normal"
								? "bg-secondary-green"
								: history["Status Masuk"] ==
										"Terlambat Masuk" ||
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
								: history["Status Masuk"] ==
										"Terlambat Masuk" ||
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
			<dialog id="my_modal_1" className="modal">
				<div className="modal-box">
					{load ? (
						<div className="size-full flex justify-center items-center">
							<span className="loading loading-spinner text-gray-500"></span>
						</div>
					) : (
						<div>
							<h3>Detail</h3>
							<div className="grid grid-cols-2">
								<img
									src={data.foto_presensi}
									alt="foto_presensi"
								/>
								<div>
									<p>{formatDate(data.tanggal_presensi)}</p>
									<p>{data.waktu_presensi}</p>
									<div
										className={`${
											data.keterangan.split(" ")[1] ===
											"Normal"
												? "bg-secondary-green"
												: "bg-secondary-red"
										} justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
									>
										{data.keterangan}
									</div>
								</div>
							</div>
						</div>
					)}
					<div className="modal-action">
						<form method="dialog">
							{/* if there is a button in form, it will close the modal */}
							<button className="btn">Close</button>
						</form>
					</div>
				</div>
			</dialog>
		</>
	);
}
