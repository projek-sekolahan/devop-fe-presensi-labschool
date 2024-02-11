import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Label, Textarea, FileInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { useState, useEffect } from "react";

export default function Sakit() {
	const [alert, setAlert] = useState(false);
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
						<Label
							htmlFor="file-upload-helper-text"
							value="Upload bukti"
							className="text-white text-base font-semibold"
						/>
					</div>
					<FileInput
						id="file-upload-helper-text"
						accept=".jpg, .jpeg, .png, .pdf"
						onChange={(e) => {
							const validExt = e.target.accept.split(", ");
							const fileName = e.target.value;
							let extFile = fileName.lastIndexOf(".");
							extFile = fileName
								.substr(extFile, fileName.length)
								.toLowerCase();

							if (!validExt.includes(extFile)) {
								e.target.value = "";
                                setAlert(true);
                                e.target.focus();
                                e.target.classList.add("focus:border-secondary-red")
                                e.target.classList.add("focus:border-2")
							}else{
                                setAlert(false)
                            }
						}}
                        
					/>
					{alert ? (
                        <p className="text-xs font-semibold text-secondary-red">Harap upload file sesuai format yang telah ditentukan</p>
                    ):null}
					<button
					type="submit"
					className="btn border-none w-full h-12 text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center mt-8"
				>
					Submit
				</button>
				</div>
			</main>
		</div>
	);
}
