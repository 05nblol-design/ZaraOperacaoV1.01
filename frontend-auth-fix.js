
// ========================================
// SCRIPT DE CORREÇÃO - AUTENTICAÇÃO FRONTEND
// ========================================

// 1. Limpar dados antigos
console.log('🧹 Limpando dados antigos...');
localStorage.clear();
sessionStorage.clear();

// 2. Configurar token válido
console.log('🔑 Configurando autenticação...');
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU3NDY2ODUxLCJleHAiOjE3NTgwNzE2NTF9.Np45pqt147s55phQ54qIBBNkAOAWlTKuSt72H40QGJY';
const userData = {
  "id": 2,
  "email": "admin@zara.com",
  "name": "Administrador",
  "role": "ADMIN",
  "isActive": true
};

// 3. Salvar no localStorage
localStorage.setItem('token', validToken);
localStorage.setItem('user', JSON.stringify(userData));

// 4. Verificar se foi salvo corretamente
const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');

if (savedToken && savedUser) {
  console.log('✅ Autenticação configurada com sucesso!');
  console.log('👤 Usuário:', JSON.parse(savedUser).name);
  console.log('🔑 Token salvo:', savedToken.substring(0, 30) + '...');
  
  // 5. Recarregar página para aplicar mudanças
  console.log('🔄 Recarregando página em 2 segundos...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
  
} else {
  console.error('❌ Erro ao salvar dados de autenticação!');
}

// ========================================
