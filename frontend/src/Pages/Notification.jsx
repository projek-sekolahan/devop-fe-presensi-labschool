import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Tabs } from "flowbite-react";
import ApiService from "../utils/ApiService.js";
import { getFormData, parseJwt, addDefaultKeys, getCombinedValues } from "../utils/utils";
import Layout from "../Components/Layout";

function NotificationCard({ notifications }) {
  if (notifications.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
          <h4 className="text-lg font-semibold">Warning</h4>
        </div>
        <p className="mt-2 text-sm">Tidak ada data notifikasi yang tersedia. Harap coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notifications.map((notification, index) => {
        const baseUrl = "https://smartapps.smalabschoolunesa1.sch.id";
        const urlRegex = new RegExp(`${baseUrl}/\\S*`, "g"); // Deteksi URL dengan path apa pun setelah domain
        // Mengubah semua URL dalam message menjadi tautan "klik disini"
        const updatedMessage = notification.message.replace(
          urlRegex,
          (match) =>
            `<a href="${match}" class="text-primary font-semibold underline">klik disini</a>`
        );

        return (
          <div className="card-notification" key={index}>
            <div className="flex flex-col justify-center w-full">
              <h4 className="font-semibold text-sm text-primary-low">
                {notification.category.replace(/\b\w/g, (char) => char.toUpperCase())}
                <span className="text-bg-3 ml-3 opacity-50">{notification.created_at.slice(10, 16)}</span>
              </h4>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p
                className="text-bg-3 font-light text-xs text-justify break-words overflow-hidden"
                dangerouslySetInnerHTML={{ __html: updatedMessage }} // Render HTML dalam message
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Notification() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const { ref, inView } = useInView();

  const fetchNotifications = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    const keys = ["AUTH_KEY", "token"];
    const combinedKeys = addDefaultKeys(keys);

    const values = getCombinedValues(keys);
    const response = await ApiService.processApiRequest("notifications/detail", getFormData(combinedKeys, values), localStorage.getItem("AUTH_KEY"), true);
    console.log("✅ selected Keys:", keys);
    console.log("✅ Final keys:", keys);
    console.log("✅ Final values:", values);
    console.log("✅ Final formData:", formData);
    console.log("✅ Final response:", response?.data);
    return false;    
    /* try {
      const response = await ApiService.notificationsPost(
        "detail",
        localStorage.getItem("AUTH_KEY"),
        getFormData(combinedKeys, values)
      );
      const parsedResponse = JSON.parse(response);
      Cookies.set("csrf", parsedResponse.csrfHash);

      if (!parsedResponse?.data) {
        console.warn("Invalid response:", parsedResponse);
        setHasMore(false);
        return;
      }

      const decodedData = parseJwt(parsedResponse.data.token);
      const allData = Object.values(
        Object.fromEntries(
          Object.entries(decodedData).filter(
            ([key, value]) => Array.isArray(value) && key !== "category"
          )
        )
      ).flat();

      if (!Array.isArray(allData) || allData.length === 0) {
        console.warn("No valid notifications found:", allData);
        setHasMore(false);
        return;
      }

      const newNotifications = allData.slice((page - 1) * 10, page * 10);
      setAllNotifications((prev) => [...prev, ...allData]);
      setCategories(["Semua", ...new Set(decodedData.category)]);
      setHasMore(newNotifications.length === 10);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    } */
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (inView) {
      fetchNotifications();
    }
  }, [inView]);

  useEffect(() => {
    setFilteredNotifications(
      activeCategory === "Semua"
        ? allNotifications
        : allNotifications.filter((item) => item.category === activeCategory)
    );
  }, [activeCategory, allNotifications]);

  return (
    <div className="notification-container h-screen flex flex-col overflow-y-auto">
      <Layout link="/home" label="Notifikasi">
        <div className="custom-card mt-10">
          <Tabs
            aria-label="Tabs Notifikasi"
            onActiveTabChange={(tabIndex) => setActiveCategory(categories[tabIndex])}
          >
            {categories.map((category) => (
              <Tabs.Item key={category} title={category.replace(/\b\w/g, (char) => char.toUpperCase())}>
                {loading && allNotifications.length === 0 ? (
                  <div className="animate-pulse bg-white h-32 w-full rounded-md"></div>
                ) : (
                  <NotificationCard notifications={filteredNotifications} />
                )}
              </Tabs.Item>
            ))}
          </Tabs>
        </div>
        <div ref={ref}></div>
      </Layout>
    </div>
  );
}