// sessionService.js
import Cookies from "js-cookie";
import apiXML from "../utils/apiXML.js";
import { handleSessionExpired } from "../utils/utils";

export const checkSession = async (keys,formData) => {
  try {
    const response = await apiXML.authPost("sesstime", keys, formData);
    const parsedResponse = JSON.parse(response);
    if (parsedResponse?.data?.title === "Your Session OK") {
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
  }
};