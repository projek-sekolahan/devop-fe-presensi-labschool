const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => {
    return formData.toString();
};

export default class apiXML {
    static getCsrf() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `${api_url}/view/tokenGetCsrf`);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText).data);
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    }

    static postWithAuth(endpoint, key, formData) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${api_url}${endpoint}`);
            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded",
            );
            xhr.setRequestHeader("Authorization", `Basic ${key}`);
            xhr.withCredentials = true;
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.responseText);
                } else {
                    reject(JSON.parse(xhr.responseText));
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send(createRequestBody(formData));
        });
    }
    static post(endpoint, formData) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${api_url}${endpoint}`);
            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded",
            );
            xhr.withCredentials = true;
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.responseText);
                } else {
                    reject(JSON.parse(xhr.responseText));
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send(createRequestBody(formData));
        });
    }

    static toLogin(key, formData) {
        return apiXML.postWithAuth("/api/client/auth/login", key, formData);
    }

    static getUserData(key, formData) {
        return apiXML.postWithAuth("/api/client/users/profile", key, formData);
    }

    static logout(key, formData) {
        return apiXML.postWithAuth("/api/client/auth/logout", key, formData);
    }

    static sessTime(key, formData) {
        return apiXML.postWithAuth("/api/client/auth/sessTime", key, formData);
    }

    static reports(key, formData) {
        return apiXML.postWithAuth(
            "/api/client/presensi/reports",
            key,
            formData,
        );
    }

    static register(formData) {
        return apiXML.post("/input/register", formData);
    }
    static verify(formData) {
        return apiXML.post("/input/verify", formData);
    }
    static facecam(formData) {
        return apiXML.post("/input/facecam", formData);
    }
    static setPassword(formData) {
        return apiXML.post("/input/setpassword", formData);
    }
    static sendOtp(formData) {
        return apiXML.post("/input/sendOTP", formData);
    }
    static recover(formData) {
        return apiXML.post("/input/recover", formData);
    }
}
