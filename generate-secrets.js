const crypto = require('crypto');

console.log('\n🔐 GERADOR DE CHAVES PARA RAILWAY\n');
console.log('='.repeat(50));

// Gerar JWT_SECRET (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📋 COPIE ESTAS VARIÁVEIS PARA O RAILWAY:');
console.log('\nJWT_SECRET=' + jwtSecret);

// Gerar SESSION_SECRET (32 bytes)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET=' + sessionSecret);

console.log('\n🌐 CORS_ORIGINS:');
console.log('CORS_ORIGINS=https://seu-frontend.up.railway.app');
console.log('(⚠️  Substitua pela URL real do seu frontend)');

console.log('\n📝 OUTRAS VARIÁVEIS NECESSÁRIAS:');
console.log('NODE_ENV=production');
console.log('PORT=3000');
console.log('DATABASE_URL=[já configurado pelo PostgreSQL]');

console.log('\n' + '='.repeat(50));
console.log('\n✅ COMO USAR:');
console.log('1. Copie as variáveis acima');
console.log('2. Vá para railway.app > seu projeto > Variables');
console.log('3. Adicione cada variável clicando em "New Variable"');
console.log('4. Cole o nome e valor de cada uma');
console.log('5. Aguarde o redeploy automático');

console.log('\n🔒 SEGURANÇA:');
console.log('- NUNCA commite essas chaves no Git');
console.log('- Mantenha-as privadas e seguras');
console.log('- Use chaves diferentes para dev/prod');

console.log('\n🚀 Após configurar, sua aplicação estará pronta!');
console.log('\n');