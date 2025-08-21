const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    // URL of the user's profile picture (optional)
    profilePicture: {
      type: String,
    },

    // Username of the user (required)
    userName: {
      type: String,
      required: true,
    },

    // Email of the user (required, unique)
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Password of the user (required)
    password: {
      type: String,
      required: true,
    },

    // Address of the user (required)
    address: {
      type: String,
    },

    // Phone number of the user (required)
    phone: {
      type: String,
    },

    // Array of items in the user's cart
    cart: [
      {
        // ID of the book in the cart (references the Book model)
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        // ID of the user who added the book to the cart (references the User model)
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        // Quantity of the book in the cart (default: 1)
        quantity: {
          type: Number,
          default: 1,
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
    ],

    // Array of favorite books for the user
    favorites: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Array of orders placed by the user
    orders: [
      {
        // ID of the order (references the Order model)
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        // Status of the order (enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, default: PENDING)
        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PENDING",
        },
        // Timestamp of when the order was placed (default: current time)
        placedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Library for purchased books
    library: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        bookFile: {
          // Cloudinary URL of the purchased book
          type: String,
          required: true,
        },
        purchasedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Timestamp of when the user was created (default: current time)
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
