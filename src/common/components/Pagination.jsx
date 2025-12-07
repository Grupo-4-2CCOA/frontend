import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from '../styles/Pagination.module.css';
import Modal from './Modal';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onPrevPage, 
  onNextPage,
  className = '' 
}) {
  const [inputValue, setInputValue] = useState('');

  // Se não houver páginas suficientes, não renderizar
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Normalizar currentPage para 1-based para exibição
  // Se currentPage é 0, assume-se que é 0-based, senão assume-se 1-based
  const normalizedPage = currentPage === 0 ? 1 : (currentPage || 1);
  
  const handlePageClick = (pageNum) => {
    if (onPageChange) {
      // onPageChange sempre recebe página 0-based
      onPageChange(pageNum - 1);
    }
  };

  const handleFirst = () => {
    if (onPageChange) {
      onPageChange(0);
    }
  };

  const handleLast = () => {
    if (onPageChange) {
      onPageChange(totalPages - 1);
    }
  };

  const handlePrev = () => {
    if (onPrevPage) {
      onPrevPage();
    } else if (onPageChange) {
      // Converter de 1-based para 0-based
      onPageChange(normalizedPage - 2);
    }
  };

  const handleNext = () => {
    if (onNextPage) {
      onNextPage();
    } else if (onPageChange) {
      // Converter de 1-based para 0-based
      onPageChange(normalizedPage);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputValue);
    if (pageNum >= 1 && pageNum <= totalPages && onPageChange) {
      handlePageClick(pageNum);
      setInputValue('');
    }
  };

  const handleInputBlur = () => {
    setInputValue('');
  };

  const isPrevDisabled = normalizedPage <= 1;
  const isNextDisabled = normalizedPage >= totalPages;

  // Calcular quais páginas mostrar
  const getPagesToShow = () => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pagesToShow = [];
    let startPage = Math.max(1, normalizedPage - 4);
    let endPage = Math.min(totalPages, normalizedPage + 4);

    if (normalizedPage <= 5) {
      startPage = 1;
      endPage = Math.min(9, totalPages);
    }

    // Ajustar se estiver no fim
    if (normalizedPage > totalPages - 5) {
      startPage = Math.max(1, totalPages - 8);
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    return pagesToShow;
  };

  const pagesToShow = getPagesToShow();

  return (
    <div className={`${styles.pagination} ${className}`}>
      <div className={styles.pageInfo}>
        <span className={styles.totalPagesLabel}>Total: {totalPages} página{totalPages !== 1 ? 's' : ''}</span>
      </div>

      <button
        className={styles.pageNavButton}
        onClick={handleFirst}
        disabled={isPrevDisabled}
        aria-label="Página anterior"
      >
        <ChevronsLeft className={styles.pageNavIcon} />
      </button>

      <button
        className={styles.pageNavButton}
        onClick={handlePrev}
        disabled={isPrevDisabled}
        aria-label="Página anterior"
      >
        <ChevronLeft className={styles.pageNavIcon} />
      </button>
      
      <div className={styles.pageNumbers}>
        {pagesToShow.map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.pageNumberButton} ${normalizedPage === pageNum ? styles.pageNumberButtonActive : ''}`}
            onClick={() => handlePageClick(pageNum)}
            aria-label={`Ir para página ${pageNum}`}
            aria-current={normalizedPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        className={styles.pageNavButton}
        onClick={handleNext}
        disabled={isNextDisabled}
        aria-label="Próxima página"
      >
        <ChevronRight className={styles.pageNavIcon} />
      </button>

      <button
        className={styles.pageNavButton}
        onClick={handleLast}
        disabled={isNextDisabled}
        aria-label="Próxima página"
      >
        <ChevronsRight className={styles.pageNavIcon} />
      </button>

      <form onSubmit={handleInputSubmit} className={styles.pageJumpForm}>
        <label htmlFor="pageJump" className={styles.pageJumpLabel}>
          Ir para:
        </label>
        <input
          id="pageJump"
          type="text"
          className={styles.pageJumpInput}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={`1-${totalPages}`}
          inputMode="numeric"
          maxLength={String(totalPages).length}
        />
      </form>
    </div>
  );
}

