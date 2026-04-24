const jwt = require("jsonwebtoken");

const generateAccessToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // false trên localhost
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 phút (khớp với expiresIn JWT)
  });

  return token;
};

const generateRefreshToken = (userId, res) => {
  const freshToken = jwt.sign({ userId }, process.env.JWT_REFRESHTOKEN, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", freshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
