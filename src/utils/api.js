import axios from "axios";
import Cookies from "js-cookie";

const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

export const getCsrf = async () => {
	const csrf = await axios
		.get(`${api_url}/view/tokenGetCsrf`, {
			withCredentials: true,
		})
		.then((response) => {
			console.log('Response :', response);
			const cookieFromResponse = response.headers.get('Set-Cookie');
			console.log('Cookie dari respons header:', cookieFromResponse);
			// Jika cookie ditemukan, Anda juga bisa menetapkannya menggunakan js-cookies
			if (cookieFromResponse) {
				const cookieData = cookieFromResponse.split(';')[0]; // Ambil bagian pertama dari cookie
				const cookieNameValue = cookieData.split('='); // Pisahkan nama dan nilai cookie
				const cookieName = cookieNameValue[0];
				const cookieValue = cookieNameValue[1];
				Cookies.set(cookieName, cookieValue);
			}
		}
		);
	// console.log(csrf);
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
