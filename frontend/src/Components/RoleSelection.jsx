import PropTypes from "prop-types";

const RoleSelection = ({ role, setRole }) => {
    const roles = [
        { id: "siswa", value: "4", icon: "/frontend/Icons/student.svg", label: "Siswa" },
        { id: "guru", value: "5", icon: "/frontend/Icons/teacher.svg", label: "Guru" },
        { id: "karyawan", value: "6", icon: "/frontend/Icons/employee.svg", label: "Karyawan" },
    ];

    return (
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
            <img
                src={roleData.icon}
                alt={`${roleData.label}-icon`}
                className={`role-icon ${
                    role === roleData.value ? "ring-4 ring-blue-400" : ""
                }`}
            />
            {/* Label */}
            <span
                className={`role-label ${
                    role === roleData.value ? "active" : ""
                }`}
            >
                {roleData.label}
            </span>
        </label>
    ))}
</div>
    );
};

// Menambahkan prop validation
RoleSelection.propTypes = {
    role: PropTypes.string.isRequired,
    setRole: PropTypes.func.isRequired,
};

export default RoleSelection;
