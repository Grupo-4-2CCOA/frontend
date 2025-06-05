import React from "react";
import styles from "../styles/secao-contato.module.css";
import { BotaoPrincipal } from "./BotaoPrincipal";

export default function SecaoContato() {
	return (
		<section className={styles["contato"]}>
			<h1 className={styles["titulo"]}>Contato</h1>

			<div className={styles["area-conteudo"]}>
				<div className={styles["imagem"]}>
					<div className={styles["placeholder"]}>
						<span className={styles["x"]}>X</span>
					</div>
				</div>
				<div className={styles["texto"]}>
					<div className={styles["caixa-texto"]} />
				</div>
			</div>

			<div className={styles["desconto"]}>
				<h2>
					O que acha de um desconto no seu <br />
					primeiro agendamento?
				</h2>
				<p>
					Preencha algumas informações e ganhe 15% de desconto para
					qualquer serviço!
				</p>

				<form className={styles["formulario"]}>
					<input type="email" placeholder="Email" />
					<input type="tel" placeholder="Telefone" />
					<BotaoPrincipal children="Enviar" />
				</form>
			</div>
		</section>
	);
}
