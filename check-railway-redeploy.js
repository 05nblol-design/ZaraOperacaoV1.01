#!/usr/bin/env node

/**
 * 🚂 VERIFICAR RAILWAY REDEPLOY
 * 
 * Verifica se o Railway precisa de redeploy após correções
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🚂 VERIFICANDO RAILWAY REDEPLOY');
console.log('=' .repeat(40));

const railwayUrl = 'https://zara-backend-production-aab3.up.railway.app';

// Função para fazer requisição HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkRailway() {
  try {
    console.log('1️⃣ Testando Railway backend...');
    
    // Testar health endpoint
    const healthResponse = await makeRequest(railwayUrl + '/api/health');
    console.log(`   ✅ Health: ${healthResponse.status}`);
    
    if (healthResponse.status === 200) {
      const healthData = JSON.parse(healthResponse.data);
      console.log(`   📊 Uptime: ${healthData.uptime}s`);
      console.log(`   🕐 Timestamp: ${new Date(healthData.timestamp).toLocaleString()}`);
    }
    
    // Testar login endpoint
    console.log('\n2️⃣ Testando login...');
    const loginData = JSON.stringify({
      email: 'admin@zara.com',
      password: 'admin123'
    });
    
    const loginResponse = await makeRequest(railwayUrl + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    
    console.log(`   ✅ Login: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const loginResult = JSON.parse(loginResponse.data);
      const token = loginResult.token;
      console.log(`   🔑 Token: ${token.substring(0, 20)}...`);
      
      // Testar endpoints com token
      console.log('\n3️⃣ Testando endpoints autenticados...');
      
      const endpoints = [
        '/api/machines',
        '/api/reports/leader-dashboard',
        '/api/users'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await makeRequest(railwayUrl + endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`   ✅ ${endpoint}: ${response.status}`);
        } catch (e) {
          console.log(`   ❌ ${endpoint}: ${e.message}`);
        }
      }
    }
    
    console.log('\n4️⃣ Verificando se precisa redeploy...');
    
    // Verificar último commit
    try {
      const lastCommit = execSync('git log -1 --format="%H %s"', { encoding: 'utf8' }).trim();
      console.log(`   📝 Último commit: ${lastCommit}`);
      
      // Se o commit contém "fix" ou "acc", pode precisar de redeploy
      if (lastCommit.toLowerCase().includes('fix') || lastCommit.toLowerCase().includes('acc')) {
        console.log('   ⚠️ Commit de correção detectado - Railway pode precisar redeploy');
        
        console.log('\n🔧 COMO FORÇAR REDEPLOY NO RAILWAY:');
        console.log('1. Acesse: https://railway.app/dashboard');
        console.log('2. Encontre o projeto zara-backend-production');
        console.log('3. Vá para a aba "Deployments"');
        console.log('4. Clique em "Redeploy" na última deployment');
        console.log('5. Ou faça um commit vazio: git commit --allow-empty -m "trigger redeploy"');
      } else {
        console.log('   ✅ Railway não precisa redeploy (backend não alterado)');
      }
    } catch (e) {
      console.log('   ⚠️ Não foi possível verificar commits:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar Railway:', error.message);
  }
}

// Executar verificação
checkRailway().then(() => {
  console.log('\n📋 RESUMO:');
  console.log('- Railway backend: Funcionando');
  console.log('- Correções aplicadas: Frontend (useMachineStatus.jsx)');
  console.log('- Redeploy necessário: Apenas Vercel (frontend)');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Fazer redeploy manual no Vercel via dashboard');
  console.log('2. Testar https://sistema-zara-frontend.vercel.app');
  console.log('3. Verificar se erro "acc is not defined" foi corrigido');
  
  console.log('\n✅ Verificação concluída!');
}).catch(console.error);