
import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/AgendarFunc";
import EditarAgendar from "../common/components/EditarAgendar";
import Popup from '../common/components/Popup';
import api from '../services/api';
import FinalizarAgendamentoModal from '../common/components/FinalizarAgendamentoModal';

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
  const [editingId, setEditingId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchAgendamentos = async (pageNum, inicio = null, fim = null) => {
    try {
      setLoading(true);
      let url = `/agendamentos?page=${pageNum}`;
      if (inicio && fim) {
        url += `&dataInicio=${inicio}&dataFim=${fim}`;
      }
      
      console.log('Fetching appointments with URL:', url);
      const response = await api.get(url);
      const data = response.data;
      console.log('Response data:', data);

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
            // Se vir como string ISO
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
        alert('Sessão expirada. Por favor, faça login novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar todas as páginas quando necessário
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
        alert('Sessão expirada. Por favor, faça login novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchAgendamentos(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualizar quando página ou filtro mudar
  useEffect(() => {
    if (filtroAtivo) {
      fetchAgendamentos(page, dataInicio, dataFim);
    } else {
      fetchAgendamentos(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtroAtivo]);

  // Buscar todos os dados quando filtro de status muda (para poder filtrar e paginar no frontend)
  // Só busca todos se não houver filtro de data ativo
  useEffect(() => {
    if (statusFilter !== 'TODOS' && !filtroAtivo) {
      fetchAllAgendamentos();
    } else if (statusFilter === 'TODOS' && allAgendamentos.length > 0 && !filtroAtivo) {
      // Se voltou para TODOS, limpar dados acumulados e voltar à paginação normal
      setAllAgendamentos([]);
      fetchAgendamentos(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento');
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
    // Implement feedback functionality if needed
    console.log('Feedback para agendamento:', id);
  };

  const handleNovoAgendamento = () => {
    setIsModalOpen(true);
  };

  const handleAplicarFiltro = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, preencha ambas as datas');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      alert('Data de início não pode ser maior que data de fim');
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

  const onPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const onNextPage = () => setPage((p) => (p + 1 < totalPages ? p + 1 : p));
  const onPageChange = (newPage) => setPage(newPage); // newPage já vem 0-based do componente Pagination

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
      alert('Erro ao atualizar lista de agendamentos');
    }
  };

  const handleFinalizar = (id) => {
    setSelectedAgendamentoId(id);
    setIsFinalizarModalOpen(true);
  };

  const formatDateTimeForAPI = (dateArr) => {
    // if (!Array.isArray(dateArr) || dateArr.length < 5) return null;
    // const [year, month, day, hour, minute] = dateArr;
    // // Format to YYYY-MM-DDTHH:mm:ss
    // const pad = (n) => n.toString().padStart(2, '0');
    // return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
    return dateArr;
  };

  const handleConfirmFinalizar = async (data) => {
    try {
      const rawAppointment = rawAgendamentos.find(a => a.id === selectedAgendamentoId);

      if (!rawAppointment) {
        alert('Erro ao encontrar dados do agendamento.');
        return;
      }

      const paymentMap = {
        'CREDIT_CARD': 1,
        'DEBIT_CARD': 2,
        'PIX': 3,
        'CASH': 4
      };

      console.log("Finalizing appointment:", rawAppointment);

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

      console.log('Sending payload:', payload);

      await api.put(`/agendamentos/${selectedAgendamentoId}`, payload);

      setIsFinalizarModalOpen(false);
      setSelectedAgendamentoId(null);
      if (filtroAtivo) {
        await fetchAgendamentos(page, dataInicio, dataFim);
      } else {
        await fetchAgendamentos(page);
      }
      alert('Agendamento finalizado com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar agendamento:', error);
      console.error('Response data:', error.response?.data);
      const msg = error.response?.data?.message || 'Erro ao finalizar agendamento.';
      alert(`Erro: ${msg}`);
    }
  };

  const getFilteredAgendamentos = () => {
    // Se filtro de status está ativo, usar allAgendamentos, senão usar agendamentos da página atual
    const sourceData = (statusFilter !== 'TODOS' && allAgendamentos.length > 0) ? allAgendamentos : agendamentos;
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

        // Comparar apenas a parte de data (ano, mês, dia) para evitar problemas de timezone
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

  // Calcular paginação baseada nos dados filtrados quando filtro de status está ativo
  const getPaginatedData = () => {
    const filtered = getFilteredAgendamentos();
    const itemsPerPage = 10; // Ajuste conforme necessário
    
    // Se não há filtro de status, usa paginação do backend
    if (statusFilter === 'TODOS') {
      return { data: filtered, totalPages: totalPages };
    }
    
    // Se há filtro de status, pagina no frontend
    const calculatedTotalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    return { data: paginatedData, totalPages: calculatedTotalPages };
  };

  if (loading) {
    return <div>Carregando agendamentos...</div>;
  }

  return (
    <>
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