import React, { useState } from "react";
import Styles from "../styles/NovoServico.module.css";
import BotaoPrincipal from "./BotaoPrincipal";

export default function NovoServicoPopup({ onCancel, onConfirm, titulo }) {
    const [imagem, setImagem] = useState("");
    const [descricao, setDescricao] = useState("");
    const [preco, setPreco] = useState("");
    const [precoDesconto, setPrecoDesconto] = useState("");
    const [descontoHabilitado, setDescontoHabilitado] = useState(false);

    return (
        <div className={Styles.popupOverlay}>
            <div className={Styles.popupContainer}>
                <h2>{titulo}</h2>
                <div className={Styles.popupForm}>
                    <label>
                        Imagem:
                        <input
                            type="text"
                            placeholder="Link da imagem"
                            value={imagem}
                            onChange={e => setImagem(e.target.value)}
                        />
                    </label>
                    <label>
                        Descrição:
                        <input
                            type="text"
                            placeholder="Descrição do serviço"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                    </label>
                    <label>
                        Preço:
                        <input
                            type="number"
                            placeholder="Preço"
                            value={preco}
                            onChange={e => setPreco(e.target.value)}
                        />
                    </label>
                    <label>
                        Preço com desconto:
                        <input
                            type="number"
                            placeholder="Preço com desconto"
                            value={precoDesconto}
                            onChange={e => setPrecoDesconto(e.target.value)}
                            disabled={!descontoHabilitado}
                        />
                    </label>
                    <div className={Styles.descontoRow}>
                        <span>Serviço com desconto:</span>
                        <button
                            type="button"
                            className={`${Styles["habilitarBtn"]} ${descontoHabilitado ? Styles.active : ""}`}
                            onClick={() => setDescontoHabilitado(true)}
                        >
                            Habilitar
                        </button>
                        <button
                            type="button"
                            className={`${Styles["desabilitarBtn"]} ${!descontoHabilitado ? Styles.active : ""}`}
                            onClick={() => setDescontoHabilitado(false)}
                        >
                            Desabilitar
                        </button>
                    </div>
                </div>
                <div className={Styles.popupActions}>
                    <BotaoPrincipal className={Styles.cancelarBtn} onClick={onCancel}>Cancelar</BotaoPrincipal>
                    <BotaoPrincipal
                        className={Styles.confirmarBtn}
                        onClick={() => onConfirm({ imagem, descricao, preco, precoDesconto, descontoHabilitado })}
                    >
                        Confirmar
                    </BotaoPrincipal>
                </div>
            </div>
        </div>
    );
}