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
export const register = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/register`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const sessTime = async (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/auth/sessTime`, formData, {
			headers: {
				Authorization: `Basic ${key}`,
			},
		})
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			window.location.replace("/login");
		});
};
export const logout = async (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/auth/logout`, formData, {
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
export const verify = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/verify`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const facecam = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/facecam`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const getUserData = async (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/users/profile`, formData, {
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
export const setPassword = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/setpassword`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const recover = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/recover`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const sendOTP = async (formData, callback) => {
	axiosInstance
		.post(`${api_url}/input/sendOTP`, formData)
		.then((res) => {
			callback(res);
		})
		.catch((error) => {
			callback(error);
		});
};
export const reports = async (key, formData, callback) => {
	axiosInstance
		.post(`${api_url}/api/client/presensi/reports`, formData, {
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
