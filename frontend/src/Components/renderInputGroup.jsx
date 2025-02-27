import PropTypes from "prop-types";
import InputField from "./InputField";

const renderInputGroup = ({
    id,
    label,
    type = "text",
    inputRef,
    placeholder = "",
    autoComplete = "",
    error = "",
    additionalElement = null,
    onChange,
}) => (
    <div className="input-group">
        <label htmlFor={id} className={`input-label ${error ? "text-red-700 font-semibold" : ""}`}>
            {error || label}
        </label>
        <div className={additionalElement ? "password-container" : ""}>
            <InputField
                id={id}
                name={id}
                type={type}
                ref={inputRef}
                placeholder={placeholder}
                autoComplete={autoComplete}
                onChange={onChange}
            />
            {additionalElement}
        </div>
    </div>
);

renderInputGroup.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    inputRef: PropTypes.object.isRequired,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
    error: PropTypes.string,
    additionalElement: PropTypes.node,
    onChange: PropTypes.func,
};

export default renderInputGroup;