const mongoose = require("mongoose");

// Define the schema for the Book model
const bookSchema = new mongoose.Schema(
  {
    // URL of the book's image (required)
    bookImage: {
      type: String,
      required: true,
    },

    // URL of the book's file (e.g., PDF) (required)
    bookFile: {
      type: String,
      required: true,
    },

    // Title of the book (required, trimmed to remove extra spaces)
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Author of the book (required)
    author: {
      type: String,
      required: true,
    },

    // Description of the book (required)
    description: {
      type: String,
      required: true,
    },

    // Price of the book (required, minimum value of 0)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Genre(s) of the book (array of strings, required)
    genre: {
      type: [String],
      required: true,
    },

    // Stock quantity of the book (required, minimum value of 0)
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    // Average rating of the book (default: 0, range: 0 to 5)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Total number of reviews for the book (default: 0)
    totalReviews: {
      type: Number,
      default: 0,
    },

    // Array of reviews for the book
    reviews: [
      {
        // ID of the user who wrote the review (references the User model)
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        // Text of the review
        comment: String,
        // Rating given by the user (range: 0 to 5)
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
        // Timestamp of when the review was created (default: current time)
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Year of publication (optional)
    publicationYear: {
      type: String,
    },

    // Publisher of the book (optional)
    publisher: {
      type: String,
    },

    // Number of pages in the book (optional)
    pages: {
      type: Number,
    },

    // ID of the superadmin who uploaded the book (references the SuperAdmin model, required)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },

    // Timestamp of when the book was created (default: current time)
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the Book model
module.exports = mongoose.model("Book", bookSchema);
