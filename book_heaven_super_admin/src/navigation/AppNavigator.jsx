import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../navigation/outlet/Outlet";
import ProtectedRoute from "./protectedRoutes/ProtectedRoutes";

// Authentication Screens
import Signin from "../screens/auth/Signin";
import Signup from "../screens/auth/Signup";
import NotFound from "../screens/notFound/NotFound";

// Dashboard Screens
import Dashboard from "../screens/dashboard/Dashboard";

// Book Management Screens
import ManageBooks from "../screens/manageBooks/books/Books";
import AddBook from "../screens/manageBooks/addBooks/AddBook";
import BookDetails from "../screens/manageBooks/bookDetails/BookDetails";
import UpdateBook from "../screens/manageBooks/updateBook/UpdateBook";

// Stock Management Screens
import Stock from "../screens/manageStock/stock/Stock";

// Review Management Screens
import Reviews from "../screens/manageReviews/reviews/Reviews";
import ReviewDetails from "../screens/manageReviews/reviewDetails/ReviewDetails";

// Order Management Screens
import Orders from "../screens/manageOrders/orders/Orders";
import OrderDetails from "../screens/manageOrders/orderDetails/OrderDetails";

const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Signin />} />
      <Route path="/auth/signup" element={<Signup />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Book Management Routes */}
        <Route path="books/add-book" element={<AddBook />} />
        <Route path="books/manage-books" element={<ManageBooks />} />
        <Route path="books/book-details/:id" element={<BookDetails />} />
        <Route path="books/edit-book/:id" element={<UpdateBook />} />

        {/* Stock Management Routes */}
        <Route path="stocks/manage-stocks" element={<Stock />} />

        {/* Review Management Routes */}
        <Route path="reviews/manage-reviews" element={<Reviews />} />
        <Route path="reviews/review-details/:id" element={<ReviewDetails />} />

        {/* Order Management Routes */}
        <Route path="orders/manage-orders" element={<Orders />} />
        <Route path="orders/order-details/:id" element={<OrderDetails />} />
      </Route>

      {/* 404 Handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
