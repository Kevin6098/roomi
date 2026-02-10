import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './db.js';

const server = app.listen(config.port, () => {
  console.log(`ROOMI API running at http://localhost:${config.port}`);
});

prisma
  .$connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.error('PostgreSQL connection failed:', err.message));

process.on('SIGTERM', () => {
  server.close();
  prisma.$disconnect();
});
