import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Label, Textarea, FileInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/utils";
import apiXML from "../utils/apiXML";

export default function Izin() {
	const [alert, setAlert] = useState(false);
	const [imageUrl, setImageUrl] = useState(null);
	const inputRef = useRef();
	const { state } = useLocation();

	const submitHandler = (e) => {
		e.preventDefault();

		`["${imageUrl}"]`;
	};
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px) relative text-white">
			<header className="h-1/5 bg-primary-md relative p-6">
				<Link to="/presensi" className="absolute top-5">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-[2.125rem] font-bold absolute bottom-5">
					Bukti Pendukung
				</h2>
			</header>
			<main className="w-full h-full px-8 pt-8 pb-4">
				<form onSubmit={submitHandler}>
					<div className="max-w-md">
						<div className="mb-2 block">
							<Label
								htmlFor="comment"
								value="Keterangan"
								className="text-white text-base font-semibold"
							/>
						</div>
						<Textarea
							id="comment"
							placeholder="Berikan alasan...."
							required
							rows={6}
							className="text-md"
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
									setAlert(true);
									e.target.focus();
									e.target.classList.add(
										"focus:border-secondary-red",
									);
									e.target.classList.add("focus:border-2");
								} else {
									setAlert(false);
								}

								const file = e.target.files[0];

								if (file) {
									// Memanggil fungsi untuk mengonversi file gambar menjadi URL
									getImageUrl(file, (url) => {
										setImageUrl(url);
									});
								}
							}}
						/>
						{alert ? (
							<p className="text-xs font-semibold text-secondary-red">
								Harap upload file sesuai format yang telah
								ditentukan (*.jpg, *.jpeg, *.png, *.pdf)
							</p>
						) : null}
						<button
							type="submit"
							className="btn border-none w-full h-12 text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center mt-8"
						>
							Submit
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}