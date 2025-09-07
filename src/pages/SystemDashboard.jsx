import NavbarLogado from "../common/components/NavbarLogado";
import SystemPanel from "../common/components/SystemPanel";
import SystemFilters from "../common/components/SystemFilters"

export default function SystemDashboard() {
    return (
        <>
            <NavbarLogado isAdmin={true} />
            <SystemFilters />
            <SystemPanel />
        </>
    );
}
