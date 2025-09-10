const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    // Verificar usuário Lucas (ID 3)
    const user = await prisma.user.findUnique({
      where: { id: 3 },
      select: { id: true, email: true, role: true }
    });
    console.log('Usuário:', user);

    // Verificar permissão para máquina 1
    const permission = await prisma.machinePermission.findUnique({
      where: {
        userId_machineId: {
          userId: 3,
          machineId: 1
        }
      }
    });
    console.log('Permissão encontrada:', permission);

    // Listar todas as permissões do usuário
    const allPermissions = await prisma.machinePermission.findMany({
      where: { userId: 3 },
      include: { machine: { select: { id: true, name: true } } }
    });
    console.log('Todas as permissões do usuário:', allPermissions);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();