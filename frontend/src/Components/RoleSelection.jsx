import React from "react";
import PropTypes from "prop-types";
import { PiChalkboardTeacherFill, PiStudentFill, PiUserSquareFill } from "react-icons/pi";

const RoleSelection = ({ role, setRole }) => {
    const roles = [
        { id: "siswa", value: "4", icon: PiStudentFill, label: "Siswa" },
        { id: "guru", value: "5", icon: PiChalkboardTeacherFill, label: "Guru" },
        { id: "karyawan", value: "6", icon: PiUserSquareFill, label: "Karyawan" },
    ];

    return (
<div className="role-selection-container">
    <div className="role-selection">
        {roles.map((roleData) => (
            <label
                key={roleData.id}
                className={`role-option ${role === roleData.value ? "active" : ""}`}
            >
                {/* Input Radio */}
                <input
                    type="radio"
                    name="sebagai"
                    id={roleData.id}
                    value={roleData.value}
                    onChange={() => setRole(roleData.value)}
                    checked={role === roleData.value}
                    className="hidden"
                />
                {/* Icon */}
                {React.createElement(roleData.icon, { className: "role-icon" })}
                {/* Label */}
                <span className="role-label">{roleData.label}</span>
            </label>
        ))}
    </div>
</div>
    );
};

// Menambahkan prop validation
RoleSelection.propTypes = {
    role: PropTypes.string.isRequired,
    setRole: PropTypes.func.isRequired,
};

export default RoleSelection;
