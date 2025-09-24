import React, { useState } from 'react';
import api, { isAuthenticated, getAuthDebugInfo } from '../../services/api';

const FeedbackModal = ({ isOpen, onClose, onConfirm, agendamento, userInfo }) => {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    if (!agendamento || !agendamento.id) {
      setError('Erro: Agendamento não encontrado');
      return;
    }

    if (!userInfo || !userInfo.id) {
      setError('Erro: Informações do usuário não encontradas');
      return;
    }

    // Verificar se há cookies de autenticação
    if (!isAuthenticated()) {
      setError('Erro: Sessão não encontrada. Faça login novamente.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feedback = {
        client: userInfo.id, // ID do cliente
        schedule: agendamento.id, // ID do agendamento
        rating: rating, // Avaliação (1-5)
        comment: comentario || '' // Comentário (opcional)
      };

      console.log('Enviando feedback:', feedback);
      console.log('URL completa:', api.defaults.baseURL + '/feedback');
      console.log('Headers da requisição:', api.defaults.headers);
      console.log('Token no localStorage:', localStorage.getItem('token'));
      
      // Tentar diferentes endpoints possíveis baseado no padrão do backend
      let response;
      const endpoints = ['/feedback', '/feedbacks', '/api/feedback', '/api/feedbacks'];
      
      for (let i = 0; i < endpoints.length; i++) {
        try {
          console.log(`Tentando endpoint: ${endpoints[i]}`);
          response = await api.post(endpoints[i], feedback);
          console.log(`Sucesso com endpoint: ${endpoints[i]}`);
          break;
        } catch (error) {
          console.log(`Erro com endpoint ${endpoints[i]}:`, error.response?.status);
          if (i === endpoints.length - 1) {
            throw error; // Se todos falharam, lança o último erro
          }
        }
      }
      
      if (response.status === 200 || response.status === 201) {
        setShowSuccess(true);
        
        // Reset form after 1.5s
        setTimeout(() => {
          setRating(0);
          setComentario('');
          setHoveredRating(0);
          setShowSuccess(false);
          onClose();
          onConfirm(response.data);
        }, 1500);
      }
    } catch (err) {
      console.error('Erro ao salvar feedback:', err);
      console.error('Status:', err.response?.status);
      console.error('Dados do erro:', err.response?.data);
      console.error('Erro completo:', err);

      // Se não há resposta (erro de rede, CORS, etc.)
      if (!err.response) {
        setError('Erro de conexão. Verifique se o servidor está funcionando.');
        return;
      }

      switch (err.response.status) {
        case 400:
          setError('Um ou mais campos estão inválidos. Por favor, verifique os dados.');
          break;
        case 401:
          setError('Sessão expirada. Redirecionando para login...');
          // O interceptor do api.js já vai fazer o redirecionamento
          break;
        case 403:
          setError('Você não tem permissão para realizar esta ação.');
          break;
        case 404:
          setError('Endpoint não encontrado. Verifique se a API está funcionando.');
          break;
        case 422:
          setError('Dados inválidos. Verifique os campos preenchidos.');
          break;
        case 500:
        case 502:
        case 503:
          setError('Erro interno do servidor. Tente novamente mais tarde.');
          break;
        default:
          setError('Ocorreu um erro ao salvar o feedback. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add Success Popup component
  const SuccessPopup = () => {
    if (!showSuccess) return null;
    return (
      <div style={styles.successOverlay}>
        <div style={styles.successModal}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#4BB543"/>
            <path d="M15 25L22 32L34 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={styles.successText}>Feedback enviado!</div>
        </div>
      </div>
    );
  };

  const handleCancel = () => {
    setRating(0);
    setComentario('');
    setHoveredRating(0);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <SuccessPopup />
      <div style={styles.modal}>
        <h2 style={styles.title}>Feedback</h2>
        
        <div style={styles.agendamentoInfo}>
          <h3 style={styles.agendamentoTitle}>Agendamento {agendamento?.id}</h3>
          <p style={styles.agendamentoData}>
            Data do agendamento: {agendamento?.data}
          </p>
          <p style={styles.agendamentoServico}>
            Serviço: {agendamento?.servico}
          </p>
        </div>

        <div style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              style={{
                ...styles.star,
                color: (hoveredRating >= star || rating >= star) 
                  ? '#FFD700' 
                  : '#E0E0E0'
              }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </button>
          ))}
        </div>

        <div style={styles.comentarioContainer}>
          <textarea
            style={styles.comentarioInput}
            placeholder="Comentário"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
          />
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button 
            style={styles.cancelButton}
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            style={{
              ...styles.confirmButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    fontFamily: '"Roboto", sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '24px',
    color: '#000000',
  },
  agendamentoInfo: {
    backgroundColor: '#FFBDCE',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  agendamentoTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '12px',
  },
  agendamentoData: {
    fontSize: '16px',
    color: '#000000',
    marginBottom: '8px',
  },
  agendamentoServico: {
    fontSize: '16px',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ratingContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  star: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '4px',
  },
  comentarioContainer: {
    marginBottom: '24px',
  },
  comentarioInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #FFBDCE',
    fontSize: '16px',
    fontFamily: '"Roboto", sans-serif',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#9B59B6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Roboto", sans-serif',
  },
  confirmButton: {
    backgroundColor: '#9B59B6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Roboto", sans-serif',
  },
  errorMessage: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: '16px',
    fontSize: '14px'
  },
  successOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  successModal: {
    background: '#fff',
    borderRadius: 12,
    padding: '2rem 2.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    minWidth: 280
  },
  successText: {
    color: '#4BB543',
    fontWeight: 600,
    fontSize: 20
  }
};

export default FeedbackModal;