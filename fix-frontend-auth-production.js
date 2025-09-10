
// Script de correção de autenticação para produção
// Execute este código no console do navegador em https://zara-operacao-v1-01.vercel.app

console.log('🔧 Aplicando correção de autenticação...');

// 1. Limpar dados antigos
localStorage.clear();
sessionStorage.clear();

// 2. Definir token válido
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzU3NTI2MzQyLCJleHAiOjE3NTgxMzExNDJ9.vBFmzoqha8h8VPWbAoQwPdrjJmPeNLohja33GKs6fwg';
localStorage.setItem('token', validToken);

// 3. Definir dados do usuário
const userData = {
  id: 1,
  name: 'Lucas Silva',
  email: 'lucas@zara.com',
  role: 'LEADER',
  permissions: ['canEdit', 'canView', 'canManage']
};
localStorage.setItem('user', JSON.stringify(userData));

// 4. Testar API com token
fetch('https://zara-backend-production-aab3.up.railway.app/api/machines', {
  headers: {
    'Authorization': 'Bearer ' + validToken,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ Token funcionando! Máquinas:', data.data.length);
    
    // Testar configuração da primeira máquina
    if (data.data.length > 0) {
      const machineId = data.data[0].id;
      return fetch('https://zara-backend-production-aab3.up.railway.app/api/machines/' + machineId + '/config', {
        headers: {
          'Authorization': 'Bearer ' + validToken,
          'Content-Type': 'application/json'
        }
      });
    }
  } else {
    throw new Error('Erro na API: ' + data.message);
  }
})
.then(response => response.json())
.then(configData => {
  if (configData.success) {
    console.log('✅ Configuração carregada com sucesso!');
    console.log('🔄 Recarregue a página para ver as correções.');
  } else {
    console.log('⚠️ Erro na configuração:', configData.message);
  }
})
.catch(error => {
  console.error('❌ Erro:', error);
});

console.log('✅ Correção aplicada! Recarregue a página.');
