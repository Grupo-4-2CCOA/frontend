import React, { useState } from 'react';
import styles from  '../styles/Agendar.module.css';

const agendar = ({ isOpen, onClose, onConfirm }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const services = [
    { id: 1, name: 'Manicure', price: 25.00 },
    { id: 2, name: 'Pedicure', price: 30.00 },
    { id: 3, name: 'Corte de Cabelo', price: 45.00 },
    { id: 4, name: 'Escova', price: 35.00 }
  ];

  const clientSlots = [
    'Wellington', 'Jubileu', 'Valdomiro', 'Nildemar neto', 'Maria Aparecida',
    'NobruApelao', 'Gustavinho 3k', 'Carlos Pereira', 'Mariana Lima', 'Rosimaria'
  ]

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
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const handleSubmit = () => {
    if (!selectedClient || !selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const appointment = {
      client: selectedClient,
      date: selectedDate,
      time: selectedTime,
      services: selectedServices,
      total: calculateTotal()
    };
    
    // Chama a função de confirmação passada como prop
    onConfirm(appointment);
    
    // Reset form
    setSelectedClient('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedServices([]);
    
    // Fecha o modal
    onClose();
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
          <label>Cliente:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className={styles["time-select"]}
          >
            <option value="">Selecione o cliente</option>
            {clientSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        
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
                  <span>{service.name} - R$ {service.price.toFixed(2)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles["total-section"]}>
          <strong>Total: R$ {calculateTotal().toFixed(2)}</strong>
        </div>

        <div className={styles["button-group"]}>
          <button className={styles["btn-back"]} onClick={onClose}>
            Voltar
          </button>
          <button className={styles["btn-confirm"]} onClick={handleSubmit}>
            + Realizar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default agendar;