const Book = require("../models/book.model");
const Review = require("../models/review.model");

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, comment, rating } = req.body;

    // Validate input
    if (!userId || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "userId, comment, and rating are required.",
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    // Check if the user has already reviewed this book
    const existingReview = book.reviews.find(
      (review) => review.userId.toString() === userId
    );
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book.",
      });
    }

    // Clean up the reviews array by removing invalid entries
    book.reviews = book.reviews.filter(
      (review) => review && typeof review === "object"
    );

    // Create a new review in the reviews collection
    const review = await Review.create({ userId, bookId, comment, rating });

    // Add the review to the book's reviews array with the same _id
    book.reviews.push({
      _id: review._id, // Use the same _id as the review in the Review collection
      userId,
      comment,
      rating,
    });

    // Update totalReviews and rating
    book.totalReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((sum, review) => sum + review.rating, 0) /
      book.totalReviews;

    // Save the updated book
    await book.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      book,
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all reviews and populate user and book details
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews from the Review collection and populate user and book details
    const reviews = await Review.find()
      .populate("userId", "profilePicture userName email") // Populate user details (userName and email)
      .populate("bookId", "bookImage title author genre price"); // Populate book details (title and author)

    // Check if reviews exist
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No reviews found!" });
    }

    // Return success response with all reviews
    res.status(200).json({
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a specific review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract reviewId from the request parameters

    // Find the review by ID and populate user and book details
    const review = await Review.findById(reviewId)
      .populate("userId", "profilePicture userName email") // Populate user details (userName and email)
      .populate("bookId", "bookImage title author genre price"); // Populate book details (title and author)

    // If the review is not found, return a 404 error
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found!" });
    }

    // Return success response with the review
    res.status(200).json({
      success: true,
      review: review,
    });
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params; // Extract reviewId from the request parameters
    const { comment, rating } = req.body; // Extract comment and rating from the request body

    // Validate input
    if (!comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "comment and rating are required.",
      });
    }

    // Find the review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found!" });
    }

    // Find the associated book
    const book = await Book.findById(review.bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    // Update the review in the Review collection
    review.comment = comment;
    review.rating = rating;
    await review.save();

    // Find and update the corresponding review in the Book's reviews array
    const bookReview = book.reviews.find((r) => r._id.toString() === reviewId);
    if (bookReview) {
      bookReview.comment = comment;
      bookReview.rating = rating;
    } else {
      return res.status(404).json({
        success: false,
        message: "Review not found in the book's reviews array!",
      });
    }

    // Update the book's rating and totalReviews
    book.totalReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.totalReviews;

    // Save the updated book
    await book.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { bookId, reviewId } = req.params;

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found!" });
    }

    // Find the review to delete in the book's reviews array
    const reviewIndex = book.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );
    if (reviewIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found in the book!" });
    }

    // Remove the review from the book's reviews array
    book.reviews.splice(reviewIndex, 1);

    // Update totalReviews and rating
    book.totalReviews = book.reviews.length;
    book.rating =
      book.reviews.length > 0
        ? book.reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.totalReviews
        : 0;

    // Save the updated book
    await book.save();

    // Delete the review from the reviews collection
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      book,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
