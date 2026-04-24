# 🗺️ VibeTalk — Application Flowchart

> Toàn bộ luồng hoạt động của ứng dụng chat ngẫu nhiên VibeTalk

---

## 1. Tổng quan kiến trúc

```mermaid
graph TD
    CLIENT["🖥️ Client\nReact + TypeScript\nTailwind CSS"]
    SERVER["⚙️ Server\nExpress.js + Node.js"]
    DB["🗄️ MongoDB\n7 Collections"]
    SOCKET["⚡ Socket.IO\nRealtime layer"]
    CLOUD["☁️ Cloudinary\nAvatar storage"]
    MAIL["📧 Nodemailer\nEmail service"]
    GOOGLE["🔑 Google OAuth2\nPassport.js"]

    CLIENT -- "REST API" --> SERVER
    CLIENT -- "WebSocket" --> SOCKET
    SERVER --> DB
    SERVER --> CLOUD
    SERVER --> MAIL
    SERVER --> GOOGLE
    SOCKET --> SERVER
```

---

## 2. Luồng xác thực (Authentication)

```mermaid
flowchart TD
    START([Người dùng mở app]) --> CHECK{Có token\nhợp lệ?}

    CHECK -- "Có" --> HOME["🏠 Trang Home\n/HomePage"]
    CHECK -- "Không" --> LOGIN["🔐 Trang Đăng nhập\n/LoginPage"]

    LOGIN --> CHOICE{Phương thức\nđăng nhập}

    CHOICE -- "Email / Password" --> VALIDATE_L{Validate\nform}
    VALIDATE_L -- "Lỗi" --> SHOW_ERR_L["❌ Hiện lỗi\n(toast notification)"]
    SHOW_ERR_L --> LOGIN
    VALIDATE_L -- "Hợp lệ" --> API_LOGIN["POST /api/auth/login"]
    API_LOGIN --> CHECK_USER{User tồn tại\n& pass đúng?}
    CHECK_USER -- "Không" --> SHOW_ERR_L
    CHECK_USER -- "Có" --> GEN_TOKEN["Tạo accessToken + refreshToken\n(JWT)"]
    GEN_TOKEN --> HOME

    CHOICE -- "Google OAuth2" --> GOOGLE["GET /api/auth/google\n(Passport.js redirect)"]
    GOOGLE --> GOOGLE_CB["GET /api/auth/google/callback"]
    GOOGLE_CB --> FIND_USER{User đã có\nGoogleId?}
    FIND_USER -- "Không" --> CREATE_USER["Tạo User mới\n(googleId)"]
    FIND_USER -- "Có" --> GEN_TOKEN
    CREATE_USER --> GEN_TOKEN

    CHOICE -- "Chưa có tài khoản" --> REGISTER["📝 Trang Đăng ký\n/RegisterPage"]
    REGISTER --> VALIDATE_R{Validate\nform}
    VALIDATE_R -- "Lỗi" --> SHOW_ERR_R["❌ Hiện lỗi"]
    SHOW_ERR_R --> REGISTER
    VALIDATE_R -- "Hợp lệ" --> API_REGISTER["POST /api/auth/register"]
    API_REGISTER --> CHECK_EMAIL{Email\nđã tồn tại?}
    CHECK_EMAIL -- "Có" --> SHOW_ERR_R
    CHECK_EMAIL -- "Không" --> HASH["Hash password\n(bcrypt salt=10)"]
    HASH --> SAVE_USER["Lưu User vào DB"]
    SAVE_USER --> LOGIN

    HOME --> LOGOUT["POST /api/auth/logout\nClear refreshToken cookie"]
    LOGOUT --> LOGIN
```

---

## 3. Luồng quên mật khẩu (Password Reset)

```mermaid
flowchart TD
    A["Nhấn 'Quên mật khẩu'"] --> B["Nhập email"]
    B --> C["POST /api/auth/forgot-password"]
    C --> D{Email tồn tại\ntrong DB?}
    D -- "Không" --> E["❌ 404 Not Found"]
    D -- "Có" --> F["Tạo reset token\n(JWT ngắn hạn)"]
    F --> G["📧 Gửi email\nreset link qua Nodemailer"]
    G --> H["User kiểm tra email\nvà click link"]
    H --> I["POST /api/auth/reset-password\n?token=..."]
    I --> J{Token còn\nhiệu lực?}
    J -- "Hết hạn / sai" --> K["❌ 403 Forbidden"]
    J -- "Hợp lệ" --> L["Hash mật khẩu mới\n(bcrypt)"]
    L --> M["Lưu vào DB"]
    M --> N["✅ Reset thành công\n→ Về trang Login"]
```

