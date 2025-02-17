import Cookies from "js-cookie";
import { alertMessage } from "./utils";

const API_URL = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => formData.toString();

const fetchWithTimeout = async (url, options = {}, timeout = 90000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
            console.warn("Request aborted due to timeout");
        }
        const errorMessage = error.name === "AbortError" 
            ? "Request Timeout: Server took too long to respond."
            : `Error: ${error.message}`;
        alertMessage("error", errorMessage, "error", () => window.location.replace("/login"));
        console.error("Fetch failed:", error);
    }
};

class ApiService {
    static async getCsrf() {
        try {
            const response = await fetchWithTimeout(`${API_URL}/view/tokenGetCsrf`, {
                method: "GET",
                credentials: "include"
            });
            if (response) {
                const res = JSON.parse(response);
                Cookies.set("csrf", res.csrfHash);
            }
        } catch (error) {
            console.error("Failed to fetch CSRF token:", error);
        }
    }

    static async post(endpoint, formData, key = null) {
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(key && { Authorization: `Basic ${key}` })
        };
        return fetchWithTimeout(`${API_URL}${endpoint}`, {
            method: "POST",
            headers,
            credentials: "include",
            body: createRequestBody(formData)
        });
    }

    static async processApiRequest(endpoint, data) {
        try {
            let response;
            const params = new URLSearchParams(data);
            let AUTH_KEY = params.get("AUTH_KEY");
            
            // Mengecek apakah AUTH_KEY ada di dalam formData
            if (AUTH_KEY == null || AUTH_KEY == "null") {
                console.warn("AUTH_KEY tidak ditemukan, mengirim request ke postInput...");
                // response = await this.postInput(endpoint, formData);
            } else {
                console.warn("AUTH_KEY ditemukan, mengirim request ke API utama...");
                /* if (endpoint.startsWith("auth")) {
                    response = await this.authPost(endpoint.replace("auth/", ""), AUTH_KEY, formData);
                } else if (endpoint.startsWith("users")) {
                    response = await this.usersPost(endpoint.replace("users/", ""), AUTH_KEY, formData);
                } else if (endpoint.startsWith("presensi")) {
                    response = await this.presensiPost(endpoint.replace("presensi/", ""), AUTH_KEY, formData);
                } else if (endpoint.startsWith("notifications")) {
                    response = await this.notificationsPost(endpoint.replace("notifications/", ""), AUTH_KEY, formData);
                } else {
                    response = await this.post(`/api/client/${endpoint}`, formData, AUTH_KEY);
                } */
                
            }
            return AUTH_KEY;
            // console.log(JSON.parse(response));
            /* const response = await this.post(`/api/client/${endpoint}`, formData);
            if (!response) throw new Error("No response from API");
            const result = JSON.parse(response);
            Cookies.set("csrf", result.csrfHash);
            return result; */
        } catch (error) {
            console.error("API request failed:", error);
            alertMessage("Error", error.message || "Gagal menghubungi server", "error");
        }
    }

    static async postInput(url, formData) {
        return this.post(`/input/${url}`, formData);
    }

    static async authPost(url, key, formData) {
        return this.post(`/api/client/auth/${url}`, formData, key);
    }

    static async usersPost(url, key, formData) {
        return this.post(`/api/client/users/${url}`, formData, key);
    }

    static async presensiPost(url, key, formData) {
        return this.post(`/api/client/presensi/${url}`, formData, key);
    }

    static async notificationsPost(url, key, formData) {
        return this.post(`/api/client/notifications/${url}`, formData, key);
    }
}

export default ApiService;