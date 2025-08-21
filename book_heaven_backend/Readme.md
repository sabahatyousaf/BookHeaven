# Book Heaven Backend

## Description

The **Book Heaven** Backend is a Node.js and Express-based RESTful API designed to power a comprehensive online book store platform. This backend provides endpoints for managing users, books, orders, inventory, and reviews. It features secure user authentication, role-based access control (RBAC), and integrates with MongoDB for data storage, JWT for security, and Cloudinary for handling document and image uploads.

---

## Features

- **User Management**:

  - User registration, login, and authentication.
  - Role-based access control: `user` and `superadmin`.
  - Profile management for users and superadmins.

- **Book Management:**:

  - Add, update, delete, and view book listings.
  - Categorize books by genres, authors, and publishers.
  - Upload book covers and related documents using Cloudinary.
  - Track inventory and stock levels.

- **Order Management:**:

  - Customers can place, track, and manage their orders.
  - Admins can process orders, update statuses, and manage transactions.
  - Integration with payment gateways (not funtional for now).

- **Reviews & Ratings:**:

  - Customers can leave ratings and reviews for books.
  - Aggregate ratings displayed on book listings.

- **Super Admin Panel:**:

  - Manage all users, books, and transactions.
  - Oversee inventory and stock levels.

- **Customer(User) Panel:**:

  - Browse and search books by title and authors.
  - Purchase books and track order history.
  - Purchased books will be added to the user Library and also can be    delivered based on user preference.
  - Leave reviews and ratings for purchased books.


---


## Technologies Used

**Backend**: Node.js, Express

**Database**: MongoDB

**Authentication**: JWT (JSON Web Tokens)

**File Storage**: Cloudinary (for images and documents)

**Security**: Role-Based Access Control (RBAC), input validation, and sanitization