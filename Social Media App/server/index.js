import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initNotificationWorker } from './workers/notificationWorker.js';

dotenv.config();

import authRoutes from './routes/Route.js';
import SocketHandler from './SocketHandler.js';
import redis from './redis.js';
import prisma, { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use('/', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

SocketHandler(io);
initNotificationWorker(io);

const PORT = process.env.PORT || 6001;

server.listen(PORT, async () => {
  console.log(`🚀 Server running @ http://localhost:${PORT}`);

  try {
    const pingResponse = await redis.ping();
    console.log(`📡 [Redis] Initial Ping: ${pingResponse}`);
  } catch (err) {
    console.error('❌ [Redis] Ping failed:', err.message);
  }
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  try {
    await redis.quit();
    console.log('✅ [Redis] Connection closed.');
    await prisma.$disconnect();
    await pool.end();
    console.log('✅ [Database] Connection pool closed.');
  } catch (err) {
    console.error('❌ [Shutdown Error]:', err.message);
  }
  process.exit(0);
});