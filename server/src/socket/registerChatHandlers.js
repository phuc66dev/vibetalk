const User = require("../models/user.model");
const {
  cancelWaitingQueue,
  createFriendRequest,
  createMessage,
  createOrJoinQueue,
  createReport,
  finalizeSession,
  getSessionById,
  markMessageAsRead,
  respondToFriendRequest,
  serializeMessage,
  serializeSession,
} = require("../services/chat.service");

function ackSuccess(ack, payload) {
  if (typeof ack === "function") {
    ack({ data: payload, ok: true });
  }
}

function ackFailure(ack, error) {
  if (typeof ack === "function") {
    ack({
      error: error instanceof Error ? error.message : "Unexpected error.",
      ok: false,
    });
  }
}

function emitChatError(socket, error) {
  socket.emit("chat_error", {
    message: error instanceof Error ? error.message : "Unexpected error.",
  });
}

async function notifyMatched(io, socket, session) {
  const participantIds = (session.participants || []).map((participant) => ({
    socketId: participant.socketId,
    userId: String(participant._id),
  }));

  for (const participant of participantIds) {
    if (!participant.socketId) {
      continue;
    }

    const sessionPayload = serializeSession(session, participant.userId);
    io.to(participant.socketId).emit("matched", {
      roomId: session.roomId,
      session: sessionPayload,
      stranger: sessionPayload.stranger,
    });

    const participantSocket = io.sockets.sockets.get(participant.socketId);
    if (participantSocket) {
      participantSocket.join(session.roomId);
      participantSocket.data.activeSessionId = String(session._id);
      participantSocket.data.roomId = session.roomId;
    }
  }
}

async function endSessionForRoom(io, socket, sessionId, reason) {
  const session = await finalizeSession(sessionId, {
    actorUserId: socket.data.userId,
    reason,
  });

  if (!session) {
    return null;
  }

  const participantIds = (session.participants || []).map((participant) =>
    String(participant._id || participant),
  );

  for (const participantId of participantIds) {
    const user = await User.findById(participantId).select("socketId");
    if (!user?.socketId) {
      continue;
    }

    io.to(user.socketId).emit("session_ended", {
      reason: session.endReason,
      sessionId: String(session._id),
    });

    const participantSocket = io.sockets.sockets.get(user.socketId);
    if (participantSocket) {
      if (session.roomId) {
        participantSocket.leave(session.roomId);
      }
      participantSocket.data.activeSessionId = null;
      participantSocket.data.roomId = null;
    }
  }

  return session;
}

