import React, { useEffect } from "react";
import styles from "../styles/SecaoAgendar.module.css";
import { Plus, MessageSquare, Edit2, Trash2 } from 'lucide-react';

export default function SecaoAgendar({ agendamentos, showPopup, onEdit, onFeedback, onNovoAgendamento }) {
  return (
    <div className={styles.content}>
      {/* Título e botão */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Agendamento</h1>
        <button
          onClick={onNovoAgendamento}
          className={styles.addButton}
        >
          <Plus className={styles.addIcon} />
          <span>Realizar Agendamento</span>
        </button>
      </div>

      {/* Lista de agendamentos */}
      <div className={styles.list}>
        {agendamentos.map((agendamento) => (
          <div key={agendamento.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.date}>{agendamento.data}</p>
                <p className={styles.service}>{agendamento.servico}</p>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => onFeedback(agendamento.id)}
                  className={styles.feedbackBtn}
                >
                  <MessageSquare className={styles.smallIcon} />
                  <span>Dar feedback</span>
                </button>

                <button
                  onClick={() => onEdit(agendamento.id)}
                  className={styles.editBtn}
                >
                  <Edit2 className={styles.smallIcon} />
                </button>

                <button
                  onClick={() => showPopup(agendamento.id)}
                  className={styles.deleteBtn}
                >
                  <Trash2 className={styles.smallIcon} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {agendamentos.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIconContainer}>
            <Plus className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>Nenhum agendamento encontrado</h3>
          <p className={styles.emptyText}>
            Clique no botão acima para realizar seu primeiro agendamento
          </p>
        </div>
      )}
    </div>
  );
}
