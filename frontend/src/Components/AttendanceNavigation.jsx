import { Link } from "react-router-dom";
import { FaPersonCircleCheck, FaCalendarCheck, FaCircleChevronRight } from "react-icons/fa6";

const AttendanceNavigation = () => {
  const navigationItems = [
    {
      id: "presensi",
      link: localStorage.getItem("group_id") === "4" ? "/presensi" : "/presensi/staff",
      icon: <FaPersonCircleCheck />,
      text: "Presensi",
    },
    {
      id: "riwayat_presensi",
      link: "/riwayat",
      icon: <FaCalendarCheck />,
      text: "Riwayat Presensi",
    },
  ];

  return (
    <div className="attendance-navigation">
      {navigationItems.map(({ id, link, icon, text }) => (
        <Link key={id} to={link} className="navigation-item">
          <div className="icon-wrapper">{icon}</div>
          <p className="text">{text}</p>
          <FaCircleChevronRight className="chevron-icon" />
        </Link>
      ))}
    </div>
  );
};

export default AttendanceNavigation;
