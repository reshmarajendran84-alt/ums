const express = require('express');
const admin_route = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require("multer");
const path = require("path");
const config = require('../config/config');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/adminAuth');

// Set view engine
admin_route.set('view engine', 'ejs');
admin_route.set("views", path.join(__dirname, "../views/admin")); // ✅ fixed path (lowercase "views")

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Static files (public folder)
admin_route.use(express.static(path.join(__dirname, "../public")));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

// Session setup
admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 10 },
  })
);

// ---------------- Routes ----------------

// Login
admin_route.get('/', auth.isLogout, adminController.loginLoad);
admin_route.post('/', adminController.verifyLogin);

// Dashboard (home)
admin_route.get('/dashboard', auth.isLogin, adminController.dashboardLoad);

// Logout
admin_route.get('/logout', auth.isLogin, adminController.logoutLoad);

// Forget password
admin_route.get('/forget', auth.isLogout, adminController.forgetLoad);
admin_route.post('/forget', adminController.forgetVerify);

// Reset password
admin_route.get('/forget-password', adminController.forgetPasswordLoad);
admin_route.post('/forget-password', adminController.forgetPasswordVerify);

// Add user
admin_route.get('/add', auth.isLogin, adminController.addUserLoad);
admin_route.post('/add', upload.single("image"), adminController.addUserVerify);

// Edit user
admin_route.get('/edit-user', auth.isLogin, adminController.editUserLoad);
admin_route.post('/edit-user', adminController.updateProfile);

// Delete user
admin_route.get('/delete-user', adminController.deleteUser);

module.exports = admin_route;
