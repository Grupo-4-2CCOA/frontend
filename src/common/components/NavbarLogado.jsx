import logo from "../../assets/logo-vb.png";
import styles from "../styles/navbarLogado.module.css";
import { Eye, User} from 'lucide-react';
import { Link } from "react-router-dom";

export default function NavbarLogado() {
    return (
        <nav className={styles.navbar}>
            <img src={logo} alt="Logo" className={styles.navbarLogo}/>
            <div className={styles.navbarLinks}>
                <ul>
                    <Link to="#">Serviços</Link>
                    <Link to="#">Agendamentos</Link>
                    <Link to="#">Feedbacks</Link>
                    <Link>Dashboards</Link>
                </ul>
            </div>
            <div className={styles.headerIcons}>
                <Eye className={styles.icon} />
                <User className={styles.icon} />
           </div>     
        </nav>
    );
}
