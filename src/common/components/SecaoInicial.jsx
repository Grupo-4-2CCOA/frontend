import style from "../styles/secao-inicial.module.css";
import logo from "../../assets/logo-vb.png";

export default function SecaoInicial() {
	return (
        <section className={style.heroSection}>
            <div className={style.heroContent}>
                <p>
                    Seja bem-vinda ao lugar onde sua beleza encontra o cuidado que merece!
                </p>
            </div>
            <div className={style.heroImageContainer}>
                <img src={logo} alt="Cabelo Ruivo Vibrante" className={style.heroImage} />
            </div>
        </section>
    )
}
