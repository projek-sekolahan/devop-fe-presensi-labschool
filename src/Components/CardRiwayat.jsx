export default function CardRiwayat({ data }) {
	return (
		<div className="w-full h-fit bg-white rounded-xl text-black flex flex-col justify-center items-center p-4 gap-2">
			<img
				src="https://source.unsplash.com/woman-in-white-shirt-holding-green-plant-6l2SLnzdF-A/600x600"
				alt="photo_profile"
				className="size-12 rounded-full bg-white"
			/>
			<p className="font-bold text-base">Fata Nadhira Putri</p>
			<div className="w-full grid grid-rows-3 grid-flow-col">
				<p className="font-medium text-sm">{data.date}</p>
				<p className="text-xs font-normal">
					<span className="text-secondary-green">Masuk : </span>
					{data.checkIn}
				</p>
				<p className="text-xs font-normal">
					<span className="text-secondary-red">Keluar : </span>
					{data.checkOut}
				</p>
				<div className={`${data.status == 'Masuk' ? 'bg-secondary-green' : (data.status == 'Izin' ? "bg-secondary-yellow" : "bg-secondary-red")} row-span-3 justify-self-center self-center w-28 mt-3 py-[0.4rem] px-5 text-center text-sm font-bold text-white rounded-md`}>
					{data.status}
				</div>
			</div>
		</div>
	);
}
