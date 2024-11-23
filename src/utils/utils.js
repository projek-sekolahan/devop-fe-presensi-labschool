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
