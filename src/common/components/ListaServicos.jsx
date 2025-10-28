import CardServico from "./CardServico";
import Styles from "../styles/ListaServicos.module.css";

const servicos = [
    {
        descricao: "Unhas bem cuidadas são um toque de delicadeza que transforma.",
        imagem: "",
    },
    {
        descricao: "Cuidar dos cabelos é mais do que estética: é sobre autoestima, expressão e bem-estar.",
        imagem: "",
    },
    {
        descricao: "Pele lisinha, toque suave e bem-estar em cada detalhe. Nossa depilação vai além da estética: é um cuidado com você.",
        imagem: "",
    },
];

export default function ListaServicos({ onEditar }) {
    return (
        <div className={Styles.listaContainer}>
            {servicos.map((servico, idx) => (
                <CardServico
                    key={idx}
                    imagem={servico.imagem}
                    descricao={servico.descricao}
                    onEditar={() => onEditar(idx)}
                />
            ))}
        </div>
    );
}