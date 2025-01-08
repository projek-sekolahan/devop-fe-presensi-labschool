import React from "react";
import PropTypes from "prop-types";
import { FaUser, FaUserTie, FaChalkboardTeacher } from "react-icons/fa";

const RoleSelection = ({ role, setRole }) => {
    const roles = [
        { id: "siswa", value: "4", icon: FaUser, label: "Siswa" },
        { id: "guru", value: "5", icon: FaChalkboardTeacher, label: "Guru" },
        { id: "karyawan", value: "6", icon: FaUserTie, label: "Karyawan" },
    ];

    return (
        <div className="role-selection-container">
            <div className="role-selection">
                {roles.map((roleData) => (
                    <label
                        key={roleData.id}
                        className={`role-option ${role === roleData.value ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            name="sebagai"
                            id={roleData.id}
                            value={roleData.value}
                            onChange={() => setRole(roleData.value)}
                            checked={role === roleData.value}
                            className="hidden"
                        />
                        {React.createElement(roleData.icon, { className: "role-icon", style: { fontSize: "2rem", color: "currentColor" } })}
                        <span className="role-label">{roleData.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

RoleSelection.propTypes = {
    role: PropTypes.string.isRequired,
    setRole: PropTypes.func.isRequired,
};

export default RoleSelection;
