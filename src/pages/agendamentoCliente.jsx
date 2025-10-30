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

  useEffect(() => {
    const loadUserAndSchedules = async () => {
      try {
        setLoading(true);
        // Buscar usuário logado para pegar ID
        const userResp = await api.get('/auth/user-info');
        const id = userResp.data?.id;
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
        const dateStr = item?.appointmentDatetime;
        let dataPt = '';
        try {
          if (dateStr) {
            const d = new Date(dateStr);
            const dStr = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            const tStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            dataPt = `${dStr} às ${tStr}`;
          }
        } catch (_) {}
        const nomesServicos = Array.isArray(item?.serviceNames) && item.serviceNames.length
          ? item.serviceNames
          : (Array.isArray(item?.services) ? item.services.map(s => s?.name).filter(Boolean) : []);
        return {
          id: item?.id,
          data: dataPt || '-',
          cliente: item?.client?.name || 'Você',
          servico: nomesServicos.join(', '),
          servicos: nomesServicos,
          status: item?.status,
          total: item?.total || 0,
        };
      });
      setAgendamentos(mapped);
    } catch (e) {
      console.error('Erro ao buscar agendamentos paginados:', e);
    }
  };

  const handleDelete = (id) => {
    setAgendamentos(agendamentos.filter(a => a.id !== id));
    setAgendamentoParaDeletar(null);
    setShowPopup(false);
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

    const agendamentoFormatado = {
      id: agendamentos.length + 1,
      data: `${dataFormatada} às ${novoAgendamento.time}`,
      cliente: 'Você',
      servico: novoAgendamento.services.map(s => s.name).join(', '),
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
        agendamentos={agendamentos}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
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
      />
    </>
  );
}
