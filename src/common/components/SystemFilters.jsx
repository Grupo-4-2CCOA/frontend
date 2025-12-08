import React from "react";
import styles from "../styles/system-filters.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import { useNavigate } from 'react-router-dom';

/**
 * 
 * @param {{
 *   dataInicio: string,
 *   setDataInicio: React.Dispatch<React.SetStateAction<string>>,
 *   dataFim: string,
 *   setDataFim: React.Dispatch<React.SetStateAction<string>>
 * }} param0 props
 * @returns 
 */
export default function SystemFilters({ dataInicio, setDataInicio, dataFim, setDataFim }) {
    const navigate = useNavigate();

    const handleNavigate = (route) => {
        navigate(route);
    };

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.leftFiltersGroup}>
                <div className={styles.dateFiltersContainer}>
                    <div className={styles.dateInputGroup}>
                        <label className={styles.dateLabel}>Data Início:</label>
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    <div className={styles.dateInputGroup}>
                        <label className={styles.dateLabel}>Data Fim:</label>
                        <input
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                </div>
            </div>
            <span>Serviços</span>
            <div className={styles.buttons}>
                <BotaoPrincipal onClick={() => handleNavigate("/system-dashboard")} children="Serviços" />
                <BotaoSecundario onClick={() => handleNavigate("/sells-dashboard")} children="Funil de Vendas" />
            </div>
        </div>
    );
}
