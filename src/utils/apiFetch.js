const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";
const createFetchRequest = (method, key, formData) => {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${key}`,
    };

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

    static async toLogin(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/login`, requestConfig)
            .then((res) => res.json())
            .then((res) => res.data);
    }

    static async getUserData(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/users/profile`, requestConfig)
            .then((res) => res.json())
            .then((res) => res.data);
    }

}