import axiosInstance from "./axiosInstance";
const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

export default class apiServices {
    static async getCsrf() {
        return axiosInstance.get(`${api_url}/view/tokenGetCsrf`);
    }
    static async toLogin(key, formData) {
        return axiosInstance.post(`${api_url}/api/client/auth/login`, formData, {
			headers: {
				Authorization: `Basic ${key}`,
			},
		});
    }
    static async getUserData(key, formData) {
        return axiosInstance.post(`${api_url}/api/client/users/profile`, formData, {
			headers: {
				Authorization: `Basic ${key}`,
			},
		});
    }
}