import React, { useState } from 'react';
import { User } from 'lucide-react';
import styles from '../common/styles/feedback.module.css';
import NavbarLogado from '../common/components/NavbarLogado';
import BotaoPrincipal from '../common/components/BotaoPrincipal';
import api from '../services/api';

const FeedbackCard = ({ item, onView }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = Array.isArray(dateStr) 
        ? new Date(dateStr[0], dateStr[1] - 1, dateStr[2]) 
        : new Date(dateStr);
        
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '—';
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.username}>{item.schedule.client.name || 'Usuario'}</h3>
      <div className={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < (item.rating || 0) ? '#f6c948' : '#e5e7eb' }}>★</span>
        ))}
      </div>
      <div className={styles.info}>
        <p className="text-sm">Nota : {item.rating}/5</p>
        <p className="text-sm">Data: {formatDate(item.createdAt || item.date || '—')}</p>
        <p className="text-sm">Tempo de duração: {item.duration || '—'}</p>
      </div>
      <button className={styles.viewButton} onClick={() => onView(item.id)}>
        Ver comentário
      </button>
    </div>
  );
};

export default function FeedbackScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Atual');
  const [selectedService, setSelectedService] = useState('');
  const [selectedRating, setSelectedRating] = useState(null); // null = todos, 1-5 = estrelas
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

    const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = Array.isArray(dateStr) 
        ? new Date(dateStr[0], dateStr[1] - 1, dateStr[2]) 
        : new Date(dateStr);
        
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '—';
    }
  };

  // Load feedbacks (first page)
  React.useEffect(() => {
    let mounted = true;
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/feedbacks?page=0');
        // Controller returns a Page object; content usually in res.data.content
        const data = res.data;
        const items = data?.content ?? data; // fallback if not paged
        if (mounted) setFeedbacks(items || []);
      } catch (err) {
        console.error('Erro ao buscar feedbacks', err);
        setError('Não foi possível carregar feedbacks.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFeedbacks();
    return () => { mounted = false; };
  }, []);

  // Fetch detail and show comment modal
  const handleViewComment = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const res = await api.get(`/feedbacks/${id}`);
      setSelectedDetail(res.data);
    } catch (err) {
      console.error('Erro ao buscar detalhe do feedback', err);
      setSelectedDetail({ error: 'Não foi possível carregar o comentário.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedDetail(null);
  };

  // Função para filtrar feedbacks
  const getFilteredFeedbacks = () => {
    return feedbacks.filter(feedback => {
      // Filtrar por estrelas
      if (selectedRating !== null && feedback.rating !== selectedRating) {
        return false;
      }
      
      // Filtrar por categoria de serviço
      if (selectedService) {
        const hasService = feedback.schedule?.items?.some(item => 
          item.service?.name?.toLowerCase().includes(selectedService.toLowerCase())
        );
        if (!hasService) return false;
      }
      
      return true;
    });
  };

  return (
    <div className={styles.container}>
      {/* Reuse global navbar */}
      <NavbarLogado isAdmin={true} />

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Categoria:</label>
            <input
              type="text"
              placeholder="Pesquisar serviço..."
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Classificação:</label>
            <div className={styles.starsFilter}>
              <button
                className={`${styles.starButton} ${selectedRating === null ? styles.active : ''}`}
                onClick={() => setSelectedRating(null)}
              >
                Todas
              </button>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.starButton} ${selectedRating === star ? styles.active : ''}`}
                  onClick={() => setSelectedRating(star)}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Cards Grid */}
      <div className={styles.content}>
        <div className={styles.grid}>
          {loading && <div>Carregando feedbacks...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && getFilteredFeedbacks().length === 0 && <div>Nenhum feedback encontrado.</div>}
          {!loading && getFilteredFeedbacks().map((feedback) => (
            <FeedbackCard key={feedback.id} item={feedback} onView={handleViewComment} />
          ))}
        </div>

        {/* Detail modal */}
        {detailOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 600 }}>
              <button onClick={closeDetail} style={{ float: 'right', background: 'transparent', border: 'none', fontSize: 18 }}>✕</button>
              <h3 style={{ marginTop: 0 }}>Comentário</h3>
              {detailLoading && <div>Carregando...</div>}
              {!detailLoading && selectedDetail && (
                <div>
                  <p><strong>Usuário:</strong> {selectedDetail.schedule.client.name ?? selectedDetail.clientId ?? '—'}</p>
                  <p><strong>Nota:</strong> {selectedDetail.rating ?? '—'}/5</p>
                  <p><strong>Data:</strong> {formatDate(selectedDetail.createdAt ?? selectedDetail.date ?? '—')}</p>
                  <div style={{ marginTop: 12 }}>
                    <strong>Comentário:</strong>
                    <p style={{ background: '#f7f7f7', padding: 12, borderRadius: 8 }}>{selectedDetail.comment ?? selectedDetail.comentario ?? 'Sem comentário.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}