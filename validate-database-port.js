#!/usr/bin/env node

/**
 * VALIDADOR DE PORTA DA DATABASE_URL
 * 
 * Detecta e corrige problemas específicos de porta na string de conexão PostgreSQL
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDADOR DE PORTA DA DATABASE_URL\n');

// Função para validar URL do banco
function validateDatabaseUrl(url) {
    const errors = [];
    const warnings = [];
    
    if (!url) {
        errors.push('DATABASE_URL não definida');
        return { valid: false, errors, warnings };
    }
    
    try {
        // Converter postgresql:// para http:// para usar URL parser
        const testUrl = url.replace(/^postgresql:\/\//, 'http://');
        const parsed = new URL(testUrl);
        
        // Validar porta
        if (!parsed.port) {
            errors.push('Porta não especificada na URL');
        } else {
            const portNum = parseInt(parsed.port);
            
            if (isNaN(portNum)) {
                errors.push(`Porta inválida: "${parsed.port}" (deve ser numérica)`);
            } else if (portNum < 1 || portNum > 65535) {
                errors.push(`Porta fora do range válido: ${portNum} (deve ser 1-65535)`);
            } else if (portNum !== 5432) {
                warnings.push(`Porta não padrão para PostgreSQL: ${portNum} (padrão é 5432)`);
            }
        }
        
        // Validar hostname
        if (parsed.hostname === 'host') {
            errors.push('Hostname genérico "host" - deve ser o hostname real do Railway');
        } else if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            warnings.push('Hostname local detectado - pode não funcionar no Railway');
        }
        
        // Validar usuário e senha
        if (!parsed.username) {
            errors.push('Usuário não especificado');
        }
        
        if (!parsed.password) {
            errors.push('Senha não especificada');
        }
        
        // Validar database
        const dbName = parsed.pathname.substring(1);
        if (!dbName) {
            errors.push('Nome do banco não especificado');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            parsed: {
                hostname: parsed.hostname,
                port: parsed.port,
                username: parsed.username,
                password: parsed.password ? '[PRESENTE]' : '[AUSENTE]',
                database: dbName
            }
        };
        
    } catch (error) {
        errors.push(`Erro ao analisar URL: ${error.message}`);
        return { valid: false, errors, warnings };
    }
}

// Função para gerar URL correta
function generateCorrectUrl() {
    return {
        template: 'postgresql://usuario:senha@hostname.railway.internal:5432/railway',
        example: 'postgresql://postgres:kGh9mN2pL8qR@postgres.railway.internal:5432/railway',
        railwayTemplate: '${{ Postgres.DATABASE_URL }}'
    };
}

// Verificar variáveis de ambiente
const envVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    DB_URL: process.env.DB_URL
};

console.log('📋 VARIÁVEIS DE AMBIENTE ENCONTRADAS:');
Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
        console.log(`✅ ${key}: ${value}`);
    } else {
        console.log(`❌ ${key}: não definida`);
    }
});

// Validar DATABASE_URL principal
const mainUrl = envVars.DATABASE_URL;
console.log('\n🔍 VALIDAÇÃO DA DATABASE_URL:');

if (mainUrl) {
    const validation = validateDatabaseUrl(mainUrl);
    
    console.log('\n📊 DETALHES DA URL:');
    if (validation.parsed) {
        Object.entries(validation.parsed).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
    }
    
    if (validation.errors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:');
        validation.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (validation.warnings.length > 0) {
        console.log('\n⚠️  AVISOS:');
        validation.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (validation.valid) {
        console.log('\n✅ URL válida!');
    } else {
        console.log('\n❌ URL inválida - correção necessária');
    }
} else {
    console.log('❌ DATABASE_URL não encontrada');
}

// Mostrar formatos corretos
const correctFormats = generateCorrectUrl();
console.log('\n📝 FORMATOS CORRETOS:');
console.log(`\n1. Template Railway:`);
console.log(`   ${correctFormats.railwayTemplate}`);
console.log(`\n2. Formato completo:`);
console.log(`   ${correctFormats.template}`);
console.log(`\n3. Exemplo real:`);
console.log(`   ${correctFormats.example}`);

// Instruções de correção
console.log('\n🔧 PASSOS PARA CORREÇÃO:');
console.log('\n1. Acesse Railway Dashboard:');
console.log('   https://railway.app/dashboard');
console.log('\n2. No serviço PostgreSQL:');
console.log('   • Clique no serviço PostgreSQL');
console.log('   • Vá em "Variables" ou "Connect"');
console.log('   • Copie a DATABASE_URL completa');
console.log('\n3. No serviço Backend:');
console.log('   • Clique no serviço do backend');
console.log('   • Vá em "Variables"');
console.log('   • Adicione/edite DATABASE_URL');
console.log('   • Cole a URL correta');
console.log('   • Clique "Deploy"');

console.log('\n⏱️  Tempo estimado: 3-5 minutos');
console.log('\n🧪 Teste após correção:');
console.log('curl https://seu-backend.railway.app/api/health');