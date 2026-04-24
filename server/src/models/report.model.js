const mongoose = require("mongoose");

/**
 * Report – báo cáo vi phạm từ user này đến user kia trong một phiên chat
 *
 * Được dùng bởi moderator để review và quyết định hành động.
 */
const ReportSchema = new mongoose.Schema(
  {
    // ── Người báo cáo ─────────────────────────────────────────────────────
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null nếu là guest
    },
    reporterGuestId: { type: String, default: null },

    // ── Người bị báo cáo ─────────────────────────────────────────────────
    reported: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null nếu là guest
    },
    reportedGuestId: { type: String, default: null },

    // ── Phiên chat liên quan ──────────────────────────────────────────────
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      default: null,
    },

    // ── Lý do báo cáo ─────────────────────────────────────────────────────
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "nudity",
        "violence",
        "underage",
        "scam",
        "other",
      ],
      required: true,
    },
    description: { type: String, maxlength: 1000 }, // mô tả thêm của người báo cáo

    // ── Bằng chứng ────────────────────────────────────────────────────────
    evidenceUrls: [{ type: String }], // ảnh chụp màn hình, v.v.

    // ── Xử lý ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // moderator / admin xử lý
    resolution: { type: String, default: null },  // ghi chú kết quả xử lý
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

ReportSchema.index({ reported: 1, status: 1 });
ReportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", ReportSchema);
module.exports = Report;
