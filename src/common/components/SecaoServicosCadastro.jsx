import React from 'react';
import styles from '../styles/SecaoServicosCadastro.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import BotaoSecundario from './BotaoSecundario';

const servico = [
    {
        id: 1,
        category: 'Categoria',
        title: 'Unha',
        description: 'Unhas bem cuidadas são um toque de delicadeza que transforma.',
        image: "",
    },
    {
        id: 2,
        category: 'Categoria',
        title: 'Cabelo',
        description: 'Cuidar dos cabelos é mais do que estética: é sobre autoestima, expressão e bem-estar.',
        image: "",
    },
    {
        id: 3,
        category: 'Categoria',
        title: 'Depilação',
        description: 'Pele lisinha, toque suave e bem-estar em cada detalhe. Nossa depilação vai além da estética: é um cuidado com você.',
        image: "",
    },
];

export default function SecaoServicosCadastro({ onEditar }) {
    return (
        <section className={styles.servicoSecao}>
            <div className={styles.carouselContainer}>
                <Swiper
                    className={styles.swiper}
                    modules={[Navigation, Pagination, A11y]}
                    spaceBetween={40}
                    slidesPerView={3}
                    pagination={{ clickable: true }}
                    loop={false}
                >
                    {servico.map((servico, idx) => (
                        <SwiperSlide key={servico.id}>
                            <div className={styles.serviceCard}>
                                <div className={styles.serviceImagePlaceholder}>
                                    <span className={styles.placeholderX}>✕</span>
                                </div>
                                <p className={styles.serviceCategory}>{servico.category}</p>
                                <h3 className={styles.serviceTitle}>{servico.title}</h3>
                                <p className={styles.serviceDescription}>{servico.description}</p>
                                <BotaoSecundario
                                    className={styles.editarBtn}
                                    onClick={() => onEditar(idx)}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>◀</span> Editar
                                </BotaoSecundario>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}