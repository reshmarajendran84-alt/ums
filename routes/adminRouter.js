const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin Login
router.get("/login", adminController.loginLoad);
router.post("/login", adminController.verifyLogin);

// Admin Logout
router.get("/logout", adminController.logoutLoad);

// Admin Dashboard
router.get("/dashboard", adminController.loadDashboard);

// Forget Password
router.get("/forget", adminController.forgetLoad);
router.post("/forget", adminController.forgetVerify);

// Reset Password
router.get("/forget-password", adminController.forgetPasswordLoad);
router.post("/forget-password", adminController.forgetPasswordVerify);

// Add User
router.get("/add-user", adminController.addUserLoad);
router.post('/add-user', adminController.addUserVerify);

// Edit User
router.get("/edit-user", adminController.editUserLoad);
router.post("/edit-user", adminController.updateProfile);

// Delete User
router.get("/delete-user", adminController.deleteUser);

module.exports = router;
