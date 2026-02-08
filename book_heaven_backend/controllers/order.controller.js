const User = require("../models/user.model");
const Order = require("../models/order.model");
const Book = require("../models/book.model");

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingFee, paymentMethod, totalAmount } =
      req.body;
    const userId = req.user.id;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!shippingAddress || !shippingFee || !paymentMethod || !totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address, shipping fee, payment method, and total amount are required",
      });
    }

    let calculatedSubtotal = 0;

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book ${item.bookId} not found`,
        });
      }

      calculatedSubtotal += book.price * item.quantity;
    }

    const numericShippingFee = parseFloat(shippingFee);
    const calculatedTotal = calculatedSubtotal + numericShippingFee;

    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Calculated total amount doesn't match provided amount",
      });
    }

    const order = new Order({
      userId,
      items,
      shippingAddress,
      shippingFee: shippingFee.toString(),
      paymentMethod,
      totalAmount,
      status: "ORDER_RECEIVED",
      payment: paymentMethod === "COD" ? "PENDING" : "UNPAID",
      statusHistory: [
        {
          status: "ORDER_RECEIVED",
          changedAt: new Date(),
          changedBy: userId, // ✅ FIX HERE
        },
      ],
    });

    const savedOrder = await order.save();

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          orders: {
            orderId: savedOrder._id,
            status: "ORDER_RECEIVED",
            placedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Please complete payment.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
      error: error.message,
    });
  }
};


// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { role } = req.user;
    let orders;

    if (role === "SUPERADMIN") {
      orders = await Order.find()
        .populate("userId") // All user fields
        .populate("items.bookId"); // All book fields
    } else {
      const user = await User.findById(req.user.id).populate({
        path: "orders.orderId",
        populate: [
          { path: "userId" }, // All user fields
          { path: "items.bookId" }, // All book fields
        ],
      });
      orders = user.orders;
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get order by id
exports.getOrderById = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params; // Order ID from URL params

    // Authorization check
    if (role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only Super Admin can view orders",
      });
    }

    // Find order with full details
    const order = await Order.findById(id)
      .populate("userId") // All user fields
      .populate("items.bookId"); // All book fields

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the authenticated request
    const { id } = req.params; // Extract order ID from the request parameters

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if the order can be canceled (only PENDING orders can be canceled)
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be canceled after it has been shipped",
      });
    }

    // Update the order status to CANCELLED
    order.status = "CANCELLED";
    await order.save();

    // Update the order status in the user's orders array
    const userOrder = user.orders.find((o) => o.orderId.toString() === id);
    if (userOrder) {
      userOrder.status = "CANCELLED";
      await user.save();
    }

    // Return success response with the canceled order
    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      order,
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update the status of an order (only for SuperAdmin)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can update order status",
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🚫 Payment must be PAID before confirmation
    if (status === "PAYMENT_CONFIRMED" && order.payment !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment must be PAID before confirming order",
      });
    }

    // ✅ Initialize history if missing
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
    });

    await order.save();

    // 📚 ADD BOOKS TO USER LIBRARY
    if (status === "PAYMENT_CONFIRMED") {
      const user = await User.findById(order.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const existingBookIds = user.library.map((b) =>
        b.bookId.toString()
      );

      const booksToAdd = [];

      for (const item of order.items) {
        if (existingBookIds.includes(item.bookId.toString())) continue;

        const book = await Book.findById(item.bookId);
        if (!book || !book.bookFile) continue; // safety

        booksToAdd.push({
          bookId: book._id,
          bookFile: book.bookFile, // ✅ from Book model
          purchasedAt: new Date(),
        });
      }


      if (booksToAdd.length > 0) {
        user.library.push(...booksToAdd);
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// Update payment status of an order (only for SuperAdmin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can update payment status",
      });
    }

    const { payment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["PENDING", "PAID"].includes(payment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    order.payment = payment;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    // Only SUPERADMIN can delete orders
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Only SUPERADMIN can delete orders",
      });
    }

    const { id } = req.params;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    // Remove the order reference from the user's orders array
    await User.updateOne(
      { _id: order.userId },
      { $pull: { orders: { orderId: id } } }
    );

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Order Deletion Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
      error: error.message,
    });
  }
};
