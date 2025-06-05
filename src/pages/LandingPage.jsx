import Footer from "../common/components/Footer";
import Navbar from "../common/components/Navbar";
import SecaoContato from "../common/components/SecaoContato";
import SecaoInicial from "../common/components/SecaoInicial";
import SecaoServicos from "../common/components/SecaoServicos";

export default function Home() {
	return (
		<>
			<Navbar />
			<SecaoInicial />
			<SecaoServicos />
			<SecaoContato />
			<Footer />
		</>
	);
}
