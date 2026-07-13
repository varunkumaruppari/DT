// Environment validation runs first — server exits on invalid config
import { env } from './config/env.js';
import { app } from './app.js';
import { connectDatabase } from './lib/prisma.js';
import { startWorkers, stopWorkers } from './workers/index.js';

// ============================================================
// server.ts — HTTP server startup
// Responsibilities: env validation, DB readiness, server start
// Express application configuration lives in app.ts
// ============================================================

async function startServer(): Promise<void> {
  console.log(`🚀 Daily Development Tracker API`);
  console.log(`   Environment: ${env.NODE_ENV}`);

  // Verify PostgreSQL connectivity before accepting traffic
  try {
    console.log('   Checking database connectivity...');
    await connectDatabase();
    console.log('   ✅ Database connected');
    startWorkers();
  } catch (err) {
    console.warn('   ⚠️  Database not available at startup:', (err as Error).message);
    console.warn('   Server will start but /health/ready will reflect unavailable state.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`   ✅ API listening on http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`   Ready:  http://localhost:${env.PORT}/api/v1/health/ready`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n⏹  SIGTERM received — shutting down gracefully');
    stopWorkers();
    server.close(() => {
      console.log('   HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n⏹  SIGINT received — shutting down gracefully');
    stopWorkers();
    server.close(() => {
      console.log('   HTTP server closed');
      process.exit(0);
    });
  });
}

startServer().catch((err: unknown) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
