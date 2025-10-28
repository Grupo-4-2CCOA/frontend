import NavbarLogado from "../common/components/NavbarLogado";
import SellsPanel from "../common/components/SellsPanel";
import SellsFilters from "../common/components/SellsFilters"

export default function SellsDashboard() {
    return (
        <>
            <NavbarLogado isAdmin={true} />
            <SellsFilters />
            <SellsPanel />
        </>
    );
}
