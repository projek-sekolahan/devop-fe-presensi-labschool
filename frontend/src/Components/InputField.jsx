import { forwardRef } from "react";
import PropTypes from "prop-types";

const InputField = forwardRef(({ id, name, placeholder, type = "text" }, ref) => (
    <input
        id={id}
        name={name}
        ref={ref}
        type={type}
        className="input-field"
        placeholder={placeholder}
        required
    />
));

// Menambahkan displayName untuk debugging
InputField.displayName = "InputField";

// Menambahkan prop validation
InputField.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    type: PropTypes.string,
};

export default InputField;
