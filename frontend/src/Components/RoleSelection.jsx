import PropTypes from "prop-types";

const RoleSelection = ({ role, setRole }) => {
    const roles = [
        { id: "siswa", value: "4", icon: "/frontend/Icons/student.svg", label: "Siswa" },
        { id: "guru", value: "5", icon: "/frontend/Icons/teacher.svg", label: "Guru" },
        { id: "karyawan", value: "6", icon: "/frontend/Icons/employee.svg", label: "Karyawan" },
    ];

    return (
        <div className="w-full flex justify-between gap-8">
            {roles.map((roleData) => (
                <label key={roleData.id} className="flex flex-col items-center">
                    <input
                        type="radio"
                        name="sebagai"
                        onChange={() => setRole(roleData.value)}
                        checked={role === roleData.value}
                        id={roleData.id}
                        value={roleData.value}
                        className="hidden peer"
                    />
                    <img
                        src={roleData.icon}
                        alt={`${roleData.label}-icon`}
                        className="size-[80px] bg-white rounded-[20px] peer-checked:ring-4 peer-checked:ring-blue-400"
                    />
                    <label htmlFor={roleData.id} className="text-base">
                        {roleData.label}
                    </label>
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
