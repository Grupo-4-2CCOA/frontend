import style from "../styles/botao.module.css"

export default function BotaoSecundario(props){
	return(
		<button className={style.botaoSecundario}>{props.children}</button>
	)
}