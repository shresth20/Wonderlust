const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Wonderlust_DEV",
    format: async (req, file) => {
      // Check file extension and return format accordingly
      const fileExtension = file.originalname.split(".").pop();
      const allowedFormats = ["png", "jpg", "jpeg"];
      if (allowedFormats.includes(fileExtension)) {
        return fileExtension;
      }
      throw new Error("Invalid file format");
    },
    // public_id: (req, file) => "computed-filename-using-request",
  },
});

module.exports = { cloudinary, storage };
