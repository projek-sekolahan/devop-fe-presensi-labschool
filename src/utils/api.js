import axios from "axios";

const api_url = import.meta.env.VITE_API_URL;

export const getCsrf = async () => {
	const csrf = await axios
		.get(`${api_url}/view/tokenGetCsrf`, { withCredentials: true })
		.then((response) => response.headers.get("Set-Cookie"));
	console.log(csrf);
};

export const toLogin = async (key, formData) => {
	const res = await axios.post(`${api_url}/api/client/auth/login`, formData, {
		headers: {
			Authorization: `Basic ${key}`,
		},
	});
	console.log(res);
};
export const register = async () => {
	const res = axios.post(`${api_url}/input/register`);
};
export const sessTime = async () => {
	const res = axios.post(`${base_url}/api/client/auth/sessTime`);
};
export const logout = async () => {
	const res = axios.post(`${base_url}api/client/auth/logout`);
};
export const verify = async () => {
	const res = axios.post(`${base_url}input/verify`);
};
export const setPasswordr = async () => {
	const res = axios.post(`${base_url}input/setpassword`);
};
export const recover = async () => {
	const res = axios.post(`${base_url}input/recover`);
};
