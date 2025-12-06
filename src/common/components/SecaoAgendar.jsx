import React, { useEffect } from "react";
import styles from "../styles/SecaoAgendar.module.css";
import { Plus, MessageSquare, Edit2, Trash2 } from 'lucide-react';

export default function SecaoAgendar({ agendamentos, showPopup, onEdit, onFeedback, onNovoAgendamento, onFinalizar, page, totalPages, onPrevPage, onNextPage, statusFilter, onStatusFilterChange, dataInicio, onDataInicioChange, dataFim, onDataFimChange, onFilter, onReset, isEmployee }) {
  const isPeriodValid = dataInicio && dataFim && dataInicio <= dataFim;
  return (
    <div className={styles.content}>
      {/* Título e botão */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Agendamentos</h1>
        <div className={styles.headerControls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className={styles.statusFilter}
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="COMPLETED">Completo</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div className={styles.dateFiltersContainer}>
            <div className={styles.dateInputGroup}>
              <label className={styles.dateLabel} htmlFor="dataInicio">Início:</label>
              <input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => onDataInicioChange(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label className={styles.dateLabel} htmlFor="dataFim">Fim:</label>
              <input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => onDataFimChange(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <button 
              onClick={onFilter} 
              className={styles.filterButton} 
              disabled={!isPeriodValid}
              style={{ backgroundColor: !isPeriodValid ? '#ccc' : 'var(--DOURADO)' }}
            >
              Filtrar
            </button>
            <button onClick={onReset} className={styles.filterButton}>
              Resetar
            </button>
          </div>
          <button
            onClick={onNovoAgendamento}
            className={styles.addButton}
          >
            <Plus className={styles.addIcon} />
            <span>Realizar Agendamento</span>
          </button>
        </div>
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
                {
                  !isEmployee && agendamento.status === 'COMPLETED' && (
                    <button
                      onClick={() => onFeedback(agendamento.id)}
                      className={styles.feedbackBtn}
                      >
                      <MessageSquare className={styles.smallIcon} />
                      <span>Dar feedback</span>
                    </button>
                  )
                }
                {agendamento.status === 'ACTIVE' && (
                  <button
                    onClick={() => onEdit(agendamento.id)}
                    className={styles.editBtn}
                    >
                  <Edit2 className={styles.smallIcon} />
                </button>
                )}
                {agendamento.status === 'ACTIVE' && (
                  <button
                  onClick={() => showPopup(agendamento.id)}
                  className={styles.deleteBtn}
                  >
                  <Trash2 className={styles.smallIcon} />
                </button>
                )}

                {agendamento.status === 'ACTIVE' && onFinalizar && (
                  <button
                    onClick={() => onFinalizar && onFinalizar(agendamento.id)}
                    className={styles.completeBtn}
                    title="Finalizar Agendamento"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                  </button>
                )}
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
