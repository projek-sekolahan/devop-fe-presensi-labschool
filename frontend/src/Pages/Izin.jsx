import { Textarea } from "flowbite-react";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getImageUrl, getFormData, loading, alertMessage, parseJwt, handleSessionError, addDefaultKeys, getCombinedValues } from "../utils/utils";
import ApiService from "../utils/ApiService";
import Cookies from "js-cookie";
import Layout from "../Components/Layout";

export default function Izin() {
	const [Alert, setAlert] = useState({ ext: false, size: false });
	const [imageUrl, setImageUrl] = useState(null);
	const inputRef = useRef();
	const keteranganRef = useRef();
	const { state } = useLocation();

	if (!state) {
		window.location.replace("/home");
	}

	const submitHandler = async (e) => {
		e.preventDefault();

		/* let keys = ["AUTH_KEY", "token"];
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
		} */

		const keys = addDefaultKeys(["AUTH_KEY", "token"]);
		const formValues = [];
		const storedValues = getCombinedValues(keys.slice(0, 2));
		let updatedCombinedKeys = [...keys];
		
		if (localStorage.getItem("group_id") == "4" || state.ket[0] === "non-dinas") {
			updatedCombinedKeys.push("status_dinas", "status_kehadiran", "keterangan_kehadiran");
			formValues.push("non-dinas", state.ket[state.ket.length - 1], keteranganRef.current.value);
		} else {
			updatedCombinedKeys.push("status_dinas", "status_kehadiran", "keterangan_kehadiran");
			formValues.push("non-dinas", ...state.ket, keteranganRef.current.value);
		}
		
		if (imageUrl) {
			updatedCombinedKeys.push("foto_surat");
			formValues.push(`["${imageUrl}"]`);
		}
		
		const values = [...storedValues, ...formValues];
		const formData = getFormData(updatedCombinedKeys, values);
		const response = await ApiService.processApiRequest("presensi/process", formData, localStorage.getItem("AUTH_KEY"), true);

        if (response?.data) {
            const hasil = parseJwt(response.data.token);
			console.log("✅ Final parse JWT:", hasil);
				return false;
				alertMessage(hasil.title, hasil.message, hasil.info, () =>
					window.location.replace("/home"),
				);
        }

		/* loading("Loading", "Data sedang diproses...");
		ApiService
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
			}); */
	};
	return (
		<div className="presensi-container">
			<Layout link={
						localStorage.getItem("group_id") == "4"
							? "/presensi"
							: "/presensi/staff"
					} label="Bukti Pendukung">
				<div className="custom-card mt-4">
					<form onSubmit={submitHandler}>
						<div className="input-group">
							<label htmlFor="comment" className="input-label">Keterangan</label>
							<Textarea
								id="comment"
								placeholder="Berikan alasan...."
								required
								rows={6}
								className="text-md"
								ref={keteranganRef}
							></Textarea>
						</div>
						<div className="input-group">
							<label htmlFor="file-upload-helper-text" className="input-label">Upload bukti{" "}</label>
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
							<button type="submit" className="btn-submit mt-2">Submit</button>
						</div>
					</form>
				</div>			
			</Layout>
		</div>
	);
}
