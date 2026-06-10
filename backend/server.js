const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Pass Socket.io to request context
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes API mapping
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profiles', require('./routes/profiles'));

// Wildcard API 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Route not found' });
});

// Centralized error handling
app.use(errorHandler);

// Socket.io real-time connection listening
io.on('connection', (socket) => {
  console.log(`Client connected to WebSocket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected from WebSocket: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
