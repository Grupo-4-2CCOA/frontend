import BotaoPrincipal from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-vb.png";
import style from "../styles/navbar.module.css";

export default function Navbar() {
    return (
        <nav className={style.navbar}>
            <img src={logo} alt="Logo" className={style.navbarLogo}/>

            <div className={style.navbarLinks}>
                <ul>
                    <Link to="/">Home</Link>
                    <a href="#">Serviços</a>
                    <a href="#">Sobre nós</a>
                    <a href="#">Contato</a>
                </ul>
            </div>

            <div className={style.navbarActions}>
                <Link to="/login">
                    <BotaoSecundario children="Entrar" />
                </Link>
            </div>
        </nav>
    );
}
