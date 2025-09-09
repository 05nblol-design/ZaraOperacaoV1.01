const dotenv = require('dotenv');
const path = require('path');
const logger = require('utils/logger');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const notificationService = require('./services/notificationService');
const emailService = require('./services/emailService');
const pushService = require('./services/pushService');

logger.info('🔍 Verificando Configurações de Notificação\n');

// Verificar variáveis de ambiente
logger.info('📋 Variáveis de Ambiente:');
logger.info('NODE_ENV:', process.env.NODE_ENV);
logger.info('PORT:', process.env.PORT);
logger.info('\n📧 Configurações de Email:');
logger.info('SMTP_HOST:', process.env.SMTP_HOST || 'Não configurado');
logger.info('SMTP_PORT:', process.env.SMTP_PORT || 'Não configurado');
logger.info('SMTP_USER:', process.env.SMTP_USER ? '✅ Configurado' : '❌ Não configurado');
logger.info('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configurado' : '❌ Não configurado');
logger.info('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ Não configurado');
logger.info('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ Não configurado');

logger.info('\n📱 Configurações Firebase/Push:');
logger.info('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Não configurado');
logger.info('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ Não configurado');
logger.info('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Não configurado');

logger.info('\n🔔 Configurações de Notificação:');
logger.info('NOTIFICATIONS_ENABLED:', process.env.NOTIFICATIONS_ENABLED || 'Não definido');
logger.info('EMAIL_NOTIFICATIONS:', process.env.EMAIL_NOTIFICATIONS || 'Não definido');
logger.info('PUSH_NOTIFICATIONS:', process.env.PUSH_NOTIFICATIONS || 'Não definido');

logger.info('\n🏗️ Status dos Serviços:');

// Verificar status do NotificationService
try {
  logger.info('NotificationService - Email habilitado:', notificationService.emailEnabled);
  logger.info('NotificationService - Push habilitado:', notificationService.pushEnabled);
} catch (error) {
  logger.error('❌ Erro ao verificar NotificationService:', error.message);
}

// Verificar status do EmailService
try {
  logger.info('EmailService - Inicializado:', !!emailService);
} catch (error) {
  logger.error('❌ Erro ao verificar EmailService:', error.message);
}

// Verificar status do PushService
try {
  logger.info('PushService - Inicializado:', !!pushService);
  logger.info('PushService - Firebase inicializado:', pushService.initialized);
} catch (error) {
  logger.error('❌ Erro ao verificar PushService:', error.message);
}

logger.info('\n📊 Resumo da Configuração:');

const emailConfigured = !!(process.env.EMAIL_USER || process.env.SMTP_USER);
const pushConfigured = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);

if (emailConfigured) {
  logger.info('✅ Email: Configurado e disponível');
} else {
  logger.info('❌ Email: Não configurado - Configure SMTP_USER/SMTP_PASS ou EMAIL_USER/EMAIL_PASSWORD');
}

if (pushConfigured) {
  logger.info('✅ Push: Configurado e disponível');
} else {
  logger.info('❌ Push: Não configurado - Configure as credenciais do Firebase');
}

if (!emailConfigured && !pushConfigured) {
  logger.info('\n⚠️  ATENÇÃO: Nenhum método de notificação está configurado!');
  logger.info('\n📝 Para configurar as notificações:');
  logger.info('\n1. Email (Nodemailer):');
  logger.info('   - SMTP_HOST=smtp.gmail.com');
  logger.info('   - SMTP_PORT=587');
  logger.info('   - SMTP_USER=seu_email@gmail.com');
  logger.info('   - SMTP_PASS=sua_senha_de_app');
  logger.info('\n2. Push (Firebase):');
  logger.info('   - FIREBASE_PROJECT_ID=seu_projeto');
  logger.info('   - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  logger.info('   - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@projeto.iam.gserviceaccount.com');
} else {
  logger.info('\n✅ Sistema de notificações parcialmente ou totalmente configurado!');
}

logger.info('\n🔚 Verificação concluída.');