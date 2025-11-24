import React, { useState } from 'react';
import styles from '../styles/Agendar.module.css';

const FinalizarAgendamentoModal = ({ isOpen, onClose, onConfirm }) => {
    const [hash, setHash] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleSubmit = () => {
        if (!hash || !paymentMethod) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        onConfirm({ hash, paymentMethod });
        setHash('');
        setPaymentMethod('');
    };

    if (!isOpen) return null;

    return (
        <div className={styles["modal-overlay"]}>
            <div className={styles["modal-content"]}>
                <h2>Finalizar Agendamento</h2>

                <div className={styles["form-group"]}>
                    <label>Hash da Operação:</label>
                    <input
                        type="text"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        className={styles["date-field"]}
                        placeholder="Insira o hash da operação"
                    />
                </div>

                <div className={styles["form-group"]}>
                    <label>Método de Pagamento:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={styles["time-select"]}
                    >
                        <option value="">Selecione...</option>
                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                        <option value="DEBIT_CARD">Cartão de Débito</option>
                        <option value="PIX">Pix</option>
                        <option value="CASH">Dinheiro</option>
                    </select>
                </div>

                <div className={styles["button-group"]}>
                    <button className={styles["btn-back"]} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles["btn-confirm"]} onClick={handleSubmit}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinalizarAgendamentoModal;
