import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import CadastroPage from "../pages/cadastro"; 
import LoginPage from "../pages/login";
import AgendarCliente from "../pages/agendamentoCliente";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/cadastro" element={<CadastroPage/>}></Route>
            <Route path="/login" element={<LoginPage/>}></Route>
            <Route path="/agendamentoCliente" element={<AgendarCliente/>}></Route>
        </Routes>
    )
}