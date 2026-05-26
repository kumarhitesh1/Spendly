const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary = require("../utils/cloudinary");

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "expense-tracker",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
    ],

    public_id: `${Date.now()}-${
      file.originalname.split(".")[0]
    }`,
  }),
});

// Validate uploaded file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, and JPG files are allowed",
      ),
      false,
    );
  }
};

// Configure multer upload
const uploadFiles = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  uploadFiles,
};