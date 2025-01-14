import { FaBars, FaBell } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Header = ({ setShowMenu, userData }) => {
  return (
    <nav className="header">
      <button onClick={() => setShowMenu(true)} aria-label="Open menu" className="menu-button">
        <FaBars />
      </button>
      <div className="profile-section">
        <Link to="/notifikasi" aria-label="Notifications">
          <FaBell className="icon" />
        </Link>
        <Link to="/profile" aria-label="Profile">
          <img
            src={userData?.img_location || "/frontend/Icons/profile.svg"}
            alt="Profile"
            className="profile-picture"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Header;
