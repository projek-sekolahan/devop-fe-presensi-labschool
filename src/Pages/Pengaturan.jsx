import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Pengaturan() {
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
			<header className="h-[60px] min-h-[60px] bg-primary-md p-4 pl-6 flex">
				<Link to="/home">
					<ArrowLeftIcon className="size-7 absolute" />
				</Link>

				<h2 className="text-lg font-bold mx-auto">Pengaturan</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 pt-5 px-7 pb-4 text-black flex flex-col gap-4 overflow-y-auto bg-white">
				<div className="form-control">
					<label className="label">
						<span className="font-medium text-lg text-primary-low">
							Notifikasi
						</span>
						<button
							id="switcher"
							className="w-14 h-7 px-1 bg-primary-low rounded-2xl flex items-center shadow-inner"
							onClick={() => {
								const switcher = document.getElementById("switcher");
                                const circle = document.getElementById('circle')

								if (
									switcher.classList.contains("bg-primary-low")
								) {
									switcher.classList.replace(
										"bg-primary-low",
										"bg-bg-2"
									);
                                    circle.classList.replace(
                                        "translate-x-[1.7rem]",
                                        "translate-x-0"
                                    )
								} else {
									switcher.classList.replace(
										"bg-bg-2",
										"bg-primary-low"
									);
                                    circle.classList.replace(
                                        "translate-x-0",
                                        "translate-x-[1.7rem]"
                                    )
								}
							}}
						>
							<span id='circle' className="size-5 bg-white rounded-full shadow-xl translate-x-[1.7rem] transition delay duration-500 ease-in-out"></span>
						</button>
					</label>
				</div>
			</main>
		</div>
	);
}
