// sessionService.js
import Cookies from "js-cookie";
import ApiService from "../utils/ApiService.js";
import { handleSessionExpired } from "../utils/utils";

export const checkSession = async (keys,formData) => {
  
  const response = await ApiService.processApiRequest("auth/sesstime", formData, keys, false);
  console.log("✅ selected Keys:", keys.slice(1, 3));
  console.log("✅ Final keys:", keys);
  console.log("✅ Final values:", values);
  console.log("✅ Final formData:", formData);
  console.log("✅ Final response:", response?.data);

  /* try {
    const response = await ApiService.authPost("sesstime", keys, formData);
    const parsedResponse = JSON.parse(response);
    if (parsedResponse?.data?.statusCode === 200) {
      Cookies.set("csrf", parsedResponse.csrfHash);
      return true; // Sesi valid
    } else {
      handleSessionExpired(parsedResponse?.data || { title: "Session Expired", message: "Sesi Anda telah berakhir." });
      return false; // Sesi tidak valid
    }
  } catch (error) {
    console.error("Error saat memeriksa sesi:", error);
    handleSessionExpired({
      title: "Session Timeout",
      message: error?.message || "Error saat memeriksa sesi",
    });
    return false; // Sesi tidak valid
  } */
};