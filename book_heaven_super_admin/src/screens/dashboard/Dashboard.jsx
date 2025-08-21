import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utils/customCards/Card";
import { getAllBooks } from "../../redux/slices/bookSlice";
import { getAllReviews } from "../../redux/slices/reviewSlice";
import { getAllOrders } from "../../redux/slices/orderSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const books = useSelector((state) => state.books.books);
  const reviews = useSelector((state) => state.reviews.reviews);
  const orders = useSelector((state) => state.orders.orders);
  const orderList = Array.isArray(orders) ? orders : [];

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllBooks());
      dispatch(getAllReviews());
    }
  }, [dispatch, user?.id]);

  const { totalBooks, totalStock } = books.reduce(
    (acc, book) => {
      acc.totalBooks++;
      acc.totalStock += book.stock || 0;
      return acc;
    },
    { totalBooks: 0, totalStock: 0 }
  );

  const totalReviews = reviews.reduce(
    (acc, review) => acc + (review.stock ?? 1),
    0
  );

  const {
    pending: pendingOrders,
    processing: processingOrders,
    shipped: shippedOrders,
    delivered: deliveredOrders,
    cancelled: cancelledOrders,
    total: totalOrders,
  } = orderList.reduce(
    (acc, order) => {
      if (order.status === "PENDING") acc.pending++;
      else if (order.status === "PROCESSING") acc.processing++;
      else if (order.status === "SHIPPED") acc.shipped++;
      else if (order.status === "DELIVERED") acc.delivered++;
      else if (order.status === "CANCELLED") acc.cancelled++;

      acc.total++;
      return acc;
    },
    {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
    }
  );

  const handleNavigateBook = () => navigate("/admin/books/manage-books");
  const handleNavigateStock = () => navigate("/admin/stocks/manage-stocks");
  const handleNavigateReviews = () => navigate("/admin/reviews/manage-reviews");
  const handleNavigateOrders = () => navigate("/admin/orders/manage-orders");

  return (
    <section id="dashboard">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-4">
            <Card
              onClick={handleNavigateBook}
              title="Books"
              icon={<i className="fas fa-book" />}
              stats={[{ label: "Total", value: totalBooks }]}
            />
          </div>

          <div className="col-sm-12 col-md-12 col-lg-4">
            <Card
              onClick={handleNavigateStock}
              title="Stock"
              icon={<i className="fas fa-shopping-cart" />}
              stats={[{ label: "Total", value: totalStock }]}
            />
          </div>

          <div className="col-sm-12 col-md-12 col-lg-4">
            <Card
              onClick={handleNavigateReviews}
              title="Reviews"
              icon={<i className="fas fa-star" />}
              stats={[{ label: "Total", value: totalReviews }]}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-4">
            <Card
              onClick={handleNavigateOrders}
              title="Orders"
              icon={<i className="fas fa-shopping-bag" />}
              stats={[
                { label: "Total", value: totalOrders },
                { label: "Pending", value: pendingOrders },
                { label: "Processing", value: processingOrders },
                { label: "Shipped", value: shippedOrders },
                { label: "Delivered", value: deliveredOrders },
                { label: "Cancelled", value: cancelledOrders },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
