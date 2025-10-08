import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import CadastroPage from "../pages/cadastro"; 
import LoginPage from "../pages/login";
import AgendarCliente from "../pages/agendamentoCliente";
import AuthLoading from "../pages/AuthLogin";
import AdicionarInformacoes from "../pages/AdicionarInformacoes";
import Unauthorized from "../pages/Unauthorized";
import SystemDashboard from "../pages/SystemDashboard";
import CadastroServico from "../pages/CadastroServico";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/auth-loading" element={<AuthLoading />} />
            <Route path="/cadastro" element={<CadastroPage/>}></Route>
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/agendamento" element={<AgendarCliente/>}></Route>
            <Route path="/informacoes" element={<AdicionarInformacoes/>}></Route>
            <Route path="/unauthorized" element={<Unauthorized/>}></Route>
            <Route path="/system-dashboard" element={<SystemDashboard/>}></Route>
            <Route path="/cadastro-servico" element={<CadastroServico/>}></Route>
        </Routes>
    )
}