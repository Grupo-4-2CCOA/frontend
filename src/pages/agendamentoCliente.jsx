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
    fetchSchedules(clientId, page);
  }, [clientId, page]);

const fetchSchedules = async (id, pageNum) => {
  try {
    const resp = await api.get(`/agendamentos/agendamentos-por-cliente/${id}?page=${pageNum}`);
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
      await fetchSchedules(page); // Refresh current page
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
    if (clientId != null) await fetchSchedules(clientId, page);
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
