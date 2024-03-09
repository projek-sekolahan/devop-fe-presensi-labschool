import axios from 'axios';
import Cookies from 'js-cookie';

// Membuat instance Axios
const axiosInstance = axios.create();

// Menambahkan interceptor untuk mengatur header cookies pada setiap permintaan
axiosInstance
    .interceptors
    .request
    .use(config => {
        // Mengatur opsi withCredentials ke true untuk mengizinkan pengiriman cookie
        // lintas domain
        config.withCredentials = true;
        // Mengambil CSRF token dari localStorage dan menambahkannya ke header Cookie
        const csrfToken = localStorage.getItem("csrf");
        if (csrfToken) {
            // Ambil seluruh cookie
            const allCookies = Cookies.get();
            // Setel header dengan cookie
            config.headers['Cookie'] = Object
                .keys(allCookies)
                .map(cookieName => {
                    return `${cookieName}=${allCookies[cookieName]}`;
                })
                .join('; ');
            console.log('Config Headers:', config.headers);

            // config.headers['Cookie'] = `ci_sso_csrf_cookie=${csrfToken}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

export default axiosInstance;