# 🗄️ VibeTalk — Database Design

> Stack: **MongoDB** (Mongoose) · Kiến trúc chat ngẫu nhiên kiểu Omegle / Azar

---

## Collections Overview

| Collection | File | Mục đích |
|---|---|---|
| `users` | `user.model.js` | Tài khoản người dùng (đăng ký + guest) |
| `chatsessions` | `chatSession.model.js` | Mỗi phiên chat 1-1 |
| `messages` | `message.model.js` | Từng tin nhắn trong phiên |
| `matchqueues` | `matchQueue.model.js` | Hàng đợi ghép đôi ngẫu nhiên |
| `reports` | `report.model.js` | Báo cáo vi phạm |
| `blocks` | `block.model.js` | Danh sách chặn (tránh re-match) |
| `friends` | `friend.model.js` | Kết bạn sau khi chat xong |

---

## Data Flow

```
User nhấn "Tìm Người Lạ"
        │
        ▼
  [MatchQueue] status: waiting
        │
        ▼ Matching Service quét queue
        │
   ┌────┴─────────────────────┐
   │ Chưa tìm được            │ Ghép được
   ▼                          ▼
Chờ... (TTL 5 phút)    [ChatSession] status: matched → active
                               │
                               ▼
                     Realtime Messages (Socket.IO)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                  Skip      Kết bạn    Báo cáo
                    │          │          │
                    ▼          ▼          ▼
              session:      [Friend]   [Report]
               ended       pending     pending
```

---

## Chi tiết Schema

### 1. `users`

```js
{
  // Thông tin cơ bản
  name:          String (required)
  email:         String (required, unique)
  password:      String (select: false)
  phone:         String
  dateOfBirth:   Date
  gender:        Enum ["male", "female", "other", "prefer_not_to_say"]
  avatar:        String
  description:   String (max 300)

  // OAuth
  googleId:      String (sparse index)

  // Sở thích — dùng để tính match score
  interests:     String[]   // VD: ["gaming", "k-pop", "travel"]

  // Bộ lọc matching
  matchPreferences: {
    genderFilter:       Enum ["any", "male", "female", "other"]
    ageMin:             Number (default: 18)
    ageMax:             Number (default: 99)
    languageFilter:     String (default: "any")
    interestMatching:   Boolean (default: true)
  }

  language:      String (default: "vi")

  // Trạng thái realtime
  isOnline:      Boolean
  lastSeen:      Date
  socketId:      String     // Socket.IO session hiện tại

  // Hệ thống phân quyền & ban
  role:          Enum ["user", "moderator", "admin"]
  isBanned:      Boolean
  banExpiresAt:  Date       // null = cấm vĩnh viễn
  banReason:     String
  reportCount:   Number

  // Thống kê
  stats: {
    totalSessions:   Number  // tổng số phiên chat
    totalMessages:   Number  // tổng tin nhắn đã gửi
    totalTimeSpent:  Number  // tổng thời gian chat (giây)
    skipsGiven:      Number  // số lần tự skip
    skipsReceived:   Number  // số lần bị skip
    likesReceived:   Number  // số lần được like
  }

  isVerified:    Boolean
  isActive:      Boolean
  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ isOnline, isBanned }` · `{ interests }` · `{ socketId }`

---

### 2. `chatsessions`

```js
{
  // Người tham gia (null-safe cho guest)
  participants:     ObjectId[] → User   // đúng 2 phần tử
  guestIds:         String[]            // socket ID / fingerprint của guest

  // Vòng đời phiên: waiting → matched → active → ended | cancelled
  status:           Enum ["waiting", "matched", "active", "ended", "cancelled"]
  type:             Enum ["text", "video"]

  // Kết thúc
  endReason:        Enum ["user_left", "skip", "reported", "timeout", "error"]
  endedBy:          ObjectId → User

  // Thời lượng
  startedAt:        Date
  endedAt:          Date
  duration:         Number   // giây

  // Matching metadata
  matchedInterests: String[] // sở thích chung
  matchScore:       Number   // điểm tương đồng (0–100)

  messageCount:     Number

  // WebRTC / Socket room
  roomId:           String (unique, sparse)

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ participants, status }` · `{ roomId }` · `{ createdAt: -1 }`

---

### 3. `messages`

```js
{
  session:         ObjectId → ChatSession (required)

  // Người gửi (null-safe cho guest)
  sender:          ObjectId → User | null
  senderGuestId:   String | null

  // Nội dung
  type:            Enum ["text", "image", "gif", "sticker", "audio", "system"]
  content:         String (max 4000 ký tự)
  mediaUrl:        String | null   // URL ảnh / gif / audio
  metadata:        Mixed | null    // { width, height } cho ảnh, { duration } cho audio, v.v.

  // Trạng thái đọc
  status:          Enum ["sent", "delivered", "read"]
  readAt:          Date | null

  // Moderation
  isDeleted:       Boolean   // soft delete
  isFlagged:       Boolean   // gắn cờ cần review

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ session, createdAt }` · `{ sender }`

---

### 4. `matchqueues`

