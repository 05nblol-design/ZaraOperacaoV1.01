// Usar fetch nativo do Node.js

// URL da API de produção no Railway
const API_URL = 'https://zaraoperacaov101-production.up.railway.app';

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuário admin no banco de produção...');
    
    // Tentar diferentes combinações de credenciais
    const credentials = [
      { email: 'admin@zara.com', password: 'admin123' },
      { email: 'admin@zara.com', password: '123456' },
      { email: 'lucas@zara.com', password: '123456' },
      { email: 'demo@zara.com', password: '123456' }
    ];
    
    for (const cred of credentials) {
      console.log(`\n🔐 Testando: ${cred.email} / ${cred.password}`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cred)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login bem-sucedido!');
        console.log('👤 Usuário:', data.user.name);
        console.log('📧 Email:', data.user.email);
        console.log('🎭 Role:', data.user.role);
        console.log('🔑 Token:', data.token.substring(0, 20) + '...');
        
        // Testar se pode criar máquinas
        console.log('\n🏭 Testando criação de máquina...');
        const machineResponse = await fetch(`${API_URL}/api/machines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({
            code: 'TEST-001',
            name: 'Máquina Teste',
            type: 'COSTURA',
            location: 'Setor A',
            status: 'OPERACIONAL'
          })
        });
        
        const machineData = await machineResponse.json();
        
        if (machineData.success) {
          console.log('✅ Pode criar máquinas!');
          
          // Deletar a máquina de teste
          await fetch(`${API_URL}/api/machines/${machineData.machine.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          console.log('🗑️ Máquina de teste removida');
          
        } else {
          console.log('❌ Não pode criar máquinas:', machineData.message);
        }
        
        return { credentials: cred, token: data.token, user: data.user };
      } else {
        console.log('❌ Falha no login:', data.message);
      }
    }
    
    console.log('\n❌ Nenhuma credencial funcionou!');
    return null;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

checkAdminUser().then(result => {
  if (result) {
    console.log('\n✅ Credenciais válidas encontradas:');
    console.log('📧 Email:', result.credentials.email);
    console.log('🔑 Senha:', result.credentials.password);
    console.log('🎭 Role:', result.user.role);
  } else {
    console.log('\n❌ Não foi possível encontrar credenciais válidas');
  }
});