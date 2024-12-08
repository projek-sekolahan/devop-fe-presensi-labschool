export default function CardNotifikasiBerita({ datas }) {
	return (
		<div className="flex flex-col gap-4">
			{datas.map((data, i) => {
				return (
					<div
						className="w-full h-fit bg-white rounded-xl text-black p-3 flex gap-2"
						key={i}
					>
						<img src={data.img} className="size-28 rounded-xl" />
						<div className="flex flex-col justify-center">
							<h4 className="font-semibold text-md">
								{data.title}
							</h4>
							<p className="text-bg-3 font-light text-sm">
								{data.desc}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
