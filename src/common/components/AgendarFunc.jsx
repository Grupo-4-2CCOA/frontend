import React, { useState, useEffect } from 'react';
import styles from '../styles/Agendar.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AgendarFunc = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar serviços
        const servicesResponse = await api.get('/servicos');
        setServices(servicesResponse.data);

        // Buscar clientes
        const clientsResponse = await api.get('/clientes');
        const clientsList = clientsResponse.data;
        setClients(clientsList);
        
        // Selecionar o primeiro cliente automaticamente
        if (clientsList.length > 0) {
          setSelectedClient(clientsList[0]);
        }

        console.log('Dados carregados:', {
          services: servicesResponse.data,
          clients: clientsList
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response?.status === 401) {
          alert('Sua sessão expirou. Faça login novamente.');
          navigate('/login');
        } else {
          alert('Não foi possível carregar os dados necessários.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, navigate]);

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  };

  const calculateTotal = () => selectedServices.reduce((sum, s) => sum + (s.basePrice || 0), 0);

  const calculateDuration = () => {
    return selectedServices.reduce((total, service) => total + (service.baseDuration || 60), 0);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !selectedClient) {
      alert('Preencha todos os campos');
      return;
    }

    const appointmentDatetime = `${selectedDate}T${selectedTime}:00`;

    const items = selectedServices.map(service => ({
      finalPrice: service.basePrice || 0,
      discount: 0.01,
      service: service.id
    }));

    const appointment = {
      client: selectedClient.id,
      employee: JSON.parse(localStorage.getItem('userInfo')).id, // Current logged in employee
      appointmentDatetime: appointmentDatetime,
      status: 'ACTIVE',
      duration: calculateDuration(),
      items: items,
      paymentType: 1
    };

    console.log('Enviando agendamento:', appointment);

    try {
      const response = await api.post('/agendamentos', appointment);
      alert('Agendamento realizado com sucesso!');
      
      const formattedData = {
        id: response.data.id,
        date: selectedDate,
        time: selectedTime,
        client: selectedClient.name,
        services: selectedServices,
        total: calculateTotal(),
        appointmentDatetime: appointmentDatetime
      };
      
      onConfirm(formattedData);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedServices([]);
      setSelectedClient(null);
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      if (error.response?.status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 409) {
        alert('Horário indisponível!');
      } else {
        alert('Erro ao criar agendamento.');
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className={styles["modal-overlay"]}>
        <div className={styles["modal-content"]}>
          <h2>Carregando...</h2>
          <p>Por favor, aguarde...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2>Realizar Agendamento</h2>

        <div className={styles["form-group"]}>
          <label>Cliente:</label>
          <select
            value={selectedClient?.id || ''}
            onChange={e => {
              const client = clients.find(c => c.id === parseInt(e.target.value));
              setSelectedClient(client);
            }}
            className={styles["time-select"]}
          >
            <option value="">Selecione o cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["form-group"]}>
          <label>Data:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className={styles["date-field"]}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>Hora:</label>
          <select
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className={styles["time-select"]}
          >
            <option value="">--:--</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className={styles["form-group"]}>
          <label>Serviços:</label>
          <div className={styles["services-list"]}>
            {services.map(service => (
              <div key={service.id} className={styles["service-item"]}>
                <label className={styles["service-label"]}>
                  <input
                    type="checkbox"
                    checked={selectedServices.some(s => s.id === service.id)}
                    onChange={() => handleServiceChange(service)}
                  />
                  <span>{service.name} - R$ {service.basePrice?.toFixed(2)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles["total-section"]}>
          <strong>Total: R$ {calculateTotal().toFixed(2)}</strong>
        </div>

        <div className={styles["button-group"]}>
          <button className={styles["btn-back"]} onClick={onClose}>Voltar</button>
          <button className={styles["btn-confirm"]} onClick={handleSubmit}>
            + Realizar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendarFunc;