const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ── Thông tin cơ bản ─────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false }, // ẩn khi query bình thường
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    avatar: { type: String, default: "" },
    description: { type: String, maxlength: 300 },

    // ── OAuth ─────────────────────────────────────────────────────────────
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },

    // ── Sở thích (dùng để matching) ───────────────────────────────────────
    interests: [{ type: String, lowercase: true, trim: true }], // VD: ["gaming", "music", "travel"]

    // ── Cài đặt tìm kiếm ngẫu nhiên ──────────────────────────────────────
    matchPreferences: {
      genderFilter: {
        type: String,
        enum: ["any", "male", "female", "other"],
        default: "any",
      },
      ageMin: { type: Number, default: 18, min: 13, max: 99 },
      ageMax: { type: Number, default: 99, min: 13, max: 99 },
      languageFilter: { type: String, default: "any" }, // "any" | mã ngôn ngữ ISO 639-1
      interestMatching: { type: Boolean, default: true }, // ưu tiên người có chung sở thích
    },

    // ── Ngôn ngữ ──────────────────────────────────────────────────────────
    language: { type: String, default: "vi" }, // ngôn ngữ giao diện

    // ── Trạng thái online ─────────────────────────────────────────────────
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String, default: null }, // Socket.IO session hiện tại

    // ── Hệ thống ban / report ─────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    isBanned: { type: Boolean, default: false },
    banExpiresAt: { type: Date, default: null }, // null = cấm vĩnh viễn
    banReason: { type: String, default: null },
    reportCount: { type: Number, default: 0 }, // tổng số lần bị báo cáo

    // ── Thống kê chat ─────────────────────────────────────────────────────
    stats: {
      totalSessions: { type: Number, default: 0 },   // tổng số phiên chat
      totalMessages: { type: Number, default: 0 },   // tổng tin nhắn đã gửi
      totalTimeSpent: { type: Number, default: 0 },  // tổng thời gian chat (giây)
      skipsGiven: { type: Number, default: 0 },      // số lần tự skip người khác
      skipsReceived: { type: Number, default: 0 },   // số lần bị người khác skip
      likesReceived: { type: Number, default: 0 },   // số lần được like/upvote
    },

    // ── Trạng thái tài khoản ─────────────────────────────────────────────
    isVerified: { type: Boolean, default: false }, // xác thực email
    isActive: { type: Boolean, default: true },    // tài khoản còn hoạt động
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ isOnline: 1, isBanned: 1 }); // tìm user online chưa bị ban
UserSchema.index({ interests: 1 });             // matching theo sở thích
UserSchema.index({ socketId: 1 });              // tra cứu nhanh theo socket

// ── Virtual: age ─────────────────────────────────────────────────────────────
UserSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
