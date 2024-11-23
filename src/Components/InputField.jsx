import { forwardRef } from "react";
import PropTypes from "prop-types";

const InputField = forwardRef(({ id, name, placeholder, type = "text" }, ref) => (
    <input
        id={id}
        name={name}
        ref={ref}
        type={type}
        className="bg-primary-md border-white border-[1px] placeholder-white text-white text-xs rounded-lg focus:bg-white focus:border-0 focus:text-black block w-full py-3 px-4"
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
