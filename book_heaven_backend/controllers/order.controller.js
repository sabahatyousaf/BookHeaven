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

    // Validate calculate subtotal
    let calculatedSubtotal = 0;
    for (const item of items) {
      const book = await Book.findById(item.bookId); // Changed Product -> Book, productId -> bookId
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

    // Create the order with initial statuses
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
          changedBy: "system",
        },
      ],
    });

    // Save the order
    const savedOrder = await order.save();

    // Update the user's orders array
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
    // Only SUPERADMIN can update order status
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Only SUPERADMIN can update order status",
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

    // Valid statuses for coffee shop
    const validStatuses = [
      "ORDER_RECEIVED",
      "PAYMENT_CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "PICKED_UP",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Status transition validation
    const currentStatus = order.status;

    // Cannot revert from finalized states
    if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify order from ${currentStatus} state`,
      });
    }

    // Valid status transitions
    if (status === "READY_FOR_PICKUP" && currentStatus !== "PREPARING") {
      return res.status(400).json({
        success: false,
        message:
          "Order must be in PREPARING status before marking as READY_FOR_PICKUP",
      });
    }

    if (status === "PICKED_UP" && currentStatus !== "READY_FOR_PICKUP") {
      return res.status(400).json({
        success: false,
        message: "Order must be READY_FOR_PICKUP before marking as PICKED_UP",
      });
    }

    if (status === "COMPLETED" && currentStatus !== "PICKED_UP") {
      return res.status(400).json({
        success: false,
        message: "Order must be PICKED_UP before marking as COMPLETED",
      });
    }

    // Update order status and history
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await order.save();

    // Update user's order reference
    await User.updateOne(
      { "orders.orderId": order._id },
      { $set: { "orders.$.status": status } }
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

// Update payment status of an order (only for SuperAdmin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment } = req.body; // Get payment status from request body
    const { id } = req.params;
    const userRole = req.user.role;

    // Authorization check
    if (userRole !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only Super Admin can update payment status",
      });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate payment status
    const validPaymentStatuses = ["PENDING", "PAID"];
    if (!validPaymentStatuses.includes(payment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status. Allowed values: PENDING, PAID",
      });
    }

    // Update payment status
    order.payment = payment;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Payment Status Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
