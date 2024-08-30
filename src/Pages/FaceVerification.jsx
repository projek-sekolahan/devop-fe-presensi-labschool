import { PiUserFocusThin } from "react-icons/pi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { alertMessage } from "../utils/utils";

export default function FaceVerification() {
	const { state } = useLocation();
	const navigate = useNavigate();

	// Fungsi untuk mengonversi derajat menjadi radian
	function degreesToRadians(degrees) {
		return (degrees * Math.PI) / 180;
	}

	// Fungsi untuk menghitung jarak antara dua titik latitude dan longitude menggunakan formula Haversine
	function calculateDistance(lat1, lon1, lat2, lon2) {
		const earthRadiusKm = 6371; // Radius bumi dalam kilometer

		const dLat = degreesToRadians(lat2 - lat1);
		const dLon = degreesToRadians(lon2 - lon1);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(degreesToRadians(lat1)) *
				Math.cos(degreesToRadians(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const distance = earthRadiusKm * c; // Jarak dalam kilometer

		return Math.round(distance * 1000, 2);
	}

	const coordinat = {
		min_longitude: 112.6651,
		longitude: 112.6645,
		max_longitude: 112.6638,
		min_latitude: -7.3004,
		latitude: -7.2998,
		max_latitude: -7.2994,
	};

	const options = {
		enableHighAccuracy: true,
		timeout: 30000,
		maximumAge: 30000,
	};

	const success = (position) => {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		if (
			latitude >= coordinat.min_latitude &&
			latitude <= coordinat.max_latitude &&
			longitude <= coordinat.min_longitude &&
			longitude >= coordinat.max_longitude
		) {
			alertMessage("success", "Done", "Anda berada di area sekolah", () =>
				navigate("/facecam", {
					state: [
						...state,
						JSON.stringify({
							longitude: longitude.toString(),
							latitude: latitude.toString(),
						}),
					],
				}),
			);
		} else {
			const distance = calculateDistance(
				latitude,
				longitude,
				coordinat.latitude,
				coordinat.longitude,
			);
			alertMessage("success", "Done", "Anda berada di area sekolah", () =>
				navigate("/facecam", {
					state: [
						...state,
						JSON.stringify({
							longitude: longitude.toString(),
							latitude: latitude.toString(),
						}),
					],
				}),
			);
			// alertMessage(
			// 	"warning",
			// 	"",
			// 	`Harap lakukan presensi didalam area sekolah, jarak anda dengan sekolah adalah ${distance} meter. koordinat anda : (${latitude}, ${longitude})`,
			// 	() =>
			// 		navigate("/presensi/verif", {
			// 			state: [...state],
			// 		}),
			// );
		}
	};

	const error = (err) => {
		alert(`ERROR(${err.code}): ${err.message}`);
	};

	const click = () => {
		navigator.geolocation.getCurrentPosition(success, error, options);
	};

	return (
		<div className="bg-primary-low font-primary text-white flex flex-col h-screen w-screen sm:w-[400px] sm:ml-[calc(50vw-200px)] relative z-[1]">
			<Link to="/presensi" state={state[1] ? [state[0]] : null}>
				<ArrowLeftIcon className="size-7 absolute top-8 left-6 z-[2]" />
			</Link>
			<div className="mt-[35%] flex flex-col items-center gap-12">
				<div className="size-fit relative flex justify-center items-center after:size-56 after:bg-[rgba(255,255,255,0.7)] after:rounded-full after:absolute after:z-[4] after:blur-sm before:size-56 before:bg-primary-high before:rounded-full before:absolute before:z-[3] before:bottom-3 before:left-6 before:blur-[2px]">
					<PiUserFocusThin className="size-48 z-[5]" />
				</div>
				<div className="flex flex-col text-center px-12">
					<h4 className="font-bold text-3xl mb-2">Verifikasi</h4>
					<p>
						Wajah anda akan diverifikasi untuk memenuhi syarat
						presensi
					</p>
					<button
						onClick={click}
						className="w-full px-6 absolute bottom-16 btn border-none w-full text-primary-md font-semibold bg-white rounded-xl text-sm px-4 py-2 text-center"
					>
						Verifikasi
					</button>
			</div>
		</div>
	);
}
