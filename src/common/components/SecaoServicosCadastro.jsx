import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from '../styles/SecaoServicosCadastro.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import api from '../../services/api';
import BotaoSecundario from './BotaoSecundario';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

export default function SecaoServicosCadastro({ onEditar, refreshKey }) {
	const BUCKET_URL = 'https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com';
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, type: '', message: '', cb: null });
    const navigate = useNavigate();

    const fetchServicos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/servicos");

            // Sort services by most recent first
            const sortedServices = response.data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setServicos(sortedServices);
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
            if (error.response?.status === 401) {
                setModal({
                    open: true,
                    type: 'error',
                    message: 'Sessão expirada. Por favor, faça login novamente.',
                    cb: () => {
                        setModal(modal => ({ ...modal, open: false }));
                        navigate('/login');
                    }
                });
            } else {
                setModal({
                    open: true,
                    type: 'error',
                    message: 'Erro ao carregar serviços. Tente novamente.',
                    cb: () => setModal(modal => ({ ...modal, open: false }))
                });
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Update services when refreshKey changes
    useEffect(() => {
        fetchServicos();
    }, [fetchServicos, refreshKey]);

    // Add function to update a single service
    const updateService = (updatedService) => {
        setServicos(currentServices =>
            currentServices.map(service =>
                service.id === updatedService.id ? updatedService : service
            )
        );
    };

    // Modify onEditar to use the new updateService function
    const handleEdit = (service) => {
        onEditar({
            ...service,
            onSuccess: (updatedService) => {
                updateService(updatedService);
            }
        });
    };

    const getImageUrl = (imageName) => {
        if (!imageName) return null;
        return `${BUCKET_URL}/${imageName}`;
    };

    if (loading) {
        return (
            <>
                <Modal open={true} type="loading" message="Carregando serviços..." onClose={() => {}} />
            </>
        );
    }

    return (
        <>
            <Modal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => {
                    setModal(modal => ({ ...modal, open: false }));
                    modal.cb && modal.cb();
                }}
            />
            <section className={styles.servicoSecao}>
                <div className={styles.carouselContainer}>
                    <Swiper
                        className={styles.swiper}
                        modules={[Navigation, Pagination, A11y]}
                        spaceBetween={40}
                        slidesPerView={4}
                        pagination={{ clickable: true }}
                        loop={true}
                        breakpoints={{
                            768: { slidesPerView: 2, spaceBetween: 20 },
                            1024: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                    >
                        {servicos.map((servico) => (
                            <SwiperSlide key={servico.id}>
                                <div className={styles.serviceCard}>
                                    <div>
                                        <div className={styles.serviceImagePlaceholder}>
                                            {servico.image ? (
                                                <img
                                                    src={getImageUrl(servico.image)}
                                                    alt={servico.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <span className={styles.placeholderX}>✕</span>
                                            )}
                                        </div>
                                        <p className={styles.serviceCategory}>
                                            {servico.category?.name || 'Sem categoria'}
                                        </p>
                                        <h3 className={styles.serviceTitle}>{servico.name}</h3>
                                        <p className={styles.serviceDescription}>
                                            {servico.description || 'Sem descrição'}
                                        </p>
                                    </div>
                                    <div className={styles.cardBottom}>
                                        <BotaoSecundario
                                            onClick={() => handleEdit(servico)}
                                            className={styles.editarCadastro}
                                        >
                                            Editar
                                        </BotaoSecundario>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </>
    );
}