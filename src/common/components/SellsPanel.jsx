import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/sells-panel.module.css";
import InfoButton from "./InfoButton.jsx";
import ApexCharts from 'apexcharts';
import Popup from "./Popup.jsx";

// import { useAuth } from '../hooks/useAuth';

export default function SellsPanel() {
    // const { userInfo } = useAuth('ADMIN', "FUNC");
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("Informação")
    const [popupText, setPopupText] = useState("");

    const chartsRef = useRef([]);

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

    function generateCharts() {
        if (chartsRef.current.visitorQuantity) {
            chartsRef.current.visitorQuantity.destroy();
        }

        if (chartsRef.current.returnRate) {
            chartsRef.current.returnRate.destroy();
        }

        let visitorQuantityChartOptions = {
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
                    data: [150, 250, 444, 390, 754, 555, 458]
                }
            ],
            yaxis: {
                title: {
                    text: "Rendimento (R$)",
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

        let returnRateChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Quantidade de visitantes no site",
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
                    data: [30, 40, 35, 50, 49, 60, 70]
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

        const visitorQuantityChart = new ApexCharts(
            document.querySelector("#visitor-quantity-chart"),
            visitorQuantityChartOptions
        );
        visitorQuantityChart.render();

        const returnRateChart = new ApexCharts(
            document.querySelector("#return-rate-chart"),
            returnRateChartOptions
        );
        returnRateChart.render();

        chartsRef.current = {
            returnRate: returnRateChart,
            visitorQuantity: visitorQuantityChart,
        };
    }

    useEffect(() => {
        generateCharts();
        return () => {
            chartsRef.current.visitorQuantity?.destroy();
            chartsRef.current.returnRate?.destroy();
        };
    }, [chartsRef]);

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
                        <span className={styles.rankValueSpan}>210 agendamentos</span>
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
                        popupText={"A taxa de retorno dos serviços em reais (R$) durante o período selecionado."}
                    />
                </div>
            </div>
            <div className={styles.panelChildren}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiCardHeader}>
                        <span className={styles.cardTitle}>Tempo médio dos visitantes no site</span>
                        <InfoButton
                            setShowPopup={setShowPopup}
                            setPopupTitle={setPopupTitle}
                            popupTitle={"Informação"}
                            setPopupText={setPopupText}
                            popupText={"Tempo médio que os visitantes passaram no site (durante o período selecionado)."}
                        />
                    </div>
                    <div className={styles.kpiItem}>
                        <span className={styles.rankValueSpan}>2 Minutos e 20 segundos</span>
                    </div>
                </div>
                <div className={styles.chart}>
                    <div id="visitor-quantity-chart"></div>
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
    )
}