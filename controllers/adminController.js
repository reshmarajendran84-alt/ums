const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const config = require("../config/config");

// ===== Helper Functions =====
const securePassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const sendResetPasswordMail = async (name, email, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.emailUser, pass: config.emailPassword }
  });

  const mailOption = {
    from: config.emailUser,
    to: email,
    subject: "Reset Password",
    html: `<p>Hi ${name}, click <a href="http://localhost:3000/admin/forget-password?token=${token}">here</a> to reset password</p>`
  };

  await transporter.sendMail(mailOption);
};

// ===== Admin Functions =====

// Login Page
const loginLoad = (req, res) => {
  if (req.session.admin_id) return res.redirect("/admin/dashboard");
  res.render("admin/login", { message: "" });
};

// Verify Login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, is_admin: 1 });

    if (!admin) return res.render("admin/login", { message: "Email is incorrect" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.render("admin/login", { message: "Incorrect password" });

    req.session.admin_id = admin._id;
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
    res.render("admin/login", { message: "Something went wrong" });
  }
};

// Dashboard / Home
const loadDashboard = async (req, res) => {
  const users = await User.find({ is_admin: 0 });
  res.render("admin/dashboard", { users });
};

// Logout
const logoutLoad = (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
};

// Forget Password Page
const forgetLoad = (req, res) => {
  res.render("admin/forget", { message: "" });
};

// Forget Password Verify
const forgetVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await User.findOne({ email, is_admin: 1 });
    if (!admin) return res.render("admin/forget", { message: "Admin not found" });

    const token = randomstring.generate();
    await User.findByIdAndUpdate(admin._id, { token });
    await sendResetPasswordMail(admin.name, admin.email, token);

    res.render("admin/forget", { message: "Check your email to reset password" });
  } catch (error) {
    console.log(error.message);
  }
};

// Reset Password Page
const forgetPasswordLoad = async (req, res) => {
  const { token } = req.query;
  const admin = await User.findOne({ token, is_admin: 1 });
  if (!admin) return res.render("admin/forget-password", { message: "Invalid link", admin_id: null });

  res.render("admin/forget-password", { admin_id: admin._id, message: "" });
};

// Reset Password Verify
const forgetPasswordVerify = async (req, res) => {
  const { password, admin_id } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(admin_id, { password: hashed, token: "" });

  res.render("admin/login", { message: "Password reset successful" });
};

// Add User Page
const addUserLoad = (req, res) => res.render("admin/addUser", { message: "" });

// Add User Verify
const addUserVerify = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const password = randomstring.generate(8);
    const hashed = await securePassword(password);

    const user = new User({ name, email, mobile, password: hashed, is_admin: 0 });
    await user.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
    res.render("admin/addUser", { message: "Error adding user" });
  }
};

// Edit User Page
const editUserLoad = async (req, res) => {
  const user = await User.findById(req.query.id);
  if (!user) return res.redirect("/admin/dashboard");
  res.render("admin/edit", { user });
};

// Update User
const updateProfile = async (req, res) => {
  const { id, name, email, mobile } = req.body;
  await User.findByIdAndUpdate(id, { name, email, mobile });
  res.redirect("/admin/dashboard");
};

// Delete User
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.query.id);
  res.redirect("/admin/dashboard");
};

module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
  logoutLoad,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  forgetPasswordVerify,
  addUserLoad,
  addUserVerify,
  editUserLoad,
  updateProfile,
  deleteUser
};
