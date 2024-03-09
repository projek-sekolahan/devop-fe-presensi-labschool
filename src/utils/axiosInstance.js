import axios from 'axios';
import Cookies from 'js-cookie';

// Membuat instance Axios
const axiosInstance = axios.create();
// Menambahkan interceptor untuk mengatur header cookies pada setiap permintaan
axiosInstance
    .interceptors
    .request
    .use(config => {
        // Mengatur opsi withCredentials ke true untuk mengizinkan pengiriman cookie lintas domain
        config.withCredentials = true;
        return config;
    }, error => {
        return Promise.reject(error);
    });

export default axiosInstance;