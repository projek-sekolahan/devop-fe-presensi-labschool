const api_url = "https://devop-sso.smalabschoolunesa1.sch.id";
const createFetchRequest = (method, key, formData) => {
    const headers = new Headers({
        'Content-Type'  : 'application/x-www-form-urlencoded',
        'Authorization' : `Basic ${key}`,
    });
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

    static getCsrf() {
        return fetch(`${api_url}/view/tokenGetCsrf`)
            .then((res) => res.json())
            .then((res) => res.data);
    }

    static register(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/register`, requestConfig);
    }

    static verify(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/verify`, requestConfig);
    }

    static facecam(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/facecam`, requestConfig);
    }

    static setPassword(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/setPassword`, requestConfig);
    }

    static recover(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/recover`, requestConfig);
    }

    static sendOTP(formData) {
        const requestConfig = createFetchRequest('POST', null, formData);
        return fetch(`${api_url}/input/sendOTP`, requestConfig);
    }

    static toLogin(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/login`, requestConfig);
    }

    static getUserData(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/users/profile`, requestConfig);
    }

    static logout(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/logout`, requestConfig);
    }

    static sessTime(key, formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/auth/sessTime`, requestConfig);
    }

    static reports(formData) {
        const requestConfig = createFetchRequest('POST', key, formData);
        return fetch(`${api_url}/api/client/presensi/reports`, requestConfig);
    }
}
