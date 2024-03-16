// import { LaptopBriefcaseRegular } from "@fluentui/react-icons";
import { Link, redirect } from "react-router-dom";
import { register } from "../utils/api.js";
import { getFormData } from "../utils/utils.js";
import { useRef, useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export default function Register() {
	console.log("nice change");
	const [role, setRole] = useState("");
	const nameRef = useRef();
	const numberRef = useRef();
	const emailRef = useRef();

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
				Swal.fire({
					titleText: res.data.title,
					text: "Harap periksa apakah nomor dan email belum digunakan!",
					icon: "error",
				});
			} else {
				Swal.fire({
					titleText: res.data.data.title,
					text: res.data.data.message.split("<br />".join("")),
					icon: "success",
				});
			}
		});
	};
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-16 relative">
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
