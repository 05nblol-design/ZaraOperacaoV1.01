
// SCRIPT DE CORREÇÃO PARA O FRONTEND VERCEL
// Execute este código no console do navegador em https://sistema-zara-frontend.vercel.app

console.log('🔧 Aplicando correção de URLs...');

// 1. Limpar localStorage antigo
localStorage.clear();
console.log('✅ LocalStorage limpo');

// 2. Definir URLs corretas
window.RAILWAY_API_URL = 'https://zara-backend-production-aab3.up.railway.app/api';
window.RAILWAY_SOCKET_URL = 'https://zara-backend-production-aab3.up.railway.app';
console.log('✅ URLs definidas:', {
  api: window.RAILWAY_API_URL,
  socket: window.RAILWAY_SOCKET_URL
});

// 3. Forçar reload da página
console.log('🔄 Recarregando página...');
window.location.reload();
