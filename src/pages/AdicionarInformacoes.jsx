import React, { useEffect, useState } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from '../common/styles/Informacoes.module.css';
import Modal from '../common/components/Modal';

function SuccessPopup({ show, onClose }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '2rem 2.5rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        minWidth: 280
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#4BB543"/>
          <path d="M15 25L22 32L34 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ color: '#4BB543', fontWeight: 600, fontSize: 20 }}>Informações salvas!</div>
      </div>
    </div>
  );
}

export default function AdicionarInformacoes() {
  const { userInfo } = useAuth('Cliente');
  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [clientData, setClientData] = useState(null);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });

  // Funções de formatação
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // CPF com todos os dígitos iguais

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  // Carrega dados existentes do cliente quando o id estiver disponível
  useEffect(() => {
    let isCancelled = false;

    const carregarDados = async () => {
      if (!userInfo?.id) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const res = await api.get(`/clientes/${userInfo.id}`);
        if (isCancelled) return;

        const dados = res.data || {};
        setClientData(dados);

        // Aplica formatação aos dados carregados
        setFormData(prev => ({
          ...prev,
          cpf: dados.cpf ? formatCPF(dados.cpf) : '',
          telefone: dados.phone ? formatTelefone(dados.phone) : '',
          cep: dados.cep ? formatCEP(dados.cep) : '',
          endereco: dados.endereco || '',
          cidade: dados.cidade || '',
          estado: dados.estado || ''
        }));
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        setClientData(null);
        setModal({
          open: true,
          type: 'error',
          message: 'Erro ao carregar dados do cliente.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      } finally {
        if (!isCancelled) {
          setLoadingData(false);
        }
      }
    };

    carregarDados();
    return () => { isCancelled = true; };
  }, [userInfo?.id]);

  if (!userInfo) return <div className={styles.loading}>Carregando...</div>;

  if (loadingData) return <div className={styles.loading}>Carregando dados do cliente...</div>;

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    switch (field) {
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'telefone':
        formattedValue = formatTelefone(value);
        break;
      case 'cep':
        formattedValue = formatCEP(value);
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    } else if (!validarCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (formData.cep.replace(/\D/g, '').length === 9) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userInfo?.id) {
      setModal({
        open: true,
        type: 'error',
        message: 'Usuário não identificado. Faça login novamente.',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    setLoading(true);

    try {
      const dadosAtualizar = {
        name: clientData?.name || userInfo?.name || '',
        email: userInfo?.email || '',
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.telefone.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        role: 2
      };

      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (cpfLimpo === '12342323233' || cpfLimpo === '12345678901') {
        setModal({
          open: true,
          type: 'error',
          message: 'CPF inválido! Use um CPF válido para teste. Exemplo: 11144477735',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
        setLoading(false);
        return;
      }

      const response = await api.put(`/clientes/${userInfo.id}`, dadosAtualizar);

      setSuccessPopupVisible(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      let errorMessage = 'Erro ao salvar informações. Tente novamente.';

      if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Cliente não encontrado. Faça login novamente.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
      setModal({
        open: true,
        type: 'error',
        message: errorMessage,
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={modal.open}
        type={modal.type}
        message={modal.message}
        onClose={() => {
          setModal(modal => ({ ...modal, open: false }));
          modal.cb && modal.cb();
        }}
      />
      <SuccessPopup show={showSuccess} />
      <NavbarLogado />
      <div className={styles.adicionarInfoContainer}>
        <div className={styles.adicionarInfoContent}>
          <form onSubmit={handleSubmit} className={styles.infoForm}>
            <div className={styles.existingInfoSection}>
              <h3>Informações já cadastradas</h3>
              <div className={styles.existingInfoGrid}>
                <div className={styles.infoItem}>
                  <label>Nome</label>
                  <div className={styles.infoValue}>{clientData?.name || userInfo?.name || 'Não informado'}</div>
                </div>
                <div className={styles.infoItem}>
                  <label>Email</label>
                  <div className={styles.infoValue}>{userInfo.email || 'Não informado'}</div>
                </div>
              </div>
            </div>
            <div className={styles.newInfoSection}>
              <h3>Complete suas informações</h3>
              <div className={styles.formGroup}>
                <label htmlFor="cpf">CPF *</label>
                <input
                  type="text"
                  id="cpf"
                  className={`${styles.formInput} ${errors.cpf ? styles.error : ''}`}
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && <span className={styles.errorMessage}>{errors.cpf}</span>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="telefone">Telefone *</label>
                <input
                  type="text"
                  id="telefone"
                  className={`${styles.formInput} ${errors.telefone ? styles.error : ''}`}
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {errors.telefone && <span className={styles.errorMessage}>{errors.telefone}</span>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cep">CEP *</label>
                <input
                  type="text"
                  id="cep"
                  className={`${styles.formInput} ${errors.cep ? styles.error : ''}`}
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={10}
                />
                {errors.cep && <span className={styles.errorMessage}>{errors.cep}</span>}
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnSalvar}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}>
                    <span></span>
                    Salvando...
                  </span>
                ) : (
                  <>
                    <span></span>
                    Salvar Informações
                  </>
                )}
              </button>
            </div>
          </form>
          <SuccessPopup show={successPopupVisible} onClose={() => setSuccessPopupVisible(false)} />
        </div>
      </div>
    </>
  );
}