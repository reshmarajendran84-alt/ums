const User = require("../models/userModel");
const config = require('../config/config');
const bcrypt = require("bcrypt");
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')

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
const addUserMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // ✅ should be boolean not string
      auth: {
        user: config.emailUser,
        pass: config.passUser,
      },
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "Admin added you - please verify your mail",
      html: `<p> Hi ${name}, please click here to 
              <a href="http://localhost:3000/verify?id=${user_id}"> Verify </a> 
              your mail.</p> 
              <br> <b>Email:</b> ${email} 
              <br> <b>Password:</b> ${password}`,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//for Reset Password Function
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.emailUser,
        pass: config.passUser,
      },
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "Reset your password",
      html: `<p> Hi ${name}, please click here to 
              <a href="http://localhost:3000/admin/forget-password?token=${token}"> Reset </a> 
              your Password.</p>`,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// login page
const loginLoad = async (req, res) => {
  try {
    res.render("admin/login");  // 
    } catch (error) {
    console.log(error.message);
  }
};


//for Verify Users Function
const verifyLogin = async (req,res) => {
  try {
    const email = req.body.email
    const password = req.body.password

    const adminData = await User.findOne({ email, role: "admin" });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        return res.redirect("/admin/dashboard");
      } else {
        return res.render("admin/login", { message: "Invalid Password" });
      }
    } else {
      return res.render("admin/login", { message: "Admin not found" });
    }

  } catch (error) {
    console.log(error.message);
  }
};

//for Home Page Function
const loadDashboard = async (req, res) => {
  try {
    if (!req.session.admin_id) {
      return res.redirect("/admin");
    }
    res.render("admin/dashboard"); 
  } catch (error) {
    console.log(error.message);
  }
};

//for Logout Users Function
const logoutLoad = async (req,res) => {
  try {
    req.session.destroy()
    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}

//for Forget Password Page Function
const forgetLoad = async (req,res) => {
  try {
    res.render('admin/forget')
  } catch (error) {
    console.log(error.message);
  }
}

//for Forget Password Verify Function
const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      // ✅ Check if user is not an admin
      if (userData.role !== "admin") {
        return res.render("admin/login", { message: "You are not an admin" });
      } else {
        const randomString = randomstring.generate();
        await User.updateOne({ email: email }, { $set : { token: randomString } });
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render('admin/forget', { message: "Please check your mail to reset your password" });
      }
    } else {
      res.render("admin/forget", { message: 'User not found' });
    }
  } catch (error) {
    console.log(error.message);
  }
};   // ✅ FIX: properly closed function here

//for Reset Password Page Function
const forgetPasswordLoad = async (req,res) => {
  try {
    const token = req.query.token
    const tokenData = await User.findOne({ token: token })

    if (tokenData) {
      res.render('admin/forget-password', { user_id: tokenData._id })
    } else {
      res.render('404', { message: "Invalid link" })
    }
  } catch (error) {
    console.log(error.message);
  }
}

//for Reset Password Function
const forgetPasswordVerify = async (req,res) => {
  try {
    const password = req.body.password
    const user_id = req.body.user_id
    const securepassword = await securePassword(password)

    await User.findByIdAndUpdate(
      { _id: user_id },
      { $set : { password: securepassword, token: '' } }
    )

    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}

//for Dashboard Page Function
const dashboardLoad = async (req,res) => { 
  try {
    const adminData = await User.find({ is_admin: 0 })
    res.render('admin/dashboard', { admin: adminData })  // ✅ fixed spelling
  } catch (error) {
    console.log(error.message);
  }
}

//for Add Users Page Function
const addUserLoad = async (req,res) => {
  try {
    res.render('admin/addUser')
  } catch (error) {
    console.log(error.message);
  }
}

// for Add Users Function
const addUserVerify = async (req,res) => {
  try {
    const name = req.body.name
    const email = req.body.email
    const mobile = req.body.mno
    
    const password = randomstring.generate(8)
    const spassword = await securePassword(password)

    const user = User({
      name: name,
      email: email,
      mobile: mobile,
      password: spassword,
      is_admin: 0
    })

    const userData = await user.save()

    if (userData) {
      addUserMail(name, email, password, userData._id)
      res.redirect("/admin/dashboard")  // ✅ fixed spelling
    } else {
      res.render('addUser', { message: "Something went wrong" })
    }
  } catch (error) {
    console.log(error.message);
  }
}

//for Edit and Update Users Page Function
const editUserLoad = async (req,res) => {
  try {
    const id = req.query.id
    const admin_Data = await User.findById({ _id: id })

    if (admin_Data) {
      res.render("edit", { user: admin_Data })
    } else {
      res.redirect('/admin/dashboard')  // ✅ fixed spelling
    }
  } catch (error) {
    console.log(error.message);
  }
}

//for Edit and Update Users Function
const updateProfile = async (req,res) => {
  try {
    const id = req.body.id
    const name = req.body.name
    const email = req.body.email
    const mobile = req.body.mno
    const verify = req.body.verify

    const updatedUser = await User.findByIdAndUpdate(
      { _id : id },
      { $set: { name: name, email: email, mobile: mobile, is_verified: verify } }
    )
    
    if (updatedUser) {
      res.redirect('/admin/dashboard')
    } else {
      res.render('edit', { message: "Something went wrong" })
    }
  } catch (error) {
    console.log(error);
  }
}

//for Delete Users Function
const deleteUser = async (req,res) => {
  try {
    const id = req.query.id
    await User.findByIdAndDelete({ _id: id })
    res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
  logoutLoad,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  forgetPasswordVerify,
  dashboardLoad,
  addUserLoad,
  addUserVerify,
  editUserLoad,
  updateProfile,
  deleteUser
}
