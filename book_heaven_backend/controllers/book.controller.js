const Book = require("../models/book.model");
const cloudinaryUpload = require("../utilities/cloudinary/cloudinary.utility");

// Add a new book
exports.addBook = async (req, res) => {
  try {
    console.log("📤 Received Request - Files:", req.files);

    // Destructure required fields from the request body
    const {
      title,
      author,
      description,
      price,
      genre,
      stock,
      publicationYear,
      publisher,
      pages,
    } = req.body;

    // Check if book image and book file (PDF) are provided
    if (!req.files?.bookImage || !req.files?.bookFile) {
      return res.status(400).json({
        success: false,
        message: "Book image and book file (PDF) are required",
      });
    }

    // Upload book image to Cloudinary
    const bookImageUploadResult = await cloudinaryUpload.uploadToCloudinary(
      req.files.bookImage[0],
      "bookImage"
    );

    // Upload book file (PDF) to Cloudinary
    const bookFileUploadResult = await cloudinaryUpload.uploadToCloudinary(
      req.files.bookFile[0],
      "bookFile"
    );

    // Create a new book instance with the uploaded file URLs
    const book = new Book({
      title,
      author,
      description,
      price,
      genre,
      stock,
      publicationYear,
      publisher,
      pages,
      bookImage: bookImageUploadResult.url,
      bookFile: bookFileUploadResult.url,
      uploadedBy: req.user.id, // Attach the user ID who uploaded the book
    });

    // Save the book to the database
    await book.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Book uploaded successfully",
      book: book,
    });
  } catch (error) {
    console.error("❌ Error Uploading Book:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    // Fetch all books from the database and populate the uploadedBy field
    const books = await Book.find().populate("uploadedBy");

    // If no books are found, return a 404 error
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Books found!",
      });
    }

    // Return success response with the list of books
    res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      books: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get a book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params; // Get the book ID from the request parameters

    // Find the book by ID and exclude the title field
    const books = await Book.findById(id).select("-title");
    if (!books) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found!",
      });
    }

    // Return success response with the fetched book
    res.json({
      success: true,
      message: "Book Fetched Successfully",
      book: books,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting Book!",
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    console.log("=== UPDATE BOOK START ===");
    console.log("User:", req.user);
    console.log("Params:", req.params);
    console.log("Body (raw):", req.body);
    console.log("Files:", req.files);

    // SUPERADMIN check
    if (!req.user || req.user.role !== "SUPERADMIN") {
      console.log("❌ Unauthorized update attempt");
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can update books.",
      });
    }

    const { id } = req.params;

    // Find the book first
    const book = await Book.findById(id);
    console.log("Book found:", book ? book._id : null);

    if (!book) {
      console.log("❌ Book not found");
      return res.status(404).json({
        success: false,
        message: "Book not found!",
      });
    }

    // Allowed fields
    const allowedFields = [
      "title",
      "author",
      "description",
      "category",
      "price",
      "reviews",
    ];

    let updates = {};

    // Build updates safely
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "reviews") {
          if (typeof req.body[field] === "string") {
            const trimmed = req.body[field].trim();
            if (!trimmed) {
              console.log("ℹ No reviews provided, skipping reviews update");
              continue; // skip updating reviews
            }
            try {
              updates[field] = JSON.parse(trimmed);
            } catch (err) {
              console.error("❌ Invalid reviews JSON:", err.message);
              res.status(400).json({
                success: false,
                message: "Invalid reviews format. Must be valid JSON.",
              });
              return;
            }
          } else {
            updates[field] = req.body[field];
          }
        }
      }
    }

    console.log("Updates after parsing body:", updates);

    // Upload book image if provided
    if (req.files?.bookImage) {
      console.log("📤 Uploading book image to Cloudinary...");
      const bookImageUploadResult = await cloudinaryUpload.uploadToCloudinary(
        req.files.bookImage[0],
        "bookImage"
      );
      console.log("✅ Book image uploaded:", bookImageUploadResult.url);
      updates.bookImage = bookImageUploadResult.url;
    }

    // Upload book file (PDF) if provided
    if (req.files?.bookFile) {
      console.log("📤 Uploading book file to Cloudinary...");
      const bookFileUploadResult = await cloudinaryUpload.uploadToCloudinary(
        req.files.bookFile[0],
        "bookFile"
      );
      console.log("✅ Book file uploaded:", bookFileUploadResult.url);
      updates.bookFile = bookFileUploadResult.url;
    }

    console.log("Final updates object for DB:", updates);

    // Update in DB
    const updatedBook = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    console.log("✅ Book updated successfully:", updatedBook);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("💥 Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    // Check if the user is a SUPERADMIN
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only Super Admins can delete books.",
      });
    }

    const { id } = req.params;

    // Find the book by ID
    const book = await Book.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    // Delete book image from Cloudinary if it exists
    if (book.bookImage) {
      await cloudinaryUpload.deleteFromCloudinary(
        book.bookImage,
        "BookHeaven/bookImage"
      );
    }

    // Delete book file (PDF) from Cloudinary if it exists
    if (book.bookFile) {
      await cloudinaryUpload.deleteFromCloudinary(
        book.bookFile,
        "BookHeaven/bookFile"
      );
    }

    // Delete the book from the database
    await Book.findByIdAndDelete(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Book deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error Deleting Book:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