---

## 4. Luồng Random Chat (Core Feature)

```mermaid
flowchart TD
    HOME["🏠 HomePage"] --> START_BTN["Nhấn 'Start Chatting'"]
    START_BTN --> EMIT_JOIN["⚡ Socket emit: join_queue\n{ chatType, filters, interests }"]

    EMIT_JOIN --> CREATE_QUEUE["Tạo MatchQueue entry\nstatus: waiting"]

    subgraph MATCHING ["🔄 Matching Service (Server)"]
        CREATE_QUEUE --> SCAN["Quét queue:\nstatus=waiting, chatType phù hợp"]
        SCAN --> FILTER["Lọc:\n- Loại bỏ cặp đã Block nhau\n- Áp dụng genderFilter, ageFilter\n- Tính match score theo interests"]
        FILTER --> FOUND{Tìm được\ncặp?}
        FOUND -- "Chưa" --> WAIT["Chờ...\n(TTL: 5 phút tự hủy)"]
        WAIT --> SCAN
        FOUND -- "Có" --> CREATE_SESSION["Tạo ChatSession\nstatus: matched → active\n+ roomId unique"]
        CREATE_SESSION --> UPDATE_QUEUE["Cập nhật 2 MatchQueue\nstatus: matched"]
    end

    UPDATE_QUEUE --> EMIT_MATCHED["⚡ Socket emit: matched\n→ cả 2 socketId"]
    EMIT_MATCHED --> CHAT_PAGE["💬 ChatPage\n(active session)"]

    subgraph CHAT ["💬 Chat realtime"]
        CHAT_PAGE --> TYPE["User gõ tin nhắn"]
        TYPE --> TYPING_EVT["⚡ emit: typing_start / typing_stop"]
        TYPING_EVT --> SHOW_DOTS["Hiện dấu ... (strangerTyping)"]

        CHAT_PAGE --> SEND_MSG["Gửi tin nhắn\n(Enter / nút Send)"]
        SEND_MSG --> EMIT_MSG["⚡ emit: send_message\n{ content, type }"]
        EMIT_MSG --> SAVE_MSG["Lưu Message vào DB\nstatus: sent → delivered"]
        SAVE_MSG --> BROADCAST["⚡ broadcast tới người còn lại\n(trong roomId)"]
        BROADCAST --> SHOW_MSG["Hiện tin nhắn\n+ cập nhật status: read"]
    end

    CHAT_PAGE --> DECISION{User\nquyết định}

    DECISION -- "Skip / Thoát" --> EMIT_SKIP["⚡ emit: skip / leave_room"]
    EMIT_SKIP --> END_SESSION_SKIP["Cập nhật ChatSession:\nstatus: ended\nendReason: skip / user_left\nduration: N giây"]
    END_SESSION_SKIP --> UPDATE_STATS["Cập nhật User.stats:\nskipsGiven++, totalSessions++, totalTimeSpent+N"]
    UPDATE_STATS --> DISCONNECTED["❌ DisconnectedPage"]
    DISCONNECTED --> FIND_NEW["Nhấn 'Find new chat'"]
    FIND_NEW --> START_BTN

    DECISION -- "Báo cáo" --> REPORT_MODAL["📋 Report Modal\n(chọn lý do)"]
    REPORT_MODAL --> CREATE_REPORT["Tạo Report\nstatus: pending"]
    CREATE_REPORT --> END_SESSION_REPORT["Kết thúc session\nendReason: reported"]
    END_SESSION_REPORT --> DISCONNECTED

    DECISION -- "Kết bạn" --> FRIEND_REQ["Gửi lời mời kết bạn\n(Friend: pending)"]
    FRIEND_REQ --> NOTIFY_OTHER["⚡ emit: friend_request\nđến đối phương"]
    NOTIFY_OTHER --> ACCEPT{Đối phương\nchấp nhận?}
    ACCEPT -- "Có" --> UPDATE_FRIEND["Friend: accepted\n→ Chat riêng tư được phép"]
    ACCEPT -- "Không" --> FRIEND_REJECTED["Friend: rejected"]
```

