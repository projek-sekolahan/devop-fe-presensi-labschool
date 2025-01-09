import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import apiXML from "../utils/apiXML.js";
import { getFormData, parseJwt, addDefaultKeys } from "../utils/utils";
import { useState } from "react";
import Cookies from "js-cookie";

function CardNotifikasi({ datas }) {
	if (!Array.isArray(datas) || datas.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                    <h4 className="text-lg font-semibold">Warning</h4>
                </div>
                <p className="mt-2 text-sm">
                    Tidak ada data notifikasi yang tersedia. Harap coba lagi nanti.
                </p>
            </div>
        );
    }
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
	const [data, setData] = useState([]);
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
				localStorage.getItem("AUTH_KEY"),
				getFormData(combinedKeys, values),
			)
			.then((res) => {
				try {
					res = JSON.parse(res); // Validasi JSON parse
					const response = parseJwt(res.data.token);
					console.log("API Response:", response);
		
					if (response.data && Array.isArray(response.data)) {
						// Ambil array data dari response
						const notifications = Object.keys(parseJwt(res.data.token))
						.filter((key) => !isNaN(key)) // Ambil key numerik
						.map((key) => response[key]); // Map key menjadi array
						console.log("Notifications:", response.data);
						setData(response.data); // Set data dari API
					} else {
						console.warn("Unexpected API format:", response);
						setData([]); // Default ke array kosong jika format salah
					}
		
					Cookies.set("csrf", response.csrfHash);
					setLoad(false);
				} catch (error) {
					console.error("Error parsing response:", error);
					setData([]); // Jika parsing gagal, set data kosong
					setLoad(false);
				}
			})
			.catch((err) => {
				console.error("API Error:", err);
		
				try {
					const errorResponse = JSON.parse(err.responseText);
					console.log("Error Response:", errorResponse);
		
					setData(errorResponse.data || []); // Validasi data error
					Cookies.set("csrf", errorResponse.csrfHash);
				} catch (parseError) {
					console.error("Error parsing error response:", parseError);
					setData([]); // Default ke array kosong jika error tidak sesuai
				}
		
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
				) : (
					<CardNotifikasi datas={data} />
				)}
			</main>
		</div>
	);
}