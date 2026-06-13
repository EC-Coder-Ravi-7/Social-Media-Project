import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

import authRoutes from './routes/Route.js';
import SocketHandler from './SocketHandler.js';

// config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use('', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on("connection", (socket) => {
  console.log("User connected");
  SocketHandler(socket);
});

// Use the environment variables
const PORT = process.env.PORT || 6001;
const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;

mongoose.connect(mongoURI, { 
 
}).then(() => {
  console.log("MongoDB Connected");
  server.listen(PORT, () => console.log(`Running @ ${PORT}`));
}).catch(err => console.log(`DB Connection Error: ${err}`));
