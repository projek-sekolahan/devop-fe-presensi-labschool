import Cookies from "js-cookie";

const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => formData.toString();

export default class apiXML {
    static csrfToken = null;

    /**
     * Fetch CSRF Token and cache it.
     */
    static async getCsrf() {
        if (this.csrfToken) return this.csrfToken; // Gunakan token yang sudah di-cache
    
        try {
            const response = await fetch(`${api_url}/view/tokenGetCsrf`, {
                method: "GET",
                credentials: "include",
            });
    
            if (!response.ok) {
                // Ambil detail response body jika ada
                const errorText = await response.text();
                throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}. Response: ${errorText}`);
            }
    
            const res = await response.json();
            this.csrfToken = res.csrfHash;
            Cookies.set("csrf", res.csrfHash); // Simpan di cookies
            return this.csrfToken;
        } catch (error) {
            console.error("Error fetching CSRF token:", error.message);
            throw error;
        }
    }    

    /**
     * Generic POST request with optional timeout and authorization.
     */
    static async post(endpoint, formData, key = null, timeout = 10000) {
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error("Error or timeout in POST request:", error);
            throw error;
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