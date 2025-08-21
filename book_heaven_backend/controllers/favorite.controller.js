const Favorite = require("../models/favorite.model"); // Import the Favorite model
const User = require("../models/user.model"); // Import the User model
const Book = require("../models/book.model"); // Import the Book model

// Add to Favorites
exports.addToFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // Extract user ID from the authenticated request

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }

    // Find the user and book by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Check if the book is already in favorites (both User model and Favorite collection)
    let favorite = await Favorite.findOne({ userId, bookId })
      .populate("userId")
      .populate("bookId");
    const userFavoriteExists = user.favorites.some(
      (fav) => fav.bookId.toString() === bookId
    );

    if (favorite && userFavoriteExists) {
      return res
        .status(400)
        .json({ success: false, message: "Book is already in favorites" });
    }

    // Add the book to the Favorite collection if it doesn't exist
    if (!favorite) {
      favorite = new Favorite({ userId, bookId });
      await favorite.save();
    }

    // Add the book to the user's favorites array if it's not already there
    if (!userFavoriteExists) {
      user.favorites.push({ bookId: book._id, userId: user._id });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Book added to favorites",
      favorite: {
        ...favorite.toObject(),
        user,
        book,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove to Favorites
exports.removeFromFavorite = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // Extract user ID from the authenticated request

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the book exists in the Favorite collection
    const favorite = await Favorite.findOneAndDelete({ userId, bookId })
      .populate("userId")
      .populate("bookId");
    if (!favorite) {
      return res
        .status(400)
        .json({ success: false, message: "Book not found in favorites" });
    }

    // Remove the book from the user's favorites array
    user.favorites = user.favorites.filter(
      (fav) => fav.bookId.toString() !== bookId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Book removed from favorites",

      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Favorites
exports.getAllFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find()
      .populate("userId")
      .populate("bookId");
    res.status(200).json({ success: true, favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
