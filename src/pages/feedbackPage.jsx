import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from '../common/styles/feedback.module.css';
import NavbarLogado from '../common/components/NavbarLogado';
import Pagination from '../common/components/Pagination';
import Modal from '../common/components/Modal';
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
      <div className={styles.cardContent}>
        <div className={styles.cardPrincipal}>
          <h3 className={styles.username}>{item.schedule?.client?.name || 'Usuario'}</h3>
          <div className={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: i < (item.rating || 0) ? '#f6c948' : '#e5e7eb' }}>★</span>
            ))}
          </div>
        </div>
        <p className={styles.date}>Data: {formatDate(item.createdAt || item.date || '—')}</p>
      </div>
      <button className={styles.viewButton} onClick={() => onView(item.id)}>
        Ver comentário
      </button>
    </div>
  );
};

export default function FeedbackScreen() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

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

  const [totalPages, setTotalPages] = React.useState(1);

  const fetchFeedbacks = async (page = 0, rating = null, employeeId = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/feedbacks?page=${page}`;
      if (rating !== null) {
        url += `&rating=${rating}`;
      }
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      
      const res = await api.get(url);
      const data = res.data;
      console.log(data);
      
      if (data?.content !== undefined) {
        setFeedbacks(data.content || []);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setFeedbacks(data);
        setTotalPages(1);
      } else {
        console.warn('Formato de resposta inesperado:', data);
        setFeedbacks([]);
      }
    } catch (err) {
      console.error('Erro ao buscar feedbacks', err);
      setError('Não foi possível carregar feedbacks.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFeedbacks(0);
  }, []);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/funcionarios');
        const employeesList = res.data || [];
        
        const filteredEmployees = employeesList.filter(emp => {
          const roleName = emp?.role?.name || emp?.role;
          if (!roleName) return false;
          const normalized = String(roleName)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return normalized === 'funcionario' || normalized === 'administrador';
        });
        
        setEmployees(filteredEmployees);
      } catch (err) {
        console.error('Erro ao buscar funcionários', err);
      }
    };
    fetchEmployees();
  }, []);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/servicos');
        const servicesList = res.data || [];
        setServices(servicesList);
      } catch (err) {
        console.error('Erro ao buscar serviços', err);
      }
    };
    fetchServices();
  }, []);

  const handleViewComment = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const res = await api.get(`/feedbacks/${id}`);
      setSelectedDetail(res.data);
      console.log(res.data);
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

  const getFilteredFeedbacks = () => {
    // Filtragem por serviço ainda é feita no frontend (backend não suporta esse filtro combinado)
    if (selectedService) {
      return feedbacks.filter(feedback => {
        const hasService = feedback.schedule?.items?.some(item => 
          item.service?.name === selectedService
        );
        return hasService;
      });
    }
    return feedbacks;
  };

  const getPaginatedFeedbacks = () => {
    // Se tem filtro de serviço, paginar no frontend
    if (selectedService) {
      const filtered = getFilteredFeedbacks();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filtered.slice(startIndex, endIndex);
    }
    // Caso contrário, o backend já fez a paginação
    return feedbacks;
  };

  const getTotalPages = () => {
    // Se tem filtro de serviço, calcular no frontend
    if (selectedService) {
      const filtered = getFilteredFeedbacks();
      return Math.ceil(filtered.length / itemsPerPage) || 1;
    }
    return totalPages;
  };

  // Quando muda filtro de rating ou employee, buscar do backend
  React.useEffect(() => {
    setCurrentPage(1);
    const employeeIdNum = selectedEmployee ? parseInt(selectedEmployee) : null;
    fetchFeedbacks(0, selectedRating, employeeIdNum);
  }, [selectedRating, selectedEmployee]);
  
  // Quando muda de página e não há filtro de serviço, buscar do backend
  React.useEffect(() => {
    if (!selectedService) {
      const employeeIdNum = selectedEmployee ? parseInt(selectedEmployee) : null;
      fetchFeedbacks(currentPage - 1, selectedRating, employeeIdNum);
    }
  }, [currentPage]);

  return (
    <div className={styles.container}>
      <NavbarLogado isAdmin={true} />
      <div className={styles.filters}>
        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Categoria:</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Funcionário:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
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

      <div className={styles.content}>
        <div className={styles.grid}>
          {loading && (
            <Modal open={true} type="loading" message="Carregando comentários..." onClose={() => {}} />
          )}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && getFilteredFeedbacks().length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIconContainer}>
                <Plus className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>Nenhum comentário encontrado</h3>
            </div>
          )}
          {!loading && getPaginatedFeedbacks().map((feedback) => (
            <FeedbackCard key={feedback.id} item={feedback} onView={handleViewComment} />
          ))}
        </div>

        {!loading && getTotalPages() > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages()}
            onPageChange={(page) => setCurrentPage(page + 1)}
            onPrevPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
          />
        )}

        {detailOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 600 }}>
              <button onClick={closeDetail} style={{ float: 'right', background: 'transparent', border: 'none', fontSize: 18 }}>✕</button>
              <h3 style={{ marginBottom: 10, color: 'var(--ROSA-LOGO)' }}>Comentário</h3>
                {detailLoading && <div>Carregando...</div>}
                {!detailLoading && selectedDetail && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p><strong>Cliente:</strong> {selectedDetail.schedule.client.name ?? selectedDetail.clientId ?? '—'}</p>
                    <p><strong>Funcionário:</strong> {selectedDetail.schedule.employee.name ?? selectedDetail.clientId ?? '—'}</p>
                    <p><strong>Nota:</strong> {selectedDetail.rating ?? '—'}/5</p>
                    <p><strong>Data:</strong> {formatDate(selectedDetail.createdAt ?? selectedDetail.date ?? '—')}</p>
                    <div style={{ marginTop: 12 }}>
                      <strong style={{ color: 'var(--ROSA-LOGO)' }}>Comentário:</strong>
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