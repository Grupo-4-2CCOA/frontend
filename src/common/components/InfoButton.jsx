import styles from '../styles/info-button.module.css';

export default function InfoButton(props) {
    
    return (
        <button 
            className={styles.button}
            onClick={()=>{props.setShowPopup(true), props.setPopupText(props.popupText)}}
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