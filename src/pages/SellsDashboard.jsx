import NavbarLogado from "../common/components/NavbarLogado";
import SellsPanel from "../common/components/SellsPanel";
import SystemFilters from "../common/components/SystemFilters"

export default function SystemDashboard() {
    return (
        <>
            <NavbarLogado isAdmin={true} />
            <SystemFilters />
            <SellsPanel />
        </>
    );
}
