const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");


//for Secure Password Function
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//for Send Mail Function
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword, // ✅ fix name (was config.passUser in your code)
      },
    });

    const mailOptions = {   // ✅ consistent naming
      from: config.emailUser,
      to: email,
      subject: "For verification mail",
      html: `<p>Hello ${name}, please click <a href="http://localhost:3000/verify?id=${user_id}">here</a> to verify your account.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");

  } catch (error) {
    console.error("Mail sending error:", error.message);
    throw error; // ✅ let insertUser handle response
  }
};


//for Reset Password Function
//for Reset Password Function
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      },
    });

    const mailOptions = {   // ✅ corrected name
      from: config.emailUser,
      to: email,
      subject: "For reset password",
      html: `<p> Hi ${name}, please click here to 
              <a href="http://localhost:3000/forget-password?token=${token}"> Reset </a> 
              your Password.</p> `,
    };


    // Send email
    await transporter.sendMail(mailOptions); // ✅ now matches
    console.log("Reset password email sent successfully");

  } catch (error) {
    console.error("Error sending reset password email:", error.message);
  }
};
//for Register Function
// Load register page
const loadRegister = async (req, res) => {
  try {
res.render('registration', { message: '' });
  } catch (error) {
    console.log(error.message);
  }
};


//for Add to MongoDB Function
const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      image: req.file.filename,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      await sendVerifyMail(req.body.name, req.body.email, userData._id); // ✅ await
      res.render("registration", {
        message: "Your registration was successful. Please verify your email.",
      });
    } else {
      res.render("registration", { message: "Registration failed." });
    }
  } catch (error) {
    console.log("Registration error:", error.message);
    res.status(500).send("Something went wrong");
  }
};

//for Verify Mail Function
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_varified: 1 } }
    );
    console.log(updateInfo);
    res.render("email-verified");
  } catch (error) {
    console.log(error.message);
  }
};

//for Login User Page Function
const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//for Verify Users Function
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_varified === 0) {
          res.render("login", { message: "Please verify your mail." });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/home");
        }
      } else {
        res.render("login", { message: "Password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and Password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for Home Page Function
const loadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("home", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//for Logout Users Function
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//for Forget Password Page Function
const forgetLoad = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

//for Forget Password Verify Function
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (!userData) return res.render("forget", { message: "User Email is incorrect" });
    if (userData.is_varified === 0) return res.render("forget", { message: "Please verify your email." });

    const token = randomstring.generate();
    const updated = await User.updateOne({ email }, { $set: { token } });
    if (updated.modifiedCount === 0) return res.render("forget", { message: "Something went wrong" });

    await sendResetPasswordMail(userData.name, userData.email, token);
    res.render("forget", { message: "Please check your mail to reset your password" });

  } catch (error) {
    console.log(error.message);
  }
};


//for Reset Password Page Function
const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token });

    if (!tokenData) return res.render("404", { message: "Your token is invalid" });

res.render("forget-password", { user_id: tokenData._id }); // ✅ keep this
  } catch (error) {
    console.log(error.message);
  }
};

//for Reset Password Function
const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;      // ✅ get new password from form
    const user_id = req.body.user_id;         // ✅ hidden field from form

    const secure_password = await securePassword(password);  // ✅ hash password

    await User.findByIdAndUpdate(
      user_id,
      { $set: { password: secure_password, token: "" } }
    );

    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};



//for Resend Verification Page Function
const verificationLoad = async (req, res) => {
  try {
    res.render("verification");
  } catch (error) {
    console.log(error.message);
  }
};

//for Resend Verification Function
const sentVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;

    const user_Data = await User.findOne({ email: email });

    if (user_Data) {
      sendVerifyMail(user_Data.name, user_Data.email, user_Data._id);
      res.render("verification", {
        message:
          "Resent verification mail your mail id, please check your mail.",
      });
    } else {
      res.render("verification", { message: "Your email not exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for User Edit & Update Page Function
const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });

    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for User Edit & Update  Function
const updateProfile = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const mobile = req.body.mno;
    const id = req.body.user_id;

    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: name,
            email: email,
            mobile: mobile,
            image: req.file.filename,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: id },
        { $set: { name: name, email: email, mobile: mobile } }
      );
    }

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  sentVerificationLink,
  verificationLoad,
  resetPassword,
  editLoad,
  updateProfile
};
