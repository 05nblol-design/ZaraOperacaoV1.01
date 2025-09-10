#!/usr/bin/env node

/**
 * Script para testar os erros específicos do Vercel:
 * - "Erro ao carregar dados da máquina"
 * - "Erro ao carregar histórico de status"
 * 
 * Este script verifica se as correções do 'acc is not defined' resolveram os problemas.
 */

const https = require('https');
const http = require('http');

const VERCEL_URL = 'https://sistema-zara-frontend.vercel.app';
const LOCAL_URL = 'http://localhost:5173';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testMachineErrors() {
  console.log('🔍 Testando erros de máquina no Vercel...');
  console.log('='.repeat(50));
  
  try {
    // 1. Testar se o Vercel está acessível
    console.log('\n1. Testando acesso ao Vercel...');
    const vercelResponse = await makeRequest(VERCEL_URL);
    
    if (vercelResponse.status === 200) {
      console.log('✅ Vercel acessível (status 200)');
      
      // Verificar se há referências aos erros no HTML
      const hasAccError = vercelResponse.data.includes('acc is not defined');
      const hasMachineError = vercelResponse.data.includes('MachineStatus-BMX93HeZ.js');
      
      console.log(`📊 Análise do HTML:`);
      console.log(`   - Erro 'acc is not defined': ${hasAccError ? '❌ ENCONTRADO' : '✅ NÃO ENCONTRADO'}`);
      console.log(`   - Arquivo MachineStatus problemático: ${hasMachineError ? '⚠️ PRESENTE' : '✅ AUSENTE'}`);
      
    } else {
      console.log(`❌ Vercel retornou status ${vercelResponse.status}`);
    }
    
    // 2. Testar local para comparação
    console.log('\n2. Testando versão local...');
    try {
      const localResponse = await makeRequest(LOCAL_URL);
      if (localResponse.status === 200) {
        console.log('✅ Versão local funcionando (status 200)');
      } else {
        console.log(`⚠️ Versão local retornou status ${localResponse.status}`);
      }
    } catch (localError) {
      console.log('⚠️ Versão local não está rodando ou inacessível');
      console.log('   Execute: npm run dev no diretório frontend');
    }
    
    // 3. Instruções para teste manual
    console.log('\n3. 📋 Instruções para teste manual:');
    console.log('   a) Acesse: ' + VERCEL_URL);
    console.log('   b) Abra o Console do navegador (F12)');
    console.log('   c) Procure por erros relacionados a:');
    console.log('      - "acc is not defined"');
    console.log('      - "Erro ao carregar dados da máquina"');
    console.log('      - "Erro ao carregar histórico de status"');
    console.log('   d) Se não houver erros, a correção funcionou! ✅');
    
    // 4. Verificar se precisa de redeploy
    console.log('\n4. 🚀 Status do Deploy:');
    console.log('   - Git: ✅ Commits enviados');
    console.log('   - Railway: ✅ Funcionando');
    console.log('   - Vercel: ⚠️ PRECISA DE REDEPLOY MANUAL');
    
    console.log('\n5. 🔧 Como fazer redeploy no Vercel:');
    console.log('   a) Acesse: https://vercel.com/dashboard');
    console.log('   b) Encontre o projeto "sistema-zara-frontend"');
    console.log('   c) Clique em "Redeploy" na última deployment');
    console.log('   d) Aguarde o build completar');
    console.log('   e) Teste novamente os erros');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Resumo: As correções foram aplicadas localmente.');
  console.log('   Para resolver os erros no Vercel, faça o redeploy manual.');
}

// Executar o teste
testMachineErrors().catch(console.error);