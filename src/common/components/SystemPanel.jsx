import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/system-panel.module.css";
import InfoButton from "./InfoButton.jsx";
import ApexCharts from 'apexcharts';
import Popup from "./Popup.jsx";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import api from '../../services/api';

// import { useAuth } from '../hooks/useAuth';

/**
 * 
 * @param {{
 *   dataInicio: string,
 *   dataFim: string,
 * }} param0 props
 * @returns 
 */
export default function SystemPanel({ dataInicio, dataFim }) {
    // const { userInfo } = useAuth('ADMIN', "FUNC");
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Informação");
    const [popupText, setPopupText] = useState("");
    const [dashboardData, setDashboardData] = useState(null);

    const chartsRef = useRef({});

    const commonChartOptions = {
        chart: {
            type: "area",
            height: "260px",
            width: "100%",
            background: 'transparent',
            toolbar: {
                show: false
            }
        },
        grid: {
            show: false
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#FF4081'],
                fontSize: '12px',
                fontWeight: 'bold',
            }
        },
        fill: {
            type: 'gradient',
            colors: ["var(--ROSA-LOGO)"],
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.1,
                gradientToColors: ["var(--ROSA)"],
                inverseColors: false,
                opacityFrom: 0.8,
                opacityTo: 0.5,
                stops: [0, 100]
            }
        }
    };

    useEffect(() => {
        api.get(`http://localhost:8080/dashboard/sistema?startDate=${dataInicio}&endDate=${dataFim}`)
            .then((response) => {
                setDashboardData(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar dados do dashboard:", error);
                setDashboardData(null);
            });
    }, [dataInicio, dataFim]);

    function generateCharts() {
        if (chartsRef.current.cancelled) chartsRef.current.cancelled.destroy();
        if (chartsRef.current.performance) chartsRef.current.performance.destroy();

        if (!dashboardData) return;

        // Usa a nova estrutura do backend: { labels: [...], values: [...] }
        const rendimentoLabels = dashboardData.rendimentoTotal?.labels || [];
        const rendimentoValues = dashboardData.rendimentoTotal?.values || [];

        const cancelamentosLabels = dashboardData.taxaCancelamento?.labels || [];
        const cancelamentosValues = dashboardData.taxaCancelamento?.values || [];

        let performanceChartOptions = {
            ...commonChartOptions,
            xaxis: { ...commonChartOptions.xaxis, categories: rendimentoLabels },
            title: {
                text: "Faturamento Total (R$)",
                align: "center",
                style: {
                    fontSize: "23px",
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                    color: "var(--PRETO)"
                }
            },
            stroke: {
                curve: "smooth",
                colors: ["var(--BRANCO)"]
            },
            series: [
                {
                    name: "Faturamento",
                    data: rendimentoValues
                }
            ],
            yaxis: {
                title: {
                    text: "Faturamento (R$)",
                    style: {
                        color: 'var(--CINZA-ESCURO)',
                        fontSize: '14px',
                        fontFamily: 'Roboto',
                        fontWeight: '600'
                    },
                    offsetX: -10
                },
                labels: {
                    style: {
                        colors: "var(--CINZA-ESCURO)",
                        fontSize: '12px',
                        fontFamily: 'Roboto'
                    }
                }
            }
        };

        let cancelledChartOptions = {
            ...commonChartOptions,
            xaxis: { ...commonChartOptions.xaxis, categories: cancelamentosLabels },
            title: {
                text: "Taxa de Cancelamento",
                align: "center",
                style: {
                    fontSize: "23px",
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                    color: "var(--PRETO)"
                }
            },
            stroke: {
                curve: "smooth",
                colors: ["var(--BRANCO)"]
            },
            series: [
                {
                    name: "Taxa (%)",
                    data: cancelamentosValues
                }
            ],
            yaxis: {
                title: {
                    text: "Taxa (%)",
                    style: {
                        color: 'var(--CINZA-ESCURO)',
                        fontSize: '14px',
                        fontFamily: 'Roboto',
                        fontWeight: '600'
                    },
                    offsetX: -10
                },
                labels: {
                    style: {
                        colors: "var(--CINZA-ESCURO)",
                        fontSize: '12px',
                        fontFamily: 'Roboto'
                    }
                }
            }
        };

        chartsRef.current.performance = new ApexCharts(
            document.querySelector("#performance-schedule-chart"),
            performanceChartOptions
        );
        chartsRef.current.performance.render();

        chartsRef.current.cancelled = new ApexCharts(
            document.querySelector("#cancelled-schedule-chart"),
            cancelledChartOptions
        );
        chartsRef.current.cancelled.render();

        return () => {
            chartsRef.current.performance?.destroy();
            chartsRef.current.cancelled?.destroy();
        };

    }

    useEffect(() => {
        return generateCharts();
    }, [dashboardData]);

    const rankingServicos = dashboardData?.rankingServicos || [];

    return (
        <div className={styles.systemPanel}>
            {showPopup && <Popup title={popupTitle} text={popupText} setShowPopup={setShowPopup} />}
            <div className={styles.charts}>
                <div className={styles.chart}>
                    <div id="performance-schedule-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupTitle={setPopupTitle}
                        popupTitle={"Informação"}
                        setPopupText={setPopupText}
                        popupText={"Valor adquirido (em reais) através dos serviços realizados em cada intervalo de tempo"}
                    />
                </div>
                <div className={styles.chart}>
                    <div id="cancelled-schedule-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupTitle={setPopupTitle}
                        popupTitle={"Informação"}
                        setPopupText={setPopupText}
                        popupText={"Quantidade de agendamentos que foram cancelados em cada intervalo de tempo."}
                    />
                </div>
            </div>
            <div className={styles.kpis}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Quantidade de atendimentos</span>
                        <InfoButton
                            setShowPopup={setShowPopup}
                            setPopupTitle={setPopupTitle}
                            popupTitle={"Informação"}
                            setPopupText={setPopupText}
                            popupText={"Número total de atendimentos realizados no período selecionado."}
                        />
                    </div>
                    <div className={styles.kpiItem}>
                        <span className={styles.rankValueSpan}>
                            {dashboardData ? `${dashboardData.totalAtendimentos} atendimentos` : "Carregando..."}
                        </span>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Serviços mais vendidos</span>
                        <InfoButton
                            setShowPopup={setShowPopup}
                            setPopupTitle={setPopupTitle}
                            popupTitle={"Informação"}
                            setPopupText={setPopupText}
                            popupText={"Lista dos serviços mais vendidos no período selecionado."}
                        />
                    </div>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'var(--DOURADO)', fontWeight: "bold", fontSize: 20 }}>Ranking</TableCell>
                                    <TableCell sx={{ color: 'var(--DOURADO)', fontWeight: "bold", fontSize: 20 }}>Serviço</TableCell>
                                    <TableCell sx={{ color: 'var(--DOURADO)', fontWeight: "bold", fontSize: 20 }}>Quantidade</TableCell>
                                    <TableCell sx={{ color: 'var(--DOURADO)', fontWeight: "bold", fontSize: 20 }}>Valor total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    rankingServicos.map((item, index) => (
                                        <TableRow key={item.ranking}>
                                            <TableCell sx={{ fontSize: 17 }}>{item.ranking}º</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>{item.nomeServico}</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>{item.quantidade}</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>
                                                {item.valorTotal.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}