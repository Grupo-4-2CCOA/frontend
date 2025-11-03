import { useState } from "react";
import NavbarLogado from "../common/components/NavbarLogado";
import NovoServicoPopup from "../common/components/NovoServico";
import SecaoServicosCadastro from "../common/components/SecaoServicosCadastro";
import BotaoPrincipal from "../common/components/BotaoPrincipal";

export default function CadastroServico() {
    const [showPopup, setShowPopup] = useState(false);
    const [popupMode, setPopupMode] = useState("novo"); // "novo" ou "editar"
    const [servicoParaEditar, setServicoParaEditar] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEditar = (servico) => {
        setPopupMode("editar");
        setServicoParaEditar(servico);
        setShowPopup(true);
    };

    const handleNovoServico = () => {
        setPopupMode("novo");
        setServicoParaEditar(null);
        setShowPopup(true);
    };

    const handleCancel = () => {
        setShowPopup(false);
        setServicoParaEditar(null);
    };

    const handleConfirm = () => {
        setShowPopup(false);
        setServicoParaEditar(null);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <NavbarLogado isAdmin={true}/>
            <div style={{ margin: "20px 10px 3px 75px" }}>
                <BotaoPrincipal
                    onClick={handleNovoServico}
                >
                    Novo serviço
                </BotaoPrincipal>
            </div>
            <SecaoServicosCadastro onEditar={handleEditar} refreshKey={refreshKey} />
            {showPopup && (
                <NovoServicoPopup 
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    titulo={popupMode === "editar" ? "Editar serviço" : "Novo Serviço"}
                    servicoParaEditar={servicoParaEditar}
                />
            )}
        </>
    );
}