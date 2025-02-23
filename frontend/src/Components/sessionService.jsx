import ApiService from "../utils/ApiService.js";
import { handleSessionExpired } from "../utils/utils";

export const checkSession = async (keys,formData) => {
  const response = await ApiService.processApiRequest("auth/sesstime", formData, keys, false);
  if (response?.data?.statusCode === 200) {
    return true;
  } else {
    handleSessionExpired(response?.data || { title: "Session Expired", message: "Sesi Anda telah berakhir." });
    return false;
  }
};