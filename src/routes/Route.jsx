import { Routes, Route  } from "react-router";
import LandingPage from "../pages/LandingPage"

export default function AppRoutes(){
	return(
		<Routes>
			<Route path="/" element={<LandingPage/>}></Route>
		</Routes>
	)
}