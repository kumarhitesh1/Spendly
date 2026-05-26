const jwt = require("jsonwebtoken");

const User = require("../models/user");

// Generate JWT token
async function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: "15d",
  });
}

// Register new user
async function registerUser(req, res) {
  const { name, email, password, profilePicUrl } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }

  // Check existing user
  const userExists = await User.findOne({
    email,
  });

  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    profilePicUrl,
  });

  if (user) {
    res.status(201).json({
      id: user._id,

      user,

      token: await generateToken(user._id),
    });
  }
}

// Login user
async function loginUser(req, res) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }

  // Find user
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // Verify password
  if (!(await user.comparePassword(password))) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  res.status(200).json({
    id: user._id,

    user,

    token: await generateToken(user._id),
  });
}

// Get user profile
async function myProfile(req, res) {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  res.json(user);
}

// Update user profile
async function updateProfile(req, res) {
  try {
    const userId = req.user._id;

    const { name, profilePicUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,

      {
        name,
        profilePicUrl,
      },

      {
        new: true,
      },
    ).select("-password");

    // Validate user
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const user = await User.findById(req.user._id);

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  myProfile,
  updateProfile,
  changePassword,
};
