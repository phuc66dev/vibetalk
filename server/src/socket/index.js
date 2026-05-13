const { createServer } = require("http");

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const { getBearerToken } = require("../middlewares/auth.middleware");
const registerChatHandlers = require("./registerChatHandlers");

function getAllowedOrigins() {
  return [
    process.env.FRONTEND_ORIGIN,
    process.env.FRONTEND_ORIGIN_RENDER,
  ].filter(Boolean);
}

async function authenticateSocket(socket) {
  const handshakeToken =
    socket.handshake.auth?.token ||
    getBearerToken(socket.handshake.headers.authorization);

  if (!handshakeToken) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(handshakeToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function attachSocketServer(app) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      credentials: true,
      origin: getAllowedOrigins(),
    },
  });

  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      socket.data.userId = String(user._id);

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            isOnline: true,
            lastSeen: new Date(),
            socketId: socket.id,
          },
        },
      );

      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
  });

  return httpServer;
}

module.exports = attachSocketServer;
