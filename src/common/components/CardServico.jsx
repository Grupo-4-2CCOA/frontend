import Styles from "../styles/CardServico.module.css";

export default function CardServico({ imagem, descricao, onEditar }) {
    return (
        <div className={Styles.card}>
            <div className={Styles.imagem}>
                {/* Se não houver imagem, mostra um placeholder */}
                {imagem ? (
                    <img src={imagem} alt="Serviço" />
                ) : (
                    <div className={Styles.placeholder}>
                        <span className={Styles.x}>✕</span>
                    </div>
                )}
            </div>
            <div className={Styles.descricao}>{descricao}</div>
            <button className={Styles.editarBtn} onClick={onEditar}>
                <span className={Styles.seta}>◀</span> Editar
            </button>
        </div>
    );
} 