import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/Agendar";
import FeedbackModal from "../common/components/FeedbackModal";
import Popup from '../common/components/Popup';
import api from '../services/api';
import EditarAgendar from "../common/components/EditarAgendar";

export default function AgendamentoCliente() {
  const [showPopup, setShowPopup] = useState(false);
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [rawAgendamentos, setRawAgendamentos] = useState([]);
  const [allAgendamentos, setAllAgendamentos] = useState([]); // Para armazenar todos os agendamentos quando filtro de status está ativo
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  useEffect(() => {
    const loadUserAndSchedules = async () => {
      try {
        setLoading(true);
        // Buscar usuário logado para pegar ID
        const userResp = await api.get('/auth/user-info');
        const id = userResp.data?.id;
		setUserInfo(userResp.data);
        setClientId(id);
        if (!id) return;
        // Buscar agendamentos paginados
        await fetchSchedules(id, page);
      } catch (e) {
        console.error('Erro ao carregar dados do cliente/agendamentos:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUserAndSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (clientId == null) return;
    if (filtroAtivo) {
      fetchSchedules(clientId, page, dataInicio, dataFim);
    } else {
      fetchSchedules(clientId, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, page, filtroAtivo]);

  // Buscar todos os dados quando filtro de status muda (para poder filtrar e paginar no frontend)
  // Só busca todos se não houver filtro de data ativo
  useEffect(() => {
    if (clientId == null) return;
    if (statusFilter !== 'TODOS' && !filtroAtivo) {
      fetchAllSchedules(clientId);
    } else if (statusFilter === 'TODOS' && allAgendamentos.length > 0 && !filtroAtivo) {
      // Se voltou para TODOS, limpar dados acumulados e voltar à paginação normal
      setAllAgendamentos([]);
      fetchSchedules(clientId, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, clientId]);

const fetchAllSchedules = async (id) => {
  try {
    setLoading(true);
    let allData = [];
    let currentPage = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `/agendamentos/agendamentos-por-cliente/${id}?page=${currentPage}`;
      const resp = await api.get(url);
      const data = resp.data;
      const content = data?.content || [];
      
      if (content.length === 0) {
        hasMore = false;
      } else {
        allData = [...allData, ...content];
        const total = data?.totalPages || 0;
        if (currentPage >= total - 1) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }
    }

    setRawAgendamentos(allData);

    const mapped = allData.map((item) => {
      const dt = item?.appointmentDatetime;
      let dataPt = '';

      try {
        let d = null;
        if (Array.isArray(dt) && dt.length >= 5) {
          d = new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4]);
        } else if (dt) {
          d = new Date(dt);
        }

        if (d && !isNaN(d.getTime())) {
          const dStr = d.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          const tStr = d.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          dataPt = `${dStr} às ${tStr}`;
        }
      } catch (e) {
        console.error('Erro ao formatar data do agendamento:', e, dt);
      }

      const nomesServicos = item?.items?.map(i => i.service?.name).filter(Boolean) || [];
      const total = item?.items?.reduce((sum, i) => sum + (i.finalPrice || 0), 0) || 0;

      return {
        id: item?.id,
        data: dataPt || '-',
        cliente: item?.client?.name || 'Você',
        servico: nomesServicos.join(', '),
        servicos: nomesServicos,
        status: item?.status,
        total: total,
        items: item?.items || []
      };
    });

    setAllAgendamentos(mapped);
    setAgendamentos(mapped);
  } catch (e) {
    console.error('Erro ao buscar todos os agendamentos:', e);
  } finally {
    setLoading(false);
  }
};

const fetchSchedules = async (id, pageNum, inicio = null, fim = null) => {
  try {
    let url = `/agendamentos/agendamentos-por-cliente/${id}?page=${pageNum}`;
    if (inicio && fim) {
      url += `&dataInicio=${inicio}&dataFim=${fim}`;
    }
    const resp = await api.get(url);
    const data = resp.data;
    const content = data?.content || [];
    setTotalPages(data?.totalPages || 0);
    setRawAgendamentos(content);

    const mapped = content.map((item) => {
      const dt = item?.appointmentDatetime;
      let dataPt = '';

      try {
        let d = null;
        if (Array.isArray(dt) && dt.length >= 5) {
          d = new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4]);
        } else if (dt) {
          d = new Date(dt);
        }

        if (d && !isNaN(d.getTime())) {
          const dStr = d.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          const tStr = d.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          dataPt = `${dStr} às ${tStr}`;
        }
      } catch (e) {
        console.error('Erro ao formatar data do agendamento:', e, dt);
      }

      // Extract service names from items array
      const nomesServicos = item?.items?.map(i => i.service?.name).filter(Boolean) || [];
      const total = item?.items?.reduce((sum, i) => sum + (i.finalPrice || 0), 0) || 0;

      return {
        id: item?.id,
        data: dataPt || '-',
        cliente: item?.client?.name || 'Você',
        servico: nomesServicos.join(', '),
        servicos: nomesServicos,
        status: item?.status,
        total: total,
        items: item?.items || [] // keep original items if needed
      };
    });

    setAgendamentos(mapped);
  } catch (e) {
    console.error('Erro ao buscar agendamentos paginados:', e);
  }
};

  const handleDelete = async (id) => {
    try {
      await api.delete(`/agendamentos/${id}`);
      if (filtroAtivo) {
        await fetchSchedules(clientId, page, dataInicio, dataFim);
      } else {
        await fetchSchedules(clientId, page);
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
    if (agendamentoParaDeletar) handleDelete(agendamentoParaDeletar);
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
    const agendamento = agendamentos.find(a => a.id === id);
    setSelectedAgendamento(agendamento);
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback enviado:', feedback);
    setShowFeedback(false);
    setSelectedAgendamento(null);
  };

  const handleNovoAgendamento = () => setIsModalOpen(true);

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
    await fetchSchedules(clientId, 0, dataInicio, dataFim);
  };

  const handleLimparFiltro = async () => {
    setDataInicio('');
    setDataFim('');
    setFiltroAtivo(false);
    setPage(0);
    await fetchSchedules(clientId, 0);
  };

  const handleConfirmarAgendamento = async (novoAgendamento) => {
    const dataFormatada = new Date(novoAgendamento.date).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const servicosArray = Array.isArray(novoAgendamento.services)
      ? novoAgendamento.services.map(s => s.name || s) // aceita objetos ou strings
      : [];

    const agendamentoFormatado = {
      id: agendamentos.length + 1,
      data: `${dataFormatada} às ${novoAgendamento.time}`,
      cliente: 'Você',
      servico: servicosArray.join(', '), // string para compatibilidade
      servicos: servicosArray,           // array com nomes dos serviços
      total: novoAgendamento.total,
      status: 'ACTIVE'
    };

    setAgendamentos([...agendamentos, agendamentoFormatado]);
    setIsModalOpen(false);
    // Recarregar a página atual para refletir backend
    if (clientId != null) {
      if (filtroAtivo) {
        await fetchSchedules(clientId, 0, dataInicio, dataFim);
      } else {
        await fetchSchedules(clientId, 0);
      }
    }
  };

  const onPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const onNextPage = () => setPage((p) => (p + 1 < totalPages ? p + 1 : p));

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

  return (
    <>
      {showPopup && (
        <Popup
          hasButtons
          onClick={handleConfirmDelete}
          title="Atenção!"
          text="Tem certeza que deseja cancelar o seu agendamento?\nVocê não conseguirá reverter esta ação."
          setShowPopup={setShowPopup}
        />
      )}

      <NavbarLogado />

      <SecaoAgendar
        agendamentos={getPaginatedData().data}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
        page={page}
        totalPages={getPaginatedData().totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
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
        isEmployee={false}
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
          if (clientId != null) await fetchSchedules(clientId, page);
        }}
      />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onConfirm={handleFeedbackSubmit}
        agendamento={selectedAgendamento}
		userInfo={userInfo}
      />
    </>
  );
}
