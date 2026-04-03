const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const { buildRoom } = require('./controllers/chatController');

// Route imports
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get('/', (req, res) => {
  res.send('StudentMart API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// ─── Socket.io ──────────────────────────────────────────────
io.use((socket, next) => {
  // Authenticate socket using JWT token passed in handshake auth
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.userId}`);

  // Join a specific chat room
  socket.on('join_room', ({ listingId, sellerId }) => {
    const room = buildRoom(socket.userId, sellerId, listingId);
    socket.join(room);
    socket.currentRoom = room;
    console.log(`📦 User ${socket.userId} joined room ${room}`);
  });

  // Send a message
  socket.on('send_message', async ({ listingId, sellerId, receiverId, text }) => {
    try {
      const room = buildRoom(socket.userId, sellerId, listingId);
      const message = await Message.create({
        listing: listingId,
        sender: socket.userId,
        receiver: receiverId,
        text,
        room,
      });

      const populated = await message.populate('sender', 'name');

      // Broadcast to the room (both sender and receiver)
      io.to(room).emit('receive_message', {
        _id: populated._id,
        text: populated.text,
        sender: populated.sender,
        createdAt: populated.createdAt,
      });
    } catch (err) {
      console.error('❌ Chat error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.userId}`);
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('❌ Server Error:', err.message);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
