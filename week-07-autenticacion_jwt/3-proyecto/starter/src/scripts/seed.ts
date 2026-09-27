import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../lib/mongoose';
import { UserModel } from '../models/user.model';

// ============================================
// SEED — usuarios de prueba para la editorial
// ============================================
// Crea un usuario admin y uno normal si no existen.
// Uso: pnpm seed   (o: npx tsx src/scripts/seed.ts)
// ============================================

const SALT_ROUNDS = 10;

async function seed(): Promise<void> {
  await connectDB();

  const users = [
    {
      name: 'Admin Editorial',
      email: 'admin@editorial.com',
      password: 'Admin1234!',
      role: 'admin' as const,
    },
    {
      name: 'Editor Demo',
      email: 'editor@editorial.com',
      password: 'Editor1234!',
      role: 'user' as const,
    },
  ];

  for (const user of users) {
    const existing = await UserModel.findOne({ email: user.email });
    if (existing) {
      console.log(`⏭️  Ya existe: ${user.email} (${existing.role})`);
      continue;
    }
    const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
    await UserModel.create({ ...user, password: hashed });
    console.log(`✅ Creado: ${user.email} (${user.role}) — password: ${user.password}`);
  }

  await disconnectDB();
}

seed().catch((err) => {
  console.error('Error ejecutando el seed:', err);
  process.exit(1);
});
