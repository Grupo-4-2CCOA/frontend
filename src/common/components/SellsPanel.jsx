import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sells-panel.module.css";
import InfoButton from "./InfoButton.jsx";
import ApexCharts from 'apexcharts';
import Popup from "./Popup.jsx";
import api from '../../services/api';

/**
 * 
 * @param {{
 *   dataInicio: string,
 *   dataFim: string,
 * }} param0 props
 * @returns 
 */
export default function SellsPanel({ dataInicio, dataFim }) {
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
        if (chartsRef.current.leads) chartsRef.current.leads.destroy();
        if (chartsRef.current.taxaRetorno) chartsRef.current.taxaRetorno.destroy();

        if (!dashboardData) return;

        // Dados dos gráficos
        const leadsLabels = dashboardData.leads?.labels || [];
        const leadsValues = dashboardData.leads?.values || [];

        const taxaRetornoLabels = dashboardData.taxaRetorno?.labels || [];
        const taxaRetornoValues = dashboardData.taxaRetorno?.values || [];

        // Gráfico de Leads
        let leadsChartOptions = {
            ...commonChartOptions,
            xaxis: { ...commonChartOptions.xaxis, categories: leadsLabels },
            title: {
                text: "Quantidade de Leads",
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
                    name: "Leads",
                    data: leadsValues
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

        // Gráfico de Taxa de Retorno
        let taxaRetornoChartOptions = {
            ...commonChartOptions,
            xaxis: { ...commonChartOptions.xaxis, categories: taxaRetornoLabels },
            title: {
                text: "Clientes Recorrentes",
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
                    name: "Retornos",
                    data: taxaRetornoValues
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

        chartsRef.current.leads = new ApexCharts(
            document.querySelector("#leads-chart"),
            leadsChartOptions
        );
        chartsRef.current.leads.render();

        chartsRef.current.taxaRetorno = new ApexCharts(
            document.querySelector("#taxa-retorno-chart"),
            taxaRetornoChartOptions
        );
        chartsRef.current.taxaRetorno.render();

        return () => {
            chartsRef.current.leads?.destroy();
            chartsRef.current.taxaRetorno?.destroy();
        };
    }

    useEffect(() => {
        return generateCharts();
    }, [dashboardData]);

    // Cálculos dos KPIs
    const totalPrimeirosAgendamentos = dashboardData?.primeirosAgendamentos?.values?.reduce((a, b) => a + b, 0) || 0;
    const totalLeads = dashboardData?.leads?.values?.reduce((a, b) => a + b, 0) || 0;
    const taxaConversaoValues = dashboardData?.taxaConversao?.values || [];
    const taxaConversaoMedia = taxaConversaoValues.length > 0 
        ? (taxaConversaoValues.reduce((a, b) => a + b, 0) / taxaConversaoValues.length).toFixed(2)
        : 0;

    return (
        <div className={styles.sellsPanel}>
            {showPopup && <Popup title={popupTitle} text={popupText} setShowPopup={setShowPopup} />}
            
            {/* Gráfico de Leads - Largura Total */}
            <div className={styles.fullWidthChart}>
                <div id="leads-chart"></div>
                <InfoButton
                    isAbsolute={true}
                    setShowPopup={setShowPopup}
                    setPopupTitle={setPopupTitle}
                    popupTitle={"Informação"}
                    setPopupText={setPopupText}
                    popupText={"Quantidade de usuários cadastrados que ainda não realizaram nenhum agendamento no período selecionado."}
                />
            </div>

            {/* Segunda linha: Gráfico de Clientes Recorrentes + KPIs */}
            <div className={styles.bottomRow}>
                <div className={styles.chart}>
                    <div id="taxa-retorno-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupTitle={setPopupTitle}
                        popupTitle={"Informação"}
                        setPopupText={setPopupText}
                        popupText={"Quantidade de clientes que realizaram 2 ou mais agendamentos, onde o segundo agendamento foi no período selecionado."}
                    />
                </div>
                <div className={styles.kpis}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiCardHeader}>
                            <span className={styles.cardTitle}>Primeiros Agendamentos (Clientes)</span>
                            <InfoButton
                                setShowPopup={setShowPopup}
                                setPopupTitle={setPopupTitle}
                                popupTitle={"Informação"}
                                setPopupText={setPopupText}
                                popupText={"Número total de usuários que realizaram seu primeiro e único agendamento no período selecionado."}
                            />
                        </div>
                        <div className={styles.kpiItem}>
                            <span className={styles.rankValueSpan}>
                                {dashboardData ? `${totalPrimeirosAgendamentos} clientes` : "Carregando..."}
                            </span>
                        </div>
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiCardHeader}>
                            <span className={styles.cardTitle}>Taxa de Conversão</span>
                            <InfoButton
                                setShowPopup={setShowPopup}
                                setPopupTitle={setPopupTitle}
                                popupTitle={"Informação"}
                                setPopupText={setPopupText}
                                popupText={"Percentual médio de leads (usuários cadastrados) que se converteram em clientes (realizaram pelo menos um agendamento) no período selecionado."}
                            />
                        </div>
                        <div className={styles.kpiItem}>
                            <span className={styles.rankValueSpan}>
                                {dashboardData ? `${taxaConversaoMedia}%` : "Carregando..."}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
