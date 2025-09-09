import React, { useEffect, useState } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from '../common/styles/Informacoes.module.css';

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
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [clientData, setClientData] = useState(null);

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

        console.log('Dados carregados do banco:', dados);

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

        if (dados.cep && dados.cep.length === 8) {
          buscarEnderecoPorCEPCarregado(dados.cep);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        setClientData(null);
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

  const buscarEnderecoPorCEPCarregado = async (cep) => {
    if (cep && cep.length === 8) {
      try {
        console.log('Buscando endereço para CEP carregado do banco:', cep);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          console.log('Dados do endereço encontrados:', data);
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }));
        } else {
          console.log('CEP não encontrado na API ViaCEP');
        }
      } catch (error) {
        console.log('Erro ao buscar CEP carregado do banco:', error);
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
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    // Campos de endereço não são validados pois são apenas para exibição

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
        // Campos obrigatórios do backend
        name: clientData?.name || userInfo?.name || '',
        email: userInfo?.email || '',
        password: 'dummy123', // Senha temporária para validação

        // Campos que estamos atualizando
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação
        phone: formData.telefone.replace(/\D/g, ''), // Remove formatação e usa 'phone'
        cep: formData.cep.replace(/\D/g, ''), // Remove hífen, apenas números
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,

        // Campo de timestamp
        updated_at: new Date().toISOString(),
      };

      console.log('Enviando dados:', dadosAtualizar);
      console.log('Endpoint:', `/clientes/${userInfo.id}`);

      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (cpfLimpo === '12342323233' || cpfLimpo === '12345678901') {
        alert('CPF inválido! Use um CPF válido para teste. Exemplo: 11144477735');
        return;
      }

      console.log('Fazendo PUT...');
      const response = await api.put(`/clientes/${userInfo.id}`, dadosAtualizar);
      console.log('Resposta da API:', response.data);

      alert('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Erro detalhado ao salvar:', error);
      console.error('Status:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);

      let errorMessage = 'Erro ao salvar informações. Tente novamente.';

      if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Cliente não encontrado. Faça login novamente.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }

      alert(errorMessage);
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
                  maxLength={9}
                />
                {errors.cep && <span className={styles.errorMessage}>{errors.cep}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endereco">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  className={styles.formInput}
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cidade">Cidade</label>
                <input
                  type="text"
                  id="cidade"
                  className={styles.formInput}
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="estado">Estado</label>
                <input
                  type="text"
                  id="estado"
                  className={styles.formInput}
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="Estado"
                  maxLength={2}
                  readOnly
                />
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
