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
        description: 'Oferecemos serviços de manicure e pedicure com higienização, esmaltação impecável e atenção aos detalhes para realçar sua autoestima.',
        image: "imagem",
    },
    {
        id: 2,
        category: 'Categoria',
        title: 'Cabelo',
        description: 'Corte, hidratação, coloração e escova com técnicas profissionais e produtos de qualidade para realçar sua beleza natural.',
        image: "imagem",
    },
    {
        id: 3,
        category: 'Categoria',
        title: 'Depilação',
        description: 'Pele lisinha e bem cuidada com nossa depilação profissional! Utilizamos técnicas seguras e higiênicas para garantir conforto, eficiência e resultados duradouros.',
        image: "imagem",
    },
    {
        id: 4,
        category: 'Categoria',
        title: 'Cílios',
        description: 'Realce o seu olhar com alongamento de cílios feito com precisão e delicadeza! Técnica segura, efeito natural ou volumoso e resultado encantador que valoriza sua beleza.',
        image: "imagem",
    },
    {
        id: 5,
        category: 'Categoria',
        title: 'Massagem',
        description: 'Relaxe e revigore-se com nossas sessões de massagem terapêutica, aliviando tensões e promovendo bem-estar integral.',
        image: "imagem",
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
                    slidesPerView={4}
                    pagination={{ clickable: true }}
                    loop={true}
                    breakpoints={{
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                    }}
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
                                <div className={styles.cardBottom}>
                                    <BotaoSecundario
                                        onClick={() => onEditar(idx)}
                                        className={styles.editarCadastro}
                                    >
                                        <span style={{ fontSize: "1.2rem" }}></span> Editar
                                    </BotaoSecundario>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}