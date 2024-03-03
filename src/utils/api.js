import axios from "axios";

const api_url = import.meta.env.VITE_API_URL;

export const getCsrf = async () => {
	const csrf = await axios
		.get(`${api_url}/view/tokenGetCsrf`)
		.then(({ data }) => data);
	return csrf;
};

export const toLogin = async (key, formData) => {
	const res = await axios.post(`${api_url}/api/client/auth/login`, formData);
	console.log(res)
};
