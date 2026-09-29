import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { store } from './database/store.js';

const PORT = process.env.PORT || 5001;

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('subscribe_flight', (flightId: number) => {
    socket.join(`flight_${flightId}`);
    console.log(`[WebSocket] Client ${socket.id} subscribed to flight_${flightId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Periodic seat hold sweep: Release expired holds every 30 seconds
setInterval(() => {
  let totalReleased = 0;
  for (const flight of store.flights) {
    if (flight.seats) {
      const released = store.seatHoldManager.sweepExpiredHolds(flight.seats);
      if (released.length > 0) {
        totalReleased += released.length;
        io.emit('seats_released', {
          flightId: flight.id,
          releasedSeats: released,
        });
      }
    }
  }
  if (totalReleased > 0) {
    console.log(`[SeatHoldManager] Auto-released ${totalReleased} expired seat holds.`);
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SkyWings Admin API Server running on port ${PORT}`);
  console.log(`📖 OpenAPI Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`⚡ WebSocket Server active for real-time flight updates`);
  console.log(`=======================================================`);
});
