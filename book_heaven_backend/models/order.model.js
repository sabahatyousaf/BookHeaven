const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "ORDER_RECEIVED", // Order placed but payment not confirmed yet
        "PAYMENT_CONFIRMED", // Payment successfully processed
        "PREPARING", // Barista is making the drinks
        "READY_FOR_PICKUP", // Order is ready at counter
        "PICKED_UP", // Customer has received order
        "COMPLETED", // Order fulfilled (for records)
        "CANCELLED", // Order cancelled before preparation
        "REFUNDED", // Order cancelled and refunded
      ],
      default: "ORDER_RECEIVED",
    },

    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    payment: {
      type: String,
      enum: ["PENDING", "PAID", "UNPAID"],
      default: "PENDING",
      required: true,
    },

    // Shipping information
    shippingAddress: {
      type: String,
      required: true,
    },

    shippingFee: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    // Total order amount
    totalAmount: {
      type: Number,
      required: true,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
