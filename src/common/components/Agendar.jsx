import React, { useState } from 'react';
import styles from '../styles/Agendar.module.css';

const agendar = ({ isOpen, onClose, onConfirm, employees = [], paymentTypes = [], services = [], loading = false }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [duration, setDuration] = useState(60);
  const [transactionHash, setTransactionHash] = useState('');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + (service.basePrice || 0), 0);
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !selectedEmployee || !selectedPaymentType) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;

    const appointmentData = {
      appointment_datetime: appointmentDateTime,
      fk_employee: selectedEmployee,
      fk_payment_type: selectedPaymentType,
      transaction_hash: transactionHash,
      services: selectedServices,
      duration: selectedServices.reduce((acc, service) => acc + service.base_duration, 0)
    };
    onConfirm(appointmentData);

    setSelectedDate('');
    setSelectedTime('');
    setSelectedServices([]);
    setSelectedEmployee('');
    setSelectedPaymentType('');
    setTransactionHash('');
  };

  // Injeta os estilos CSS
  React.useEffect(() => {
    if (isOpen) {
      const styleSheet = document.createElement("style");
      styleSheet.innerText = styles;
      styleSheet.id = "appointment-modal-styles";

      if (!document.getElementById("appointment-modal-styles")) {
        document.head.appendChild(styleSheet);
      }
    }

    return () => {
      const existingStyle = document.getElementById("appointment-modal-styles");
      if (existingStyle && !isOpen) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content"]}>
        <h2>Realizar Agendamento</h2>

        <div className={styles["form-group"]}>
          <label>Data:</label>
          <div className={styles["date-input"]}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles["date-field"]}
            />
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label>Hora:</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className={styles["time-select"]}
          >
            <option value="">--:--</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className={styles["form-group"]}>
          <label>Funcionário:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className={styles["time-select"]}
          >
            <option value="">Selecione um funcionário</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["form-group"]}>
          <label>Tipo de Pagamento:</label>
          <select
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            className={styles["time-select"]}
          >
            <option value="">Selecione o tipo de pagamento</option>
            {paymentTypes.map(payment => (
              <option key={payment.id} value={payment.id}>
                {payment.name}
              </option>
            ))}
          </select>
        </div>

		<div className={styles["form-group"]}>
			<label>Serviços:</label>
			<div className={styles["services-list"]}>
			{services.map(service => (
				<div key={service.id} className={styles["service-item"]}>
				<input
					type="checkbox"
					checked={selectedServices.some(s => s.id === service.id)}
					onChange={() => handleServiceChange(service)}
				/>
				<span>{service.name}</span>
				<span>R$ {service.basePrice}</span>
				</div>
			))}
			</div>
		</div>

		<div className={styles["total-section"]}>
			<strong>Total: R$ {calculateTotal().toFixed(2)}</strong>
		</div>

		<div className={styles["button-group"]}>
          <button className={styles["btn-back"]} onClick={onClose} disabled={loading}>
            Voltar
          </button>
          <button
            className={styles["btn-confirm"]}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Salvando...' : '+ Realizar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default agendar;