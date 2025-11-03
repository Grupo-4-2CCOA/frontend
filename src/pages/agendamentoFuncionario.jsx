import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/AgendarFunc";
import { useAuth } from '../hooks/useAuth';
import Popup from '../common/components/Popup';
import api from '../services/api';

export default function AgendamentoFuncionario() {
  const [showPopup, setShowPopup] = useState(false);
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAgendamentos = async (pageNum) => {
    try {
      setLoading(true);
      const response = await api.get(`/agendamentos?page=${pageNum}`);
      const data = response.data;
      
      console.log('API Response:', data);

      // Handle paginated response
      const content = data?.content || [];
      setTotalPages(data?.totalPages || 0);

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
			}
		} catch (error) {
			console.error('Error formatting date:', error, dateArr);
		}

        return {
          id: apt?.id,
          data: dataPt || '-',
          servico: apt.items?.map(item => item.service?.name).join(', ') || 'Sem serviços',
          cliente: apt.client?.name || 'Cliente não identificado',
          status: apt?.status || 'PENDING'
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

  useEffect(() => {
    fetchAgendamentos(page);
  }, [page]);

  const handleShowDeletePopup = (id) => {
    setAgendamentoParaDeletar(id);
    setShowPopup(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/agendamentos/${id}`);
      await fetchAgendamentos(page); // Refresh current page
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

  const onPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const onNextPage = () => setPage((p) => (p + 1 < totalPages ? p + 1 : p));

  const handleConfirmarAgendamento = async (novoAgendamento) => {
    try {
      await fetchAgendamentos(page); // Refresh current page
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar lista de agendamentos:', error);
      alert('Erro ao atualizar lista de agendamentos');
    }
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
      <NavbarLogado isAdmin={true}/>
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
    </>
  );
}