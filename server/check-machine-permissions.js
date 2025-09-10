const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Verificando máquina ID 1:');
    const machine = await prisma.machine.findUnique({
      where: { id: 1 }
    });
    console.log('Máquina:', machine);
    
    console.log('\nVerificando permissões para máquina ID 1:');
    const permissions = await prisma.machinePermission.findMany({
      where: { machineId: 1 },
      include: {
        user: { select: { email: true, role: true } }
      }
    });
    console.log('Permissões:', permissions);
    
    console.log('\nVerificando todos os usuários:');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('Usuários:', allUsers);
    
    console.log('\nCriando permissão para usuário admin acessar máquina ID 1:');
    const adminUser = allUsers.find(u => u.role === 'ADMIN');
    if (adminUser) {
      const permission = await prisma.machinePermission.upsert({
        where: {
          userId_machineId: {
            userId: adminUser.id,
            machineId: 1
          }
        },
        update: {
          canView: true,
          canOperate: true,
          canEdit: true
        },
        create: {
          userId: adminUser.id,
          machineId: 1,
          canView: true,
          canOperate: true,
          canEdit: true
        }
      });
      console.log('Permissão criada/atualizada:', permission);
    } else {
      console.log('Usuário admin não encontrado');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();