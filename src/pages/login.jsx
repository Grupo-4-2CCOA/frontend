import React from "react";
import Navbar from "../common/components/Navbar";
import { useNavigate } from "react-router-dom";
import styles from "../common/styles/login.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Aqui você implementaria a lógica de autenticação com Google  
    navigate('/agendamentoCliente');
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Bem-vindo(a) ao site!
            </h1>
            <p className={styles.subtitle}>
              Faça login para agendar seu horário
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className={styles.googleButton}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className={styles.googleIcon}
            />
            Entrar com Google
          </button>
        </div>
      </main>
    </>
  );
}