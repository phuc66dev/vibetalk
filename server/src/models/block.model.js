const mongoose = require("mongoose");

/**
 * Block – danh sách chặn giữa các user đã đăng ký
 *
 * Khi A chặn B:
 *  - Matching service không ghép A & B vào cùng phiên
 *  - B không thể tìm / nhắn tin cho A
 */
const BlockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, maxlength: 300, default: null }, // tuỳ chọn
  },
  {
    timestamps: true,
  },
);

// Đảm bảo mỗi cặp (blocker, blocked) chỉ tồn tại một lần
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
BlockSchema.index({ blocked: 1 }); // tra cứu "user này bị ai chặn"

const Block = mongoose.model("Block", BlockSchema);
module.exports = Block;
