import { Routes, Route  } from "react-router";
import LandingPage from "../pages/LandingPage";
import CadastroPage from "../pages/cadastro"; 

export default function AppRoutes(){
	return(
		<Routes>
			<Route path="/" element={<LandingPage/>}></Route>
			<Route path="/cadastro" element={<CadastroPage/>}></Route> 
		</Routes>
	)
}