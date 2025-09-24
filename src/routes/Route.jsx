import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import LoginPage from "../pages/Login";
import AgendarCliente from "../pages/agendamentoCliente";
import AuthLoading from "../pages/AuthLogin";
import AdicionarInformacoes from "../pages/AdicionarInformacoes";
import Unauthorized from "../pages/Unauthorized";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/auth-loading" element={<AuthLoading />} />
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/agendamento" element={<AgendarCliente/>}></Route>
            <Route path="/informacoes" element={<AdicionarInformacoes/>}></Route>
            <Route path="/unauthorized" element={<Unauthorized/>}></Route>
        </Routes>
    )
}