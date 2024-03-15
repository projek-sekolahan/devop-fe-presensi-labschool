export default function ModalNotification({ status, data }) {
	if (status) {
		return (
			<dialog id="my_modal_3" className="modal text-gray-600">
				<div className="modal-box p-0 rounded-md">
					<div className="relative flex items-center justify-between px-2 py-2 font-bold text-white bg-green-500 rounded-t">
						<div className="relative flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="inline w-6 h-6 mr-2 opacity-75"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
								/>
							</svg>
							<span>{data ? data.data.title : null}</span>
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
						<span className="block">
							{data ? data.data.message : null}
						</span>
					</div>
				</div>
			</dialog>
		);
	} else {
		return (
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

							<span>{data ? data.title : null}</span>
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
						<span className="block">
							Register Error, Harap periksa apakah data yang anda
							masukkan benar, pastikan tidak menggunakan email
							yang sudah terdaftar.
						</span>
					</div>
				</div>
			</dialog>
		);
	}
}
