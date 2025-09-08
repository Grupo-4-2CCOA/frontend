import React, { useEffect, useState } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from  '../common/styles/Informacoes.module.css';

export default function AdicionarInformacoes() {
  const { userInfo } = useAuth('USER');
  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    cep: '',
    endereco: '',
    cidade: '',
    estado: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Carrega dados existentes do cliente quando o id estiver disponível
  useEffect(() => {
    let isCancelled = false;

    const carregarDados = async () => {
      if (!userInfo?.id) return;
      try {
        const res = await api.get(`/clientes/${userInfo.id}`);
        if (isCancelled) return;
        const dados = res.data || {};
        setFormData(prev => ({
          ...prev,
          cpf: dados.cpf || '',
          telefone: dados.telefone || '',
          cep: dados.cep || '',
          endereco: dados.endereco || '',
          cidade: dados.cidade || '',
          estado: dados.estado || ''
        }));
      } catch (error) {
        // Evita estourar erro visual aqui; a interceptação 401 já redireciona
        console.error('Erro ao carregar dados do cliente:', error);
      }
    };

    carregarDados();
    return () => { isCancelled = true; };
  }, [userInfo?.id]);

  if (!userInfo) return <div className={styles.loading}>Carregando...</div>;

  // Funções de formatação...
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

  const buscarEnderecoPorCEP = async (cep) => {
    if (cep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar CEP');
      }
    }
  };

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
        if (formattedValue.length === 9) {
          buscarEnderecoPorCEP(formattedValue);
        }
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
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
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
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    setLoading(true);
    
    try {
      const dadosAtualizar = {
        cpf: formData.cpf,
        telefone: formData.telefone,
        cep: formData.cep,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
      };
      await api.put(`/clientes/${userInfo.id}`, dadosAtualizar);
      alert('Informações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarLogado />
      <div className={styles.adicionarInfoContainer}>
        <div className={styles.adicionarInfoContent}>
          

          <form onSubmit={handleSubmit} className={styles.infoForm}>
            <div className={styles.existingInfoSection}>
              <h3>Informações já cadastradas</h3>
              <div className={styles.existingInfoGrid}>
                <div className={styles.infoItem}>
                  <label>Nome</label>
                  <div className={styles.infoValue}>{userInfo.name || 'Não informado'}</div>
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
                  maxLength={9}
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
        </div>
      </div>
    </>
  );
}
