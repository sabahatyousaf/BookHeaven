import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  return (
    <section id="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-container">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-home"></i>
            </div>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/books/manage-books"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/books") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-book"></i>
            </div>
            <span>Manage Books</span>
          </NavLink>

          <NavLink
            to="/admin/stocks/manage-stocks"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/stocks") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <span>Manage Stock</span>
          </NavLink>

          <NavLink
            to="/admin/reviews/manage-reviews"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/reviews") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-star"></i>
            </div>
            <span>Manage Reviews</span>
          </NavLink>

          <NavLink
            to="/admin/orders/manage-orders"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/orders") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <span>Manage Orders</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
