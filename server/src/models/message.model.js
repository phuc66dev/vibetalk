const mongoose = require("mongoose");

/**
 * Message – từng tin nhắn trong một ChatSession
 *
 * Thiết kế tối ưu cho real-time:
 *  - index theo sessionId + createdAt để phân trang tin nhắn
 *  - hỗ trợ nhiều loại nội dung (text, image, gif, sticker, system)
 *  - lưu trạng thái delivered / read cho mỗi người nhận
 */
const MessageSchema = new mongoose.Schema(
  {
    // ── Liên kết phiên chat ───────────────────────────────────────────────
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    // ── Người gửi ─────────────────────────────────────────────────────────
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null nếu là guest
    },
    senderGuestId: { type: String, default: null }, // fingerprint/socket của guest

    // ── Nội dung ──────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["text", "image", "gif", "sticker", "audio", "system"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000, // giới hạn 4000 ký tự
    },
    mediaUrl: { type: String, default: null }, // URL ảnh / gif / audio
    metadata: {
      // dữ liệu phụ phụ thuộc loại tin nhắn
      // VD: { width, height } cho ảnh, { duration } cho audio
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Trạng thái ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: { type: Date, default: null }, // thời điểm đối phương đọc

    // ── Moderation ────────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false }, // soft delete
    isFlagged: { type: Boolean, default: false }, // bị gắn cờ cần review
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
MessageSchema.index({ session: 1, createdAt: 1 }); // phân trang tin nhắn của 1 session
MessageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
