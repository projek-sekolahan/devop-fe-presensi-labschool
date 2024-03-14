import axiosInstance from "./axiosInstance";
const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

export const getCsrf = async () => {
	const csrf = await axiosInstance.get(`${api_url}/view/tokenGetCsrf`);
	return csrf;
};

export const toLogin = (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/auth/login`, formData, {
			headers: {
				Authorization: `Basic ${key}`,
			},
		})
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const register = async (formData) => {
	const res = axiosInstance.post(`${api_url}/input/register`, formData);
	return res;
};
export const sessTime = async () => {
	const res = axiosInstance.post(`${api_url}/api/client/auth/sessTime`);
	return res;
};
export const logout = async () => {
	const res = axiosInstance.post(`${api_url}/api/client/auth/logout`);
	return res;
};
export const verify = async (formData) => {
	const res = axiosInstance.post(`${api_url}/input/verify`, formData);
	return res;
};
export const setPasswordr = async () => {
	const res = axiosInstance.post(`${api_url}/input/setpassword`);
	return res;
};
export const recover = async () => {
	const res = axiosInstance.post(`${api_url}/input/recover`);
	return res;
};
