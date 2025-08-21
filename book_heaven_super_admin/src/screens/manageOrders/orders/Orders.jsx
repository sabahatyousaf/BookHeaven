import React, { useState, useEffect } from "react";
import "./Orders.css";
import "../../../styles/globalStyles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  setOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "../../../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import InputField from "../../../utils/customInputField/InputField";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.orders.orders);

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllOrders())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) =>
    order.status?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetail = (order) => {
    navigate(`/admin/orders/order-details/${order._id}`, {
      state: { order },
    });
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handlePaymentStatusChange = (order) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const getNextValidStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "ORDER_RECEIVED":
        return ["PAYMENT_CONFIRMED", "CANCELLED"];
      case "PAYMENT_CONFIRMED":
        return ["PREPARING", "REFUNDED"];
      case "PREPARING":
        return ["READY_FOR_PICKUP", "CANCELLED"];
      case "READY_FOR_PICKUP":
        return ["PICKED_UP"];
      case "PICKED_UP":
        return ["COMPLETED"];
      default:
        return [];
    }
  };

  const changeOrderStatus = async (status) => {
    setLoadingAction(status);
    try {
      if (selectedOrder?._id) {
        await dispatch(
          updateOrderStatus({
            orderId: selectedOrder._id,
            status: status,
          })
        ).unwrap();

        toast.success(
          `Status changed to ${status.replace(/_/g, " ")} successfully!`
        );

        // Update local state
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id ? { ...order, status } : order
        );
        dispatch(setOrders(updatedOrders));
      }
    } catch (error) {
      toast.error(`Failed to change status: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const changePaymentStatus = async (payment) => {
    setLoadingAction(payment);
    try {
      if (selectedOrder?._id) {
        await dispatch(
          updatePaymentStatus({
            orderId: selectedOrder._id,
            payment: payment,
          })
        ).unwrap();

        toast.success(`Payment Status changed to ${payment} successfully!`);

        // Update local state
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id ? { ...order, payment } : order
        );
        dispatch(setOrders(updatedOrders));
      }
    } catch (error) {
      toast.error(`Failed to change payment status: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ORDER_RECEIVED":
        return "#FFA500"; // Orange
      case "PAYMENT_CONFIRMED":
        return "#4169E1"; // Royal Blue
      case "PREPARING":
        return "#6A5ACD"; // Slate Blue
      case "READY_FOR_PICKUP":
        return "#32CD32"; // Lime Green
      case "PICKED_UP":
        return "#228B22"; // Forest Green
      case "COMPLETED":
        return "#4CAF50"; // Green
      case "CANCELLED":
        return "#FF0000"; // Red
      case "REFUNDED":
        return "#FFC0CB"; // Pink
      default:
        return "#808080"; // Gray
    }
  };

  const handleDeleteOrderConfirm = async (orderId) => {
    setLoadingAction(orderId);

    try {
      if (orderId) {
        await dispatch(deleteOrder(orderId)).unwrap();

        toast.success("Order deleted successfully!");

        // Remove from local state
        const updatedOrders = orders.filter((order) => order._id !== orderId);
        dispatch(setOrders(updatedOrders));
      }
    } catch (error) {
      toast.error(`Failed to delete order: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <section id="orders">
      <div className="orders-container">
        <h2 className="orders-title">Orders List</h2>
        <div className="orders-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Orders"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredOrders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>

                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const nextStatuses = getNextValidStatuses(order.status);
                  return (
                    <tr key={order._id}>
                      <td className="order-id">
                        #{order._id.substring(18, 24).toUpperCase()}
                      </td>
                      <td className="order-customer">
                        {order.userId?.userName || "N/A"}
                      </td>
                      <td className="payment-status">
                        <span
                          className={`payment-badge ${order.payment.toLowerCase()}`}
                        >
                          {order.payment}
                        </span>
                      </td>
                      <td className="order-status">
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(order.status),
                          }}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="action-btn view-detail"
                          onClick={() => handleViewDetail(order)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        {nextStatuses.length > 0 && (
                          <button
                            className="action-btn status-change"
                            onClick={() => handleStatusChange(order)}
                          >
                            <i className="fas fa-sync"></i>
                          </button>
                        )}

                        {order.status === "ORDER_RECEIVED" && (
                          <button
                            className="action-btn payment-status-change"
                            onClick={() => handlePaymentStatusChange(order)}
                          >
                            <i className="fas fa-money-bill"></i>
                          </button>
                        )}

                        <button
                          className="action-btn delete-order"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-orders-found">No Orders Found</div>
          )}
        </div>

        {/* Status Change Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Order Status for #${
            selectedOrder?._id?.substring(18, 24).toUpperCase() || "Order"
          }`}
          loading={loadingAction !== null}
          buttons={getNextValidStatuses(selectedOrder?.status).map(
            (status) => ({
              label: status.replace(/_/g, " "),
              className: `modal-btn-${status.toLowerCase()}`,
              onClick: () => changeOrderStatus(status),
              loading: loadingAction === status,
            })
          )}
        >
          <div className="status-flow">
            <p>
              Current Status:{" "}
              <strong>{selectedOrder?.status?.replace(/_/g, " ")}</strong>
            </p>
            <p>Available Next Status:</p>
            <div className="status-options">
              {getNextValidStatuses(selectedOrder?.status).map((status) => (
                <div key={status} className="status-option">
                  → {status.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {/* Payment Status Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Confirm Payment for #${
            selectedOrder?._id?.substring(18, 24).toUpperCase() || "Order"
          }`}
          loading={loadingAction !== null}
          buttons={["PAID"].map((payment) => ({
            label: payment.charAt(0) + payment.slice(1).toLowerCase(),
            className: `modal-btn-${payment.toLowerCase()}`,
            onClick: () => changePaymentStatus(payment),
            loading: loadingAction === payment,
          }))}
        >
          <p>Confirm that payment has been received for this order.</p>
          <p>
            Total Amount: <strong>Rs. {selectedOrder?.totalAmount}</strong>
          </p>
        </Modal>

        {/* Order Deletion Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Confirm Deletion for #${
            selectedOrder?._id?.substring(18, 24).toUpperCase() || "Order"
          }`}
          loading={loadingAction !== null}
          buttons={[
            {
              label: "Delete",
              className: "modal-btn-danger",
              onClick: () => handleDeleteOrderConfirm(selectedOrder?._id),
              loading: loadingAction === selectedOrder?._id,
            },
          ]}
        >
          <p>Are you sure you want to delete this order?</p>
          <p>
            This action cannot be undone. The order total was{" "}
            <strong>Rs. {selectedOrder?.totalAmount}</strong>
          </p>
        </Modal>
      </div>
    </section>
  );
};

export default Orders;
