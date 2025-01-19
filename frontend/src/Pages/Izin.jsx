import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Label, Textarea, FileInput } from "flowbite-react";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
	getImageUrl,
	getFormData,
	loading,
	alertMessage,
	parseJwt,
	handleSessionError,
	addDefaultKeys,
} from "../utils/utils";
import apiXML from "../utils/apiXML";
import Cookies from "js-cookie";

export default function Izin() {
	const [Alert, setAlert] = useState({ ext: false, size: false });
	const [imageUrl, setImageUrl] = useState(null);
	const inputRef = useRef();
	const keteranganRef = useRef();
	const { state } = useLocation();

	if (!state) {
		window.location.replace("/home");
	}

	const submitHandler = (e) => {
		e.preventDefault();

		let keys = ["AUTH_KEY", "token"];
		const combinedKeys = addDefaultKeys(keys);
		let values = [
			localStorage.getItem("AUTH_KEY"),
			localStorage.getItem("login_token"),
			localStorage.getItem("devop-sso"),
			Cookies.get("csrf"),
		];
		let updatedCombinedKeys = [...combinedKeys];
		if (
			localStorage.getItem("group_id") == "4" ||
			state.ket[0] === "non-dinas"
		) {
			updatedCombinedKeys = [
				...updatedCombinedKeys,
				"status_dinas",
				"status_kehadiran",
				"keterangan_kehadiran",
			];

			values = [
				...values,
				"non-dinas",
				state.ket[state.ket.length - 1],
				keteranganRef.current.value,
			];
		} else {
			updatedCombinedKeys = [
				...updatedCombinedKeys,
				"status_dinas",
				"status_kehadiran",
				"keterangan_kehadiran",
			];
			values = [
				...values,
				"non-dinas",
				...state.ket,
				keteranganRef.current.value,
			];
		}

		if (imageUrl) {
			updatedCombinedKeys = [...updatedCombinedKeys, "foto_surat"];

			values = [...values, `["${imageUrl}"]`];
		}
		loading("Loading", "Data sedang diproses...");
		apiXML
			.presensiPost(
				"process",
				localStorage.getItem("AUTH_KEY"),
				getFormData(updatedCombinedKeys, values),
			)
			.then((res) => {
				res = JSON.parse(res);
				const hasil = parseJwt(res.data);
				Cookies.set("csrf", res.csrfHash);
				alertMessage(hasil.title, hasil.message, hasil.info, () =>
					window.location.replace("/home"),
				);
			})
			.catch((err) => {
				handleSessionError(err, "/login");
			});
	};
	return (
		<div className="presensi-container">
			<header>
				<Link to={
						localStorage.getItem("group_id") == "4"
							? "/presensi"
							: "/presensi/staff"
					}>
					<ArrowLeftIcon className="w-6 h-6 text-white" />
				</Link>
				<h1 className="presensi-section-container">Bukti Pendukung</h1>
			</header>
			<main>
				<div className="custom-card">
					<form onSubmit={submitHandler}>
						<div className="max-w-md">
							<div className="mb-2 block">
								<label
									htmlFor="comment"
									className="text-white text-base font-semibold"
								>
									Keterangan
								</label>
							</div>
							<Textarea
								id="comment"
								placeholder="Berikan alasan...."
								required
								rows={6}
								className="text-md"
								ref={keteranganRef}
							></Textarea>
						</div>
						<div className="mt-4">
							<div className="mb-2">
								<label
									htmlFor="file-upload-helper-text"
									className="text-white text-base font-semibold"
								>
									Upload bukti{" "}
								</label>
							</div>
							<input
								type="file"
								id="file-upload-helper-text"
								accept=".jpg, .jpeg, .png, .pdf"
								className="whitespace-nowrap w-full rounded-xl bg-white text-gray-500 text-sm"
								ref={inputRef}
								required={state.kode == 3 ? false : true}
								onChange={(e) => {
									const validExt = e.target.accept.split(", ");
									const fileName = e.target.value;
									let extFile = fileName.lastIndexOf(".");
									extFile = fileName
										.substr(extFile, fileName.length)
										.toLowerCase();

									if (!validExt.includes(extFile) && fileName) {
										e.target.value = "";
										setAlert({ ext: true, size: false });
										e.target.focus();
										e.target.classList.add(
											"focus:border-secondary-red",
										);
										e.target.classList.add("focus:border-2");
									} else {
										setAlert({ ext: false, size: false });
									}

									const file = e.target.files[0];

									if (file) {
										// Memanggil fungsi untuk mengonversi file gambar menjadi URL
										if (file.size / 1024 < 750) {
											setAlert({ ext: false, size: false });
											getImageUrl(file, (url) => {
												setImageUrl(url);
											});
										} else {
											setAlert({ ext: false, size: true });
											e.target.value = "";
										}
									}
								}}
							/>
							{Alert.ext ? (
								<p className="text-xs font-semibold text-secondary-red">
									Harap upload file sesuai format yang telah
									ditentukan (*.jpg, *.jpeg, *.png, *.pdf)
								</p>
							) : Alert.size ? (
								<p className="text-xs font-semibold text-secondary-red">
									Harap upload file dengan ukuran kurang dari
									750Kb
								</p>
							) : null}
							<button
								type="submit"
								className="btn"
							>
								Submit
							</button>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
}
