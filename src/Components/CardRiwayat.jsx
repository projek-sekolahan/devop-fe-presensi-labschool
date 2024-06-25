import { formatDate } from "../utils/utils";
import apiXML from "../utils/apiXML";
import { parseJwt, getFormData, handleSessionError } from "../utils/utils";
import { useState } from "react";
import Cookies from "js-cookie";
export default function CardRiwayat({ index, history, biodata }) {
	const [datas, setDatas] = useState(null);
	const [loading, setLoading] = useState(true);
	const clickHandler = () => {
		document.getElementById(`my_modal_${index}`).showModal();
		setDatas(null);
		const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token", "param"];
		let values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("devop-sso"),
			Cookies.get("csrf"),
			localStorage.getItem("login_token"),
			biodata.id.concat(",", history["Tanggal Presensi"]),
		];

		loading &&
			!datas &&
			apiXML
				.presensiPost(
					"detail_presensi",
					localStorage.getItem("AUTH_KEY"),
					getFormData(keys, values),
				)
				.then((res) => {
					res = JSON.parse(res);
					Cookies.set("csrf", res.csrfHash);
					setDatas(parseJwt(res.data).result);
					setLoading(false);
				})
				.catch((e) => console.log(e));
	};
	return (
		<>
			<button
				onClick={clickHandler}
				className="btn w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2"
			>
				<img
					src={biodata.img_location}
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
									: history["Status Masuk"] == null &&
										  history["Status Pulang"] == null &&
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
									: history["Keterangan"] == "Dinas Luar"
										? "Dinas Luar"
										: "Izin/Sakit"
						}`}
					</div>
				</div>
			</button>
			<dialog id={`my_modal_${index}`} className="modal">
				<div className="modal-box">
					{loading ? (
						<div className="size-full flex justify-center items-center">
							<span className="loading loading-spinner text-gray-500"></span>
						</div>
					) : (
						<>
							<h3 className="font-semibold text-xl mb-4">
								Detail
							</h3>
							{datas.map((data, i) => {
								return (
									<div key={i}>
										<div className="grid grid-cols-2 gap-4">
											<img
												src={`https://devop-sso.smalabschoolunesa1.sch.id/${data.foto_presensi}`}
												alt="foto_presensi"
												className="rounded-xl border-4 border-white"
											/>
											<div>
												<p className="font-medium text-md">
													{formatDate(
														data.tanggal_presensi,
													)}
												</p>
												<p className="text-sm font-normal">
													{data.waktu_presensi}
												</p>
												<div
													className={`${
														data.keterangan.split(
															" ",
														)[1] === "Normal"
															? "bg-secondary-green"
															: "bg-secondary-red"
													} justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
												>
													{data.keterangan}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</>
					)}
					<div className="modal-action">
						<form method="dialog">
							<button
								onClick={() => {
									setDatas(null);
									setLoading(true);
								}}
								className="btn"
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
