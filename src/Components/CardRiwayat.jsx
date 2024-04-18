export default function CardRiwayat({ history, biodata }) {
	return (
		<div className="w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2">
			<img
				src={`https://devop-sso.smalabschoolunesa1.sch.id/${biodata.img_location}`}
				alt="photo_profile"
				className="size-12 rounded-full bg-white"
			/>
			<p className="font-bold text-base">{biodata.nama_lengkap}</p>
			<div className="w-full flex gap-2 justify-between">
				<div className="flex flex-col">
					<p className="font-medium text-xs">{history.date}</p>
					<p className="text-xs font-normal">
						<span className="text-secondary-green">Masuk : </span>
						{history.checkIn}
					</p>
					<p className="text-xs font-normal">
						<span className="text-secondary-red">Keluar : </span>
						{history.checkOut}
					</p>
				</div>
				<div
					className={`${
						history.status == "Masuk"
							? "bg-secondary-green"
							: history.status == "Izin"
								? "bg-secondary-yellow"
								: "bg-secondary-red"
					} row-span-3 justify-self-center self-center w-full max-w-28 mt-3 py-[0.4rem] text-center text-sm font-bold text-white rounded-md flex-shrink`}
				>
					{history.status}
				</div>
			</div>
		</div>
	);
}
