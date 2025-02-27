import Swal from "sweetalert2";
import { useEffect } from "react";
import Cookies from "js-cookie";

export const getHash = (pass) => {
    const keycode = CryptoJS.enc.Hex.parse(
        CryptoJS.SHA1(btoa(pass)).toString()
    );
    const authcode = CryptoJS.enc.Hex.parse(CryptoJS.SHA1(pass).toString());
    const hash = CryptoJS.AES.encrypt(pass, keycode, { iv: authcode })
        .toString()
        .replace(/[^\w\s]/gi, "");
    return hash;
};

export const getKey = (email, hash) => {
    const key = btoa(email + ":" + hash);
    const tokenkey = CryptoJS.SHA1(key).toString();
    return [key, tokenkey];
};

export const getFaceUrl = (source, x, y, size) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context?.drawImage(source, x, y, size, size, 0, 0, size, size);
    const url = canvas.toDataURL("image/jpeg");
    return url;
};

// Fungsi untuk mengonversi file gambar menjadi URL
export const getImageUrl = (fileInput, callback) => {
    // Membuat objek FileReader
    const reader = new FileReader();
    // Event handler yang akan dipanggil setelah pembacaan file selesai
    reader.onload = function (event) {
        // Mengembalikan URL gambar dari data yang dibaca
        callback(event.target.result);
    };
    // Membaca file gambar sebagai URL data
    reader.readAsDataURL(fileInput);
};

// Default keys yang selalu digunakan
export const defaultKeys = ["devop-sso", "csrf_token"];

// Fungsi untuk menambahkan default keys ke dalam daftar keys yang diberikan
export const addDefaultKeys = (keys) => {
    return [...keys, ...defaultKeys];
};

// Fungsi untuk mengambil nilai dari localStorage atau Cookies dengan debugging tambahan
export const getStoredValue = (key) => {
    // Ambil nilai langsung dari localStorage sebelum diproses lebih lanjut
    const registToken = localStorage.getItem("regist_token");
    let devopSso = localStorage.getItem("devop-sso");
    // Jika 'devop-sso' tidak ada atau kosong, gunakan 'regist_token'
    if (!devopSso || devopSso.trim() === "") {
        devopSso = registToken;
    }
    return {
        "csrf_token": Cookies.get("csrf"),
        "token": localStorage.getItem("login_token"),
        "devop-sso": devopSso,
        "regist_token": registToken
    }[key] ?? localStorage.getItem(key) ?? null;
};

// Fungsi utama untuk mendapatkan nilai berdasarkan keys yang diberikan
export const getCombinedValues = (keys) => {
    const combinedKeys = addDefaultKeys(keys);
    const valuesObj = combinedKeys.reduce((acc, key) => {
        acc[key] = getStoredValue(key); return acc;
    }, {});
    return combinedKeys.map((key) => valuesObj[key]); // Mengembalikan array nilai saja
};

export const createFormData = (keys, values) => {
    const formData = new FormData();
    keys.forEach((key, index) => {
        formData.append(key, values[index]);
    });
    return formData;
};

export const getFormData = (keys, values) => {
    return keys
        .map((key, index) => {
            const value = values[index] ?? "null"; // Set default "null" jika undefined
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join("&");
};

export function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
    if (token == localStorage.getItem("login_token")) {
        return decrypt(JSON.parse(jsonPayload), "fromToken");
    } else {
        return decrypt(JSON.parse(jsonPayload), "fromData");
    }
}

function decrypt(param, from) {
    let keyEnkrip, ivEnkrip;
    if (from == "fromToken") {
        keyEnkrip = "devop-sso";
        ivEnkrip = "devop-sso";
    } else if (from == "fromData") {
        var decodeToken = parseJwt(localStorage.getItem("login_token"));
        keyEnkrip = decodeToken.apikey;
        ivEnkrip = decodeToken.session_hash;
    }
    const keyHex = CryptoJS.SHA256(keyEnkrip).toString().substring(0, 32);
    const ivHex = CryptoJS.SHA256(ivEnkrip).toString().substring(0, 16);
    const key = CryptoJS.enc.Utf8.parse(keyHex);
    const iv = CryptoJS.enc.Utf8.parse(ivHex);
    let cipher = CryptoJS.AES.decrypt(atob(param.data), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    var decryptedText = cipher.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
}

export const alertMessage = (title, message, type, callback) => {
    Swal.close();
    Swal.fire({
        titleText: title,
        html: message,
        icon: type,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
        allowEscapeKey: false,
    }).then(() => {
        callback();
    });
};

export const loading = (title, text) => {
    Swal.fire({
        titleText: title,
        html: text,
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: true,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    // Array nama hari dalam Bahasa Indonesia
    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];
    // Array nama bulan dalam Bahasa Indonesia
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    // Mendapatkan hari, tanggal, bulan, dan tahun
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    // Mengembalikan tanggal dalam format yang diinginkan
    return `${day}, ${dayOfMonth} ${month} ${year}`;
};

// Fungsi untuk mengatur waktu dan tanggal
export const useClock = (timeRef, dateRef, dayRef) => {
    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = now
                .toLocaleTimeString("en-US", { hour12: false })
                .split(".")
                .join(":");
            const currentDate = now.toLocaleDateString("en-GB");
            const currentDay = days[now.getDay()];
            if (timeRef.current && dateRef.current && dayRef.current) {
                timeRef.current.innerText = `${currentTime} WIB`;
                dateRef.current.innerText = `${currentDate}`;
                dayRef.current.innerText = `${currentDay},`;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [timeRef, dateRef, dayRef]);
};

function clearCookies() {
    localStorage.clear();
    // Ambil semua cookies yang ada
    var allCookies = Cookies.get();
    // Iterasi setiap cookie
    Object.keys(allCookies).forEach(function (cookieName) {
        var cookieValue = Cookies.get(cookieName);
        // Periksa apakah cookie sudah kedaluwarsa
        if (!cookieValue) {
            // Hapus cookie yang sudah kedaluwarsa
            Cookies.remove(cookieName);
        }
    });
}

export const getCookieValue = (cookieName) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const handleSessionError = (err, location) => {
    clearCookies();
    let res = JSON.parse(err.responseText);
    if (err.status == 400 || err.status == 401 || err.status == 403 || err.status == 502) {
        res.data
            ? alertError(res.data.title, res.data.message, res.data.info, () =>
                  window.location.replace(location)
              )
            : alertError(
                  "Password atau Username Salah",
                  "Periksa kembali password dan username.",
                  "error",
                  () => window.location.replace(location)
              );
    } else {
        alertError(
            "Input Error",
            "Something went wrong. Please try again later.",
            "error",
            () => window.location.replace(location)
        );
    }
};

export const handleSessionExpired = (data) => {
    clearCookies();
    alertError(data.title, data.message, "error", () => {
        window.location.replace("/login");
    });
};

function alertError(title, message, type, callback) {
    Swal.fire({
        titleText: title,
        html: message,
        icon: type,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
        allowEscapeKey: false,
    }).then(() => {
        callback();
    });
}