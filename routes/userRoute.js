const express = require("express");
const user_route = express();
const bodyPraser = require("body-parser");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const config = require("../config/config");
const auth = require("../middleware/auth");

//for view engine
user_route.set("view engine", "ejs");
user_route.set("views", path.join(__dirname, "../views/users"));

user_route.use(bodyPraser.json());
user_route.use(bodyPraser.urlencoded({ extended: true }));

//for session save
user_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 10 },
  })
);

//for image save
user_route.use(express.static('public'))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/userImages"));

  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

const userController = require("../controllers/userController");

//for register page
user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post('/register', upload.single('image'), userController.insertUser);

//for mailverify
user_route.get("/verify", userController.verifyMail);

//for login page
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);

//for home page
user_route.get("/home", auth.isLogin, userController.loadHome);

//for logout page
user_route.get("/logout", auth.isLogin, userController.userLogout);

//for forget page
user_route.get("/forget", auth.isLogout, userController.forgetLoad);
user_route.post("/forget", userController.forgetVerify);

// forget password
user_route.get('/forget-password', auth.isLogout, userController.forgetPasswordLoad);
user_route.post('/forget-password', userController.resetPassword);

//for verification mail page
user_route.get("/verification", userController.verificationLoad);
user_route.post("/verification", userController.sentVerificationLink);

// Edit profile routes
user_route.get("/edit", auth.isLogin, userController.editLoad);
user_route.post("/edit", upload.single('image'), userController.updateProfile);


module.exports = user_route;