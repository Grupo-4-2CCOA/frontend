import { BotaoPrincipal } from "./BotaoPrincipal";
import BotaoSecundario from "./BotaoSecundario";
import logo from "../../assets/logo-vb.svg"
import style from "../styles/navbar.module.css"

export default function Navbar() {
	return (
		<nav className={style.navbar}>
			<img src={logo} alt="Logo" className={style.navbarLogo}/>

			<div className={style.navbarLinks}>
				<ul>
					<li>Home</li>
					<li>Serviços</li>
					<li>Sobre nós</li>
					<li>Contato</li>
				</ul>
			</div>

			<div className={style.navbarActions}>
				<BotaoSecundario children="Entrar" />
				<BotaoPrincipal children="Cadastre-se" />
			</div>
		</nav>
	);
}
