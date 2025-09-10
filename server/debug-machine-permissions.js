const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugMachinePermissions() {
  try {
    console.log('🔍 Verificando máquina ID 1...');
    
    // Verificar se a máquina existe
    const machine = await prisma.machine.findUnique({
      where: { id: 1 },
      select: { id: true, name: true, type: true, location: true, status: true, isActive: true }
    });
    
    console.log('Máquina ID 1:', machine);
    
    if (!machine) {
      console.log('❌ Máquina ID 1 não encontrada!');
      return;
    }
    
    // Verificar permissões para esta máquina
    const permissions = await prisma.machinePermission.findMany({
      where: { machineId: 1 },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    
    console.log('\n🔐 Permissões para máquina 1:');
    console.log('Total de permissões:', permissions.length);
    
    permissions.forEach(perm => {
      console.log(`- Usuário: ${perm.user.name} (${perm.user.email})`);
      console.log(`  Role: ${perm.user.role}`);
      console.log(`  canView: ${perm.canView}`);
      console.log(`  canOperate: ${perm.canOperate}`);
      console.log(`  canMaintain: ${perm.canMaintain}`);
      console.log('---');
    });
    
    // Verificar usuários de teste
    console.log('\n👤 Verificando usuários de teste...');
    const testUserIds = [507, 508, 509, 510]; // IDs numéricos dos usuários de teste
    
    for (const userId of testUserIds) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      });
      
      if (user) {
        console.log(`Usuário ${userId}:`, user);
        
        const userPermission = await prisma.machinePermission.findUnique({
          where: {
            userId_machineId: {
              userId: userId,
              machineId: 1
            }
          }
        });
        
        console.log(`Permissão para máquina 1:`, userPermission);
      } else {
        console.log(`Usuário ${userId}: não encontrado`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugMachinePermissions();