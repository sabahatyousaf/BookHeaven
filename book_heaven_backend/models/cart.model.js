const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    price: {  // This will store the total price (quantity * unit price)
      type: Number,
      required: true
    },

    unitPrice: {  // This will store the book's original price
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);