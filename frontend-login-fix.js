
// SCRIPT DE CORREÇÃO PARA O FRONTEND VERCEL
// Execute este código no console do navegador em: https://sistema-zara-frontend.vercel.app

console.log('🔧 Aplicando correção de autenticação...');

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Configurar token válido
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU3NDczMDA4LCJleHAiOjE3NTgwNzc4MDh9.tC3LrjrpIPhXcXpXCK40nVwMtckAXMS7S5Y-HYdlO24';
const userData = {
  id: 1,
  name: 'Admin',
  email: 'admin@zara.com',
  role: 'ADMIN',
  isActive: true
};

// 3. Salvar no localStorage
localStorage.setItem('token', validToken);
localStorage.setItem('user', JSON.stringify(userData));

// 4. Verificar se foi salvo
console.log('Token salvo:', localStorage.getItem('token') ? '✅' : '❌');
console.log('Usuário salvo:', localStorage.getItem('user') ? '✅' : '❌');

// 5. Recarregar página
console.log('🔄 Recarregando página...');
window.location.reload();
