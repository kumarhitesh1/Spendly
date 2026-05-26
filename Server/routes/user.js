const express = require("express");
const {
  registerUser,
  loginUser,
  myProfile,
  updateProfile,
  changePassword,
} = require("../controllers/user");
const { isAuth } = require("../middlewares/isAuth");
const { uploadFiles } = require("../middlewares/multer");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuth, myProfile);
router.put("/profile", isAuth, updateProfile);
router.put("/change-password", isAuth, changePassword);

router.post("/upload", uploadFiles.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = req.file.path;
  res.status(200).json({ message: "File uploaded successfully", imageUrl });
});

module.exports = router;
