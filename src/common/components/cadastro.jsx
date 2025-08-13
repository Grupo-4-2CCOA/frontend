import React, { useState } from 'react';
import styles from '../styles/cadastro.module.css';
import popupStyles from '../styles/popup.module.css';

export function getCadastroComponent() {
  return function Cadastro() {
    const [formData, setFormData] = useState({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    });

    const [popup, setPopup] = useState({ message: '', type: '', show: false });

    const showPopup = (message, type) => {
      setPopup({ message, type, show: true });
    };

    const hidePopup = () => {
      setPopup({ message: '', type: '', show: false });
      
      if (popup.type === 'success') {
        setFormData({
          nome: '',
          email: '',
          senha: '',
          confirmarSenha: ''
        });
      }
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!formData.nome.trim()) {
        showPopup('Campo nome é obrigatório', 'error');
        return;
      }
      
      if (!formData.email.trim()) {
        showPopup('Campo email é obrigatório', 'error');
        return;
      }
      
      if (!formData.senha) {
        showPopup('Campo senha é obrigatório', 'error');
        return;
      }
      
      if (!formData.confirmarSenha) {
        showPopup('Campo confirmar senha é obrigatório', 'error');
        return;
      }
      
      if (formData.senha !== formData.confirmarSenha) {
        showPopup('As senhas não coincidem!', 'error');
        return;
      }

      showPopup('Cadastro realizado com sucesso!', 'success');
    };

    return (
      <main className={styles.main}>
        {popup.show && (
          <div className={`${popupStyles.popupOverlay}`}>
            <div className={`${popupStyles.popup} ${popupStyles[popup.type]}`}>
              <p className={popupStyles.message}>{popup.message}</p>
              <button 
                onClick={hidePopup}
                className={popupStyles.button}
              >
                OK
              </button>
            </div>
          </div>
        )}
        
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Cadastre-se Gratuitamente
            </h1>
            <p className={styles.subtitle}>
              Crie sua conta para realizar agendamentos
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Senha"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirmar senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Confirmar senha"
                  className={styles.input}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.button}
            >
              Cadastrar
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.loginLink}>
            <a href="#" className={styles.loginAnchor}>
              Já tem uma conta?
            </a>
          </div>
        </div>
      </main>
    );
  };
}

