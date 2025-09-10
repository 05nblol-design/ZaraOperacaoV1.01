#!/usr/bin/env node

// Script de correção automática do Railway
const https = require('https');

const CORRECT_RAILWAY_URL = 'https://zara-backend-production-aab3.up.railway.app';

function testCorrectURL() {
  console.log('🔍 Testando URL correta do Railway...');
  
  https.get(CORRECT_RAILWAY_URL + '/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('🎉 Railway está funcionando na URL correta!');
        console.log('📝 Atualize as configurações para usar:');
        console.log('   ' + CORRECT_RAILWAY_URL);
      } else {
        console.log('❌ Railway ainda não está funcionando');
      }
    });
  }).on('error', (err) => {
    console.log('❌ Erro:', err.message);
  });
}

testCorrectURL();
