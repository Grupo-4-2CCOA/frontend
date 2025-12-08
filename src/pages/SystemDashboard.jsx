import { useState } from "react";
import NavbarLogado from "../common/components/NavbarLogado";
import SystemPanel from "../common/components/SystemPanel";
import SystemFilters from "../common/components/SystemFilters"

export default function SystemDashboard() {
    const [dataInicio, setDataInicio] = useState(`${new Date().getFullYear()}-01-01`);
    const [dataFim, setDataFim] = useState(`${new Date().getFullYear()}-12-31`);

    return (
        <>
            <NavbarLogado isAdmin={true} />
            <SystemFilters dataInicio={dataInicio} setDataInicio={setDataInicio} dataFim={dataFim} setDataFim={setDataFim} />
            <SystemPanel dataInicio={dataInicio} dataFim={dataFim} />
        </>
    );
}
