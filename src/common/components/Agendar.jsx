import React, { useState, useEffect } from 'react';
import styles from '../styles/Agendar.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Agendar = ({ isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'loading', message: '', cb: null });
  const navigate = useNavigate();

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // Busca os dados necessários (serviços, funcionários, user info)
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar serviços
        const servicesResponse = await api.get('/servicos');
        setServices(servicesResponse.data);

        // Buscar funcionários
        const employeesResponse = await api.get('/funcionarios');
        const employeesList = employeesResponse.data;

        const filteredEmployees = employeesList.filter(emp => {
          const roleName = emp?.role?.name || emp?.role;
          if (!roleName) return false;
          const normalized = String(roleName)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // remove acentos
          return normalized === 'funcionario';
        });

        setEmployees(filteredEmployees);

        // Selecionar o primeiro funcionário automaticamente
        if (filteredEmployees.length > 0) {
          setSelectedEmployee(filteredEmployees[0]);
        } else {
          setSelectedEmployee(null);
        }

        // Buscar informações do usuário logado
        const userResponse = await api.get('/auth/user-info');
        setUserInfo(userResponse.data);

        console.log('Dados carregados:', {
          services: servicesResponse.data,
          employees: employeesList,
          userInfo: userResponse.data
        });
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
    return selectedServices.reduce((total, service) => total + (service.baseDuration || 0), 0);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      setModal({
        open: true,
        type: 'error',
        message: 'Preencha todos os campos',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    if (!userInfo?.id) {
      setModal({
        open: true,
        type: 'error',
        message: 'Não foi possível identificar o cliente. Faça login novamente.',
        cb: () => {
          setModal(modal => ({ ...modal, open: false }));
          navigate('/login');
        }
      });
      return;
    }

    if (!selectedEmployee?.id) {
      setModal({
        open: true,
        type: 'error',
        message: 'Não foi possível selecionar um funcionário.',
        cb: () => setModal(modal => ({ ...modal, open: false }))
      });
      return;
    }

    // Combina data e hora em LocalDateTime (ISO 8601)
    const appointmentDatetime = `${selectedDate}T${selectedTime}:00`;

    // Transforma serviços em items com a estrutura esperada pelo backend
    const items = selectedServices.map(service => ({
      finalPrice: service.basePrice || 0,
      discount: 0.01, // Desconto mínimo (backend requer @Positive)
      service: service.id
    }));

    const appointment = {
      client: userInfo.id, // ID do cliente logado
      employee: selectedEmployee.id, // ID do funcionário selecionado
      appointmentDatetime: appointmentDatetime,
      status: 'ACTIVE', // Status padrão
      duration: calculateDuration(), // Duração em minutos
      items: items, // Lista de itens do agendamento
      paymentType: 1 // Tipo de pagamento padrão (ajustar conforme necessário)
    };

    console.log('Enviando agendamento:', appointment);

    setModal({
      open: true,
      type: 'loading',
      message: 'Realizando agendamento...',
      cb: null
    });

    try {
      await api.post('/agendamentos', appointment);

      setModal({
        open: true,
        type: 'success',
        message: 'Agendamento realizado com sucesso!',
        cb: () => {
          setModal(modal => ({ ...modal, open: false }));
          // Passar dados formatados para o callback
          const formattedData = {
            date: selectedDate,
            time: selectedTime,
            services: selectedServices,
            total: calculateTotal(),
            appointmentDatetime: appointmentDatetime
          };
          onConfirm(formattedData);
          setSelectedDate('');
          setSelectedTime('');
          setSelectedServices([]);
          onClose();
        }
      });
    } catch (error) {
      setModal({ open: false, type: '', message: '', cb: null }); // fecha loading caso erro

      console.error('Erro ao criar agendamento:', error);
      console.error('Detalhes do erro:', error.response?.data);
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
      } else if (error.response?.data) {
        setModal({
          open: true,
          type: 'error',
          message: `Erro ao criar agendamento: ${JSON.stringify(error.response.data)}`,
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
      <>
        <Modal open={true} type="loading" message="Carregando dados..." onClose={() => {}} />
      </>
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
            <label>Funcionário:</label>
            <select
              value={selectedEmployee?.id || ''}
              onChange={e => {
                const emp = employees.find(employee => employee.id === parseInt(e.target.value));
                setSelectedEmployee(emp);
              }}
              className={styles["time-select"]}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
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

export default Agendar;