---

## 5. Luồng quản lý Profile

```mermaid
flowchart TD
    NAV["Bottom Navigation"] --> PROFILE_PAGE["👤 ProfilePage"]
    PROFILE_PAGE --> VIEW_INFO["Xem thông tin:\nTên, avatar, bio, stats"]

    VIEW_INFO --> EDIT_BTN["Nhấn 'Edit Profile'"]
    EDIT_BTN --> EDIT_PAGE["✏️ EditProfilePage"]

    EDIT_PAGE --> UPLOAD_AVT["Upload ảnh đại diện\n(multipart/form-data)"]
    UPLOAD_AVT --> MULTER["Multer lưu file tạm\nvào /uploads"]
    MULTER --> CLOUDINARY["Upload lên Cloudinary\n/user_avatars"]
    CLOUDINARY --> DEL_TEMP["Xoá file tạm (fs.unlink)"]
    DEL_TEMP --> AVATAR_URL["Nhận secure_url\ntừ Cloudinary"]

    EDIT_PAGE --> UPDATE_FIELDS["Cập nhật:\nbio, phone, dateOfBirth,\ngender, interests"]
    UPDATE_FIELDS --> API_UPDATE["PUT /api/auth/update-profile\n(protectRoute middleware)"]
    AVATAR_URL --> API_UPDATE
    API_UPDATE --> SAVE_DB["Lưu vào MongoDB\nusers collection"]
    SAVE_DB --> SUCCESS["✅ Cập nhật thành công\n(toast notification)"]

    VIEW_INFO --> SETTINGS_BTN["Nhấn 'Settings'"]
    SETTINGS_BTN --> SETTINGS_PAGE["⚙️ SettingsPage"]
    SETTINGS_PAGE --> MATCH_PREF["Cài đặt matching:\ngenderFilter, ageMin/Max,\nlanguageFilter, interestMatching"]
    MATCH_PREF --> SAVE_PREF["Lưu matchPreferences\nvào User.matchPreferences"]
```

---

## 6. Luồng Token Refresh

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    C->>S: Request API (accessToken hết hạn)
    S-->>C: 401 Unauthorized

    C->>S: POST /api/auth/refresh-token\n(refreshToken trong cookie httpOnly)
    S->>DB: Verify refreshToken + tìm User
    DB-->>S: User data

    alt Token hợp lệ
        S-->>C: { accessToken: newToken }
        C->>S: Retry request gốc (token mới)
        S-->>C: 200 OK + data
    else Token hết hạn / không hợp lệ
        S-->>C: 403 Forbidden
        C->>C: Xoá auth state\nChuyển về LoginPage
    end
```

---

## 7. Luồng Moderation (Admin / Moderator)

```mermaid
flowchart TD
    REPORT_CREATED["📋 Report mới\nstatus: pending"] --> ADMIN_PANEL["🛡️ Admin Panel\n(role: moderator / admin)"]

    ADMIN_PANEL --> REVIEW["Xem chi tiết report:\n- Lý do\n- Mô tả\n- Evidence URLs\n- Lịch sử của reported user"]

    REVIEW --> DECISION{Kết luận}

    DECISION -- "Vi phạm" --> BAN_OPTIONS{Loại ban}
    BAN_OPTIONS -- "Tạm thời" --> TEMP_BAN["isBanned: true\nbanExpiresAt: Date\nbanReason: ..."]
    BAN_OPTIONS -- "Vĩnh viễn" --> PERM_BAN["isBanned: true\nbanExpiresAt: null"]
    TEMP_BAN --> RES_REPORT
    PERM_BAN --> RES_REPORT

    DECISION -- "Không vi phạm" --> DISMISS["Report: dismissed\nresolution: ghi chú"]
    DISMISS --> RES_REPORT

    RES_REPORT["Cập nhật Report:\nstatus: resolved\nresolvedBy: moderatorId\nresolvedAt: now"]
    RES_REPORT --> END([Hoàn tất])

    subgraph BAN_EFFECT ["Hiệu lực Ban"]
        TEMP_BAN & PERM_BAN --> MATCH_BLOCK["Matching service từ chối\nen-queue nếu isBanned=true"]
        MATCH_BLOCK --> LOGIN_BLOCK["Chặn login:\nRoute Guard kiểm tra isBanned"]
    end
