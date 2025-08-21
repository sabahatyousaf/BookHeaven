import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import "./OrderDetails.css";

const OrderDetails = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrder(location.state?.order || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  if (loading) {
    return (
      <div
        className="loader-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!order) {
    return <div className="not-found">No Order Found</div>;
  }

  return (
    <section id="order-detail">
      <div className="banner">
        <h1>Order Details</h1>
      </div>
      <div className="container">
        <div className="order-info">
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td className="label color1">Order ID</td>
                  <td className="value color1">
                    #{order._id.substring(18, 24).toUpperCase()}
                  </td>
                  <td className="label color2">Status</td>
                  <td className="value color2">
                    <span
                      className={`status-badge ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="label color3">Placed At</td>
                  <td className="value color3">
                    {new Date(order.placedAt).toLocaleString()}
                  </td>

                  <td className="label color2">Payment Status</td>
                  <td className="value color2">
                    <span
                      className={`status-badge ${order.payment.toLowerCase()}`}
                    >
                      {order.payment}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="label color4">Customer</td>
                  <td className="value color4">{order.userId?.userName}</td>
                  <td className="label color1">Customer Email</td>
                  <td className="value color1">{order.userId?.email}</td>
                </tr>

                <tr>
                  <td className="label color2">Customer Phone</td>
                  <td className="value color2">{order.userId?.phone}</td>
                  <td className="label color2">Customer Address</td>
                  <td className="value color2">{order.userId?.address}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="order-items">
          <h2>Order Items</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.bookId?.title}</td>
                    <td>{item.bookId?.author}</td>
                    <td>{item.quantity}</td>
                    <td>${item.bookId?.price}</td>
                    <td>${(item.bookId?.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
