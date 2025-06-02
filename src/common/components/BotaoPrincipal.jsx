import style from "../styles/botao.module.css"

export function BotaoPrincipal(props){
	return (
		<button className={style.botaoPrincipal}>{props.children}</button>
	)
}