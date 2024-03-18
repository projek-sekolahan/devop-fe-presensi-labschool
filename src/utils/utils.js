export const getHash = (pass) => {
	const keycode = CryptoJS.enc.Hex.parse(
		CryptoJS.SHA1(btoa(pass)).toString()
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

export const getFormData = (keys, values) => {
	return keys
		.map(
			(key, index) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(
					values[index]
				)}`
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
			.join("")
	);
	if (token == localStorage.getItem("token")) {
		return decrypt(JSON.parse(jsonPayload), "fromToken");
	} else {
		return JSON.parse(jsonPayload);
	}
}

function decrypt(param, from) {
	let keyEnkrip, ivEnkrip;
	if (from == "fromToken") {
		keyEnkrip = "smalabschoolunesa1";
		ivEnkrip = "smalabschoolunesa1";
	} else {
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
