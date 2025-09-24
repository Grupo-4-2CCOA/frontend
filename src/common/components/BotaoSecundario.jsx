import style from "../styles/botao.module.css"

export default function BotaoSecundario(props) {
	return (
		<button
			onClick={props.onClick}
			className={style.botaoSecundario}
		>
			{props.children}
		</button>
	)
}