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

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json()); // để parse body JSON
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV !== "development", // false trên localhost
      httpOnly: true,
      sameSite: "lax", // lax để Google redirect hoạt động (strict chặn redirect)
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
