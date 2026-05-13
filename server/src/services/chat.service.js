const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const Block = require("../models/block.model");
const ChatSession = require("../models/chatSession.model");
const Friend = require("../models/friend.model");
const MatchQueue = require("../models/matchQueue.model");
const Message = require("../models/message.model");
const Report = require("../models/report.model");
const User = require("../models/user.model");

function getUserAge(user) {
  if (!user?.dateOfBirth) {
    return null;
  }

  const birthDate = new Date(user.dateOfBirth);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function normalizeInterests(interests = []) {
  return [...new Set(
    interests
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean),
  )];
}

function normalizeFilters(filters = {}) {
  const ageMin = Number.isFinite(Number(filters.ageMin))
    ? Number(filters.ageMin)
    : 18;
  const ageMax = Number.isFinite(Number(filters.ageMax))
    ? Number(filters.ageMax)
    : 99;

  return {
    ageMax: Math.max(ageMin, ageMax),
    ageMin: Math.max(13, ageMin),
    genderFilter: filters.genderFilter || "any",
    interestMatching:
      typeof filters.interestMatching === "boolean"
        ? filters.interestMatching
        : true,
    languageFilter: filters.languageFilter || "any",
  };
}

function computeMatchScore(entry, candidate) {
  const source = normalizeInterests(entry.interests);
  const target = normalizeInterests(candidate.interests);

  if (!source.length || !target.length) {
    return 0;
  }

  const targetSet = new Set(target);
  const shared = source.filter((interest) => targetSet.has(interest));
  const denominator = Math.max(source.length, target.length);

  return Math.round((shared.length / denominator) * 100);
}

function getSharedInterests(entry, candidate) {
  const source = normalizeInterests(entry.interests);
  const targetSet = new Set(normalizeInterests(candidate.interests));
  return source.filter((interest) => targetSet.has(interest));
}

function passesDirectionalFilters(source, target) {
  const filters = normalizeFilters(source.filters);

  if (
    filters.genderFilter !== "any" &&
    target.gender &&
    filters.genderFilter !== target.gender
  ) {
    return false;
  }

  if (target.age !== null && target.age !== undefined) {
    if (target.age < filters.ageMin || target.age > filters.ageMax) {
      return false;
    }
  }

  if (
    filters.languageFilter !== "any" &&
    target.language &&
    filters.languageFilter !== target.language
  ) {
    return false;
  }

  if (filters.interestMatching) {
    const score = computeMatchScore(source, target);
    if (score === 0 && source.interests?.length && target.interests?.length) {
      return false;
    }
  }

  return true;
}

async function isBlockedBetween(entry, candidate) {
  if (!entry.user || !candidate.user) {
    return false;
  }

  const blocked = await Block.exists({
    $or: [
      { blocked: candidate.user, blocker: entry.user },
      { blocked: entry.user, blocker: candidate.user },
    ],
  });

  return Boolean(blocked);
}

function getRoomId() {
  return `room_${randomUUID()}`;
}

function serializeMessage(message, viewerId) {
  const senderId = message.sender ? String(message.sender) : null;
  const viewer = viewerId ? String(viewerId) : null;

  return {
    author: senderId && viewer && senderId === viewer ? "me" : "stranger",
    content: message.content,
    createdAt: message.createdAt,
    id: String(message._id),
    readAt: message.readAt,
    sessionId: String(message.session),
    status: message.status,
    type: message.type,
  };
}

function buildStrangerSummary(session, viewerId) {
  const viewer = viewerId ? String(viewerId) : null;
  const stranger = (session.participants || []).find(
    (participant) => String(participant._id || participant) !== viewer,
  );

  if (!stranger || !stranger._id) {
    return {
      id: null,
      name: "Anonymous",
    };
  }

  return {
    avatar: stranger.avatar || null,
    id: String(stranger._id),
    name: stranger.name || "Anonymous",
  };
}

function serializeSession(session, viewerId) {
  return {
    endReason: session.endReason,
    id: String(session._id),
    matchedInterests: session.matchedInterests || [],
    messageCount: session.messageCount || 0,
    roomId: session.roomId,
    startedAt: session.startedAt,
    status: session.status,
    stranger: buildStrangerSummary(session, viewerId),
    type: session.type,
  };
}

async function buildQueueEntryPayload({
  chatType = "text",
  filters = {},
  interests = [],
  socketId,
  user,
}) {
  const normalizedInterests = normalizeInterests(
    interests.length ? interests : user?.interests || [],
  );
  const age = getUserAge(user);

  return {
    age,
    chatType,
    filters: normalizeFilters(filters || user?.matchPreferences || {}),
    gender: user?.gender || "prefer_not_to_say",
    interests: normalizedInterests,
    language: user?.language || "vi",
    socketId,
    user: user?._id ?? null,
  };
}

