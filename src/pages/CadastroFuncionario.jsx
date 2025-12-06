import React, { useState } from 'react';
import NavbarLogado from '../common/components/NavbarLogado';
import api from '../services/api';
import styles from '../common/styles/CadastroFuncionario.module.css';
import BotaoPrincipal from '../common/components/BotaoPrincipal';

export default function CadastroFuncionario() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    role: 3
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(formData);
      const response = await api.post('/funcionarios', formData);

      setFeedback({
        type: 'success',
        message: 'Funcionário cadastrado com sucesso!'
      });

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        cep: '',
        role: 3
      });

      // Remover mensagem após 3 segundos
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao cadastrar funcionário'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <NavbarLogado isAdmin={true} />

      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <h1 className={styles.titulo}>Cadastrar Funcionário</h1>
          <p className={styles.subtitulo}>Preencha os dados para registrar um novo funcionário no sistema</p>

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Seção de Informações Pessoais */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Informações Pessoais</legend>

              <div className={styles.formGroup}>
                <label htmlFor="nome" className={styles.label}>Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cpf" className={styles.label}>CPF *</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="telefone" className={styles.label}>Telefone *</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cep" className={styles.label}>CEP *</label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </fieldset>

            {/* Botões */}
            <div className={styles.buttonGroup}>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
              </button>
              <button type="reset" className={styles.resetBtn} onClick={() => setFormData({
                name: '',
                email: '',
                cpf: '',
                phone: '',
                cep: '',
                role: 3
              })}>
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}