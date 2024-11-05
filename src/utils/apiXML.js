import Cookies from "js-cookie";

const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";

const createRequestBody = (formData) => {
    return formData.toString();
};

// const reqTimeout = JSON.stringify({status })

export default class apiXML {
    static getCsrf() { console.log(Cookies.get("cf_clearance"))
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `${api_url}/view/tokenGetCsrf`);
            xhr.withCredentials = true;
            // Menambahkan cf_clearance ke header
            const cf_clearance_value = Cookies.get("cf_clearance"); // Ambil cf_clearance dari cookies
            if (cf_clearance_value) {
                xhr.setRequestHeader("cf_clearance", cf_clearance_value); // Menambahkan header
            }
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.responseText);
                    let res = JSON.parse(xhr.responseText);
                    Cookies.set("csrf", res.csrfHash);
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
                "application/x-www-form-urlencoded"
            );
            xhr.setRequestHeader("Authorization", `Basic ${key}`);
            xhr.withCredentials = true;
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr);
                }
            };
            xhr.onerror = () => reject(xhr);
            xhr.send(createRequestBody(formData));
        });
    }
    static post(endpoint, formData) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${api_url}${endpoint}`);
            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            xhr.withCredentials = true;

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr);
                }
            };
            xhr.onerror = () => reject(xhr);
            xhr.send(createRequestBody(formData));
        });
    }
    static authPost(url, key, formData) {
        return apiXML.postWithAuth("/api/client/auth/" + url, key, formData);
    }
    static usersPost(url, key, formData) {
        return apiXML.postWithAuth("/api/client/users/" + url, key, formData);
    }
    static presensiPost(url, key, formData) {
        return apiXML.postWithAuth(
            "/api/client/presensi/" + url,
            key,
            formData
        );
    }
    static notificationsPost(url, key, formData) {
        return apiXML.postWithAuth(
            "/api/client/notifications/" + url,
            key,
            formData
        );
    }
    static postInput(url, formData) {
        return apiXML.post("/input/" + url, formData);
    }
}
