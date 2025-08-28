import styles from '../styles/popup.module.css';

export default function Popup(props) {
    return (
        <div className={styles.popup}>
            {props.text}
        </div>
    );
}