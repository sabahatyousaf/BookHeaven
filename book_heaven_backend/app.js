const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Route Imports
const superAdminRoute = require("./routes/super-admin.route");
const userRoute = require("./routes/user.route");
const bookRoute = require("./routes/book.route");
const cartRoute = require("./routes/cart.route");
const favoriteRoute = require("./routes/favorite.route");
const orderRoute = require("./routes/order.route");
const reviewRoute = require("./routes/review.route");

require("dotenv").config();

const app = express();
app.use(bodyParser.json({ limit: "20kb" }));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

// Routes
app.use("/api/super-admin", superAdminRoute);
app.use("/api/user", userRoute);
app.use("/api/book", bookRoute);
app.use("/api/cart", cartRoute);
app.use("/api/favorite", favoriteRoute);
app.use("/api/order", orderRoute);
app.use("/api/review", reviewRoute);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
