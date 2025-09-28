import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/Login";
import AgendarCliente from "../pages/agendamentoCliente";
import AgendarFuncionario from "../pages/agendamentoFuncionario";
import AuthLoading from "../pages/AuthLogin";
import AdicionarInformacoes from "../pages/AdicionarInformacoes";
import Unauthorized from "../pages/Unauthorized";
import SystemDashboard from "../pages/SystemDashboard";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/auth-loading" element={<AuthLoading />} />
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/agendamento" element={<AgendarCliente/>}></Route>
            <Route path="/agendamentoFunc" element={<AgendarFuncionario/>}></Route>
            <Route path="/informacoes" element={<AdicionarInformacoes/>}></Route>
            <Route path="/unauthorized" element={<Unauthorized/>}></Route>
            <Route path="/system-dashboard" element={<SystemDashboard/>}></Route>
        </Routes>
    )
}