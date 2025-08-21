const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const bookPictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const bookController = require("../controllers/book.controller");

// Route to upload a new book (requires authentication and file upload middleware)
router.post(
  "/upload-book",
  protect, // Ensure the user is authenticated
  bookPictureUpload.upload, // Handle book image and file uploads
  bookController.addBook // Controller to handle adding a book
);

// Route to fetch all books (requires authentication)
router.get("/get-all-books", protect, bookController.getAllBooks);

// Route to fetch a specific book by ID (requires authentication)
router.get("/get-book-by-id/:id", protect, bookController.getBookById);

// Route to update a book by ID (requires authentication and file upload middleware)
router.patch(
  "/update-book/:id",
  protect, // Ensure the user is authenticated
  bookPictureUpload.upload, // Handle book image and file uploads
  bookController.updateBook // Controller to handle updating a book
);

// Route to delete a book by ID (requires authentication)
router.delete("/delete-book/:id", protect, bookController.deleteBook);

// Export the router for use in the main application
module.exports = router;
