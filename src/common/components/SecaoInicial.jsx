import style from "../styles/secao-inicial.module.css"
import cabeloVermelho from '../../assets/fundo-mulher.png';

export default function SecaoInicial() {
	return (
        <section className={style.heroSection}>
            <div className={style.heroContent}>
                <h1>
                    Seja bem-vinda
                    <br />ao lugar
                    <br />onde sua beleza
                    <br />encontra
                    <br />o cuidado que
                    <br />merece!
                </h1>
            </div>
            <div className={style.heroImageContainer}>
                <img src={cabeloVermelho} alt="Cabelo Ruivo Vibrante" className={style.heroImage} />
            </div>
        </section>
    )
}
