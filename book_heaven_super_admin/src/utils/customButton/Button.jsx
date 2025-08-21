import React from "react";
import Loader from "../customLoader/Loader";
import "../../styles/globalStyles.css";
import "./Button.css";

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  height,
  variant,
  color,
}) => {
  return (
    <section id="button">
      <button
        className={`custom-button ${variant || "btn-primary"} ${
          disabled ? "disabled" : ""
        }`}
        onClick={onPress}
        style={{
          ...style,
          width: width || "auto",
          height: height || "auto",
        }}
        disabled={disabled}
      >
        {loading ? (
          <Loader loading={loading} size={20} color="#fff" />
        ) : (
          <span style={{ ...textStyle }}>{title}</span>
        )}
      </button>
    </section>
  );
};

export default Button;
