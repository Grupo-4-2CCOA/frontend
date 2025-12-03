import React from "react";
import Styles from "./Modal.module.css";

export default function Modal({ open, type, message, onClose }) {
  if (!open) return null;
  let icon;
  let color;

  switch (type) {
    case "success":
      icon = "✔️";
      color = "#27ae60";
      break;
    case "error":
      icon = "❌";
      color = "#e74c3c";
      break;
    case "loading":
      icon = null;
      color = "#3498db";
      break;
    default:
      icon = null;
      color = "#333";
  }

  return (
    <div className="modal-bg" onClick={type !== "loading" ? onClose : undefined}>
      <div className="modal-box">
        {type !== "loading" && (
          <span className="modal-close" onClick={onClose}>
            &times;
          </span>
        )}
        <div className="modal-icon" style={{ color, fontSize: "3rem", marginBottom: "1rem" }}>
          {icon}
        </div>
        <div className="modal-msg">{message}</div>
        {type === "loading" && (
          <div className="modal-loader">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
}