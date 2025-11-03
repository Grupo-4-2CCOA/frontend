import React, { useEffect } from "react";
import styles from "../styles/SecaoAgendar.module.css";
import { Plus, MessageSquare, Edit2, Trash2 } from 'lucide-react';

export default function SecaoAgendar({ agendamentos, showPopup, onEdit, onFeedback, onNovoAgendamento, page, totalPages, onPrevPage, onNextPage }) {
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
                <p className={styles.clientName}>{agendamento.cliente}</p>
                <p className={styles.service}>{agendamento.servico}</p>
                {/* {Array.isArray(agendamento.servicos) && agendamento.servicos.length > 0 && (
                  <div className={styles.servicesChips}>
                    {agendamento.servicos.map((nome) => (
                      <span key={nome} className={styles.serviceChip}>{nome}</span>
                    ))}
                  </div>
                )} */}
                {agendamento.status && (
                  <span className={
                    agendamento.status === 'ACTIVE' ? styles.statusAtivo :
                    agendamento.status === 'COMPLETED' ? styles.statusCompleto :
                    agendamento.status === 'CANCELED' ? styles.statusCancelado : ''
                  }>
                    {agendamento.status === 'ACTIVE'
                      ? 'Ativo'
                      : agendamento.status === 'CANCELED'
                        ? 'Cancelado'
                        : agendamento.status === 'COMPLETED'
                          ? 'Completo'
                          : agendamento.status}
                  </span>
                )}
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

      {/* Paginação */}
      {typeof totalPages === 'number' && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={onPrevPage}
            disabled={page <= 0}
          >
            Anterior
          </button>
          <span className={styles.pageIndicator}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={onNextPage}
            disabled={page >= totalPages - 1}
          >
            Próxima
          </button>
        </div>
      )}

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
