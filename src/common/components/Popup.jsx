import styles from '../styles/popup.module.css';
import BotaoPrincipal from './BotaoPrincipal';
import BotaoSecundario from './BotaoSecundario';

export default function Popup(props) {
    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popup}>
                <button className={styles.svgButton} onClick={()=>props.setShowPopup(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                </button>
                <span className={styles.popupTitle}>{props.title}</span>
                <span className={styles.popupInfo}>{props.text}</span>
                {
                    props.hasButtons && (
                        <div className={styles.optionalButtons}>
                            <BotaoPrincipal
                                onClick={props.onClick}
                                children={"Cancelar"}
                            />
                            <BotaoSecundario
                                onClick={()=>props.setShowPopup(false)}
                                children={"Voltar"}
                            />
                        </div>
                    )
                }
            </div>
        </div>

    );
}