const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const config = require("./config/config");
const userRoute = require("./routes/userRoute");
const bodyParser = require('body-parser');
const app = express();
const adminRoute = require("./routes/adminRouter");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session middleware
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

// MongoDB Connection
mongoose
  .connect(config.mongoURI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Home Page
app.get("/", (req, res) => {
  res.render("layouts/homepage");
});
app.get("/homepage", (req, res) => {
res.render("layouts/homepage");
});

// Mount user routes
app.use("/", userRoute);
app.use("/admin", adminRoute);

// Start server
app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
