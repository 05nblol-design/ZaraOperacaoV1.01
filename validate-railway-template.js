#!/usr/bin/env node

/**
 * VALIDADOR DE TEMPLATE VARIABLES - Railway
 * Valida sintaxe de variáveis como ${{ zara-postgres.DATABASE_URL }}
 */

const fs = require('fs');
const path = require('path');

function validateRailwayTemplate() {
    console.log('🔧 VALIDADOR DE TEMPLATE VARIABLES - Railway\n');
    
    const templateVariable = '${{ zara-postgres.DATABASE_URL }}';
    console.log(`📋 Variável identificada: ${templateVariable}`);
    
    // Analisar a sintaxe
    const analysis = analyzeTemplateVariable(templateVariable);
    
    console.log('\n🔍 ANÁLISE DA VARIÁVEL:');
    console.log(`   Sintaxe: ${analysis.syntaxValid ? '✅ Correta' : '❌ Incorreta'}`);
    console.log(`   Serviço: ${analysis.serviceName}`);
    console.log(`   Variável: ${analysis.variableName}`);
    
    if (analysis.syntaxValid) {
        console.log('\n✅ A sintaxe da variável está correta!');
        showConfigurationSteps(analysis.serviceName);
    } else {
        console.log('\n❌ Problemas encontrados na sintaxe:');
        analysis.errors.forEach(error => {
            console.log(`   - ${error}`);
        });
        showCorrectSyntax();
    }
    
    // Verificar se existe no ambiente atual
    checkEnvironmentVariable();
}

function analyzeTemplateVariable(template) {
    const analysis = {
        syntaxValid: true,
        serviceName: null,
        variableName: null,
        errors: []
    };
    
    // Verificar sintaxe básica
    if (!template.startsWith('${{')) {
        analysis.syntaxValid = false;
        analysis.errors.push('Deve começar com "${{"');
    }
    
    if (!template.endsWith('}}')) {
        analysis.syntaxValid = false;
        analysis.errors.push('Deve terminar com "}}"');
    }
    
    // Extrair conteúdo
    const match = template.match(/\$\{\{\s*([^.]+)\.([^\s}]+)\s*\}\}/);
    if (match) {
        analysis.serviceName = match[1].trim();
        analysis.variableName = match[2].trim();
        
        // Validar nome do serviço
        if (!/^[a-zA-Z0-9-_]+$/.test(analysis.serviceName)) {
            analysis.syntaxValid = false;
            analysis.errors.push('Nome do serviço contém caracteres inválidos');
        }
        
        // Validar nome da variável
        if (analysis.variableName !== 'DATABASE_URL') {
            analysis.errors.push(`Variável "${analysis.variableName}" pode estar incorreta. Esperado: DATABASE_URL`);
        }
    } else {
        analysis.syntaxValid = false;
        analysis.errors.push('Formato inválido. Esperado: ${{ servico.VARIAVEL }}');
    }
    
    return analysis;
}

function showConfigurationSteps(serviceName) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 PASSOS PARA CONFIGURAR NO RAILWAY');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣ VERIFICAR NOME DO SERVIÇO POSTGRESQL:');
    console.log('   - Acesse: https://railway.app/dashboard');
    console.log('   - Vá para seu projeto');
    console.log(`   - Confirme se o serviço PostgreSQL se chama "${serviceName}"`);
    console.log('   - Se não, anote o nome correto');
    
    console.log('\n2️⃣ CONFIGURAR NO BACKEND:');
    console.log('   - Clique no serviço Backend');
    console.log('   - Aba "Variables"');
    console.log('   - Adicione/Edite:');
    console.log(`     Nome: DATABASE_URL`);
    console.log(`     Valor: \${{ ${serviceName}.DATABASE_URL }}`);
    console.log('   - Clique "Save"');
    
    console.log('\n3️⃣ AGUARDAR REDEPLOY:');
    console.log('   - Railway fará redeploy automático');
    console.log('   - Aguarde 3-5 minutos');
    
    console.log('\n4️⃣ TESTAR:');
    console.log('   - https://seu-backend.railway.app/health');
    console.log('   - Verificar logs de deploy');
}

function showCorrectSyntax() {
    console.log('\n💡 SINTAXE CORRETA PARA RAILWAY:');
    console.log('\n📋 Exemplos válidos:');
    console.log('   ${{ postgres.DATABASE_URL }}');
    console.log('   ${{ postgresql.DATABASE_URL }}');
    console.log('   ${{ zara-postgres.DATABASE_URL }}');
    console.log('   ${{ db.DATABASE_URL }}');
    
    console.log('\n❌ Sintaxes incorretas:');
    console.log('   {{ postgres.DATABASE_URL }}      # Faltam os $');
    console.log('   ${ postgres.DATABASE_URL }       # Chaves erradas');
    console.log('   ${postgres.DATABASE_URL}         # Chaves erradas');
    console.log('   ${{postgres.DB_URL}}             # Variável errada');
}

function checkEnvironmentVariable() {
    console.log('\n🔍 VERIFICAÇÃO DO AMBIENTE ATUAL:');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        console.log('✅ DATABASE_URL encontrada no ambiente');
        
        // Verificar se é uma template variable ou URL real
        if (databaseUrl.includes('${{')) {
            console.log('📋 Tipo: Template Variable (não resolvida)');
            console.log('⚠️  Isso indica que a variável não foi processada pelo Railway');
        } else if (databaseUrl.startsWith('postgresql://')) {
            console.log('📋 Tipo: URL PostgreSQL resolvida');
            console.log('✅ A template variable foi processada corretamente');
            
            // Verificar se não é o hostname genérico
            if (databaseUrl.includes('@host:')) {
                console.log('❌ PROBLEMA: Hostname genérico "host" detectado');
                console.log('🔧 Solução: Verificar configuração do serviço PostgreSQL');
            }
        } else {
            console.log('⚠️  Formato não reconhecido');
        }
        
        console.log(`📍 Valor: ${databaseUrl.substring(0, 50)}...`);
    } else {
        console.log('❌ DATABASE_URL não encontrada no ambiente');
        console.log('🔧 Configure a variável no Railway Dashboard');
    }
}

function generateExamples() {
    console.log('\n📚 EXEMPLOS DE CONFIGURAÇÃO:');
    
    const examples = [
        {
            service: 'postgres',
            template: '${{ postgres.DATABASE_URL }}',
            description: 'Serviço padrão do PostgreSQL'
        },
        {
            service: 'zara-postgres',
            template: '${{ zara-postgres.DATABASE_URL }}',
            description: 'Serviço nomeado específico'
        },
        {
            service: 'database',
            template: '${{ database.DATABASE_URL }}',
            description: 'Serviço com nome personalizado'
        }
    ];
    
    examples.forEach((example, index) => {
        console.log(`\n${index + 1}. ${example.description}:`);
        console.log(`   Serviço: ${example.service}`);
        console.log(`   Template: ${example.template}`);
    });
}

// Executar validação
if (require.main === module) {
    validateRailwayTemplate();
    generateExamples();
    
    console.log('\n🎯 PRÓXIMA AÇÃO:');
    console.log('1. Verificar nome exato do serviço PostgreSQL no Railway');
    console.log('2. Configurar a template variable no serviço Backend');
    console.log('3. Aguardar redeploy e testar');
    
    console.log('\n📞 SUPORTE ADICIONAL:');
    console.log('- RAILWAY-TEMPLATE-VARIABLES.md');
    console.log('- RAILWAY-URGENT-DATABASE-FIX.md');
}

module.exports = { validateRailwayTemplate, analyzeTemplateVariable };