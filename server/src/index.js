require("dotenv").config();
// Import các thư viện cần thiết
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const passport = require("./config/passport");
const route = require("./routes/index");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error.middleware");
// Load biến môi trường từ file .env

// Khởi tạo ứng dụng Express
const app = express();

// Cấu hình danh sách các domain được phép truy cập
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN_RENDER, // Production
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép các request không có origin (như Postman hoặc mobile apps)
      // hoặc origin nằm trong danh sách allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Bắt buộc phải có để gửi/nhận cookie (Session)
  }),
);

// Middleware
app.use(express.json()); // để parse body JSON
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV !== "development", // false trên localhost
      httpOnly: true,
      sameSite: "", // lax để Google redirect hoạt động (strict chặn redirect)
      maxAge: 10 * 60 * 1000, // 10 phút (chỉ dùng trong OAuth flow)
    },
  }),
);
/* OAuth Middleware */
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình route
route(app);

// Error handler
app.use(errorHandler);

// Cấu hình cổng
const PORT = process.env.PORT || 5001;

// Kết nối MongoDB
connectDB();

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
