import 'dotenv/config';
import { app } from './app';
import { connectDB, disconnectDB } from './lib/mongoose';

const PORT = Number(process.env.PORT) || 3000;

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });

  // Cierre graceful: cerrar conexiones antes de salir
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} recibido — cerrando servidor...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal error on startup:', err);
  process.exit(1);
});
