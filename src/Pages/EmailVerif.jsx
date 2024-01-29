import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function EmailVerif() {
	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative">
            <Link to="/">
                <ArrowLeftIcon className="size-7 absolute top-8 left-6"/>
            </Link>
			<img
				src="/src/assets/icons/splash.svg"
				alt="labschool-unesa-logo"
				className="size-[241px] m-auto mt-24"
			/>
			<div className="w-full h-1/2 mt-auto bottom-0 bg-primary-md rounded-t-[2rem] p-6 sm:p-8">
				<h2 className="font-bold text-4xl">Email Verification</h2>
				<p className="font-thin text-xs">
					Enter the verification code that was sended to your email
					addreas
				</p>
				<form>
					<div className="flex justify-between my-8">
						<input
							type="number"
							id="n-1"
							className="size-20 bg-white text-black font-normal text-center rounded-[1.25rem]"
						/>
						<input
							type="number"
							id="n-2"
							className="size-20 bg-white text-black font-normal text-center rounded-[1.25rem]"
						/>
						<input
							type="number"
							id="n-3"
							className="size-20 bg-white text-black font-normal text-center rounded-[1.25rem]"
						/>
						<input
							type="number"
							id="n-4"
							className="size-20 bg-white text-black font-normal text-center rounded-[1.25rem]"
						/>
					</div>
					<p className="text-center font-thin text-xs">
						Didn&apos;t receive the verification code?
						<Link className="text-center font-bold">
							{" "}
							Click Here
						</Link>
					</p>
					<Link to="/verification">
						<button
							type="submit"
							className="w-full text-primary-md font-semibold bg-white hover:bg-primary-300 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-xl text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-8"
						>
							Create my account
						</button>
					</Link>
				</form>
			</div>
		</div>
	);
}
