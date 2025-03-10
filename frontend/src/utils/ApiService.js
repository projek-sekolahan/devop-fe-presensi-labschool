import Cookies from "js-cookie";
import { alertMessage, loading } from "./utils";

const API_URL = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => formData.toString();

const fetchWithTimeoutAndRetry = async (url, options = {}, timeout = 90000, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 503 && i < retries - 1) {
                    console.warn(`Service unavailable (503), retrying... (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, 2000)); // Tunggu 2 detik sebelum retry
                    continue;
                }
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`Fetch failed (attempt ${i + 1}):`, error);
            
            if (i === retries - 1) { // Jika ini adalah percobaan terakhir
                alertMessage("error", `Request failed after ${retries} attempts: ${error.message}`, "error", () => window.location.replace("/login"));
                return null;
            }

            await new Promise(res => setTimeout(res, 2000)); // Tunggu sebelum mencoba lagi
        }
    }
};

class ApiService {
    static async getCsrf() {
        try {
            const responseText = await fetchWithTimeoutAndRetry(
                `${API_URL}/view/tokenGetCsrf`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!responseText) throw new Error("Empty response from CSRF API");
            const res = JSON.parse(responseText);
            if (!res.status || !res.csrfHash) throw new Error("Invalid CSRF response");
            Cookies.set("csrf", res.csrfHash);
        } catch (error) {
            console.error("Failed to fetch CSRF token:", error);
        }
    }

    static async post(endpoint, formData, key = null) {
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(key && { Authorization: `Basic ${key}` }),
        };
        return fetchWithTimeoutAndRetry(`${API_URL}${endpoint}`, {
            method: "POST",
            headers,
            credentials: "include",
            body: createRequestBody(formData),
        });
    }

    static async processApiRequest(endpoint, data, authKey, load) {
        try {
            let response;
            if (load) {
                loading("Loading", `Processing ${endpoint.replace(/\//g, " ")} Data...`);
            }
    
            if (!authKey || authKey === "null") {
                response = await this.postInput(endpoint, data);
            } else {
                const endpointMap = {
                    auth: this.authPost,
                    users: this.usersPost,
                    presensi: this.presensiPost,
                    notifications: this.notificationsPost,
                };
                const [prefix, ...rest] = endpoint.split("/");
                const handler = endpointMap[prefix];
                if (handler) {
                    response = await handler.call(this, rest.join("/"), authKey, data);
                } else {
                    response = await this.post(`/api/client/${endpoint}`, data, authKey);
                }
            }
    
            if (!response) {
                console.error(`Tidak ada respon dari API untuk endpoint: ${endpoint}`);
                return null;
            }
    
            let result;
            try {
                result = JSON.parse(response);
            } catch (jsonError) {
                console.error("Gagal parsing JSON:", jsonError);
                return null;
            }
    
            if (result?.csrfHash) {
                Cookies.set("csrf", result.csrfHash);
            }
    
            return result;
        } catch (error) {
            console.error(`processApiRequest Error pada endpoint: ${endpoint}`, error);
        }
    }

    static async postInput(url, data) {
        return this.post(`/input/${url}`, data);
    }

    static async authPost(url, key, data) {
        return this.post(`/api/client/auth/${url}`, data, key);
    }

    static async usersPost(url, key, data) {
        return this.post(`/api/client/users/${url}`, data, key);
    }

    static async presensiPost(url, key, data) {
        return this.post(`/api/client/presensi/${url}`, data, key);
    }

    static async notificationsPost(url, key, data) {
        return this.post(`/api/client/notifications/${url}`, data, key);
    }
}

export default ApiService;
