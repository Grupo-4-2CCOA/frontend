import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sells-panel.module.css";
import InfoButton from "./InfoButton.jsx";
import ApexCharts from 'apexcharts';
import Popup from "./Popup.jsx";
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
export default function SellsPanel({ dataInicio, dataFim }) {
    // const { userInfo } = useAuth('ADMIN', "FUNC");
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Informação");
    const [popupText, setPopupText] = useState("");
    const [dashboardData, setDashboardData] = useState(null);
    const [primeirosAgendamentos, setPrimeirosAgendamentos] = useState(0);

    const chartsRef = useRef([]);

    const mesesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    function getSerieFromPairArray(array, indexValue = 1) {
        if (!array) return [];
        return array.map(item => item[indexValue]);
    }

    function getLabelFromPairArray(array) {
        if (!array) return [];
        return array.map(item => mesesLabels[(item[0] ?? 1) - 1]);
    }

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
        xaxis: {
            categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
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
        api.get(`http://localhost:8080/dashboard/vendas?startDate=${dataInicio}&endDate=${dataFim}`)
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
        if (chartsRef.current.leadQuantity) {
            chartsRef.current.leadQuantity.destroy();
        }

        if (chartsRef.current.returnRate) {
            chartsRef.current.returnRate.destroy();
        }

        if (!dashboardData) return;

        setPrimeirosAgendamentos(getSerieFromPairArray(dashboardData.primeirosAgendamentos, 1));
        // const primeirosAgendamentosLabels = getLabelFromPairArray(dashboardData.primeirosAgendamentos);

        const leadsPorMes = getSerieFromPairArray(dashboardData.leads, 1);
        const leadsLabels = getLabelFromPairArray(dashboardData.leads);

        const taxaRetornoPorMes = getSerieFromPairArray(dashboardData.taxaRetorno, 1);
        const taxaRetornoLabels = getLabelFromPairArray(dashboardData.taxaRetorno);

        let leadQuantityChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Quantidade de leads no site",
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
                    name: "Cancelled",
                    data: leadsPorMes
                }
            ],
            yaxis: {
                title: {
                    text: "Quantidade",
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

        leadQuantityChartOptions.xaxis.categories = leadsLabels;

        let returnRateChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Taxa de retorno",
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
                    name: "Rendimento",
                    data: taxaRetornoPorMes
                }
            ],
            yaxis: {
                title: {
                    text: "Taxa",
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

        returnRateChartOptions.xaxis.categories = taxaRetornoLabels;

        const leadQuantityChart = new ApexCharts(
            document.querySelector("#lead-quantity-chart"),
            leadQuantityChartOptions
        );
        leadQuantityChart.render();

        const returnRateChart = new ApexCharts(
            document.querySelector("#return-rate-chart"),
            returnRateChartOptions
        );
        returnRateChart.render();

        chartsRef.current = {
            returnRate: returnRateChart,
            leadQuantity: leadQuantityChart,
        };
        return () => {
            chartsRef.current.leadQuantity?.destroy();
            chartsRef.current.returnRate?.destroy();
        };
    }

    useEffect(() => {
        return generateCharts();
    }, [dashboardData]);

    return (
        <div className={styles.sellsPanel}>
            {
                showPopup && <Popup title={popupTitle} text={popupText} setShowPopup={setShowPopup} />
            }
            <div className={styles.panelChildren}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Quantidade de primeiros agendamentos</span>
                        <InfoButton
                            setShowPopup={setShowPopup}
                            setPopupTitle={setPopupTitle}
                            popupTitle={"Informação"}
                            setPopupText={setPopupText}
                            popupText={"Número total de primeiros agendamentos realizados no período selecionado."}
                        />
                    </div>
                    <div className={styles.kpiItem}>
                        <span className={styles.rankValueSpan}>{primeirosAgendamentos.length} agendamentos</span>
                    </div>
                </div>
                <div className={styles.chart}>
                    <div id="lead-quantity-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupTitle={setPopupTitle}
                        popupTitle={"Informação"}
                        setPopupText={setPopupText}
                        popupText={"A taxa de retorno dos serviços em reais (R$) durante o período selecionado."}
                    />
                </div>
            </div>
            <div className={styles.panelChildren}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>???????????????</span>
                        <InfoButton
                            setShowPopup={setShowPopup}
                            setPopupTitle={setPopupTitle}
                            popupTitle={"Informação"}
                            setPopupText={setPopupText}
                            popupText={"???????????????"}
                        />
                    </div>
                    <div className={styles.kpiItem}>
                        <span className={styles.rankValueSpan}>???????????????</span>
                    </div>
                </div>
                <div className={styles.chart}>
                    <div id="return-rate-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupTitle={setPopupTitle}
                        popupTitle={"Informação"}
                        setPopupText={setPopupText}
                        popupText={"A taxa de retorno dos serviços em reais (R$) durante o período selecionado"}
                    />
                </div>
            </div>
        </div>
    );
}