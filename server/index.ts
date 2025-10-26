import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase } from './db.js';
import { playerRouter } from './routes/player.js';
import { sessionRouter } from './routes/session.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { adminRouter } from './routes/admin.js';
import { serveFrontend } from './serve-frontend.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    credentials: true
  }
});

// Initialize database
initDatabase();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/player', playerRouter);
app.use('/api/session', sessionRouter(io));
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter(io));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  serveFrontend(app);
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('leaderboard:subscribe', () => {
    socket.join('leaderboard');
    console.log('Client subscribed to leaderboard:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { io };
