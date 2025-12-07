import React from 'react';
import styles from '../styles/secao-servicos.module.css'; 

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const servico = [
    {
        id: 1,
        category: 'Categoria',
        title: 'Unhas de gel',
        description: 'Alongamento profissional com gel, garantindo unhas resistentes, elegantes e com acabamento impecável.',
        image: "https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com/unha-gel.jpg",
    },
    {
        id: 2,
        category: 'Categoria',
        title: 'Cabelo',
        description: 'Corte feminino moderno e personalizado, feito para valorizar o formato do rosto e realçar sua beleza natural.',
        image: "https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com/corte-de-cabelo.jpg", 
    },
    {
        id: 3,
        category: 'Categoria',
        title: 'Manicure',
        description: 'Tratamento completo para as mãos com corte, lixamento e esmaltação, oferecendo acabamento limpo e duradouro.',
        image: "https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com/manicure-simples.jpg",
    },
    {
        id: 4,
        category: 'Categoria',
        title: 'Pedicure',
        description: 'Cuidado essencial para os pés, incluindo corte, lixamento e esmaltação com técnicas que garantem conforto e estética.',
        image: "https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com/pedicure.jpg",
    },
    {
        id: 5,
        category: 'Categoria',
        title: 'Limpeza de Pele',
        description: 'Limpeza facial profunda com remoção de impurezas, revitalização da pele e sensação de frescor imediato.',
        image: "https://grupo4-beauty-barreto-source.s3.us-east-1.amazonaws.com/limpeza-simples.jpg",
    },
];

export default function SecaoServicos() {
    return (
        <section className={styles['servico-secao']}>
            <h2 className={styles['servico-titulo']}>Serviços</h2>

            <div className={styles['carousel-container']}>
                <Swiper
                    className={styles['swiper']}
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
                    {servico.map(servico => (
                        <SwiperSlide key={servico.id}>
                            <div className={styles['service-card']}>
                                <div className={styles['service-image-placeholder']}>
                                    <img
                                        src={servico.image}
                                        alt={servico.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                                <p className={styles['service-category']}>{servico.category}</p>
                                <h3 className={styles['service-title']}>{servico.title}</h3>
                                <p className={styles['service-description']}>{servico.description}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}