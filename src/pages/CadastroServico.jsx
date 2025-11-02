import { useState } from "react";
import NavbarLogado from "../common/components/NavbarLogado";
import NovoServicoPopup from "../common/components/NovoServico";
import SecaoServicosCadastro from "../common/components/SecaoServicosCadastro";
import BotaoPrincipal from "../common/components/BotaoPrincipal";

export default function CadastroServico() {
    const [showPopup, setShowPopup] = useState(false);
    const [popupMode, setPopupMode] = useState("novo"); // "novo" ou "editar"
	const [refreshKey, setRefreshKey] = useState(0);

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

	const handleConfirm = () => {
        setShowPopup(false);
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
					titulo="Novo Serviço"
				/>
            )}
        </>
    );
}