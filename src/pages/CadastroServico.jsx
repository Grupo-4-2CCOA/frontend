import { useState } from "react";
import NavbarLogado from "../common/components/NavbarLogado";
import NovoServicoPopup from "../common/components/NovoServico";
import SecaoServicosCadastro from "../common/components/SecaoServicosCadastro";
import BotaoPrincipal from "../common/components/BotaoPrincipal";

export default function CadastroServico() {
    const [showPopup, setShowPopup] = useState(false);
    const [popupMode, setPopupMode] = useState("novo"); // "novo" ou "editar"

    const handleEditar = (idx) => {
        setPopupMode("editar");
        setShowPopup(true);
    };

    const handleNovoServico = () => {
        setPopupMode("novo");
        setShowPopup(true);
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    const handleConfirm = (dados) => {
        alert("Serviço cadastrado:\n" + JSON.stringify(dados, null, 2));
        setShowPopup(false);
    };

    return (
        <>
            <NavbarLogado />
            <div style={{ margin: "20px 10px 3px 75px" }}>
                <BotaoPrincipal
                    onClick={handleNovoServico}
                >
                    Novo serviço
                </BotaoPrincipal>
            </div>
            <SecaoServicosCadastro onEditar={handleEditar} />
            {showPopup && (
                <NovoServicoPopup
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    titulo={popupMode === "novo" ? "Novo Serviço" : "Editar Serviço"}
                />
            )}
        </>
    );
}