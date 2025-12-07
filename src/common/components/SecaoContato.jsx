import React from "react";
import styles from "../styles/secao-contato.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function SecaoContato() {
	return (
		<section className={styles["contato"]}>
			<h1 className={styles["titulo"]}>Contato</h1>

			<div className={styles["area-conteudo"]}>
				<div className={styles["imagem"]}>
					<div className={styles["placeholder"]}>
						<img src="/favicon.png" alt="Logo da Beauty Barreto" />
					</div>
				</div>
				<div className={styles["texto"]}>
					<div className={styles["caixa-texto"]}>
						<div className={styles["contato-item"]}>
							<FaEnvelope className={styles["contato-item-icon"]} />
							<span className={styles["contato-item-label"]}>Email:</span>
							<span>beauty-barreto@gmail.com</span>
						</div>
						<div className={styles["contato-item"]}>
							<FaPhone className={styles["contato-item-icon"]} />
							<span className={styles["contato-item-label"]}>Telefone:</span>
							<span>(11) 97146-5871</span>
						</div>
						<div className={styles["contato-item"]}>
							<FaMapMarkerAlt className={styles["contato-item-icon"]} />
							<span className={styles["contato-item-label"]}>Endereço:</span>
							<span>Rua Oswald Sad, 216 - Taboão da Serra, SP</span>
						</div>
					</div>
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
