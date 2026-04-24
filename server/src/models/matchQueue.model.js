const mongoose = require("mongoose");

/**
 * MatchQueue – hàng đợi matching ngẫu nhiên
 *
 * Khi user nhấn "Tìm người lạ", một entry được tạo tại đây.
 * Matching service sẽ quét queue và ghép đôi 2 entry phù hợp,
 * sau đó tạo ChatSession và xoá (hoặc đánh dấu matched) cả 2 entry.
 */
const MatchQueueSchema = new mongoose.Schema(
  {
    // ── Người đang tìm kiếm ───────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = guest chưa đăng ký
    },
    guestId: { type: String, default: null }, // socket ID / fingerprint
    socketId: { type: String, required: true }, // socket hiện tại để notify kết quả

    // ── Yêu cầu loại chat ─────────────────────────────────────────────────
    chatType: {
      type: String,
      enum: ["text", "video"],
      default: "text",
    },

    // ── Bộ lọc matching ───────────────────────────────────────────────────
    filters: {
      genderFilter: { type: String, enum: ["any", "male", "female", "other"], default: "any" },
      ageMin: { type: Number, default: 13 },
      ageMax: { type: Number, default: 99 },
      languageFilter: { type: String, default: "any" },
      interestMatching: { type: Boolean, default: true },
    },
    interests: [{ type: String }], // interests của user để tính match score

    // ── Thông tin user nhanh (tránh join) ────────────────────────────────
    gender: { type: String, default: "prefer_not_to_say" },
    age: { type: Number, default: null },
    language: { type: String, default: "vi" },

    // ── Trạng thái ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["waiting", "matched", "cancelled"],
      default: "waiting",
      index: true,
    },
    matchedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      default: null,
    }, // được điền khi ghép đôi thành công

    // ── Số lần bị skip trước khi matched (UX insight) ────────────────────
    skipCount: { type: Number, default: 0 },

    // ── TTL: tự động xoá entry sau 5 phút nếu không match ────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
MatchQueueSchema.index({ status: 1, chatType: 1, createdAt: 1 }); // matching chính
MatchQueueSchema.index({ socketId: 1 });                           // tra cứu nhanh

const MatchQueue = mongoose.model("MatchQueue", MatchQueueSchema);
module.exports = MatchQueue;
