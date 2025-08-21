const mongoose = require("mongoose");

// Define the schema for the Review model
const reviewSchema = new mongoose.Schema(
  {
    // ID of the user who wrote the review (references the User model, required)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ID of the book being reviewed (references the Book model, required)
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    // Text of the review (required)
    comment: {
      type: String,
      required: true,
    },

    // Rating given by the user (required, range: 0 to 5)
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the Review model
module.exports = mongoose.model("Review", reviewSchema);