function registerChatHandlers(io, socket) {
  socket.on("join_queue", async (payload = {}, ack) => {
    try {
      await cancelWaitingQueue(socket.id, socket.data.userId);

      const result = await createOrJoinQueue({
        chatType: payload.chatType || "text",
        filters: payload.filters || {},
        interests: payload.interests || [],
        socketId: socket.id,
        user: socket.data.user,
      });

      socket.data.queueing = true;
      ackSuccess(ack, {
        status: result.session ? "matched" : "waiting",
      });

      if (!result.session) {
        socket.emit("queue_waiting", {
          chatType: payload.chatType || "text",
        });
        return;
      }

      socket.data.queueing = false;
      await notifyMatched(io, socket, result.session);
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on("typing_start", async ({ sessionId } = {}) => {
    if (!sessionId || !socket.data.roomId) {
      return;
    }

    socket.to(socket.data.roomId).emit("stranger_typing", {
      isTyping: true,
      sessionId,
    });
  });

  socket.on("typing_stop", async ({ sessionId } = {}) => {
    if (!sessionId || !socket.data.roomId) {
      return;
    }

    socket.to(socket.data.roomId).emit("stranger_typing", {
      isTyping: false,
      sessionId,
    });
  });

  socket.on("send_message", async ({ content, sessionId, type } = {}, ack) => {
    try {
      const message = await createMessage({
        content,
        senderId: socket.data.userId,
        sessionId,
        type,
      });

      const session = await getSessionById(sessionId);
      for (const participant of session.participants || []) {
        if (!participant.socketId) {
          continue;
        }

        io.to(participant.socketId).emit("new_message", {
          message: serializeMessage(message, participant._id),
        });
      }

      ackSuccess(ack, {
        message: serializeMessage(message, socket.data.userId),
      });
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on("read_message", async ({ messageId } = {}, ack) => {
    try {
      const message = await markMessageAsRead({
        messageId,
        readerId: socket.data.userId,
      });

      const session = await getSessionById(message.session);
      const sender = (session.participants || []).find(
        (participant) => String(participant._id) === String(message.sender),
      );

      if (sender?.socketId) {
        io.to(sender.socketId).emit("message_read", {
          messageId: String(message._id),
          readAt: message.readAt,
        });
      }

      ackSuccess(ack, {
        messageId: String(message._id),
        readAt: message.readAt,
      });
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on("skip", async ({ sessionId } = {}, ack) => {
    try {
      const session = await endSessionForRoom(io, socket, sessionId, "skip");
      ackSuccess(ack, {
        ended: Boolean(session),
      });
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on("leave_room", async ({ sessionId } = {}, ack) => {
    try {
      const session = await endSessionForRoom(io, socket, sessionId, "user_left");
      ackSuccess(ack, {
        ended: Boolean(session),
      });
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on(
    "report_user",
    async ({ description, reason, sessionId } = {}, ack) => {
      try {
        const report = await createReport({
          description,
          reason,
          reporterId: socket.data.userId,
          sessionId,
        });

        await endSessionForRoom(io, socket, sessionId, "reported");
        ackSuccess(ack, { reportId: String(report._id) });
      } catch (error) {
        ackFailure(ack, error);
        emitChatError(socket, error);
      }
    },
  );

  socket.on("friend_request", async ({ sessionId } = {}, ack) => {
    try {
      const request = await createFriendRequest({
        requesterId: socket.data.userId,
        sessionId,
      });
      const session = await getSessionById(sessionId);

      for (const participant of session.participants || []) {
        if (!participant.socketId) {
          continue;
        }

        io.to(participant.socketId).emit("friend_request", {
          request: {
            id: String(request._id),
            recipient: String(request.recipient),
            requester: String(request.requester),
            sessionId,
            status: request.status,
          },
        });
      }

      ackSuccess(ack, {
        requestId: String(request._id),
        status: request.status,
      });
    } catch (error) {
      ackFailure(ack, error);
      emitChatError(socket, error);
    }
  });

  socket.on(
    "friend_request_response",
    async ({ accepted, requestId } = {}, ack) => {
      try {
        const request = await respondToFriendRequest({
          accepted: Boolean(accepted),
          requestId,
          userId: socket.data.userId,
        });

        const recipient = await User.findById(request.recipient).select("socketId");
        const requester = await User.findById(request.requester).select("socketId");

        for (const target of [recipient?.socketId, requester?.socketId]) {
          if (!target) {
            continue;
          }

          io.to(target).emit("friend_request_updated", {
            request: {
              id: String(request._id),
              respondedAt: request.respondedAt,
              status: request.status,
            },
          });
        }

        ackSuccess(ack, {
          requestId: String(request._id),
          status: request.status,
        });
      } catch (error) {
        ackFailure(ack, error);
        emitChatError(socket, error);
      }
    },
  );

  socket.on("disconnect", async () => {
    try {
      socket.data.queueing = false;
      await cancelWaitingQueue(socket.id, socket.data.userId);

      if (socket.data.activeSessionId) {
        await endSessionForRoom(
          io,
          socket,
          socket.data.activeSessionId,
          "user_left",
        );
      }

      await User.updateOne(
        { _id: socket.data.userId, socketId: socket.id },
        {
          $set: {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null,
          },
        },
      );
    } catch (error) {
      console.error("Socket disconnect cleanup failed:", error);
    }
  });
}

module.exports = registerChatHandlers;
