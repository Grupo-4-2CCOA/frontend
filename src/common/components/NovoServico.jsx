import React, { useState, useEffect } from "react";
import Styles from "../styles/NovoServico.module.css";
import BotaoPrincipal from "./BotaoPrincipal";
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function NovoServicoPopup({ onCancel, onConfirm, titulo, servicoParaEditar }) {
	const BUCKET_URL = 'https://beauty-barreto-source.s3.us-east-1.amazonaws.com'; // added
    const { userInfo } = useAuth();
    const [imagem, setImagem] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null); 
	const [existingImageUrl, setExistingImageUrl] = useState(null);
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
        if (servicoParaEditar) {
            setNome(servicoParaEditar.name || "");
            setDescricao(servicoParaEditar.description || "");
            setPreco(servicoParaEditar.basePrice ? String(servicoParaEditar.basePrice) : "");
            setDuracao(servicoParaEditar.baseDuration ? String(servicoParaEditar.baseDuration) : "");
            setCategoriaId(servicoParaEditar.category?.id ? String(servicoParaEditar.category.id) : "");
            setImagem(null); // Não pré-carrega imagem
			setPreviewUrl(null);

			const imgName = servicoParaEditar.image || servicoParaEditar.photo || servicoParaEditar.imageName;
            if (imgName) {
                setExistingImageUrl(`${BUCKET_URL}/${encodeURIComponent(imgName)}`);
            } else {
                setExistingImageUrl(null);
            }
        } else {
            setNome("");
            setDescricao("");
            setPreco("");
            setDuracao("");
            setCategoriaId("");
            setImagem(null);
            setPreviewUrl(null);
            setExistingImageUrl(null);
        }
    }, [servicoParaEditar]);

	useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

	const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (file) {
            setImagem(file);
            setPreviewUrl(URL.createObjectURL(file));
            // keep existingImageUrl for reference, preview will show new file
        } else {
            setImagem(null);
        }
    };

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

            // Se usuário escolheu novo arquivo, usa-o
            if (imagem) {
                formData.append('image', imagem);
            } else if (servicoParaEditar) {
                // Se for edição e não houve novo arquivo, traz a imagem existente do bucket
                const imgName = servicoParaEditar.image || servicoParaEditar.photo || servicoParaEditar.imageName;
                if (imgName) {
                    try {
                        const url = `${BUCKET_URL}/${encodeURIComponent(imgName)}`;
                        const resp = await fetch(url);
                        if (resp.ok) {
                            const blob = await resp.blob();
                            // cria um File a partir do blob (backend recebe como arquivo)
                            const file = new File([blob], decodeURIComponent(imgName), { type: blob.type });
                            formData.append('image', file);
                        } else {
                            console.warn('Não foi possível baixar imagem existente:', resp.status, url);
                        }
                    } catch (fetchErr) {
                        console.error('Erro ao baixar imagem existente:', fetchErr);
                    }
                }
            }

            if (servicoParaEditar && servicoParaEditar.id) {
                // Editar serviço existente
                await api.put(`/servicos/${servicoParaEditar.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Serviço editado com sucesso!');
            } else {
                // Criar novo serviço
                await api.post('/servicos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Serviço cadastrado com sucesso!');
            }

            onConfirm();

        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            const errorMessage = error.response?.data || 'Erro ao salvar serviço';
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
                            onChange={handleFileChange}
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