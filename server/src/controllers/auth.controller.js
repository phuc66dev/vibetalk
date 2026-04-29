const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const userService = require("../services/auth.service");

const cloudinary = require("../config/cloudinary");

const { sendResetPasswordEmail } = require("../utils/mailer");
const ERROR_CODE = require("../utils/errorCodes");
const { responseSuccess } = require("../utils/response");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const AppError = require("../utils/AppError");
const { getBearerToken } = require("../middlewares/auth.middleware");

const getFrontendOrigin = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.FRONTEND_ORIGIN_RENDER || process.env.FRONTEND_ORIGIN;
  }

  return process.env.FRONTEND_ORIGIN || process.env.FRONTEND_ORIGIN_RENDER;
};

const buildAuthPayload = (user) => ({
  accessToken: generateAccessToken(user._id),
  refreshToken: generateRefreshToken(user._id),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  },
});

const oauth2Login = async (req, res, next) => {
  const user = req.user;
  try {
    const { accessToken, refreshToken } = buildAuthPayload(user);
    const redirectHash = new URLSearchParams({
      accessToken,
      refreshToken,
    }).toString();

    res.redirect(
      `${getFrontendOrigin()}/login?oauth_success=true#${redirectHash}`,
    );
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExisted = await userService.findByEmail(email);

    if (userExisted)
      return next(
        new AppError("Email already exists.", 400, { code: "EMAIL_EXIST" }),
      );

    const salt = await bcrypt.genSalt(10);
    const hassedPassword = await bcrypt.hash(password, salt);

    const newUser = await userService.createUser({
      name,
      email,
      password: hassedPassword,
      role,
    });

    if (newUser) {
      responseSuccess(
        res,
        "Register successfully",
        {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
        201,
      );
    } else {
      next(AppError.template(ERROR_CODE.BAD_REQUEST));
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userService.findByEmailWithPassword(email);

    if (!user) return next(AppError.template(ERROR_CODE.NOT_FOUND));

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return next(
        new AppError("Invalid cretendials.", 400, {
          code: "PASSWORD_NOT_CORRECT",
        }),
      );

    responseSuccess(res, "Login successfully", buildAuthPayload(user), 200);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    responseSuccess(res, "Logged out successfully.", null, 200);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { description, phone, dateOfBirth, gender, address } = req.body || {};

  const avatarFile = req.file;

  try {
    if (
      !avatarFile &&
      !description &&
      !phone &&
      !dateOfBirth &&
      !gender &&
      !address
    )
      return next(
        new AppError("No fields have been updated.", 400, {
          code: "NO_CHANGE",
        }),
      );

    let avatarUrl = req.user.avatar;

    if (avatarFile) {
      const cloudinaryRes = await cloudinary.uploader.upload(avatarFile.path, {
        folder: "user_avatars",
      });
      avatarUrl = cloudinaryRes.secure_url;

      // Xóa file tạm thời sau khi upload xong
      console.log(avatarFile.path);

      fs.unlink(avatarFile.path, (err) => {
        if (err) console.log("Error deleting temp file:", err);
      });
    }

    const updateFields = {
      avatar: avatarUrl,
      description: description || req.user.description,
      phone: phone || req.user.phone,
      dateOfBirth: dateOfBirth || req.user.dateOfBirth,
      gender: gender || req.user.gender,
      address: address || req.user.address,
    };

    const updatedUser = await userService.updateById(
      req.user._id,
      updateFields,
    );

    responseSuccess(res, "Update profile successfully", updatedUser, 200);
  } catch (error) {
    console.log("Error in updateProfile:", error.message);

    if (avatarFile) {
      fs.unlink(avatarFile.path, (err) => {
        if (err) console.log("Error deleting temp file on error:", err);
      });
    }

    next(error);
  }
};

const checkAuth = (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await userService.findByEmail(email);
    if (!user) return next(AppError.template(ERROR_CODE.NOT_FOUND));

    const tokenReset = generateAccessToken(user._id);

    await sendResetPasswordEmail(email, tokenReset);

    res.status(200).json({
      message: "Send request successfully. Please check your email!",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { resetPassword } = req.body;

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await userService.findById(decoded.userId);
    if (!user) return next(AppError.template(ERROR_CODE.NOT_FOUND));

    if (resetPassword?.length < 6)
      return next(
        new AppError("Password must be at least 6 characters.", 400, {
          code: "INVALID_DATA",
        }),
      );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(resetPassword, salt);

    await user.save();

    res.status(200).json({ message: "Reset password successfully." });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  try {
    if (!token) return next(AppError.template(ERROR_CODE.UNAUTHORIZED));

    const decoded = jwt.verify(token, process.env.JWT_REFRESHTOKEN);
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return next(AppError.template(ERROR_CODE.NOT_FOUND));
    }

    responseSuccess(
      res,
      "Refresh token successfully.",
      {
        accessToken: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      },
      200,
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401, { code: "UNAUTHORIZED" }));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401, { code: "UNAUTHORIZED" }));
    }
    next(error);
  }
};

module.exports = {
  oauth2Login,
  register,
  login,
  logout,
  checkAuth,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
};
