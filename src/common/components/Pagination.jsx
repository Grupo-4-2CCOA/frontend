import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/Pagination.module.css';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onPrevPage, 
  onNextPage,
  className = '' 
}) {
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

  const isPrevDisabled = normalizedPage <= 1;
  const isNextDisabled = normalizedPage >= totalPages;

  return (
    <div className={`${styles.pagination} ${className}`}>
      <button
        className={styles.pageNavButton}
        onClick={handlePrev}
        disabled={isPrevDisabled}
      >
        <ChevronLeft className={styles.pageNavIcon} />
      </button>
      
      <div className={styles.pageNumbers}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.pageNumberButton} ${normalizedPage === pageNum ? styles.pageNumberButtonActive : ''}`}
            onClick={() => handlePageClick(pageNum)}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        className={styles.pageNavButton}
        onClick={handleNext}
        disabled={isNextDisabled}
      >
        <ChevronRight className={styles.pageNavIcon} />
      </button>
    </div>
  );
}

