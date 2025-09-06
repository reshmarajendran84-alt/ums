
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin Login
router.get("/", adminController.loginLoad);
router.post("/login", adminController.verifyLogin);

// Dashboard
router.get("/dashboard", adminController.loadDashboard);

// Logout
router.get("/logout", adminController.logoutLoad);

// Forget Password
router.get("/forget", adminController.forgetLoad);
router.post("/forget", adminController.forgetVerify);

// Reset Password
router.get("/forget-password", adminController.forgetPasswordLoad);
router.post("/forget-password", adminController.forgetPasswordVerify);

// User Management
router.get("/add-user", adminController.addUserLoad);
router.post("/add-user", adminController.addUserVerify);

router.get("/edit-user", adminController.editUserLoad);
router.post("/edit-user", adminController.updateProfile);
router.get("/delete-user", adminController.deleteUser);

module.exports = router;
