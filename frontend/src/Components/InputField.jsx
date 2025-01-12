import { forwardRef } from "react";
import PropTypes from "prop-types";

const InputField = forwardRef(
    ({ id, name, placeholder = "", type = "text", autoComplete = "off", className = "", required = false }, ref) => (
        <input
            id={id}
            name={name}
            ref={ref}
            type={type}
            className={`input-field ${className}`}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
        />
    )
);

// Menambahkan displayName untuk debugging
InputField.displayName = "InputField";

// Menambahkan validasi prop menggunakan PropTypes
InputField.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    autoComplete: PropTypes.string,
    className: PropTypes.string,
    required: PropTypes.bool,
};

// Menambahkan default props untuk beberapa nilai opsional
InputField.defaultProps = {
    placeholder: "",
    type: "text",
    autoComplete: "off",
    className: "",
    required: false,
};

export default InputField;