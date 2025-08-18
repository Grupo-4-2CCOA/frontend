import { Routes, Route  } from "react-router";
import Home from "../pages/Home";
import CadastroPage from "../pages/cadastro"; 

export default function AppRoutes(){
	return(
		<Routes>
			<Route path="/" element={<Home/>}></Route>
			<Route path="/cadastro" element={<CadastroPage/>}></Route> 
		</Routes>
	)
}