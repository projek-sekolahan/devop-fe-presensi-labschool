import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import { getFormData, parseJwt, addDefaultKeys } from "../utils/utils";
import { useState } from "react";
import Cookies from "js-cookie";

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
							{data.category != "notifikasi" ? (
								<>
									<h4 className="font-semibold text-[12px] text-primary-low inline">
										Berita
										<span className="text-bg-3 ml-3 opacity-50">
											{data.created_at.slice(10, 16)}
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
											{data.created_at.slice(10, 16)}
										</span>
									</h4>
									{data.title == "Presensi Berhasil" ? (
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
								{data.message}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default function Notification() {
	const [data, setData] = useState(null);
	const [load, setLoad] = useState(true);

	const keys = ["AUTH_KEY", "token"];
	const combinedKeys = addDefaultKeys(keys);
	const values = [
		localStorage.getItem("AUTH_KEY"),
		localStorage.getItem("login_token"),
		localStorage.getItem("devop-sso"),
		Cookies.get("csrf"),
	];
	load &&
		!data &&
		apiXML
			.notificationsPost(
				'detail',
				localStorage.getItem("login_token"),
				getFormData(combinedKeys, values),
			)
			.then((res) => {
				res = JSON.parse(res);
				setData(parseJwt(res.data));
				Cookies.set("csrf", res.csrfHash);
				setLoad(false);
			}).catch((err) => {
				err = JSON.parse(err.responseText);
				setData(err.data);
				Cookies.set("csrf", err.csrfHash);
				setLoad(false);
			});
	return (
		<div className="bg-primary-low font-primary flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative text-white overflow-y-hidden">
			<header className="min-h-[60px] bg-primary-md relative p-6 flex justify-start items-center gap-3">
				<Link to="/home">
					<ArrowLeftIcon className="size-7" />
				</Link>

				<h2 className="text-2xl font-bold">Notifikasi</h2>
			</header>
			<main className="w-full h-full relative bottom-0 left-0 px-8 pt-6 pb-4 text-black overflow-y-auto">
				{load ? (
					<div className="size-full flex justify-center items-center">
						<span className="loading loading-spinner text-white"></span>
					</div>
				) : data.info == "error" ? (
					<div className="size-full flex justify-center items-center">
						<p className="text-white">Belum ada notifikasi.</p>
					</div>
				) : (
					<CardNotifikasi datas={data} />
				)}
			</main>
		</div>
	);
}