import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/Agendar";
import FeedbackModal from "../common/components/FeedbackModal";
import Popup from '../common/components/Popup';
import api from '../services/api';
import EditarAgendar from "../common/components/EditarAgendar";
import { useNavigate } from 'react-router-dom';
import { useModal } from '../common/hooks/useModal';
import Modal from '../common/components/Modal';

export default function AgendamentoCliente() {
  const [showPopup, setShowPopup] = useState(false);
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
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

  const {
      open: modalOpen,
      type: modalType,
      message: modalMessage,
      showModal,
      closeModal,
    } = useModal();

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
  }, [clientId, page, filtroAtivo, dataInicio, dataFim]);

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
      showModal('success', 'Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      showModal('error', 'Erro ao cancelar agendamento');
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
      showModal('error', 'Por favor, preencha ambas as datas');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      showModal('error', 'Data de início não pode ser maior que data de fim');
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
    let filtered = agendamentos;

    // Filtrar por status
    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(agendamento => agendamento.status === statusFilter);
    }

    // Filtrar por data
    if (dataInicio || dataFim) {
      filtered = filtered.filter(agendamento => {
        const agendamentoDate = agendamento.appointmentDatetime;
        let agendDate = null;

        if (Array.isArray(agendamentoDate) && agendamentoDate.length >= 3) {
          agendDate = new Date(agendamentoDate[0], agendamentoDate[1] - 1, agendamentoDate[2]);
        } else if (agendamentoDate) {
          agendDate = new Date(agendamentoDate);
        }

        if (!agendDate || isNaN(agendDate.getTime())) return true;

        if (dataInicio) {
          const startDate = new Date(dataInicio);
          if (agendDate < startDate) return false;
        }

        if (dataFim) {
          const endDate = new Date(dataFim);
          endDate.setHours(23, 59, 59, 999);
          if (agendDate > endDate) return false;
        }

        return true;
      });
    }

    return filtered;
  };

  return (
    <>
      <Modal open={modalOpen} type={modalType} message={modalMessage} onClose={closeModal}/>
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
        agendamentos={getFilteredAgendamentos()}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dataInicio={dataInicio}
        onDataInicioChange={setDataInicio}
        dataFim={dataFim}
        onDataFimChange={setDataFim}
        onFilter={handleAplicarFiltro}
        onReset={handleLimparFiltro}
        filtroAtivo={filtroAtivo}
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
