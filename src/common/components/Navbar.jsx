import { BotaoPrincipal } from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import logo from "../../assets/logo-vb.svg"
import style from "../styles/navbar.module.css"
import { Link } from "react-router";

export default function Navbar() {
	return (
		<nav className={style.navbar}>
			<img src={logo} alt="Logo" className={style.navbarLogo}/>

			<div className={style.navbarLinks}>
				<ul>
					<a href="#">Home</a>
					<a href="#">Serviços</a>
					<a href="#">Sobre nós</a>
					<a href="#">Contato</a>
				</ul>
			</div>

			<div className={style.navbarActions}>
				<Link to="/login"><BotaoSecundario children="Entrar" /></Link>
				<Link to="/cadastro"><BotaoPrincipal children="Cadastre-se" /></Link>
			</div>
		</nav>
	);
}
