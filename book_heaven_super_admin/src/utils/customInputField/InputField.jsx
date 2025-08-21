import React from "react";
import "../../styles/globalStyles.css";
import "./InputField.css";

const InputField = ({
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable = true,
  dropdownOptions,
  selectedValue,
  onValueChange,
  bgColor,
  textColor,
  width,
  label,
  type,
  fullWidth = false,
  required = false,
  icon,
  multiline = false,
  rows = 3,
}) => {
  return (
    <section id="input-field">
      <div style={{ ...style, width: width || "100%" }}>
        {dropdownOptions ? (
          <select
            className="custom-input"
            value={selectedValue}
            onChange={onValueChange} // No modification needed here
            style={{
              backgroundColor: bgColor || "var(--white)",
              color: textColor || "var(--dark)",
              width: fullWidth ? "100%" : "auto",
            }}
            required={required}
          >
            <option value="" disabled>
              {label || placeholder}
            </option>
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={value}
            onChange={onChange} // Pass the full event
            placeholder={label || placeholder}
            className="custom-input"
            required={required}
            rows={rows}
            style={{
              backgroundColor: bgColor || "var(--white)",
              color: textColor || "var(--dark)",
              ...inputStyle,
            }}
            readOnly={!editable}
          />
        ) : (
          <>
            <input
              value={value}
              onChange={onChange} // Pass the full event
              placeholder={label || placeholder}
              type={type || (secureTextEntry ? "password" : "text")}
              className="custom-input"
              required={required}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                ...inputStyle,
              }}
              readOnly={!editable}
            />
            {icon && <div className="input-icon">{icon}</div>}
          </>
        )}
      </div>
    </section>
  );
};

export default InputField;
