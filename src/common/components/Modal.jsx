import React from "react";
import Styles from "../styles/Modal.module.css";

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
    <div
      className={Styles["modal-bg"]}
      onClick={type !== "loading" ? onClose : undefined}
    >
      <div
        className={Styles["modal-box"]}
        onClick={e => e.stopPropagation()}
      >
        {type !== "loading" && (
          <span className={Styles["modal-close"]} onClick={onClose}>
            &times;
          </span>
        )}
        <div
          className={Styles["modal-icon"]}
          style={{ color, fontSize: "3rem", marginBottom: "1rem" }}
        >
          {icon}
        </div>
        <div className={Styles["modal-msg"]}>{message}</div>
        {type === "loading" && (
          <div className={Styles["modal-loader"]}>
            <div className={Styles["loader"]}></div>
          </div>
        )}
      </div>
    </div>
  );
}