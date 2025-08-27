import logo from "../../assets/logo-vb.png";
import style from "../styles/navbarLogado.module.css";
import { Eye, User} from 'lucide-react';

export default function NavbarLogado() {
    return (
        <nav className={style.navbar}>
            <img src={logo} alt="Logo" className={style.navbarLogo}/>  
            <div className={style.headerIcons}>
             <Eye className={style.icon} />
             <User className={style.icon} />
           </div>     
        </nav>
    );
}
