import logo from "../../assets/logo-vb.png";
import styles from "../styles/navbarLogado.module.css";
import { Link } from "react-router-dom";
import { Eye, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavbarLogado(props) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <nav className={styles.navbar}>
      <img src={logo} alt="Logo" className={styles.navbarLogo} />
      {
        props.isAdmin && (
          <div className={styles.navbarLinks}>
            <ul>
              <Link to="#">Serviços</Link>
              <Link to="#">Agendamentos</Link>
              <Link to="#">Feedbacks</Link>
              <Link>Dashboards</Link>
            </ul>
          </div>
        )
      }
      <div className={styles.headerIcons}>
        <Eye className={styles.icon} />
        <div className={styles.profileMenu}>
          <User className={styles.icon} onClick={() => setShowMenu(!showMenu)} />
          {showMenu && (
            <div className={styles.dropdown}>
              <button onClick={() => handleNavigate("/informacoes")}>Informações adicionais</button>
              <button onClick={() => handleNavigate("/login")}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
