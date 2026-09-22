import express from 'express';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
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

// Mount Routes
app.use('/', authRoutes);

// Create HTTP & Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach Socket Handlers
SocketHandler(io);

// Start Listening on Port
const PORT = process.env.PORT || 6001;

server.listen(PORT, async () => {
  console.log(`🚀 Server running @ http://localhost:${PORT}`);

  // Test Redis connection on boot
  try {
    const pingResponse = await redis.ping();
    console.log(`📡 [Redis] Initial Ping: ${pingResponse}`);
  } catch (err) {
    console.error('❌ [Redis] Ping failed:', err.message);
  }
});

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  try {
    await redis.quit();
    console.log('✅ [Redis] Connection closed.');
  } catch (err) {
    console.error('❌ [Redis] Error closing connection:', err.message);
  }
  process.exit(0);
});