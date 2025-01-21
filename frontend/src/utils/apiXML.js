import Cookies from "js-cookie";
import { alertMessage } from "../utils/utils";

const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => formData.toString();

export default class apiXML {
    /**
     * Fetch CSRF Token and cache it.
     */
    static async getCsrf() {
        try {
            const response = await fetch(`${api_url}/view/tokenGetCsrf`, {
                method: "GET",
                credentials: "include",
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                alertMessage(
                    "error",
                    "Error Response Server",
                    "error",
                    () => window.location.replace("/login")
                );
                console.error(`Error response body failed to fetch CSRF token: ${response.status} ${response.statusText}. Response: ${errorText}`);
            }
    
            const res = await response.json();
            Cookies.set("csrf", res.csrfHash); // Simpan di cookies
        } catch (error) {
            alertMessage(
                "error",
                "Error Response Server",
                "error",
                () => window.location.replace("/login")
            );
        }
    }       

    /**
     * Generic POST request with optional timeout and authorization.
     */
    static async post(endpoint, formData, key = null, timeout = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
    
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(key && { Authorization: `Basic ${key}` }),
        };
    
        try {
            const response = await fetch(`${api_url}${endpoint}`, {
                method: "POST",
                headers,
                credentials: "include",
                body: createRequestBody(formData),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
    
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
    
            return await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
    
            const errorMessage =
                error.name === "AbortError"
                    ? "Request Timeout: Server took too long to respond."
                    : `Error during POST request: ${error.message}`;
    
            alertMessage(
                "error",
                errorMessage,
                "error",
                () => window.location.replace("/login")
            );
            console.error("POST request failed:", error);
        }
    }    

    /**
     * Specific POST requests for different purposes.
     */
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

    static async postInput(url, formData) {
        return this.post(`/input/${url}`, formData);
    }
}