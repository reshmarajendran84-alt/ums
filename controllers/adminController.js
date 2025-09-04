const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const config = require("../config/config");


// Secure Password
const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error.message);
  }
};

// Send email for new user
const addUserMail = async (name, email, password, user_id) => {
  try {
   const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
});


    const mailOptions = {
  from: config.emailUser,
  to: email,
  subject: "Verify your account",
  html: `
    <p>Hi ${name},</p>
    <p>Thank you for registering on UMS. Please verify your email by clicking the link below:</p>
    <p><a href="http://localhost:3000/verify?id=${user_id}">Verify Email

             <p>Email: ${email}</p>
             <p>Password: ${password}</p>`,
    };

    transporter.sendMail(mailOption, (err, info) => {
      if (err) console.log(err);
      else console.log("Email sent: ", info.response);
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Send Reset Password email
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "Reset Password",
      html: `<p>Hi ${name}, please click here to <a href="http://localhost:3000/admin/forget-password?token=${token}">Reset</a> your password.</p>`,
    };

    transporter.sendMail(mailOption, (err, info) => {
      if (err) console.log(err);
      else console.log("Email sent: ", info.response);
    });
  } catch (error) {
    console.log(error.message);
  }
};

// ====== Controller Functions ======

// Admin Login Page
const loginLoad = async (req, res) => {
if (req.session.admin_id) {
    return res.redirect("/admin/dashboard");
  }
  res.render("admin/login", { message: "" });
};

// Verify Admin Login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await User.findOne({ email, is_admin: 1 });

    if (!adminData) {
      return res.render("admin/login", { message: "Email is incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, adminData.password);
    if (!passwordMatch) {
      return res.render("admin/login", { message: "Incorrect password" });
    }

    if (adminData.is_admin != 1) {
      return res.render("admin/login", { message: "You are not an admin" });
    }

    // ✅ Only reaches here if valid admin
req.session.admin_id = adminData._id;   // ✅ correct
    return res.redirect("/admin/home");

  } catch (error) {
    console.log(error.message);
    return res.render("admin/login", { message: "Something went wrong" });
  }
};


// Admin Home / Dashboard
const loadDashboard = async (req, res) => {
  try {
const adminData = await User.find({ is_admin:1 });
    res.render("admin/home", { admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

// Logout Admin
const logoutLoad = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

// Forget Password Page
const forgetLoad = async (req, res) => {
  try {
    res.render("admin/forget");
  } catch (error) {
    console.log(error.message);
  }
};

// Forget Password Verify
const forgetVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const adminData = await User.findOne({ email });

    if (!adminData) return res.render("admin/forget", { message: "User not found" });
    if (adminData.is_admin !== 1) return res.render("admin/forget", { message: "You are not an admin" });

    const token = randomstring.generate();
await User.findByIdAndUpdate(user_id, { $set: { password: hashedPassword, token: "" } });
    sendResetPasswordMail(adminData.name, adminData.email, token);

    res.render("admin/forget", { message: "Please check your email to reset password" });
  } catch (error) {
    console.log(error.message);
  }
};

// Reset Password Page
const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const adminData = await User.findOne({ token });
    if (!adminData) return res.render("admin/forget-password", { message: "Invalid link", admin_id: null });
    res.render("admin/forget-password", { admin_id: adminData._id });
  } catch (error) {
    console.log(error.message);
  }
};

// Reset Password Verify
const forgetPasswordVerify = async (req, res) => {
  try {
    const { password, user_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(user_id, { $set: { password: hashedPassword, token: "" } });

res.render("admin/login", { message: "Password reset successful! Please login." });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something went wrong!");
  }
};


// // Dashboard - List Users
// const dashboardLoad = async (req, res) => {
//   try {
//     const users = await User.find({ is_admin: 0 });
//     res.render("admin/dashboard", { users });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// Add User Page
const addUserLoad = async (req, res) => {
  try {
    res.render("admin/addUser");
  } catch (error) {
    console.log(error.message);
  }
};

// Add User Verify
const addUserVerify = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    const password = randomstring.generate(8);
    const spassword = await securePassword(password);

    const user = new User({
      name,
      email,
      mobile,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();
    if (userData) {
      addUserMail(name, email, password, userData._id);
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/addUser", { message: "Something went wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Edit User Page
const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById(id);
    if (!user) return res.redirect("/admin/dashboard");

    res.render("admin/edit", { user });
  } catch (error) {
    console.log(error.message);
  }
};

// Update User
const updateProfile = async (req, res) => {
  try {
    const { id, name, email, mobile, verify } = req.body;
await User.findByIdAndUpdate(id, { $set: { name, email, mobile, is_verified: verify } });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndDelete(id);
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
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
  // dashboardLoad,
  addUserLoad,
  addUserVerify,
  editUserLoad,
  updateProfile,
  deleteUser,
};
