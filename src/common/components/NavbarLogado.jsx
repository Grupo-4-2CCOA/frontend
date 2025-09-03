import logo from "../../assets/logo-vb.png";
import style from "../styles/navbarLogado.module.css";
import { Eye, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function NavbarLogado() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
  setShowMenu(false);
  navigate(path);
    };

  return (
    <nav className={style.navbar}>
      <img src={logo} alt="Logo" className={style.navbarLogo} />
      <div className={style.headerIcons}>
        <Eye className={style.icon} />
        <div className={style.profileMenu}>
          <User className={style.icon} onClick={() => setShowMenu(!showMenu)} />
          {showMenu && (
            <div className={style.dropdown}>
              <button onClick={() => handleNavigate("/informacoes")}>Informações adicionais</button>
              <button onClick={() => handleNavigate("/login")}>Sair</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
