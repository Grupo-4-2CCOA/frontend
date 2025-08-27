import React, { useState } from 'react';
import NavbarLogado from "../common/components/NavBarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/Agendar"

export default function AgendamentoCliente() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, data: '12 de março de 2025', servico: 'Manicure' },
    { id: 2, data: '13 de março de 2025', servico: 'Corte de Cabelo' },
    { id: 3, data: '14 de março de 2025', servico: 'Pedicure' },
  ]); 

  const handleDelete = (id) => {
    setAgendamentos(agendamentos.filter(item => item.id !== id));
  };

  const handleEdit = (id) => {
    alert(`Editar agendamento ${id}`);
  };

  const handleFeedback = (id) => {
    alert(`Dar feedback para agendamento ${id}`);
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
      <NavbarLogado />
      <SecaoAgendar
        agendamentos={agendamentos}
        onDelete={handleDelete}
        onEdit={handleEdit}
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