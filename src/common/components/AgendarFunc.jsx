import React, { useState, useEffect } from 'react';
import styles from '../styles/Agendar.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const AgendarFunc = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await api.get('/auth/user-info');
        setUserInfo(userResponse.data);

        const servicesResponse = await api.get('/servicos');
        setServices(servicesResponse.data);

        const clientsResponse = await api.get('/clientes');
        const rawClients = clientsResponse.data || [];

        const filteredClients = rawClients.filter(c => {
          const roleName = c?.role?.name || c?.role;
          if (!roleName) return false;
          const normalized = String(roleName)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return normalized === 'cliente';
        });

        setClients(filteredClients);

        if (filteredClients.length > 0) {
          setSelectedClient(filteredClients[0]);
          setSelectedClientId(filteredClients[0].id);
        } else {
          setSelectedClient(null);
          setSelectedClientId('');
        }

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response?.status === 401) {
          setModal({
            open: true,
            type: 'error',
            message: 'Sua sessão expirou. Faça login novamente.',
            cb: () => {
              setModal(modal => ({ ...modal, open: false }));
              navigate('/login');
            }
          });
        } else {
          setModal({
            open: true,
            type: 'error',
            message: 'Não foi possível carregar os dados necessários.',
            cb: () => setModal(modal => ({ ...modal, open: false }))
          });
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
      setModal({
        open: true,
        type: 'error',
        message: 'Preencha todos os campos',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    let user = userInfo;
    if (!user || !user.id) {
      try {
        const resp = await api.get('/auth/user-info');
        user = resp.data;
        setUserInfo(user || null);
      } catch (err) {
        console.error('Não foi possível obter user-info no submit:', err);
        setModal({
          open: true,
          type: 'error',
          message: 'Usuário não autenticado. Por favor faça login novamente.',
          cb: () => {
            setModal(modal => ({ ...modal, open: false }));
            navigate('/login');
          }
        });
        return;
      }
    }

    if (!user?.id) {
      setModal({
        open: true,
        type: 'error',
        message: 'Usuário não identificado. Faça login novamente.',
        cb: () => {
          setModal(modal => ({ ...modal, open: false }));
          navigate('/login');
        }
      });
      return;
    }

    const appointmentDatetime = `${selectedDate}T${selectedTime}:00`;

    const items = selectedServices.map(service => ({
      finalPrice: service.basePrice || 0,
      discount: 0.01,
      service: service.id
    }));

    const appointment = {
      client: parseInt(selectedClientId, 10),
      employee: user.id,
      appointmentDatetime: appointmentDatetime,
      status: 'ACTIVE',
      duration: calculateDuration(),
      items: items,
      paymentType: 1
    };

    setModal({
      open: true,
      type: 'loading',
      message: 'Realizando agendamento...',
      cb: null
    });

    try {
      const response = await api.post('/agendamentos', appointment);

      setModal({
        open: true,
        type: 'success',
        message: 'Agendamento realizado com sucesso!',
        cb: () => {
          setModal(modal => ({ ...modal, open: false }));
          const clientObj = clients.find(c => c.id === parseInt(selectedClientId, 10)) || selectedClient;
          const formattedData = {
            id: response.data.id,
            date: selectedDate,
            time: selectedTime,
            client: clientObj?.name || 'Cliente',
            services: selectedServices,
            total: calculateTotal(),
            appointmentDatetime
          };

          onConfirm(formattedData);
          setSelectedDate('');
          setSelectedTime('');
          setSelectedServices([]);
          setSelectedClient(null);
          setSelectedClientId('');
          onClose();
        }
      });
    } catch (error) {
      setModal({ open: false, type: '', message: '', cb: null }); // fecha loading
      console.error('Erro ao criar agendamento:', error);
      if (error.response?.status === 401) {
        setModal({
          open: true,
          type: 'error',
          message: 'Sua sessão expirou. Faça login novamente.',
          cb: () => {
            setModal(modal => ({ ...modal, open: false }));
            navigate('/login');
          }
        });
      } else if (error.response?.status === 409) {
        setModal({
          open: true,
          type: 'error',
          message: 'Horário indisponível!',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      } else {
        setModal({
          open: true,
          type: 'error',
          message: 'Erro ao criar agendamento.',
          cb: () => setModal(modal => ({ ...modal, open: false }))
        });
      }
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Modal open={true} type="loading" message="Carregando dados..." onClose={() => {}} />
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
      <div className={styles["modal-overlay"]}>
        <div className={styles["modal-content"]}>
          <h2>Realizar Agendamento</h2>
          <div className={styles["form-group"]}>
            <label>Cliente:</label>
            <select
              value={selectedClientId || ''}
              onChange={e => {
                const id = parseInt(e.target.value, 10);
                setSelectedClientId(id);
                const client = clients.find(c => c.id === id) || null;
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
    </>
  );
};

export default AgendarFunc;