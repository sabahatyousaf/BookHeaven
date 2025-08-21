import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";
import Loader from "../customLoader/Loader";

const Modal = ({ isOpen, onClose, title, children, buttons = [] }) => {
  return ReactDOM.createPortal(
    <section id="modal">
      <div
        className={`modal-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            {buttons.map((btn, index) => (
              <button
                key={index}
                className={`modal-btn ${btn.className || ""}`}
                onClick={btn.onClick}
                disabled={btn.loading}
              >
                {btn.loading ? (
                  <Loader loading={btn.loading} size={20} color="#fff" />
                ) : (
                  btn.label
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>,
    document.body
  );
};

export default Modal;
