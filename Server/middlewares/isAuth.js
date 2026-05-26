const jwt = require("jsonwebtoken");

const User = require("../models/user");

// Verify authenticated user
async function isAuth(req, res, next) {
  try {
    const { token } = req.headers;

    // Validate token
    if (!token) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SEC);

    // Fetch authenticated user
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(500).json({
      message: "Please Login",
    });
  }
}

module.exports = {
  isAuth,
};