```

---

## 8. Socket.IO Event Map

```mermaid
graph LR
    subgraph CLIENT_EMIT ["📤 Client emit"]
        CE1["join_queue\n{ chatType, filters, interests }"]
        CE2["leave_queue"]
        CE3["send_message\n{ sessionId, content, type }"]
        CE4["typing_start / typing_stop\n{ sessionId }"]
        CE5["skip\n{ sessionId }"]
        CE6["leave_room\n{ sessionId }"]
        CE7["friend_request\n{ sessionId, recipientId }"]
        CE8["read_message\n{ messageId }"]
    end

    subgraph SERVER_EMIT ["📨 Server emit"]
        SE1["matched\n{ session, roomId, stranger }"]
        SE2["queue_timeout\n{ reason: 'no_match' }"]
        SE3["new_message\n{ message }"]
        SE4["stranger_typing\n{ isTyping }"]
        SE5["stranger_left\n{ endReason }"]
        SE6["friend_request_received\n{ from, sessionId }"]
        SE7["message_read\n{ messageId, readAt }"]
    end

    CE1 -.->|matching engine| SE1
    CE1 -.->|timeout| SE2
    CE3 -.->|broadcast| SE3
    CE4 -.->|forward| SE4
    CE5 & CE6 -.->|notify other| SE5
    CE7 -.->|forward| SE6
    CE8 -.->|confirm| SE7
```

---

## 9. Page Navigation Map

```mermaid
graph LR
    GUEST([Guest / User]) --> LOGIN["/login\n🔐 LoginPage"]
    GUEST --> REGISTER["/register\n📝 RegisterPage"]

    LOGIN --> HOME["/\n🏠 HomePage"]
    REGISTER --> LOGIN

    HOME --> CHAT["(modal overlay)\n💬 ChatPage"]
    HOME --> PROFILE["/profile\n👤 ProfilePage"]
    HOME --> SETTINGS["/settings\n⚙️ SettingsPage"]

    PROFILE --> EDIT["/profile/edit\n✏️ EditProfilePage"]
    EDIT --> PROFILE

    CHAT --> DISCONNECTED["(modal overlay)\n❌ DisconnectedPage"]
    DISCONNECTED --> HOME
    DISCONNECTED --> CHAT

    style HOME fill:#7f2ccb,color:#fff
    style CHAT fill:#5b21b6,color:#fff
    style DISCONNECTED fill:#3b0764,color:#fff
```

---

## 10. Database Write Sequence (1 phiên chat đầy đủ)

```mermaid
sequenceDiagram
    participant U1 as User A
    participant SRV as Server
    participant DB as MongoDB
    participant U2 as User B

    U1->>SRV: join_queue (socket)
    SRV->>DB: INSERT MatchQueue { user: A, status: waiting }

    U2->>SRV: join_queue (socket)
    SRV->>DB: INSERT MatchQueue { user: B, status: waiting }

    SRV->>DB: QUERY matching entries
    SRV->>DB: INSERT ChatSession { participants:[A,B], status: active }
    SRV->>DB: UPDATE MatchQueue A,B → status: matched

    SRV-->>U1: emit matched { roomId, session }
    SRV-->>U2: emit matched { roomId, session }

    U1->>SRV: send_message "Hi!"
    SRV->>DB: INSERT Message { session, sender:A, content:"Hi!", status: sent }
    SRV-->>U2: emit new_message

    U2->>SRV: read_message
    SRV->>DB: UPDATE Message → status: read, readAt: now
    SRV-->>U1: emit message_read

    U2->>SRV: skip (socket)
    SRV->>DB: UPDATE ChatSession → status: ended, endReason: skip, duration: Xs
    SRV->>DB: UPDATE User A.stats.skipsReceived++
    SRV->>DB: UPDATE User B.stats.skipsGiven++
    SRV-->>U1: emit stranger_left { endReason: skip }
```
