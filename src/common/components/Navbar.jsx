import { BotaoPrincipal } from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import logo from "../../assets/logo-vb.png";
import style from "../styles/navbar.module.css";

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
				<BotaoSecundario children="Entrar" />
				<BotaoPrincipal children="Cadastre-se" />
			</div>
		</nav>
	);
}
