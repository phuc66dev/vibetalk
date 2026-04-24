const mongoose = require("mongoose");

/**
 * Friend – kết bạn sau khi hoàn thành một phiên chat thành công
 *
 * Sau khi 2 người chat xong, một trong hai có thể gửi lời mời kết bạn.
 * Nếu chấp nhận, họ có thể chat riêng với nhau mà không cần ghép ngẫu nhiên.
 *
 * Trạng thái: pending → accepted | rejected | cancelled
 */
const FriendSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Phiên chat nơi họ gặp nhau (optional, để hiển thị context)
    originSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    respondedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Đảm bảo mỗi cặp chỉ tồn tại một lần (bất kể chiều)
FriendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
FriendSchema.index({ recipient: 1, status: 1 }); // lấy danh sách lời mời nhận được

const Friend = mongoose.model("Friend", FriendSchema);
module.exports = Friend;
