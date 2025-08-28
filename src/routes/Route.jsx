import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import CadastroPage from "../pages/cadastro"; 
import LoginPage from "../pages/login";
import AgendarCliente from "../pages/agendamentoCliente";
import AuthLoading from "../pages/AuthLogin";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/auth-loading" element={<AuthLoading />} />
            <Route path="/cadastro" element={<CadastroPage/>}></Route>
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/agendamento" element={<AgendarCliente/>}></Route>
        </Routes>
    )
}