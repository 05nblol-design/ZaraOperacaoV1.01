const axios = require('axios');

// URLs dos deployments
const VERCEL_URL = 'https://sistema-zara-frontend-lvkva1b9y-05nblol-designs-projects.vercel.app';
const RAILWAY_URL = 'https://zaraoperacaov101-production.up.railway.app';

async function testDeployments() {
    console.log('🚀 Testando deployments...');
    
    // Teste Vercel Frontend
    try {
        console.log('\n📱 Testando Vercel Frontend...');
        const vercelResponse = await axios.get(VERCEL_URL, { timeout: 10000 });
        console.log('✅ Vercel Frontend: OK (Status:', vercelResponse.status, ')');
    } catch (error) {
        console.log('❌ Vercel Frontend: ERRO -', error.message);
    }
    
    // Teste Railway Backend Health
    try {
        console.log('\n🔧 Testando Railway Backend Health...');
        const healthResponse = await axios.get(`${RAILWAY_URL}/api/health`, { timeout: 10000 });
        console.log('✅ Railway Health: OK (Status:', healthResponse.status, ')');
        console.log('📊 Health Data:', healthResponse.data);
    } catch (error) {
        console.log('❌ Railway Health: ERRO -', error.message);
    }
    
    // Teste Railway Backend Login
    try {
        console.log('\n🔐 Testando Railway Backend Login...');
        const loginResponse = await axios.post(`${RAILWAY_URL}/api/auth/login`, {
            email: 'admin@zara.com',
            password: 'admin123'
        }, { timeout: 10000 });
        console.log('✅ Railway Login: OK (Status:', loginResponse.status, ')');
        console.log('🎫 Token recebido:', loginResponse.data.token ? 'SIM' : 'NÃO');
    } catch (error) {
        console.log('❌ Railway Login: ERRO -', error.message);
        if (error.response) {
            console.log('📄 Status:', error.response.status);
            console.log('📄 Data:', error.response.data);
        }
    }
    
    console.log('\n🏁 Teste de deployments concluído!');
}

testDeployments().catch(console.error);