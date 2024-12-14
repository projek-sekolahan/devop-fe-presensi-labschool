export default function CardNotifikasiRiwayat({ datas }) {
	return (
		<div className="flex flex-col gap-4">
			{datas.map((data, i) => {
				return (
					<div
						className="w-full h-fit bg-white rounded-xl text-black p-4"
						key={i}
					>
						<div className="w-full flex gap-2 justify-between">
							<div className="flex flex-col">
								<p className="font-medium text-xs">
									{data.date}
								</p>
								<p className="text-xs font-normal">
									<span className="text-secondary-green">
										Masuk :{" "}
									</span>
									{data.checkIn}
								</p>
								<p className="text-xs font-normal">
									<span className="text-secondary-red">
										Keluar :{" "}
									</span>
									{data.checkOut}
								</p>
							</div>
							<div
								className={`${
									data.status == "Masuk"
										? "bg-secondary-green"
										: data.status == "Izin"
											? "bg-secondary-yellow"
											: "bg-secondary-red"
								} row-span-3 justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
							>
								{data.status}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
