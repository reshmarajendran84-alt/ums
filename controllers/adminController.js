const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const randomstring = require('randomstring')
const nodemailer = require('nodemailer')
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
const addUserMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
  secure: true, // ✅ must be boolean
      auth: {
        user: config.emailUser,
    pass: config.emailPassword, // ✅ make sure this matches your config.js or .env
      },
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "Admin add you and verify your mail",
      html:
        "<p> Hi " +
        name +
        ', please click here to <a href="http://localhost:3000/verify?id=' +
        user_id +
        '"> Verify </a> your mail.</p> <br> <b>Email:- '+email+'</b> <br> <b>Password:- '+password+'</b>',
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
    pass: config.emailPassword, // ✅ make sure this matches your config.js or .env
      },
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "For reset password",
      html:
        "<p> Hi " +
        name +
        ', please click here to <a href="http://localhost:3000/admin/forget-password?token=' +
        token +
        '"> Reset </a> your Password.</p> ',
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

//for Login User Page Function
const loginLoad = async (req,res) => {
  try {
res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
}

//for Verify Users Function
const verifyLogin = async (req,res) => {
  try {
    const email = req.body.email
    const password = req.body.password

    const userData = await User.findOne({email:email})

    if(userData){
      const passwordMatch = await bcrypt.compare(password,userData.password)
      if(passwordMatch){
       if(userData.is_admin === 1 || userData.is_admin === "1" || userData.is_admin === true) {
  req.session.user_id = userData._id
  res.redirect('/admin/home')
} else {
  res.render("admin/login", {message: "You are not an admin"})
}
}else{
       res.render("admin/login", {message: "Your password is incorrect"})
      }
    }else{
      res.render("admin/login",{message: "Your email is incorrect"})
    }
  } catch (error) {
    console.log(error.message);
    
  }
}

//for Home Page Function
const loadDashboard = async (req,res) => {
  try {
    const id = req.session.user_id
    const adminData = await User.findById({_id:id})
    res.render('home', {admin:adminData})
  } catch (error) {
    console.log(error.message);
  }
}

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
res.render("admin/forget")
  } catch (error) {
    console.log(error.message);
  }
}

//for Forget Password Verify Function
const forgetVerify = async (req,res) => {
  try {
    const email = req.body.email
    const userData = await User.findOne({email:email})
    
    if(userData){
      if(userData.is_admin === 1){
        res.render("admin/forget", {message: 'Your not a admin'})
      }else{
        const randomString = randomstring.generate()
        const updateUser = await User.updateOne({email:email}, {$set : {token:randomString}})
        sendResetPasswordMail(userData.name, userData.email, randomString)
        res.render('admin/forget', {message: "Please check your mail to reset your password"})
      }
    }else{
      res.render("admin/forget", {message: 'User not found'})
    }
  } catch (error) {
    console.log(error.message);
  }
}

//for Reset Password Page Function
const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const adminData = await User.findOne({ token: token });

    if (adminData) {
      res.render("admin/forget-password", {
        admin_id: adminData._id   // pass id to ejs
      });
    } else {
      res.render("admin/forget-password", { message: "Invalid link", admin_id: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for Reset Password Function
const forgetPasswordVerify = async (req, res) => {
  try {
    const password = req.body.password
    const user_id = req.body.admin_id   // ✅ match EJS field
    const securepassword = await securePassword(password)

    await User.findByIdAndUpdate(
      user_id,
      { $set: { password: securepassword, token: '' } }
    )

    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}


//for Dashboard Page Function
const dashboardLoad = async (req,res) => {
  try {
const adminData = await User.find({is_admin:1})
    res.render('admin/dashboard', {admin:adminData})
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
      name:name,
      email:email,
      mobile:mobile,
      password:spassword,
      is_admin:1
    })

    const userData = await user.save()

    if (userData) {
      addUserMail(name, email, password, userData._id)
      res.redirect("/admin/dashboard")
    }else{
      res.render('admin/addUser', {message: "Something went wrong"})
    }
  } catch (error) {
    console.log(error.message);
  }
}

//for Edit and Update Users Page Function
const editUserLoad = async (req,res) => {
  try {
    const id = req.query.id

    const admin_Data = await User.findById({_id:id})

    if(admin_Data){
      res.render("admin/edit", {user:admin_Data})
    }else{
      res.redirect('/admin/dashboard')
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

    const updetedUser = await User.findByIdAndUpdate({ _id : id}, {$set: { name: name, email:email, mobile:mobile, is_varified : verify}})
    
    if(updetedUser){
      res.redirect('/admin/dashboard')
    }else{
      res.render('admin/edit', {message: "Somthing weent wrong"})
    }
  } catch (error) {
    console.log(error);
  }
}

//for Delete Users Function
const deleteUser = async (req,res) => {
  try {
    const id = req.query.id

    await User.findByIdAndDelete({ _id : id}, { _id : id})
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