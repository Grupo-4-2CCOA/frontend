import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/AgendarFunc";
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState(false);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });

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

  useEffect(() => {
    if (filtroAtivo) {
      fetchAgendamentos(page, dataInicio, dataFim);
    } else {
      fetchAgendamentos(page);
    }
    // eslint-disable-next-line
  }, [page, filtroAtivo, dataInicio, dataFim]);

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
    // Implement edit functionality if needed
    console.log('Editar agendamento:', id);
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

  const onPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const onNextPage = () => setPage((p) => (p + 1 < totalPages ? p + 1 : p));

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
    if (!Array.isArray(dateArr) || dateArr.length < 5) return null;
    const [year, month, day, hour, minute] = dateArr;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
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
        transactionHash: data.hash,
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
        agendamentos={agendamentos}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
        onFinalizar={handleFinalizar}
        page={page}
        totalPages={totalPages}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
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