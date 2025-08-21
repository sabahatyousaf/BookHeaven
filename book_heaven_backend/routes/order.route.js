const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const orderController = require("../controllers/order.controller");

// Route to place a new order (requires authentication)
router.post("/place-order", protect, orderController.placeOrder);

// Route to fetch all orders (requires authentication)
router.get("/get-all-orders", protect, orderController.getAllOrders);

// Route to fetch order by id (requires authentication)
router.get("/get-order-by-id/:id", protect, orderController.getOrderById);

// Route to cancel an order by ID (requires authentication)
router.put("/cancel-order/:id", protect, orderController.cancelOrder);

// Route to update the status of an order by ID (requires authentication)
router.patch(
  "/update-order-status/:id",
  protect,
  orderController.updateOrderStatus
);

// Route to update the status of an payment by ID (requires authentication)
router.patch(
  "/payment/update-payment-status/:id",
  protect,
  orderController.updatePaymentStatus
);

// Route to delete order
router.delete(
  "/delete-order/:id",
  protect,
  orderController.deleteOrder
);

// Export the router for use in the main application
module.exports = router;
