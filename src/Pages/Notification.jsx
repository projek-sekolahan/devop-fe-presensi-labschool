import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import {getFormData, parseJwt} from "../utils/utils"

function CardNotifikasi({ datas }) {
	return (
		<div className="flex flex-col gap-4">
			{datas.map((data, i) => {
				return (
					<div
						className="w-full h-fit bg-white rounded-xl text-black p-6 flex gap-2"
						key={i}
					>
						<div className="flex flex-col justify-center">
							{data.kode == 2 ? (
								<>
									<h4 className="font-semibold text-[12px] text-primary-low inline">
										Berita
										<span className="text-bg-3 ml-3 opacity-50">
											{data.jam}
										</span>
									</h4>
									<h4 className="font-semibold text-[12px]">
										{data.title}
									</h4>
								</>
							) : (
								<>
									<h4 className="font-semibold text-[12px] text-primary-low">
										Notifikasi
										<span className="text-bg-3 ml-3 opacity-50">
											{data.jam}
										</span>
									</h4>
									{data.kode == 1 ? (
										<h4 className="font-semibold text-[12px] text-secondary-green">
											Presensi Berhasil
										</h4>
									) : (
										<h4 className="font-semibold text-[12px] text-secondary-red">
											Presensi Gagal!
										</h4>
									)}
								</>
							)}

							<p className="text-bg-3 font-light text-[10px] text-justify">
								{data.desc}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default function Notification() {
	const data = [
		{
			kode: 1,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 0,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 2,
			title: "Prestasi SMA Labschool Unesa",
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 2,
			title: "Kegiatan P5 SMA Labschool Unesa",
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 1,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 0,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 1,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
		{
			kode: 0,
			jam: "09.32",
			desc: "Lorem ipsum dolor sit amet consectetur. Velit dolor turpis tristique justo libero vitae ipsum. Malesuada bibendum enim faucibus nisi a posuere",
		},
	];
	const keys = ["AUTH_KEY", "devop-sso", "csrf_token", "token", "param"]
	const values = [localStorage.getItem("AUTH_KEY"), localStorage.getItem("devop-sso"), localStorage.getItem("csrf"), localStorage.getItem("login_token"), "1, 2024-05-07"]
	apiXML.details(localStorage.getItem("login_token"), getFormData(keys, values)).then(res => {
		res = JSON.parse(res)
		console.log(parseJwt(res.data))
	})
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
			<header className="min-h-[60px] bg-primary-md relative p-6 flex justify-start items-center gap-3">
				<Link to="/home">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-2xl font-bold">Notifikasi</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 px-8 pt-6 pb-4 text-black overflow-y-auto">
				<CardNotifikasi datas={data} />
			</main>
		</div>
	);
}
