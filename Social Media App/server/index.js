import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/Route.js';
import SocketHandler from './SocketHandler.js';
import redis from './redis.js';
import prisma, { pool } from './db.js';
import { initNotificationWorker } from './workers/notificationWorker.js';
import morgan from 'morgan';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

SocketHandler(io);
initNotificationWorker(io);

const PORT = process.env.PORT || 6001;

server.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  try {
    const pingResponse = await redis.ping();
    logger.info(`📡 [Redis] Initial Ping: ${pingResponse}`);
  } catch (err) {
    logger.error(`❌ [Redis] Ping failed: ${err.message}`);
  }
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  try {
    await redis.quit();
    await prisma.$disconnect();
    await pool.end();
    console.log('✅ Connections closed.');
  } catch (err) {
    console.error('❌ [Shutdown Error]:', err.message);
  }
  process.exit(0);
});