import axios from 'axios';
import axiosInstance from './axiosInstance';
const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

export const getCsrf = async () => {
	const csrf = await axios.get(`${api_url}/view/tokenGetCsrf`, {
		withCredentials:true
	});
	return csrf;
	// console.log(csrf);
};

/* export const getCookie = async () => {
	const response = await fetch(api_url);
	return response;
} */

export const toLogin = async (key, formData) => {
	const res = await axios.post(`${api_url}/api/client/auth/login`, formData, {
		headers: {
			Authorization: `Basic ${key}`,
			withCredentials:true,
			Cookie : `ci_sso_csrf_cookie=${localStorage.getItem("csrf")}`
		},
	});
	// console.log(res);
};
export const register = async () => {
	const res = axiosInstance.post(`${api_url}/input/register`);
};
export const sessTime = async () => {
	const res = axiosInstance.post(`${base_url}/api/client/auth/sessTime`);
};
export const logout = async () => {
	const res = axiosInstance.post(`${base_url}api/client/auth/logout`);
};
export const verify = async () => {
	const res = axiosInstance.post(`${base_url}input/verify`);
};
export const setPasswordr = async () => {
	const res = axiosInstance.post(`${base_url}input/setpassword`);
};
export const recover = async () => {
	const res = axiosInstance.post(`${base_url}input/recover`);
};