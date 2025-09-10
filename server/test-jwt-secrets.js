const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRETS = [
  'cFiffgr8I7Z40pqjpXZMDLJzaKjKOVnR',
  '90d8592d5567af28fffdbb0c23638593e5408abd'
];

const USER_ID = 2; // ID do usuário admin

async function testJWTSecrets() {
  console.log('🔍 Testando diferentes JWT_SECRET values...');
  
  for (let i = 0; i < JWT_SECRETS.length; i++) {
    const secret = JWT_SECRETS[i];
    console.log(`\n🧪 Testando JWT_SECRET ${i + 1}: ${secret.substring(0, 10)}...`);
    
    try {
      // Gerar token com este secret
      const token = jwt.sign(
        { id: USER_ID },
        secret,
        { expiresIn: '7d' }
      );
      
      console.log('✅ Token gerado:', token.substring(0, 50) + '...');
      
      // Testar endpoint
      const response = await axios.get(
        'https://zara-backend-production-aab3.up.railway.app/api/reports/machine-performance',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('🎉 SUCESSO! Este é o JWT_SECRET correto!');
      console.log('📊 Status:', response.status);
      console.log('📝 Dados:', JSON.stringify(response.data, null, 2));
      
      return secret;
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Erro:', error.response.status, error.response.statusText);
        console.log('📝 Resposta:', error.response.data);
      } else {
        console.log('❌ Erro de rede:', error.message);
      }
    }
  }
  
  console.log('\n❌ Nenhum JWT_SECRET funcionou!');
}

testJWTSecrets();