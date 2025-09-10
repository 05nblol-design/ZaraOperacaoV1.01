
// SCRIPT DE CORREÇÃO DE AUTENTICAÇÃO
// Execute este código no console do navegador em https://sistema-zara-frontend.vercel.app

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Definir novo token e dados do usuário
const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU3NDcyNDgwLCJleHAiOjE3NTgwNzcyODB9.Zv0IAEomd24gYc1Bhx6e9DxQy9K_Cy42yWe_uuD4ZNY';
const userData = {
  "id": 2,
  "email": "admin@zara.com",
  "name": "Administrador",
  "role": "ADMIN",
  "isActive": true
};

// 3. Salvar no localStorage
localStorage.setItem('token', newToken);
localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('isAuthenticated', 'true');

// 4. Recarregar a página
console.log('✅ Token atualizado! Recarregando página...');
window.location.reload();
