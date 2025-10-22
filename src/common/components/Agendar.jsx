import React, { useState, useEffect } from 'react';
import styles from '../styles/Agendar.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Agendar = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // Busca os serviços do backend
  useEffect(() => {
    if (!isOpen) return;

    const fetchServices = async () => {
      try {
        const response = await api.get('/servicos');
        setServices(response.data);
        console.log('Serviços carregados:', response.data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        if (error.response?.status === 401) {
          alert('Sua sessão expirou. Faça login novamente.');
          navigate('/login');
        } else {
          alert('Não foi possível carregar os serviços disponíveis.');
        }
      }
    };
    fetchServices();
  }, [isOpen, navigate]);

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  };

  const calculateTotal = () => selectedServices.reduce((sum, s) => sum + (s.basePrice || 0), 0);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Preencha todos os campos');
      return;
    }

    const appointment = {
      date: selectedDate,
      time: selectedTime,
      services: selectedServices,
      total: calculateTotal()
    };

    try {
      await api.post('/agendamentos', appointment);
      alert('Agendamento realizado com sucesso!');
      onConfirm(appointment);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedServices([]);
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

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2>Realizar Agendamento</h2>

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

export default Agendar;