async function upsertQueueEntry(payload) {
  const match = payload.user
    ? { user: payload.user, status: "waiting" }
    : { socketId: payload.socketId, status: "waiting" };

  const update = {
    $set: {
      age: payload.age,
      chatType: payload.chatType,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      filters: payload.filters,
      gender: payload.gender,
      interests: payload.interests,
      language: payload.language,
      matchedSession: null,
      socketId: payload.socketId,
      status: "waiting",
      user: payload.user,
    },
  };

  return MatchQueue.findOneAndUpdate(match, update, {
    new: true,
    setDefaultsOnInsert: true,
    upsert: true,
  });
}

async function findMatchCandidate(queueEntry) {
  const candidates = await MatchQueue.find({
    _id: { $ne: queueEntry._id },
    chatType: queueEntry.chatType,
    status: "waiting",
  })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  for (const candidate of candidates) {
    if (
      candidate.user &&
      queueEntry.user &&
      String(candidate.user) === String(queueEntry.user)
    ) {
      continue;
    }

    if (!passesDirectionalFilters(queueEntry, candidate)) {
      continue;
    }

    if (!passesDirectionalFilters(candidate, queueEntry)) {
      continue;
    }

    if (await isBlockedBetween(queueEntry, candidate)) {
      continue;
    }

    return candidate;
  }

  return null;
}

async function createSessionFromEntries(queueEntry, candidate) {
  const matchedInterests = getSharedInterests(queueEntry, candidate);
  const matchScore = computeMatchScore(queueEntry, candidate);

  const session = await ChatSession.create({
    matchedInterests,
    matchScore,
    participants: [queueEntry.user, candidate.user].filter(Boolean),
    roomId: getRoomId(),
    startedAt: new Date(),
    status: "active",
    type: queueEntry.chatType,
  });

  await MatchQueue.updateMany(
    { _id: { $in: [queueEntry._id, candidate._id] } },
    {
      $set: {
        matchedSession: session._id,
        status: "matched",
      },
    },
  );

  return ChatSession.findById(session._id).populate(
    "participants",
    "name avatar interests socketId",
  );
}

async function matchmake(queueEntry) {
  const candidate = await findMatchCandidate(queueEntry);

  if (!candidate) {
    return { queueEntry, session: null };
  }

  const lockedCandidate = await MatchQueue.findOneAndUpdate(
    { _id: candidate._id, status: "waiting" },
    { $set: { status: "matched" } },
    { new: true },
  );

  if (!lockedCandidate) {
    return { queueEntry, session: null };
  }

  const lockedSelf = await MatchQueue.findOneAndUpdate(
    { _id: queueEntry._id, status: "waiting" },
    { $set: { status: "matched" } },
    { new: true },
  );

  if (!lockedSelf) {
    await MatchQueue.updateOne(
      { _id: lockedCandidate._id },
      { $set: { status: "waiting" } },
    );
    return { queueEntry, session: null };
  }

  const session = await createSessionFromEntries(lockedSelf, lockedCandidate);
  return { queueEntry: lockedSelf, session };
}

async function createOrJoinQueue(options) {
  const payload = await buildQueueEntryPayload(options);
  const queueEntry = await upsertQueueEntry(payload);
  return matchmake(queueEntry);
}

async function getSessionById(sessionId) {
  return ChatSession.findById(sessionId).populate(
    "participants",
    "name avatar interests stats socketId",
  );
}

function isSessionParticipant(session, userId) {
  if (!session || !userId) {
    return false;
  }

  return (session.participants || []).some(
    (participant) => String(participant._id || participant) === String(userId),
  );
}

async function ensureSessionParticipant(sessionId, userId) {
  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error("Chat session not found.");
  }

  if (!isSessionParticipant(session, userId)) {
    throw new Error("You are not part of this chat session.");
  }

  return session;
}

async function createMessage({ content, senderId, sessionId, type = "text" }) {
  const session = await ensureSessionParticipant(sessionId, senderId);

  if (session.status !== "active") {
    throw new Error("This chat session is no longer active.");
  }

  const trimmedContent = String(content || "").trim();
  if (!trimmedContent) {
    throw new Error("Message content is required.");
  }

  const message = await Message.create({
    content: trimmedContent,
    sender: senderId,
    session: session._id,
    status: "delivered",
    type,
  });

  await Promise.all([
    ChatSession.updateOne(
      { _id: session._id },
      { $inc: { messageCount: 1 } },
    ),
    User.updateOne(
      { _id: senderId },
      { $inc: { "stats.totalMessages": 1 } },
    ),
  ]);

  return Message.findById(message._id);
}

