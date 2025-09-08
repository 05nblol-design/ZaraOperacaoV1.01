#!/usr/bin/env node

/**
 * CORREÇÃO URGENTE - DATABASE_URL Railway
 * Detecta e corrige hostname genérico 'host' no DATABASE_URL
 */

const fs = require('fs');
const path = require('path');

function checkDatabaseURL() {
    console.log('🔍 DIAGNÓSTICO URGENTE - DATABASE_URL Railway\n');
    
    // Verificar variável de ambiente
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        console.log('❌ DATABASE_URL não encontrada no ambiente');
        console.log('\n📋 VARIÁVEIS DISPONÍVEIS:');
        Object.keys(process.env)
            .filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
            .forEach(key => {
                console.log(`   ${key}: ${process.env[key] ? '[DEFINIDA]' : '[VAZIA]'}`);
            });
        
        showRailwayInstructions();
        return;
    }
    
    console.log('✅ DATABASE_URL encontrada');
    console.log(`📍 URL atual: ${databaseUrl.substring(0, 50)}...`);
    
    // Verificar problemas
    const problems = [];
    
    // Problema 1: Hostname genérico 'host'
    if (databaseUrl.includes('@host:')) {
        problems.push({
            type: 'HOSTNAME_GENÉRICO',
            description: "Hostname 'host' é genérico, não é um servidor real",
            severity: 'CRÍTICO'
        });
    }
    
    // Problema 2: localhost
    if (databaseUrl.includes('@localhost:') || databaseUrl.includes('@127.0.0.1:')) {
        problems.push({
            type: 'LOCALHOST',
            description: 'Usando localhost ao invés do hostname do Railway',
            severity: 'CRÍTICO'
        });
    }
    
    // Problema 3: Porta inválida
    const portMatch = databaseUrl.match(/:([0-9]+)\//); 
    if (portMatch && portMatch[1] !== '5432') {
        problems.push({
            type: 'PORTA_INVÁLIDA',
            description: `Porta ${portMatch[1]} pode estar incorreta (padrão: 5432)`,
            severity: 'MÉDIO'
        });
    }
    
    // Mostrar resultados
    if (problems.length === 0) {
        console.log('✅ DATABASE_URL parece estar correta');
        console.log('\n🔧 Se ainda há erro de conexão, verifique:');
        console.log('   - Serviço PostgreSQL está ativo no Railway');
        console.log('   - Credenciais estão corretas');
        console.log('   - Não há firewall bloqueando a conexão');
    } else {
        console.log('\n🚨 PROBLEMAS DETECTADOS:');
        problems.forEach((problem, index) => {
            console.log(`\n${index + 1}. ${problem.type} [${problem.severity}]`);
            console.log(`   ${problem.description}`);
        });
        
        showRailwayInstructions();
    }
}

function showRailwayInstructions() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 INSTRUÇÕES PARA CORRIGIR NO RAILWAY');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣ ACESSE O RAILWAY:');
    console.log('   https://railway.app/dashboard');
    
    console.log('\n2️⃣ VAYA PARA SEU PROJETO:');
    console.log('   - Clique no projeto da aplicação Zara');
    console.log('   - Você verá os serviços: Backend, PostgreSQL, etc.');
    
    console.log('\n3️⃣ OBTENHA A URL CORRETA:');
    console.log('   - Clique no serviço PostgreSQL');
    console.log('   - Vá na aba "Variables"');
    console.log('   - Procure por DATABASE_URL');
    console.log('   - Copie o valor completo');
    
    console.log('\n4️⃣ CONFIGURE NO BACKEND:');
    console.log('   - Volte e clique no serviço Backend');
    console.log('   - Vá na aba "Variables"');
    console.log('   - Adicione/Edite: DATABASE_URL');
    console.log('   - Cole a URL copiada do PostgreSQL');
    console.log('   - Clique em "Save"');
    
    console.log('\n5️⃣ AGUARDE O REDEPLOY:');
    console.log('   - O Railway fará redeploy automático');
    console.log('   - Aguarde 3-5 minutos');
    
    console.log('\n6️⃣ TESTE A APLICAÇÃO:');
    console.log('   - Acesse: https://seu-backend.railway.app/health');
    console.log('   - Deve retornar status OK');
    
    console.log('\n📋 FORMATO CORRETO DA URL:');
    console.log('postgresql://postgres:senha@railway-host.railway.app:5432/railway');
    
    console.log('\n❌ FORMATOS INCORRETOS:');
    console.log('postgresql://postgres:senha@host:5432/railway');
    console.log('postgresql://postgres:senha@localhost:5432/railway');
    
    console.log('\n⏱️ TEMPO ESTIMADO: 5-10 minutos total');
}

function generateCorrectURL() {
    console.log('\n💡 EXEMPLO DE URL CORRETA PARA RAILWAY:');
    console.log('postgresql://postgres:SUA_SENHA@railway-host.railway.app:5432/railway');
    
    console.log('\n🔧 SUBSTITUA:');
    console.log('   - SUA_SENHA: pela senha real do PostgreSQL');
    console.log('   - railway-host.railway.app: pelo hostname real do Railway');
    console.log('   - railway: pelo nome real do banco de dados');
}

// Executar diagnóstico
if (require.main === module) {
    checkDatabaseURL();
    generateCorrectURL();
    
    console.log('\n🎯 PRÓXIMA AÇÃO: Acesse o Railway Dashboard e corrija o DATABASE_URL');
    console.log('📞 Em caso de dúvidas, consulte: RAILWAY-URGENT-DATABASE-FIX.md');
}

module.exports = { checkDatabaseURL, showRailwayInstructions };