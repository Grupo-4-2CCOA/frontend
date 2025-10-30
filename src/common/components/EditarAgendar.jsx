import React, { useEffect, useState } from 'react';
import styles from '../styles/Agendar.module.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EditarAgendar = ({ isOpen, onClose, scheduleId, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (!isOpen || !scheduleId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [servicesResp, employeesResp, userResp, scheduleResp] = await Promise.all([
          api.get('/servicos'),
          api.get('/funcionarios'),
          api.get('/auth/user-info'),
          api.get(`/agendamentos/${scheduleId}`)
        ]);

        const servicesList = servicesResp.data || [];
        const employeesList = employeesResp.data || [];
        const user = userResp.data;
        const schedule = scheduleResp.data;

        setServices(servicesList);
        setEmployees(employeesList);
        setUserInfo(user);

        // Preencher dados atuais
        const dt = schedule?.appointmentDatetime;
        if (dt) {
          const d = new Date(dt);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const hh = String(d.getHours()).padStart(2, '0');
          const mi = String(d.getMinutes()).padStart(2, '0');
          setSelectedDate(`${yyyy}-${mm}-${dd}`);
          setSelectedTime(`${hh}:${mi}`);
        }

        const employeeId = schedule?.employee?.id || schedule?.employeeId;
        if (employeeId) {
          const emp = employeesList.find(e => e.id === employeeId) || null;
          setSelectedEmployee(emp);
        } else if (employeesList.length > 0) {
          setSelectedEmployee(employeesList[0]);
        }

        // Selecionar serviços existentes (por id ou por nome)
        let existingServices = [];
        if (Array.isArray(schedule?.items) && schedule.items.length) {
          const serviceIds = schedule.items.map(it => it?.service?.id || it?.serviceId).filter(Boolean);
          existingServices = servicesList.filter(s => serviceIds.includes(s.id));
        } else if (Array.isArray(schedule?.serviceNames)) {
          existingServices = servicesList.filter(s => schedule.serviceNames.includes(s.name));
        }
        setSelectedServices(existingServices);
      } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        if (error.response?.status === 401) {
          alert('Sua sessão expirou. Faça login novamente.');
          navigate('/login');
        } else {
          alert('Não foi possível carregar os dados do agendamento.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, scheduleId, navigate]);

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  };

  const calculateTotal = () => selectedServices.reduce((sum, s) => sum + (s.basePrice || 0), 0);

  const calculateDuration = () => selectedServices.length * 60;

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Preencha todos os campos');
      return;
    }

    if (!userInfo?.id) {
      alert('Não foi possível identificar o cliente. Faça login novamente.');
      navigate('/login');
      return;
    }

    if (!selectedEmployee?.id) {
      alert('Não foi possível selecionar um funcionário.');
      return;
    }

    const appointmentDatetime = `${selectedDate}T${selectedTime}:00`;

    const items = selectedServices.map(service => ({
      finalPrice: service.basePrice || 0,
      discount: 0.01,
      service: service.id
    }));

    const updatedAppointment = {
      client: userInfo.id,
      employee: selectedEmployee.id,
      appointmentDatetime,
      status: 'ACTIVE',
      duration: calculateDuration(),
      items,
      paymentType: 1
    };

    try {
      await api.put(`/agendamentos/${scheduleId}`, updatedAppointment);
      alert('Agendamento atualizado com sucesso!');

      const formattedData = {
        id: scheduleId,
        date: selectedDate,
        time: selectedTime,
        services: selectedServices,
        total: calculateTotal(),
        appointmentDatetime
      };

      onConfirm?.(formattedData);
      onClose?.();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      console.error('Detalhes do erro:', error.response?.data);
      if (error.response?.status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        navigate('/login');
      } else if (error.response?.status === 409) {
        alert('Horário indisponível!');
      } else if (error.response?.data) {
        alert(`Erro ao atualizar agendamento: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Erro ao atualizar agendamento.');
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
        <h2>Editar Agendamento</h2>

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
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarAgendar;
