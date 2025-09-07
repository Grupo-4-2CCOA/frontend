import style from "../styles/botao.module.css"

export default function BotaoPrincipal(props) {
	return (
		<button
			onClick={props.onClick}
			className={style.botaoPrincipal}
		>
			{props.children}
		</button>
	)
}