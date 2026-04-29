require("dotenv").config();
const express = require("express");
const cors = require("cors");

const passport = require("./config/passport");
const route = require("./routes/index");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN_RENDER,
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
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);
app.use(passport.initialize());

route(app);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

connectDB();

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
