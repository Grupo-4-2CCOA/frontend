import React from 'react';
import style from '../styles/footer.module.css';
import logo from '../../assets/logo-vb.png';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className={style.footer}>
            <div className={style.footerTop}>
                <div className={style.footerLogoText}>
                    <img src={logo} alt="Logo Beauty Barreto" className={style.footerLogo} />
                </div>
                <div className={style.footerSocialIcons}>
                    <a href="https://wa.me/5511971465871" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <FaWhatsapp className={style.socialIcon} />
                    </a>
                    <a href="https://www.facebook.com/vilma.barreto.144" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <FaFacebookF className={style.socialIcon} />
                    </a>
                    <a href="https://www.instagram.com/espacovilmabarreto" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaInstagram className={style.socialIcon} />
                    </a>
                </div>
            </div>

            <hr className={style.footerDivider} />

            <div className={style.footerBottom}>
                <p className={style.footerCopyright}>Beauty Barreto @ 2025. Todos os direitos Reservados.</p>
                <div className={style.footerLinksBottom}>
                    <a href="#">Home</a>
                    <a href="#">Serviços</a>
                    <a href="#">Sobre nós</a>
                    <a href="#">Contato</a>
                </div>
            </div>
        </footer>
    );
}