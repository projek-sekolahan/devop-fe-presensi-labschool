import Swal from "sweetalert2";

export const getHash = (pass) => {
	const keycode = CryptoJS.enc.Hex.parse(
		CryptoJS.SHA1(btoa(pass)).toString(),
	);
	const authcode = CryptoJS.enc.Hex.parse(CryptoJS.SHA1(pass).toString());
	const hash = CryptoJS.AES.encrypt(pass, keycode, { iv: authcode })
		.toString()
		.replace(/[^\w\s]/gi, "");
	return hash;
};

export const getKey = (email, hash) => {
	const key = btoa(email + ":" + hash);
	const tokenkey = CryptoJS.SHA1(key).toString();
	return [key, tokenkey];
};

export const getImageUrl = (source, x, y, size) => {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");

	context?.drawImage(source, x, y, size, size, 0, 0, size, size);
	const url = canvas.toDataURL("image/jpeg");
	return url;
};

export const createFormData = (keys, values) => {
	const formData = new FormData();
	keys.forEach((key, index) => {
		formData.append(key, values[index]);
	});
	return formData;
};

export const getFormData = (keys, values) => {
	return keys
		.map(
			(key, index) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(
					values[index],
				)}`,
		)
		.join("&");
};

export function parseJwt(token) {
	var base64Url = token.split(".")[1];
	var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	var jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join(""),
	);
	if (token == localStorage.getItem("login_token")) {
		return decrypt(JSON.parse(jsonPayload), "fromToken");
	} else {
		return decrypt(JSON.parse(jsonPayload), "fromData");
	}
}

function decrypt(param, from) {
	let keyEnkrip, ivEnkrip;
	if (from == "fromToken") {
		keyEnkrip = "smalabschoolunesa1";
		ivEnkrip = "smalabschoolunesa1";
	} else if (from == "fromData") {
		var decodeToken = parseJwt(localStorage.getItem("login_token"));
		keyEnkrip = decodeToken.apikey;
		ivEnkrip = decodeToken.session_hash;
	}
	const keyHex = CryptoJS.SHA256(keyEnkrip).toString().substring(0, 32);
	const ivHex = CryptoJS.SHA256(ivEnkrip).toString().substring(0, 16);
	const key = CryptoJS.enc.Utf8.parse(keyHex);
	const iv = CryptoJS.enc.Utf8.parse(ivHex);
	let cipher = CryptoJS.AES.decrypt(atob(param.data), key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	var decryptedText = cipher.toString(CryptoJS.enc.Utf8);
	return JSON.parse(decryptedText);
}

export const alert = (type, title, message, callback) => {
	Swal.fire({
		titleText: title,
		html: message,
		icon: type,
		allowOutsideClick: false,
		allowEnterKey: false,
		allowEscapeKey: false,
	}).then(() => {
		callback();
	});
};

export const loading = (title, text) => {
	Swal.fire({
		titleText: title,
		html: text,
		icon: "info",
		allowOutsideClick: false,
		allowEnterKey: false,
		allowEscapeKey: false,
		didOpen: () => {
			Swal.showLoading();
		},
	});
};

export const formatDate = (inputDate) => {
	const date = new Date(inputDate);

	// Array nama hari dalam Bahasa Indonesia
	const days = [
		"Minggu",
		"Senin",
		"Selasa",
		"Rabu",
		"Kamis",
		"Jumat",
		"Sabtu",
	];

	// Array nama bulan dalam Bahasa Indonesia
	const months = [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	];

	// Mendapatkan hari, tanggal, bulan, dan tahun
	const day = days[date.getDay()];
	const dayOfMonth = date.getDate();
	const month = months[date.getMonth()];
	const year = date.getFullYear();

	// Mengembalikan tanggal dalam format yang diinginkan
	return `${day}, ${dayOfMonth} ${month} ${year}`;
};
