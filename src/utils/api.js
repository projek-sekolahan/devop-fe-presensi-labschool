import axiosInstance from "./axiosInstance";
const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

export const getCsrf = async () => {
	const csrf = await axiosInstance.get(`${api_url}/view/tokenGetCsrf`);
	return csrf;
};

// export const toLogin = async (key, formData) => {
// 	const res = await axiosInstance.post(
// 		`${api_url}/api/client/auth/login`,
// 		formData,
// 		{
// 			headers: {
// 				Authorization: `Basic ${key}`,
// 			},
// 		}
// 	);
// 	return res.data;
// };

export const toLogin = (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/auth/login`, formData, {
			headers: {
				Authorization: `Basic ${key}`,
			},
		})
		.then((res) => {
			callback(res);
		});
};
export const register = async (formData) => {
	const res = axiosInstance.post(`${api_url}/input/register`, formData);
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
