import React from 'react';

export default function Unauthorized() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Acesso não autorizado</h2>
      <p>Você não tem permissão para acessar esta página.</p>
      <a href="/login">Ir para o login</a>
    </div>
  );
}


