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