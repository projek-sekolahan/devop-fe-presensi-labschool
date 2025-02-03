import { PiUserFocusThin } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { alertMessage } from "../utils/utils";
import Layout from "../Components/Layout";

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
			alertMessage("Done", "Anda berada di area sekolah", "success", () =>
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
			alertMessage("Done", "Anda berada di area sekolah", "success", () =>
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
			// 	"Kamu Diluar Sekolah",
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
		<div className="presensi-container">
			<Layout link={
						localStorage.getItem("group_id") == "4"
							? "/presensi"
							: "/presensi/staff"
					} label="Presensi">
				<div className="mt-10 flex flex-col items-center gap-12">
					<div className="circle-container">
						<PiUserFocusThin className="size-48 z-[5]" />
					</div>
					<div className="text-container">
						<h4 className="font-bold text-3xl mb-2">Verifikasi</h4>
						<p className="font-semibold">Wajah anda untuk syarat presensi</p>
					</div>
					<div className="w-full px-6 absolute bottom-10">
						<button onClick={click} className="btn-submit">Verifikasi</button>
					</div>
				</div>
			</Layout>
		</div>
	);
}