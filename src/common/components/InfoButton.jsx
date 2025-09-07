import styles from '../styles/info-button.module.css';

export default function InfoButton(props) {
    
    return (
        <button 
            className={styles.button}
            onClick={()=>{props.setShowPopup(true), props.setPopupText(props.popupText), props.setPopupTitle(props.popupTitle)}}
            style={{
                position: props.isAbsolute? "absolute" : "unset",
                top: 25,
                right: 25
            }}
        >
            ?
        </button>
    );
}