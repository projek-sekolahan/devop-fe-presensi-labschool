import axios from "axios";

const base_url = import.meta.env.VITE_API_URL;

export const getCsrf = async () => {
	const csrf = await axios
		.get(`${base_url}/view/tokenGetCsrf`)
		.then(({ data }) => data);
	return csrf;
};
