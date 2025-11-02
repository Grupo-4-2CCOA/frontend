import React, { useState, useEffect } from "react";
import Styles from "../styles/NovoServico.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function NovoServicoPopup({ onCancel, onConfirm, titulo }) {
    const { userInfo } = useAuth();
    const [imagem, setImagem] = useState(null);
    const [descricao, setDescricao] = useState("");
    const [preco, setPreco] = useState("");
    const [duracao, setDuracao] = useState("");
    const [nome, setNome] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [categoriaId, setCategoriaId] = useState("");
    const [loading, setLoading] = useState(false);
    const [precoDesconto, setPrecoDesconto] = useState("");
    const [descontoHabilitado, setDescontoHabilitado] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get('/categorias');
                setCategorias(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
                alert('Erro ao carregar categorias');
            }
        };

        fetchCategorias();
    }, []);

    const handleSubmit = async () => {
        if (!nome || !preco || !duracao || !categoriaId) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);

            const serviceData = {
                name: nome,
                basePrice: parseFloat(preco),
                baseDuration: parseInt(duracao),
                description: descricao || null,
                category: parseInt(categoriaId)
            };

            const formData = new FormData();
            formData.append('service', new Blob([JSON.stringify(serviceData)], { 
                type: 'application/json' 
            }));

            if (imagem) {
                formData.append('image', imagem);
            }

            await api.post('/servicos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            alert('Serviço cadastrado com sucesso!');
            onConfirm();

        } catch (error) {
            console.error('Erro ao cadastrar serviço:', error);
            const errorMessage = error.response?.data || 'Erro ao cadastrar serviço';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={Styles.popupOverlay}>
            <div className={Styles.popupContainer}>
                <h2>{titulo}</h2>
                <div className={Styles.popupForm}>
                    <label>
                        Nome:
                        <input
                            type="text"
                            placeholder="Nome do serviço"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Categoria:
                        <select 
                            value={categoriaId} 
                            onChange={e => setCategoriaId(e.target.value)}
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Imagem:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setImagem(e.target.files[0])}
                        />
                    </label>
                    <label>
                        Descrição:
                        <textarea
                            placeholder="Descrição do serviço"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                    </label>
                    <label>
                        Preço Base:
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Preço"
                            value={preco}
                            onChange={e => setPreco(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Duração (minutos):
                        <input
                            type="number"
                            placeholder="Duração em minutos"
                            value={duracao}
                            onChange={e => setDuracao(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div className={Styles.popupActions}>
                    <BotaoPrincipal 
                        onClick={onCancel} 
                        disabled={loading}
                    >
                        Cancelar
                    </BotaoPrincipal>
                    <BotaoPrincipal
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Confirmar'}
                    </BotaoPrincipal>
                </div>
            </div>
        </div>
    );
}