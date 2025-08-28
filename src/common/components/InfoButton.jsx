import styles from '../styles/info-button.module.css';

export default function InfoButton(props) {
    
    return (
        <button 
            className={styles.button}
            onClick={()=>{props.setShowPopup(true), props.setPopupText(props.popupText)}}
        >
            ?
        </button>
    );
}