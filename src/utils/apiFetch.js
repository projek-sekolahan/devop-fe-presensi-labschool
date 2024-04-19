const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";
const createFetchRequest = (method, key, formData) => {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (key && key !== null) {
        headers.Authorization = `Basic ${key}`;
    }
    const body = formData.toString();
    const credentials = 'include';
    return {
        method,
        headers,
        body,
        credentials
    };
};

export default class apiFetch {

    static async getCsrf() {
        return fetch(`${api_url}/view/tokenGetCsrf`)
            .then((res) => res.json())
            .then((res) => res.data);
    }

    static async register(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/register`, requestConfig);
    }

    static async verify(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/verify`, requestConfig);
    }

    static async facecam(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/facecam`, requestConfig);
    }

    static async setPassword(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/setPassword`, requestConfig);
    }

    static async recover(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/recover`, requestConfig);
    }

    static async sendOTP(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/sendOTP`, requestConfig);
    }

    static async toLogin(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/login`, requestConfig);
    }

    static async getUserData(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/users/profile`, requestConfig);
    }

    static async logout(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/logout`, requestConfig);
    }

    static async sessTime(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/sessTime`, requestConfig);
    }

    static async reports(formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/presensi/reports`, requestConfig);
    }

}