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

// import { useAuth } from '../hooks/useAuth';

export default function SystemPanel() {
    // const { userInfo } = useAuth('ADMIN', "FUNC");
    const [showPopup, setShowPopup] = useState(false);
    const [popupText, setPopupText] = useState("Número total de atendimentos realizados no período selecionado.");

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
        if (chartsRef.current.cancelled) {
            chartsRef.current.cancelled.destroy();
        }

        if (chartsRef.current.performance) {
            chartsRef.current.performance.destroy();
        }

        let cancelledChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Agendamentos Cancelados",
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

        let performanceChartOptions = {
            ...commonChartOptions,
            title: {
                text: "Rendimento Total",
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

        const cancelledScheduleChart = new ApexCharts(
            document.querySelector("#cancelled-schedule-chart"),
            cancelledChartOptions
        );
        cancelledScheduleChart.render();

        const performanceScheduleChart = new ApexCharts(
            document.querySelector("#performance-schedule-chart"),
            performanceChartOptions
        );
        performanceScheduleChart.render();

        chartsRef.current = {
            performance: performanceScheduleChart,
            cancelled: cancelledScheduleChart
        };
    }

    useEffect(() => {
        generateCharts();
        return () => {
            chartsRef.current.performance?.destroy();
            chartsRef.current.cancelled?.destroy();
        };
    }, [chartsRef]);

    var mockValues = [
        {
            service: "Cabelo",
            quantity: 150,
            price: 10
        },
        {
            service: "Sobrancelha",
            quantity: 100,
            price: 30
        },
        {
            service: "Manicure",
            quantity: 75,
            price: 20
        },
        {
            service: "Pedicure",
            quantity: 50,
            price: 22.45
        },
        {
            service: "Unhas de Gel",
            quantity: 25,
            price: 111
        }
    ]

    return (
        <div className={styles.systemPanel}>
            {
                showPopup && <Popup text={popupText} setShowPopup={setShowPopup} />
            }
            <div className={styles.charts}>
                <div className={styles.chart}>
                    <div id="performance-schedule-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupText={setPopupText}
                        popupText={"Número total de atendimentos realizados no período selecionado."}
                    />
                </div>
                <div className={styles.chart}>
                    <div id="cancelled-schedule-chart"></div>
                    <InfoButton
                        isAbsolute={true}
                        setShowPopup={setShowPopup}
                        setPopupText={setPopupText}
                        popupText={"Número total de atendimentos realizados no período selecionado."}
                    />
                </div>
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
                                    mockValues.map((item, index) => (
                                        <TableRow>
                                            <TableCell sx={{ fontSize: 17 }}>{index + 1}º</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>{item.service}</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>{item.quantity}</TableCell>
                                            <TableCell sx={{ fontSize: 17 }}>
                                                {(item.price * item.quantity).toLocaleString('pt-BR', {
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
    )
}