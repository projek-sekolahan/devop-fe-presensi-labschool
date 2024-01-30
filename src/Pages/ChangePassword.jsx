import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ChangePassword() {
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/">
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<img
				src="/img/reset_pwd.png"
				alt="reset"
				className="size-[calc(100vh/2+30px)] absolute top-0 left-0 z-0"
			/>
			<div className="w-full h-1/2 mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8 relative z-10">
				<h2 className="font-bold text-4xl">Ganti Password</h2>
				<div className="my-6 space-y-4 md:space-y-6">
					<form
						className="space-y-4 md:space-y-6 flex flex-col gap-2"
						action="#"
					>
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
						<input
							type="password"
							name="password"
							id="password"
							placeholder="New password (8 or more characters)"
							className="bg-primary-md border-white border-[1px] text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
							required=""
						/>

						<Link to="/profile">
							<button
								type="submit"
								className="w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								Ganti Password
							</button>
						</Link>
					</form>
				</div>
			</div>
		</div>
	);
}
