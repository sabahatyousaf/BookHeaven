const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const reviewController = require("../controllers/review.controller");

// Add a review
router.post("/add-review/:bookId", protect, reviewController.addReview);

// Fetch all reviews for a book
router.get("/get-all-reviews", protect, reviewController.getAllReviews);

// Get a specific review by ID
router.get(
  "/get-review-by-id/:reviewId",
  protect,
  reviewController.getReviewById
);

// Update a review
router.patch(
  "/update-review/:reviewId",
  protect,
  reviewController.updateReview
);

router.delete(
  "/delete-review/:bookId/:reviewId", // Include both bookId and reviewId
  protect,
  reviewController.deleteReview
);
module.exports = router;
