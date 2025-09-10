import React, { useState, useEffect } from 'react';
import NavbarLogado from "../common/components/NavbarLogado";
import SecaoAgendar from "../common/components/SecaoAgendar";
import Agendar from "../common/components/Agendar"
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export default function AgendamentoCliente() {
  const { userInfo } = useAuth('USER');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [services, setServices] = useState([]);

  const fetchAgendamentos = async () => {
	try {
		const appointmentsResponse = await api.get('/agendamentos');
		const allAppointments = appointmentsResponse.data;

		console.log(allAppointments);

		const userAppointments = allAppointments.filter(
		appointment => appointment.client.id === userInfo.id
		);

		const allServicesNames = [];
		console.log(allServicesNames);

		for (const i of allAppointments) {
			const servicesNamesByScheduleId = await api.get(`/agendamentos/servicos-por-agendamento-id/${i.id}`);
			allServicesNames.push(servicesNamesByScheduleId.data);
		}

		console.log(servicesNamesByScheduleId.data);

		const formattedAppointments = userAppointments.map(appointment => ({
			id: appointment.id,
			data: new Date(appointment.appointmentDatetime).toLocaleDateString('pt-BR'),
			servicos: allServicesNames.join(", ") || 'Serviço não especificado',
			status: appointment.status,
			valor_total: appointment.items?.reduce((total, item) => total + item.finalPrice, 0) || 0
		}));

		setAgendamentos(formattedAppointments);
	} catch (error) {
		console.error('Erro ao buscar agendamentos:', error);
	}
   };

  useEffect(() => {
    const carregarDados = async () => {
      try {

        const employeesResponse = await api.get('/funcionarios');
        setEmployees(employeesResponse.data || []);

        const paymentResponse = await api.get('/pagamentos');
        setPaymentTypes(paymentResponse.data || []);

		const servicesResponse = await api.get('/servicos');
        setServices(servicesResponse.data || []);
		
        const appointmentsResponse = await api.get('/agendamentos');
        const allAppointments = appointmentsResponse.data;

		console.log(allAppointments);

        const userAppointments = allAppointments.filter(
          appointment => appointment.client.id === userInfo.id
        );

		const allServicesNames = [];

		for (const i of allAppointments) {
			const servicesNamesByScheduleId = await api.get(`/agendamentos/servicos-por-agendamento-id/${i.id}`);
			allServicesNames.push(servicesNamesByScheduleId.data);
		}

		console.log(servicesNamesByScheduleId.data);

        const formattedAppointments = userAppointments.map(appointment => ({
          id: appointment.id,
          data: new Date(appointment.appointmentDatetime).toLocaleDateString('pt-BR'),
          servicos: allServicesNames.join(", ") || 'Serviço não especificado',
          status: appointment.status,
          valor_total: appointment.items?.reduce((total, item) => total + item.finalPrice, 0) || 0
        }));

		setAgendamentos(formattedAppointments);

		await fetchAgendamentos();

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setEmployees([
          { id: 1, name: 'Maria Silva' },
          { id: 2, name: 'João Santos' }
        ]);
        setPaymentTypes([
          { id: 1, name: 'Dinheiro' },
          { id: 2, name: 'Cartão' },
          { id: 3, name: 'PIX' }
        ]);
      }
    };

    if (userInfo?.id) {
      carregarDados();
    }
  }, [userInfo?.id]);

  if (!userInfo) return <div>Carregando...</div>;

  const handleDelete = (id) => {
    setAgendamentos(agendamentos.filter(item => item.id !== id));
  };

  const handleEdit = (id) => {
    alert(`Editar agendamento ${id}`);
  };

  const handleFeedback = (id) => {
    alert(`Dar feedback para agendamento ${id}`);
  };

  const handleNovoAgendamento = () => {
    setIsModalOpen(true);
  };

  const handleConfirmarAgendamento = async (dadosAgendamento) => {
    if (!userInfo?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

	if (!dadosAgendamento.services || dadosAgendamento.services.length === 0) {
      alert('Selecione pelo menos um serviço');
      return;
    }

    setLoading(true);

	console.log('Dados do agendamento:', dadosAgendamento);

    try {
	  const agendamentoData = {
        client: Number(userInfo.id),
        employee: Number(dadosAgendamento.fk_employee),
        appointmentDatetime: new Date(dadosAgendamento.appointment_datetime).toISOString(),
        status: 'ACTIVE',
        duration: dadosAgendamento.services.reduce((acc, service) => acc + service.base_duration, 0),
        transactionHash: dadosAgendamento.transaction_hash || undefined,
        paymentType: dadosAgendamento.fk_payment_type ? Number(dadosAgendamento.fk_payment_type) : undefined
      };

      const response = await api.post('/agendamentos', agendamentoData);
      const scheduleId = response.data.id;

	  
      const itemPromises = dadosAgendamento.services.map(service => {
        const itemData = {
          finalPrice: Number(service.basePrice),
          discount: 0.1,
          schedule: scheduleId,
          service: service.id
        };

		console.log(itemData);
        return api.post('/itens-agendamento', itemData);
      });

      await Promise.all(itemPromises);

	  await fetchAgendamentos();
      alert('Agendamento realizado com sucesso!');
      setIsModalOpen(false);

    } catch (error) {
      console.error('Erro detalhado:', error.response?.data);

      let errorMessage = 'Erro ao criar agendamento:\n';

      if (error.response?.data) {
        // Verifica se é uma string direta da API
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } 
        // Verifica se são erros de validação do Spring
        else if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            errorMessage += `\n- ${err.defaultMessage || err.message}`;
          });
        }
        // Outros tipos de erro
        else {
          errorMessage += JSON.stringify(error.response.data, null, 2);
        }
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
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
        employees={employees}
        paymentTypes={paymentTypes}
		services={services}
        loading={loading}
      />
    </>
  );
}