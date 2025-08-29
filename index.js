const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// View engine setup
app.set("views", path.join(__dirname, "views")); // ✅ lowercase "views"
app.set("view engine", "ejs");

// Load routers
const userRoute = require("./routes/userRoute");
const adminRouter = require("./routes/adminRouter");

app.use("/", userRoute);
app.use("/admin", adminRouter);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the User Management System");
});

// Start server
app.listen(3000, () => {
  console.log("✅ Server is running on http://localhost:3000");
});
