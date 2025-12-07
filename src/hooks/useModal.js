import { useState, useCallback } from "react";

export function useModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const showModal = useCallback((modalType, modalMsg) => {
    setType(modalType);
    setMessage(modalMsg || "");
    setOpen(true);
  }, []);
  const closeModal = useCallback(() => setOpen(false), []);

  return {
    open,
    type,
    message,
    showModal,
    closeModal,
  };
}