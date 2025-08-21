const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const Book = require("../models/book.model");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }

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

    let cartItem = await Cart.findOne({ userId, bookId });
    const userCartExists = user.cart.some(
      (item) => item.bookId.toString() === bookId
    );

    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.price = cartItem.quantity * cartItem.unitPrice; // Update total price
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        bookId,
        quantity: 1,
        unitPrice: book.price,
        price: book.price,
      });
      await cartItem.save();
    }

    if (!userCartExists) {
      user.cart.push({
        bookId: book._id,
        userId: user._id,
        quantity: 1,
        unitPrice: book.price,
        price: book.price,
      });
      await user.save();
    } else {
      const cartIndex = user.cart.findIndex(
        (item) => item.bookId.toString() === bookId
      );
      user.cart[cartIndex].quantity += 1;
      user.cart[cartIndex].price =
        user.cart[cartIndex].quantity * user.cart[cartIndex].unitPrice;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Book added to cart",
      cart: {
        ...cartItem.toObject(),
        book,
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove one item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }

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

    const cartItem = await Cart.findOne({ userId, bookId });
    if (!cartItem) {
      return res
        .status(400)
        .json({ success: false, message: "Book not found in cart" });
    }

    const userCartIndex = user.cart.findIndex(
      (item) => item.bookId.toString() === bookId
    );
    if (userCartIndex === -1) {
      return res
        .status(400)
        .json({ success: false, message: "Book not in user cart" });
    }

    if (cartItem.quantity > 1 || user.cart[userCartIndex].quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.price = cartItem.quantity * cartItem.unitPrice;
      await cartItem.save();

      user.cart[userCartIndex].quantity -= 1;
      user.cart[userCartIndex].price =
        user.cart[userCartIndex].quantity * user.cart[userCartIndex].unitPrice;
      await user.save();
    } else {
      await Cart.findByIdAndDelete(cartItem._id);
      user.cart.splice(userCartIndex, 1);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Book removed from cart",
      cart: {
        ...cartItem.toObject(),
        book,
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove all items from cart
exports.removeAllFromCart = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const result = await Cart.deleteMany({ userId, bookId });

    if (result.deletedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Book not found in cart" });
    }

    user.cart = user.cart.filter((item) => item.bookId.toString() !== bookId);
    await user.save();

    const cart = await Cart.find({ userId }).populate("bookId");

    res.status(200).json({
      success: true,
      message: "All quantities removed from cart",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all cart items
exports.getAllCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.find({ userId })
      .populate("bookId")
      .populate("userId"); // Populate user details

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
