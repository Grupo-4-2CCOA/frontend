import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/AgendarFunc";
import EditarAgendar from "../common/components/EditarAgendar";
import Popup from '../common/components/Popup';
import api from '../services/api';
import FinalizarAgendamentoModal from '../common/components/FinalizarAgendamentoModal';
import Modal from '../common/components/Modal';

export default function AgendamentoFuncionario() {
  const [showPopup, setShowPopup] = useState(false);
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [rawAgendamentos, setRawAgendamentos] = useState([]);
  const [allAgendamentos, setAllAgendamentos] = useState([]); // Para armazenar todos os agendamentos quando filtro de status está ativo
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [filtroAtivo, setFiltroAtivo] = useState(false);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });
  const [editingId, setEditingId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchAgendamentos = async (pageNum, inicio = null, fim = null) => {
    try {
      setLoading(true);
      let url = `/agendamentos?page=${pageNum}`;
      if (inicio && fim) {
        url += `&dataInicio=${inicio}&dataFim=${fim}`;
      }
      
      const response = await api.get(url);
      const data = response.data;

      const content = Array.isArray(data) ? data : (data.content || []);
      const total = data?.totalPages ?? 0;
      setTotalPages(total);
      setRawAgendamentos(content);

      const formattedAppointments = content.map(apt => {
        const dateArr = apt?.appointmentDatetime;
        let dataPt = '';

        try {
          if (Array.isArray(dateArr) && dateArr.length >= 5) {
            const d = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4]);
            const day = d.getDate();
            const month = d.toLocaleString('pt-BR', { month: 'long' });
            const year = d.getFullYear();
            const time = d.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            dataPt = `${day} de ${month} de ${year} às ${time}`;
          } else if (typeof dateArr === 'string') {
            const d = new Date(dateArr);
            if (!isNaN(d.getTime())) {
              const day = d.getDate();
              const month = d.toLocaleString('pt-BR', { month: 'long' });
              const year = d.getFullYear();
              const time = d.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              dataPt = `${day} de ${month} de ${year} às ${time}`;
            }
          }
        } catch (error) {
          console.error('Error formatting date:', error, dateArr);
        }

        const nomesServicos = apt?.items?.map(i => i.service?.name).filter(Boolean) || [];
        const total = apt?.items?.reduce((sum, i) => sum + (i.finalPrice || 0), 0) || 0;

        return {
          id: apt?.id,
          data: dataPt || '-',
          servico: nomesServicos.join(', '),
          servicos: nomesServicos,
          cliente: apt.client?.name || 'Cliente não identificado',
          status: apt?.status || 'PENDING',
          total: total,
          items: apt?.items || []
        };
      });

      setAgendamentos(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      if (error.response?.status === 401) {
        setModal({
          open: true,
          type: 'error',
          message: 'Sessão expirada. Por favor, faça login novamente.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      } else {
        setModal({
          open: true,
          type: 'error',
          message: 'Erro ao buscar agendamentos. Tente novamente.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAgendamentos = async (inicio = null, fim = null) => {
    try {
      setLoading(true);
      let allData = [];
      let currentPage = 0;
      let hasMore = true;

      while (hasMore) {
        let url = `/agendamentos?page=${currentPage}`;
        if (inicio && fim) {
          url += `&dataInicio=${inicio}&dataFim=${fim}`;
        }
        
        const response = await api.get(url);
        const data = response.data;
        const content = Array.isArray(data) ? data : (data.content || []);
        
        if (content.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...content];
          const total = data?.totalPages ?? 0;
          if (currentPage >= total - 1) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }
      }

      setRawAgendamentos(allData);

      const formattedAppointments = allData.map(apt => {
        const dateArr = apt?.appointmentDatetime;
        let dataPt = '';

        try {
          if (Array.isArray(dateArr) && dateArr.length >= 5) {
            const d = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], dateArr[3], dateArr[4]);
            const day = d.getDate();
            const month = d.toLocaleString('pt-BR', { month: 'long' });
            const year = d.getFullYear();
            const time = d.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            dataPt = `${day} de ${month} de ${year} às ${time}`;
          } else if (typeof dateArr === 'string') {
            const d = new Date(dateArr);
            if (!isNaN(d.getTime())) {
              const day = d.getDate();
              const month = d.toLocaleString('pt-BR', { month: 'long' });
              const year = d.getFullYear();
              const time = d.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              dataPt = `${day} de ${month} de ${year} às ${time}`;
            }
          }
        } catch (error) {
          console.error('Error formatting date:', error, dateArr);
        }

        const nomesServicos = apt?.items?.map(i => i.service?.name).filter(Boolean) || [];
        const total = apt?.items?.reduce((sum, i) => sum + (i.finalPrice || 0), 0) || 0;

        return {
          id: apt?.id,
          data: dataPt || '-',
          servico: nomesServicos.join(', '),
          servicos: nomesServicos,
          cliente: apt.client?.name || 'Cliente não identificado',
          status: apt?.status || 'PENDING',
          total: total,
          items: apt?.items || []
        };
      });

      setAllAgendamentos(formattedAppointments);
      setAgendamentos(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar todos os agendamentos:', error);
      if (error.response?.status === 401) {
        setModal({
          open: true,
          type: 'error',
          message: 'Sessão expirada. Por favor, faça login novamente.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      } else {
        setModal({
          open: true,
          type: 'error',
          message: 'Erro ao buscar agendamentos. Tente novamente.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos(0);
  }, []);

  // Efeito para mudanças de página - só buscar se não houver filtro de status
  useEffect(() => {
    // Só buscar quando não há filtro de status ativo (para evitar conflitos)
    // Quando há filtro de status, os dados já foram buscados e a paginação é feita no frontend
    if (statusFilter === 'TODOS') {
      if (filtroAtivo && dataInicio && dataFim) {
        fetchAgendamentos(page, dataInicio, dataFim);
      } else {
        fetchAgendamentos(page);
      }
    }
    // Se statusFilter !== 'TODOS', não buscar aqui pois já foi buscado no useEffect do statusFilter
    // e a paginação é feita no frontend através do getPaginatedData()
  }, [page]);

  // Efeito para mudanças de filtro de status
  useEffect(() => {
    // Sempre resetar para primeira página ao mudar o filtro de status
    setPage(0);
    
    if (statusFilter !== 'TODOS') {
      // Se há filtro de status, buscar TODOS os agendamentos para filtrar no frontend
      // Se há filtro de data ativo, buscar todos os agendamentos com filtro de data
      if (filtroAtivo && dataInicio && dataFim) {
        fetchAllAgendamentos(dataInicio, dataFim);
      } else {
        fetchAllAgendamentos();
      }
    } else {
      // Quando voltar para TODOS, limpar allAgendamentos e buscar normalmente
      setAllAgendamentos([]);
      // Buscar página 0 - o useEffect de page não vai disparar porque setPage(0) não muda o estado se já for 0
      if (filtroAtivo && dataInicio && dataFim) {
        fetchAgendamentos(0, dataInicio, dataFim);
      } else {
        fetchAgendamentos(0);
      }
    }
  }, [statusFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/agendamentos/${id}`);
      if (filtroAtivo) {
        await fetchAgendamentos(page, dataInicio, dataFim);
      } else {
        await fetchAgendamentos(page);
      }
      setAgendamentoParaDeletar(null);
      setShowPopup(false);
      setModal({
        open: true,
        type: 'success',
        message: 'Agendamento cancelado com sucesso!',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      setModal({
        open: true,
        type: 'error',
        message: 'Erro ao cancelar agendamento.',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    }
  };

  const handleConfirmDelete = () => {
    if (agendamentoParaDeletar) {
      handleDelete(agendamentoParaDeletar);
    }
  };

  const handleShowDeletePopup = (id) => {
    setAgendamentoParaDeletar(id);
    setShowPopup(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setIsEditOpen(true);
  };

  const handleFeedback = (id) => {
    console.log('Feedback para agendamento:', id);
  };

  const handleNovoAgendamento = () => {
    setIsModalOpen(true);
  };

  const handleAplicarFiltro = async () => {
    if (!dataInicio || !dataFim) {
      setModal({
        open: true,
        type: 'error',
        message: 'Por favor, preencha ambas as datas',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      setModal({
        open: true,
        type: 'error',
        message: 'Data de início não pode ser maior que data de fim',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    setPage(0);
    setFiltroAtivo(true);
    await fetchAgendamentos(0, dataInicio, dataFim);
  };

  const handleLimparFiltro = async () => {
    setDataInicio('');
    setDataFim('');
    setFiltroAtivo(false);
    setPage(0);
    await fetchAgendamentos(0);
  };

  const getEffectiveTotalPages = () => {
    const paginatedData = getPaginatedData();
    return paginatedData.totalPages;
  };

  const onPrevPage = () => {
    setPage((p) => {
      const effectiveTotalPages = getEffectiveTotalPages();
      return Math.max(0, p - 1);
    });
  };
  
  const onNextPage = () => {
    setPage((p) => {
      const effectiveTotalPages = getEffectiveTotalPages();
      return (p + 1 < effectiveTotalPages ? p + 1 : p);
    });
  };
  
  const onPageChange = (newPage) => {
    const effectiveTotalPages = getEffectiveTotalPages();
    setPage(Math.min(newPage, effectiveTotalPages - 1));
  };

  const handleConfirmarAgendamento = async (novoAgendamento) => {
    try {
      if (filtroAtivo) {
        await fetchAgendamentos(0, dataInicio, dataFim);
      } else {
        await fetchAgendamentos(0);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar lista de agendamentos:', error);
      setModal({
        open: true,
        type: 'error',
        message: 'Erro ao atualizar lista de agendamentos.',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    }
  };

  const handleFinalizar = (id) => {
    setSelectedAgendamentoId(id);
    setIsFinalizarModalOpen(true);
  };

  const formatDateTimeForAPI = (dateArr) => {
    return dateArr;
  };

  const handleConfirmFinalizar = async (data) => {
    try {
      const rawAppointment = rawAgendamentos.find(a => a.id === selectedAgendamentoId);

      if (!rawAppointment) {
        setModal({
          open: true,
          type: 'error',
          message: 'Erro ao encontrar dados do agendamento.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
        return;
      }

      const paymentMap = {
        'CREDIT_CARD': 1,
        'DEBIT_CARD': 2,
        'PIX': 3,
        'CASH': 4
      };


      const payload = {
        client: rawAppointment.client?.id,
        employee: rawAppointment.employee?.id,
        appointmentDatetime: formatDateTimeForAPI(rawAppointment.appointmentDatetime),
        status: 'COMPLETED',
        duration: rawAppointment.duration,
        paymentType: paymentMap[data.paymentMethod],
        transactionHash: null,
        // createdAt: rawAppointment.createdAt,
        // updatedAt: new Date().toISOString(),
        items: rawAppointment.items?.map(item => ({
          service: item.service?.id,
          finalPrice: item.finalPrice,
          discount: item.discount
        })) || []
      };

      await api.put(`/agendamentos/${selectedAgendamentoId}`, payload);

      setIsFinalizarModalOpen(false);
      setSelectedAgendamentoId(null);
      if (filtroAtivo) {
        await fetchAgendamentos(page, dataInicio, dataFim);
      } else {
        await fetchAgendamentos(page);
      }
      setModal({
        open: true,
        type: 'success',
        message: 'Agendamento finalizado com sucesso!',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    } catch (error) {
      console.error('Erro ao finalizar agendamento:', error);
      const msg = error.response?.data?.message || 'Erro ao finalizar agendamento.';
      setModal({
        open: true,
        type: 'error',
        message: `Erro: ${msg}`,
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
    }
  };

  const getFilteredAgendamentos = () => {
    // Quando há filtro de status, usar allAgendamentos (que já foram buscados todos)
    // Quando não há filtro de status, usar agendamentos (paginação do backend)
    let sourceData;
    
    if (statusFilter !== 'TODOS' && allAgendamentos.length > 0) {
      sourceData = allAgendamentos;
    } else if (statusFilter === 'TODOS') {
      sourceData = agendamentos;
    } else {
      // Caso intermediário: filtro de status ativo mas ainda não carregou todos
      sourceData = agendamentos;
    }
    
    let filtered = sourceData;

    // Filtrar por status
    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(agendamento => agendamento.status === statusFilter);
    }

    // Não filtrar por data quando filtroAtivo é true, pois o backend já retornou os dados filtrados
    // O filtro de data no frontend só é necessário quando o usuário está visualizando sem aplicar o filtro
    if (!filtroAtivo && (dataInicio || dataFim)) {
      filtered = filtered.filter(agendamento => {
        // Buscar o agendamento original para pegar appointmentDatetime
        const rawAppointment = rawAgendamentos.find(a => a.id === agendamento.id);
        if (!rawAppointment) return true;

        const agendamentoDate = rawAppointment.appointmentDatetime;
        let agendDate = null;

        if (Array.isArray(agendamentoDate) && agendamentoDate.length >= 5) {
          agendDate = new Date(agendamentoDate[0], agendamentoDate[1] - 1, agendamentoDate[2], agendamentoDate[3], agendamentoDate[4]);
        } else if (Array.isArray(agendamentoDate) && agendamentoDate.length >= 3) {
          agendDate = new Date(agendamentoDate[0], agendamentoDate[1] - 1, agendamentoDate[2]);
        } else if (agendamentoDate) {
          agendDate = new Date(agendamentoDate);
        }

        if (!agendDate || isNaN(agendDate.getTime())) return true;

        const agendDateOnly = new Date(agendDate.getFullYear(), agendDate.getMonth(), agendDate.getDate());

        if (dataInicio) {
          const startDateParts = dataInicio.split('-');
          const startDate = new Date(parseInt(startDateParts[0]), parseInt(startDateParts[1]) - 1, parseInt(startDateParts[2]));
          if (agendDateOnly < startDate) return false;
        }

        if (dataFim) {
          const endDateParts = dataFim.split('-');
          const endDate = new Date(parseInt(endDateParts[0]), parseInt(endDateParts[1]) - 1, parseInt(endDateParts[2]));
          if (agendDateOnly > endDate) return false;
        }

        return true;
      });
    }

    return filtered;
  };

  const getPaginatedData = () => {
    const filtered = getFilteredAgendamentos();
    const itemsPerPage = 5; // Máximo de 5 agendamentos por página
    
    // Se não há filtro de status (TODOS), usa paginação do backend
    if (statusFilter === 'TODOS') {
      return { data: filtered, totalPages: totalPages };
    }
    
    // Se há filtro de status, faz paginação no frontend com 5 itens por página
    const calculatedTotalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    // Garantir que totalPages seja pelo menos 1 mesmo se não houver dados
    const finalTotalPages = calculatedTotalPages === 0 ? 1 : calculatedTotalPages;
    
    return { data: paginatedData, totalPages: finalTotalPages };
  };

  if (loading) {
    return (
      <Modal open={true} type="loading" message="Carregando agendamentos..." onClose={() => {}} />
    );
  }

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
      {showPopup && (
        <Popup
          hasButtons={true}
          onClick={handleConfirmDelete}
          title="Atenção!"
          text="Tem certeza que deseja cancelar o agendamento? Você não conseguirá reverter esta ação."
          setShowPopup={setShowPopup}
        />
      )}
      <NavbarLogado isAdmin={true} />
      <SecaoAgendar
        agendamentos={getPaginatedData().data}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
        onFinalizar={handleFinalizar}
        page={page}
        totalPages={getPaginatedData().totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onPageChange={onPageChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(0); // Resetar para primeira página ao mudar filtro
        }}
        dataInicio={dataInicio}
        onDataInicioChange={setDataInicio}
        dataFim={dataFim}
        onDataFimChange={setDataFim}
        onFilter={handleAplicarFiltro}
        onReset={handleLimparFiltro}
        filtroAtivo={filtroAtivo}
        isEmployee={true}
      />

      <Agendar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarAgendamento}
      />

      <EditarAgendar
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        scheduleId={editingId}
        onConfirm={async () => {
          await fetchAgendamentos(page);
        }}
      />

      <FinalizarAgendamentoModal
        isOpen={isFinalizarModalOpen}
        onClose={() => {
          setIsFinalizarModalOpen(false);
          setSelectedAgendamentoId(null);
        }}
        onConfirm={handleConfirmFinalizar}
      />
    </>
  );
}