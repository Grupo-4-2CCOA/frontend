import { useState } from "react";
import NavbarLogado from "../common/components/NavbarLogado";
import SellsPanel from "../common/components/SellsPanel";
import SellsFilters from "../common/components/SellsFilters"

export default function SellsDashboard() {
    const [dataInicio, setDataInicio] = useState(`${new Date().getFullYear()}-01-01`);
    const [dataFim, setDataFim] = useState(`${new Date().getFullYear()}-12-31`);

    return (
        <>
            <NavbarLogado isAdmin={true} />
            <SellsFilters dataInicio={dataInicio} setDataInicio={setDataInicio} dataFim={dataFim} setDataFim={setDataFim} />
            <SellsPanel dataInicio={dataInicio} dataFim={dataFim} />
        </>
    );
}
