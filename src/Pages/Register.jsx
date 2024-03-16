// import { LaptopBriefcaseRegular } from "@fluentui/react-icons";
import { Link, redirect } from "react-router-dom";
import { register } from "../utils/api.js";
import { getFormData } from "../utils/utils.js";
import { useRef, useState } from "react";
import Cookies from "js-cookie";
import ModalNotification from "/src/Components/ModalNotification";

export default function Register() {
	console.log("nice change");
	const [response, setResponse] = useState(null);
	const [status, setStatus] = useState();
	const [role, setRole] = useState("");
	const nameRef = useRef();
	const numberRef = useRef();
	const emailRef = useRef();
	const messageRef = useRef();
	const titleRef = useRef();

	const submitHandler = (e) => {
		e.preventDefault();
		const keys = [
			"username",
			"phone",
			"namaLengkap",
			"sebagai",
			"csrf_token",
		];
		const csrf_token = Cookies.get("ci_sso_csrf_cookie");
		const values = [
			emailRef.current.value,
			numberRef.current.value,
			nameRef.current.value,
			role,
			csrf_token,
		];
		register(getFormData(keys, values), (res) => {
			if (res.status != 200 || res.data.info == "error") {
				// setStatus("false");
				setResponse(res.data);
				titleRef.current.innerText = res.data.title;
				messageRef.current.innerText =
					"Register Error, Harap periksa apakah data yang anda masukkan benar, pastikan tidak menggunakan email yang sudah terdaftar.";
				document.getElementById("my_modal_3").showModal();
				redirect(`/${res.data.location}`);
			} else {
				// setStatus("true");
				setResponse(res.data.data);
				titleRef.current.innerText = res.data.data.title;
				messageRef.current.innerHTML = res.data.data.message;
				document.getElementById("my_modal_3").showModal();
				redirect(`/${res.data.data.location}`);
			}
		});
	};
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-16 relative">
			<dialog id="my_modal_3" className="modal text-gray-600">
				<div className="modal-box p-0 rounded-md">
					<div className="relative flex items-center justify-between px-2 py-2 font-bold text-white bg-red-500 rounded-t">
						<div className="relative flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
								/>
							</svg>

							<span ref={titleRef}></span>
						</div>
						<form className="relative" method="dialog">
							<button>
								<svg
									className="w-5 h-5 text-green-300 fill-current hover:text-white"
									role="button"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
								>
									<title>Close</title>
									<path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
								</svg>
							</button>
						</form>
					</div>
					<div className="p-3 bg-white border border-gray-300 rounded-b shadow-lg">
						<span className="block" ref={messageRef}></span>
					</div>
				</div>
			</dialog>
			<h1 className="text-center text-4xl font-bold text-white ">
				Register
			</h1>
			<small className="text-center text-xs font-medium text-white mt-1">
				Selamat datang!
			</small>
			<div className="w-full h-fit bg-primary-md rounded-t-[2rem] absolute bottom-0 lef-0 p-4 pb-8">
				<form
					className="p-6 space-y-4 md:space-y-6 sm:p-8"
					onSubmit={submitHandler}
				>
					<div className="flex justify-center gap-8">
						<label className="flex flex-col items-center gap-1">
							<input
								type="radio"
								name="sebagai"
								onClick={(e) => setRole(e.target.value)}
								id="siswa"
								value="4"
								className="hidden peer"
								required
							/>
							<img
								src="/Icons/student.svg"
								className="size-[80px] bg-white rounded-[20px] peer-checked:ring-4 peer-checked:ring-blue-400"
								alt="student-icon"
							></img>
							<label htmlFor="siswa" className="text-base">
								Siswa
							</label>
						</label>
						<label className="flex flex-col items-center gap-1">
							<input
								type="radio"
								name="sebagai"
								onClick={(e) => setRole(e.target.value)}
								id="guru"
								value="5"
								className="hidden peer"
								required
							/>
							<img
								src="/Icons/teacher.svg"
								className="w-[80px] h-[80px] bg-white rounded-[20px] peer-checked:ring-4 peer-checked:ring-blue-400"
								alt="teacher-icon"
							></img>
							<label htmlFor="guru" className="text-base">
								Guru
							</label>
						</label>
						<label className="flex flex-col items-center gap-1">
							<input
								type="radio"
								name="sebagai"
								onClick={(e) => setRole(e.target.value)}
								id="karyawan"
								value="6"
								className="hidden peer"
								required
							/>
							<img
								src="/Icons/employee.svg"
								className="w-[80px] h-[80px] bg-white rounded-[20px] peer-checked:ring-4 peer-checked:ring-blue-400"
								alt="employee-icon"
							></img>
							<label htmlFor="karyawan" className="text-base">
								Karyawan
							</label>
						</label>
					</div>
					<div className="space-y-4 md:space-y-6 flex flex-col gap-2">
						<input
							id="name"
							name="namaLengkap"
							ref={nameRef}
							className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="Nama Lengkap"
							required={+true}
						/>
						<input
							id="number"
							name="phone"
							ref={numberRef}
							className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4 autofill:bg-red-500"
							placeholder="No. Telepon"
							required={+true}
						/>

						<input
							type="email"
							name="username"
							ref={emailRef}
							id="username"
							className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="Email"
							required=""
						/>
						<button
							type="submit"
							className="btn border-none w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center"
						>
							Create my account
						</button>
					</div>
					<div
						id="line"
						className="w-full border-t-[0.25px] border-white h-0 relative top-4"
					>
						<p className="absolute text-center left-[calc(50%-1.25rem)] top-[-0.85rem] z-10 text-white bg-primary-md w-10">
							or
						</p>
					</div>
				</form>
				<p className="text-center text-sm font-light text-white dark:text-gray-400 mt-5">
					Sudah memiliki akun?{" "}
					<Link
						to="/login"
						className="font-medium underline text-white hover:underline dark:text-primary-500"
					>
						Login
					</Link>
				</p>
			</div>
		</div>
	);
}
