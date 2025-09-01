const express = require("express");
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// login page
router.get("/", adminAuth.isLogout, adminController.loginLoad);
router.post("/", adminController.verifyLogin);

// home page
router.get("/home", adminAuth.isLogin, adminController.loadDashboard);

// logout
router.get("/logout", adminAuth.isLogin, adminController.logoutLoad);

// forget password
router.get("/forget", adminAuth.isLogout, adminController.forgetLoad);
router.post("/forget", adminController.forgetVerify);

// reset password
router.get("/forget-password", adminAuth.isLogout, adminController.forgetPasswordLoad);
router.post("/forget-password", adminController.forgetPasswordVerify);

// dashboard
// dashboard
router.get("/dashboard", adminAuth.isLogin, adminController.dashboardLoad);

// add user
router.get("/addUser", adminAuth.isLogin, adminController.addUserLoad);
router.post("/addUser", adminController.addUserVerify);

// edit user
router.get("/edit", adminAuth.isLogin, adminController.editUserLoad);
router.post("/edit", adminController.updateProfile);

// delete user
router.get("/deleteUser", adminAuth.isLogin, adminController.deleteUser);

module.exports = router;