async function markMessageAsRead({ messageId, readerId }) {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found.");
  }

  const session = await ensureSessionParticipant(message.session, readerId);
  const senderId = message.sender ? String(message.sender) : null;

  if (senderId && senderId === String(readerId)) {
    return message;
  }

  if (session.status !== "active") {
    return message;
  }

  message.status = "read";
  message.readAt = message.readAt || new Date();
  await message.save();

  return message;
}

function computeSessionDuration(session) {
  if (!session.startedAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
  );
}

async function finalizeSession(sessionId, { actorUserId, reason }) {
  const session = await getSessionById(sessionId);

  if (!session) {
    return null;
  }

  if (session.status === "ended" || session.status === "cancelled") {
    return session;
  }

  const duration = computeSessionDuration(session);
  session.status = "ended";
  session.endReason = reason;
  session.endedAt = new Date();
  session.duration = duration;
  session.endedBy = actorUserId || null;
  await session.save();

  const participantIds = (session.participants || [])
    .map((participant) => participant?._id || participant)
    .filter(Boolean);
  const actorId = actorUserId ? String(actorUserId) : null;
  const receiverIds = participantIds.filter(
    (participantId) => String(participantId) !== actorId,
  );

  const userUpdates = participantIds.map((participantId) => {
    const update = {
      $inc: {
        "stats.totalSessions": 1,
        "stats.totalTimeSpent": duration,
      },
    };

    if (actorId && String(participantId) === actorId && reason === "skip") {
      update.$inc["stats.skipsGiven"] = 1;
    }

    if (actorId && String(participantId) !== actorId && reason === "skip") {
      update.$inc["stats.skipsReceived"] = 1;
    }

    return User.updateOne({ _id: participantId }, update);
  });

  await Promise.all([
    ...userUpdates,
    MatchQueue.updateMany(
      { matchedSession: session._id },
      { $set: { status: "cancelled" } },
    ),
  ]);

  return session;
}

async function cancelWaitingQueue(socketId, userId) {
  const filter = userId
    ? {
        $or: [{ socketId }, { user: userId }],
        status: "waiting",
      }
    : { socketId, status: "waiting" };

  await MatchQueue.updateMany(filter, { $set: { status: "cancelled" } });
}

async function createReport({ description, reason, reporterId, sessionId }) {
  const session = await ensureSessionParticipant(sessionId, reporterId);
  const reported = (session.participants || []).find(
    (participant) => String(participant._id || participant) !== String(reporterId),
  );

  const report = await Report.create({
    description: description?.trim() || "",
    reason,
    reported: reported?._id || reported || null,
    reporter: reporterId,
    session: session._id,
    status: "pending",
  });

  if (reported?._id || reported) {
    await User.updateOne(
      { _id: reported._id || reported },
      { $inc: { reportCount: 1 } },
    );
  }

  return report;
}

async function createFriendRequest({ requesterId, sessionId }) {
  const session = await ensureSessionParticipant(sessionId, requesterId);
  const participantIds = (session.participants || [])
    .map((participant) => String(participant._id || participant))
    .filter(Boolean);

  if (participantIds.length !== 2) {
    throw new Error("Friend requests require two registered users.");
  }

  const recipientId = participantIds.find(
    (participantId) => participantId !== String(requesterId),
  );

  const existing = await Friend.findOne({
    $or: [
      { recipient: recipientId, requester: requesterId },
      { recipient: requesterId, requester: recipientId },
    ],
  });

  if (existing) {
    if (existing.status === "accepted") {
      return existing;
    }

    existing.requester = new mongoose.Types.ObjectId(requesterId);
    existing.recipient = new mongoose.Types.ObjectId(recipientId);
    existing.originSession = session._id;
    existing.respondedAt = null;
    existing.status = "pending";
    await existing.save();
    return existing;
  }

  return Friend.create({
    originSession: session._id,
    recipient: recipientId,
    requester: requesterId,
    status: "pending",
  });
}

async function respondToFriendRequest({ accepted, requestId, userId }) {
  const request = await Friend.findById(requestId);

  if (!request) {
    throw new Error("Friend request not found.");
  }

  if (String(request.recipient) !== String(userId)) {
    throw new Error("You cannot respond to this friend request.");
  }

  request.status = accepted ? "accepted" : "rejected";
  request.respondedAt = new Date();
  await request.save();

  return request;
}

module.exports = {
  cancelWaitingQueue,
  createFriendRequest,
  createMessage,
  createOrJoinQueue,
  createReport,
  ensureSessionParticipant,
  finalizeSession,
  getSessionById,
  markMessageAsRead,
  respondToFriendRequest,
  serializeMessage,
  serializeSession,
};
