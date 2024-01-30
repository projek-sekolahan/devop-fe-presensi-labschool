import { Link } from "react-router-dom";

export default function Register() {
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] pt-8">
			<h1 className="text-center text-4xl font-bold text-white ">
				Register
			</h1>
			<small className="text-center text-xs font-medium text-white mt-1">
				Selamat datang!
			</small>
			<div className="w-full h-full bg-primary-md rounded-t-[2rem] mt-[6.25rem]">
				<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
					<div id="role" className="flex justify-center gap-8">
						<figure>
							<img
								src="/Icons/student.svg"
								className="w-[80px] h-[80px] bg-white rounded-[20px]"
							></img>
							<figcaption className="text-center text-white text-xs font-normal mt-1">
								Siswa
							</figcaption>
						</figure>
						<figure>
							<img
								src="/Icons/teacher.svg"
								className="w-[80px] h-[80px] bg-white rounded-[20px]"
							></img>
							<figcaption className="text-center text-white text-xs font-normal mt-1">
								Guru
							</figcaption>
						</figure>
						<figure>
							<img
								src="/Icons/employee.svg"
								className="w-[80px] h-[80px] bg-white rounded-[20px]"
							></img>
							<figcaption className="text-center text-white text-xs font-normal mt-1">
								Karyawan
							</figcaption>
						</figure>
					</div>
					<form
						className="space-y-4 md:space-y-6 flex flex-col gap-2"
						action="#"
					>
						<input
							id="name"
							className="bg-primary-md border-white border-[1px] text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="Nama Lengkap"
							required=""
						/>
						<input
							id="number"
							className="bg-primary-md border-white border-[1px] text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="No. Telepon"
							required=""
						/>

						<input
							type="email"
							name="email"
							id="email"
							className="bg-primary-md border-white border-[1px] text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							placeholder="Email"
							required=""
						/>

						<input
							type="password"
							name="password"
							id="password"
							placeholder="Password (8 or more characters)"
							className="bg-primary-md border-white border-[1px] text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							required=""
						/>
						<Link to="/verification">
							<button
								type="submit"
								className="w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								Create my account
							</button>
						</Link>
					</form>
					<div
						id="line"
						className="w-full border-t-[0.25px] border-white h-0 relative top-4"
					>
						<p className="absolute text-center left-[calc(50%-1.25rem)] top-[-0.85rem] z-10 text-white bg-primary-md w-10">
							or
						</p>
					</div>
				</div>
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
