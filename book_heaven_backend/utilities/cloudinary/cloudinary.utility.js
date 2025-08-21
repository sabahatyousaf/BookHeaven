const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
});

// Set up Multer storage (no custom configuration, uses default disk storage)
const storage = multer.diskStorage({});

// Define a file filter to restrict uploads to specific file types
const fileFilter = (req, file, cb) => {
  if (!file) {
    // If no file is uploaded, return an error
    return cb(new Error("No file uploaded."), false);
  }

  // Define allowed MIME types for images and PDFs
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  const allowedPdfTypes = ["application/pdf"];

  // Check if the uploaded file's MIME type is allowed
  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedPdfTypes.includes(file.mimetype)
  ) {
    // If allowed, proceed with the upload
    cb(null, true);
  } else {
    // If not allowed, return an error
    cb(
      new Error(
        "Invalid file type. Only image (JPG, PNG, WEBP) and PDF files are allowed."
      ),
      false
    );
  }
};

// Configure Multer with the storage and file filter
const upload = multer({
  storage, // Use the defined storage
  fileFilter, // Use the defined file filter
}).fields([
  { name: "profilePicture", maxCount: 1 }, // Allow 1 profile picture file
  { name: "bookImage", maxCount: 1 }, // Allow 1 book image file
  { name: "bookFile", maxCount: 1 }, // Allow 1 book file (PDF)
]);

// Middleware to check if files were uploaded before proceeding
const checkUploadedFiles = (req, res, next) => {
  if (!req.files) {
    // If no files were uploaded, return an error
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }
  // If files were uploaded, proceed to the next middleware or route handler
  next();
};

// Function to upload a file to Cloudinary
const uploadToCloudinary = async (file, type) => {
  const baseFolder = "BookHeaven"; // Base folder for Cloudinary storage
  let folder = `${baseFolder}`;

  // Determine the subfolder based on the file type
  if (type === "profilePicture") {
    folder += "/profilePictures"; // Store profile pictures in a subfolder
  } else if (type === "bookImage") {
    folder += "/bookImages"; // Store book images in a subfolder
  } else if (type === "bookFile") {
    folder += "/books"; // Store book files (PDFs) in a subfolder
  } else {
    throw new Error("Invalid file type"); // Throw an error for invalid file types
  }

  try {
    const timestamp = Date.now(); // Generate a unique timestamp for the file name
    const globalFileName = `${timestamp}`; // Use the timestamp as the file name

    // Determine the resource type (image or raw) based on the file's MIME type
    let resourceType = "image"; // Default for images
    if (file.mimetype === "application/pdf") {
      resourceType = "raw"; // PDFs must be uploaded as "raw" type
    }

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder, // Specify the folder for storage
      public_id: globalFileName, // Use the timestamp as the public ID
      resource_type: resourceType, // Specify the resource type (image or raw)
    });

    // Return the secure URL of the uploaded file
    return { url: result.secure_url };
  } catch (error) {
    // Log and throw an error if the upload fails
    console.error("❌ Error Uploading to Cloudinary:", error);
    throw new Error("Error uploading to Cloudinary");
  }
};

// Function to delete a file from Cloudinary
const deleteFromCloudinary = async (fileUrl) => {
  try {
    // Extract the public ID from the file URL
    const matches = fileUrl.match(
      /\/(?:image|raw)\/upload\/(?:v\d+\/)?([^?]+)/
    );

    // If the public ID cannot be extracted, log an error and return
    if (!matches || matches.length < 2) {
      console.error(`❌ Failed to extract public ID from URL: ${fileUrl}`);
      return;
    }

    let publicId = matches[1]; // Extract the public ID from the URL

    // Remove the file extension for images (not needed for raw files)
    if (fileUrl.includes("/image/upload/")) {
      publicId = publicId.replace(/\.[^.]+$/, ""); // Removes .jpg, .png, etc.
    }

    // Determine the resource type (image or raw) based on the URL
    const resourceType = fileUrl.includes("/image/upload/") ? "image" : "raw";

    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // Specify the resource type for deletion
    });

    // Check if the deletion was successful
    if (result.result !== "ok") {
      console.error(`❌ Cloudinary Deletion Failed for: ${fileUrl}`);
    } else {
      console.log(`✅ Successfully deleted: ${fileUrl}`);
    }
  } catch (error) {
    // Log and throw an error if the deletion fails
    console.error("❌ Error Deleting from Cloudinary:", error);
    throw new Error("Cloudinary Deletion Failed");
  }
};

// Export the functions and middleware for use in other parts of the application
module.exports = {
  upload, // Multer upload middleware
  checkUploadedFiles, // Middleware to check if files were uploaded
  uploadToCloudinary, // Function to upload files to Cloudinary
  deleteFromCloudinary, // Function to delete files from Cloudinary
};
