import React, { useState } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/Agendar"
import { useAuth } from '../hooks/useAuth';
import Popup from '../common/components/Popup';

export default function AgendamentoCliente() {
  const { userInfo } = useAuth('USER');
  const [showPopup, setShowPopup] = useState(false);
  const [agendamentoParaDeletar, setAgendamentoParaDeletar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, data: '12 de março de 2025', servico: 'Manicure' },
    { id: 2, data: '13 de março de 2025', servico: 'Corte de Cabelo' },
    { id: 3, data: '14 de março de 2025', servico: 'Pedicure' },
  ]);

  if (!userInfo) return <div>Carregando...</div>;

  const handleDelete = (id) => {
    setAgendamentos(agendamentos.filter(item => item.id !== id));
    setAgendamentoParaDeletar(null);
    setShowPopup(false);
  };

  const handleConfirmDelete = () => {
    if (agendamentoParaDeletar) {
      handleDelete(agendamentoParaDeletar);
    }
  };

  const handleEdit = (id) => {
    alert(`Editar agendamento ${id}`);
  };

  const handleFeedback = (id) => {
    alert(`Dar feedback para agendamento ${id}`);
  };

  const handleShowDeletePopup = (id) => {
    setAgendamentoParaDeletar(id);
    setShowPopup(true);
  };

  // Função modificada para abrir o modal
  const handleNovoAgendamento = () => {
    setIsModalOpen(true);
  };

  // Nova função para confirmar o agendamento
  const handleConfirmarAgendamento = (novoAgendamento) => {
    // Formatar a data para o padrão brasileiro
    const dataFormatada = new Date(novoAgendamento.date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Criar o novo agendamento
    const agendamentoFormatado = {
      id: agendamentos.length + 1,
      data: dataFormatada,
      servico: novoAgendamento.services.map(s => s.name).join(', ')
    };

    // Adicionar ao estado
    setAgendamentos([...agendamentos, agendamentoFormatado]);

    alert('Agendamento realizado com sucesso!');
  };

  return (
    <>
        {
          showPopup && <Popup
            hasButtons={true}
            onClick={handleConfirmDelete}
            title={"Atenção!"}
            text={"Tem certeza que deseja cancelar o seu agendamento?\nVocê não conseguirá reverter esta ação."}
            setShowPopup={setShowPopup}
          />
        }
      <NavbarLogado />
      <SecaoAgendar
        agendamentos={agendamentos}
        showPopup={handleShowDeletePopup}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFeedback={handleFeedback}
        onNovoAgendamento={handleNovoAgendamento}
      />

      {/* Modal de agendamento */}
      <Agendar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarAgendamento}
      />
    </>
  );
}