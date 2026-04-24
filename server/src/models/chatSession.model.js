const mongoose = require("mongoose");

/**
 * ChatSession – mỗi "phòng chat" giữa 2 người xa lạ
 *
 * Vòng đời:
 *   waiting  → matched → active → ended
 *   waiting  → cancelled  (user thoát trước khi match)
 */
const ChatSessionSchema = new mongoose.Schema(
  {
    // ── Người tham gia ────────────────────────────────────────────────────
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // luôn có đúng 2 phần tử khi session matched

    // Cho phép guest chưa đăng ký (null = anonymous / guest)
    guestIds: [{ type: String }], // socket ID hoặc fingerprint của guest

    // ── Trạng thái phiên ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["waiting", "matched", "active", "ended", "cancelled"],
      default: "waiting",
      index: true,
    },

    // ── Loại chat ─────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["text", "video"],
      default: "text",
    },

    // ── Lý do kết thúc ────────────────────────────────────────────────────
    endReason: {
      type: String,
      enum: [
        "user_left",     // một trong hai tự thoát
        "skip",          // bị skip
        "reported",      // phiên bị đóng do báo cáo
        "timeout",       // không có hoạt động quá lâu
        "error",         // lỗi kỹ thuật
        null,
      ],
      default: null,
    },
    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // user nào kết thúc phiên

    // ── Thời lượng ────────────────────────────────────────────────────────
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // tính bằng giây

    // ── Matching metadata ─────────────────────────────────────────────────
    matchedInterests: [{ type: String }], // sở thích chung (nếu có)
    matchScore: { type: Number, default: 0 }, // điểm tương đồng (0–100)

    // ── Thống kê tin nhắn nhanh ───────────────────────────────────────────
    messageCount: { type: Number, default: 0 },

    // ── WebRTC (cho video chat) ───────────────────────────────────────────
    roomId: { type: String, unique: true, sparse: true }, // ID phòng WebRTC / Socket room
  },
  {
    timestamps: true,
  },
);

ChatSessionSchema.index({ participants: 1, status: 1 });
ChatSessionSchema.index({ createdAt: -1 }); // sắp xếp phiên mới nhất
ChatSessionSchema.index({ roomId: 1 });

const ChatSession = mongoose.model("ChatSession", ChatSessionSchema);
module.exports = ChatSession;