```js
{
  // Ai đang chờ
  user:          ObjectId → User | null
  guestId:       String | null
  socketId:      String (required)   // để notify kết quả

  chatType:      Enum ["text", "video"]

  // Bộ lọc
  filters: {
    genderFilter:     Enum ["any", "male", "female", "other"]
    ageMin:           Number
    ageMax:           Number
    languageFilter:   String
    interestMatching: Boolean
  }
  interests:     String[]   // để tính match score

  // Snapshot nhanh (tránh join)
  gender:        String
  age:           Number | null
  language:      String

  // Trạng thái
  status:        Enum ["waiting", "matched", "cancelled"]
  matchedSession: ObjectId → ChatSession | null

  skipCount:     Number

  // TTL: MongoDB tự xoá sau 5 phút nếu không match
  expiresAt:     Date  ← TTL Index (expireAfterSeconds: 0)

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ status, chatType, createdAt }` · `{ socketId }` · TTL on `expiresAt`

---

### 5. `reports`

```js
{
  // Người báo cáo (null-safe cho guest)
  reporter:          ObjectId → User | null
  reporterGuestId:   String | null

  // Người bị báo cáo (null-safe cho guest)
  reported:          ObjectId → User | null
  reportedGuestId:   String | null

  session:           ObjectId → ChatSession | null

  // Lý do
  reason:            Enum ["spam", "harassment", "hate_speech", "nudity",
                           "violence", "underage", "scam", "other"]
  description:       String (max 1000)
  evidenceUrls:      String[]   // ảnh chụp màn hình

  // Moderation workflow: pending → reviewing → resolved | dismissed
  status:            Enum ["pending", "reviewing", "resolved", "dismissed"]
  resolvedBy:        ObjectId → User | null   // moderator / admin
  resolution:        String | null
  resolvedAt:        Date | null

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ reported, status }` · `{ createdAt: -1 }`

---

### 6. `blocks`

```js
{
  blocker:   ObjectId → User (required)
  blocked:   ObjectId → User (required)
  reason:    String (max 300) | null

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ blocker, blocked }` UNIQUE · `{ blocked }`

> Matching service kiểm tra Block trước khi ghép đôi — A chặn B thì không bao giờ bị ghép cùng nhau.

---

### 7. `friends`

```js
{
  requester:      ObjectId → User (required)
  recipient:      ObjectId → User (required)
  originSession:  ObjectId → ChatSession | null   // phiên nơi họ gặp nhau

  // Vòng đời: pending → accepted | rejected | cancelled
  status:         Enum ["pending", "accepted", "rejected", "cancelled"]
  respondedAt:    Date | null

  createdAt, updatedAt (timestamps)
}
```

**Indexes:** `{ requester, recipient }` UNIQUE · `{ recipient, status }`

---

## Index Summary

| Collection | Index | Mục đích |
|---|---|---|
| `users` | `{ isOnline, isBanned }` | Tìm user online chưa bị ban |
| `users` | `{ interests }` | Matching theo sở thích |
| `users` | `{ socketId }` | Tra cứu nhanh theo socket |
| `chatsessions` | `{ participants, status }` | Phiên đang active của user |
| `chatsessions` | `{ roomId }` | Tra cứu phòng WebRTC |
| `messages` | `{ session, createdAt }` | Phân trang tin nhắn |
| `matchqueues` | `{ status, chatType, createdAt }` | Matching chính |
| `matchqueues` | `expiresAt` | TTL auto-delete |
| `reports` | `{ reported, status }` | Lịch sử báo cáo của 1 user |
| `blocks` | `{ blocker, blocked }` UNIQUE | Ngăn chặn re-match |
| `friends` | `{ requester, recipient }` UNIQUE | Quan hệ kết bạn |

---

## Matching Algorithm

```
1. Lấy tất cả entries với status=waiting và chatType phù hợp
2. Loại bỏ cặp có quan hệ Block với nhau
3. Tính match score cho mỗi cặp:
   - Mỗi sở thích chung       → +10 điểm
   - Cùng ngôn ngữ            → +20 điểm
   - Trong khoảng tuổi lọc    → +10 điểm
   - Cùng gender filter       → +5 điểm
4. Ghép cặp có điểm cao nhất
5. Tạo ChatSession, cập nhật status=matched cho 2 entries
6. Emit socket event đến cả 2 socketId
```

---

## Scaling Notes

- **MatchQueue → Redis**: Khi user tăng lên, chuyển queue sang Redis (in-memory LPOS/ZADD) để matching sub-millisecond. MongoDB TTL vẫn giữ để audit.
- **Message Archiving**: `messages` sẽ tăng trưởng nhanh nhất. Archive messages >30 ngày sang cold storage (S3 + Athena).
- **Socket Cleanup**: `socketId` trong `User` và `MatchQueue` phải được **clear ngay** khi socket disconnect để tránh gửi event đến socket cũ.
- **Sharding Key**: Nếu sharding `messages`, dùng `{ session: 1 }` để đảm bảo tin nhắn cùng phiên nằm trên cùng shard.
