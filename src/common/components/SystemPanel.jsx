import React, { useState, useEffect } from "react";
import styles from "../styles/system-panel.module.css";
import InfoButton from "./InfoButton.jsx";
import ApexCharts from 'apexcharts';

export default function SystemPanel(){
    const[charts, setCharts] = useState({performance: null, cancelled: null});
    const[showPopup, setShowPopup] = useState(false);
    const[popupText, setPopupText] = useState("");

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
            enabled: true
        },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
    };

    function generateCharts() {
        if(charts.cancelled) {
            charts.cancelled.destroy();
        }

        if(charts.performance) {
            charts.performance.destroy();
        }

        let cancelledChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Agendamentos Cancelados",
                align: "center",
                style: {
                    fontSize: "20px",
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
                    data: [30, 40, 35, 50, 49, 60, 70]
                }
            ],
            fill: {
                type: 'gradient',
                colors: ["var(--ROSA-LOGO)"],
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.1,
                    inverseColors: false,
                    opacityFrom: 0.8,
                    opacityTo: 0.3,
                    stops: [0, 100]
                }
            },
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
                },
                max: 100,
                min: 0
            }
        };

        let performanceChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Rendimento Total",
                align: "center",
                style: {
                    fontSize: "20px",
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
                    data: [30, 40, 35, 50, 49, 60, 70]
                }
            ],
            fill: {
                type: 'gradient',
                colors: ["var(--ROSA-LOGO)"],
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.1,
                    inverseColors: false,
                    opacityFrom: 0.8,
                    opacityTo: 0.3,
                    stops: [0, 100]
                }
            },
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
                },
                max: 100,
                min: 0
            }
        };

        var cancelledScheduleChart = new ApexCharts(document.querySelector("#cancelled-schedule-chart"), cancelledChartOptions);
        cancelledScheduleChart.render();
        
        var performanceScheduleChart = new ApexCharts(document.querySelector("#performance-schedule-chart"), performanceChartOptions);
        performanceScheduleChart.render();

        setCharts({performance: performanceScheduleChart, cancelled: cancelledScheduleChart});
    }

    useEffect(() => {
        generateCharts();
    }, []);

    var mockValues = [
        {
            service: "Cabelo",
            quantity: 150
        },
        {
            service: "Sobrancelha",
            quantity: 100
        },
        {
            service: "Manicure",
            quantity: 75
        },
        {
            service: "Pedicure",
            quantity: 50
        },
        {
            service: "Unhas de Gel",
            quantity: 25
        }
    ]

    return(
        <div className={styles.systemPanel}>
            <div className={styles.charts}>
                <div id="performance-schedule-chart"></div>
                <div id="cancelled-schedule-chart"></div>
            </div>
            <div className={styles.kpis}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Quantidade de atendimentos</span>
                        <InfoButton 
                            setShowPopup={setShowPopup}
                            setPopupText={setPopupText}
                            popupText={"Número total de atendimentos realizados no período selecionado."}
                        />
                    </div>
                    <div className={styles.kpiItem}>
                        <span className={styles.rankValueSpan}>59 atendimentos</span>
                    </div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Serviços mais vendidos</span>
                        <InfoButton 
                            setShowPopup={setShowPopup}
                            setPopupText={setPopupText}
                            popupText={"Lista dos serviços mais vendidos no período selecionado."}
                        />
                    </div>
                    {
                        mockValues.map((item, index) => (
                            <div className={styles.kpiItem}>
                                <span className={styles.rankValueSpan}>{index + 1}.</span>
                                <span className={styles.rankValueSpan}>{item.service}</span>
                                <span className={styles.rankValueSpan}>{item.quantity}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}