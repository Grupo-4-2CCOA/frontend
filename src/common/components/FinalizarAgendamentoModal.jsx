import React, { useState } from 'react';
import styles from '../styles/Agendar.module.css';
import Modal from './Modal';

const FinalizarAgendamentoModal = ({ isOpen, onClose, onConfirm }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });

    const handleSubmit = () => {
        if (!paymentMethod) {
            setModal({
                open: true,
                type: 'error',
                message: 'Por favor, preencha todos os campos.',
                cb: () => setModal(modal => ({ ...modal, open: false }))
            });
            return;
        }
        onConfirm({ paymentMethod });
        setPaymentMethod('');
    };

    if (!isOpen) return null;

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
                    <h2>Finalizar Agendamento</h2>
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
        </>
    );
};

export default FinalizarAgendamentoModal;