const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wonderlust_DEV",
    allowerdFormats: ["png", "jpg", "jpeg"],
    // public_id: (req, file) => 'computed-filename-using-request',
  },
});
module.exports = { cloudinary, cloudStorage };



// // Set up multer to use memory storage
// const upload = multer({ storage: multer.memoryStorage() });


// const { cloudStorage } = require("../cloudConfig.js");
// const cloudinary = require("cloudinary").v2;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });



// // Middleware to handle file upload and upload to Cloudinary
// const uploadToCloudinary = (req, res, next) => {
//   // Use multer middleware to parse the file from the request and store it in memory
//   upload.single("listing[image]")(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ error: "File upload failed" });
//     }

//     try {
//       // Upload file to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.buffer, {
//         folder: "wonderlust_DEV",
//         allowerdFormats: ["png", "jpg", "jpeg"],
//         // Optional: Folder in Cloudinary to store the uploaded file
//         // Additional options like transformation, tags, etc.
//       });

//       // Pass the Cloudinary URL of the uploaded image to the next middleware or route handler
//       req.cloudinaryUrl = result.secure_url;
//       next();
//     } catch (error) {
//       console.error("Cloudinary upload error:", error);
//       return res.status(500).json({ error: "Cloudinary upload failed" });
//     }
//   });
// };
// // Use the uploadToCloudinary middleware in your route handler
// router.post("/create", isLoggedIn, uploadToCloudinary, async (req, res) => {
//   // Access the Cloudinary URL of the uploaded image from req.cloudinaryUrl
//   console.log("Uploaded image URL:", req.cloudinaryUrl);
//   // Handle further processing or response
// });

