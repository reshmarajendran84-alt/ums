// Importing required modules

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");   // <-- MUST be here


//securepassword page load
const securePassword = async(password)=>{
    try{
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message);
    }
};
//for sent mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'reshmarajendaranrajendran333@gmail.com',  
                user:config.emailUser,
                // pass: 'glmvdngjbcxddwgd'
                pass:config.emailPassword
            },
            });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Email Verification',
            html: `<p>Hi ${name}, please click here to 
                   <a href="http://localhost:3000/verify?id=${user_id}">
                   verify</a> your email.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email error:", error);
            } else {
                console.log("Email has been sent: " + info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};

// for reset passeord send mail
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'reshmarajendaranrajendran333@gmail.com',  
                user:config.emailUser,
                // pass: 'glmvdngjbcxddwgd'
                pass:config.emailPassword
            },
            });

        const mailOptions = {
            from: 'reshmarajendaranrajendran333@gmail.com',
            to: email,
            subject: 'Email for Reset Password',
            html: `<p>Hi ${name}, please click here to 
                   <a href="http://localhost:3000/forget-password?token='+token+'">
                   Reset</a> your password.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email error:", error);
            } else {
                console.log("Email has been sent: " + info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};
// Load Register Page

const loadRegister =async(req,res)=>{
    try{

        res.render('registration.ejs')
    } catch(error){
        console.log(error.message);
    }
};
// Insert User

const insertUser =async(req,res)=>{
    try {

        const spassword =await securePassword(req.body.password);
        const user =new User({

            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:spassword,
            is_admin:0,
        });

        const userDate = await user.save();
        if(userDate){
sendVerifyMail(req.body.name, req.body.email, userDate._id);
            res.render('registration',{message:"your registration has been successfully,please verify email"});
        }
        else{
            res.render('registration',{message:"your registration has been  failed"});
        }
    }catch(error){
        console.log(error.message);
    
}}
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        console.log(updateInfo);
        res.render("email-verified");

    }
    catch(error){
        console.log(error.message);
    }
}

// login user methods started

const loginLoad = async(req,res)=>{
    try{
        res.render('login');
    }catch(error){
    console.log(error.message);

    }
}

const verifyLogin =async(req,res)=>{
    try{
        const email =req.body.email;
        const password = req.body.password;
        const userDate =await User.findOne({email:email})
        if(userDate){
            const passwordMatch = await bcrypt.compare(password,userDate.password)
            if(passwordMatch){
                if(userDate.is_verified === 0){
res.render('login', { message: "Invalid email or password" });

                }else{
req.session.user_id = userDate._id;
                    res.redirect('/home');
                }
            }else{
                res.render('login',{messgae:"password incorrect"});
            }
        }else{
            res.render('login',{message:"Email and password is incorrect"});
        }
    }catch(error){
        console.log(error.message);

    }
}

const loadHome =async(req,res)=>{
    try{
res.render('home');
    }catch{

        console.log(error.message);p
    }

}

//forget password 
const forgetLoad =async(req,res)=>{
    try{

        res.render('forget');
    }catch(error){
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userDate = await User.findOne({ email: email });

        if (userDate) {
            if (userDate.is_verified === 0) {
                res.render('forget', { message: "Please verify your mail." });
            } else {
                const token = randomstring.generate(7);  // 7-character random string
                console.log(token);

                await User.updateOne({ email: email }, { $set: { token: token } });
                sendResetPasswordMail(userDate.name, userDate.email, token);

                res.render('forget', { message: "Please check your mail to reset your password" });
            }
        } else {
            res.render('forget', { message: "User email is incorrect." });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const forgetPasswordLoad =async(req,res)=>{
try{
    const token =req.query.token;
   const tokenData= await User.findOne({token:token});
   if(tokenDate){
        res.render('forget-password',{user_id:tokenData._id});


   }
   else{
    res.render('404',{message:"Token is invalid."});
   }

}catch(error){
    console.log(error.message);
}
}

const resetPassword =async(req,res)=>{
    try{
        const password =req.body.password;
        const user_id =req.body.user_id;
        const secure_password = await securePassword(password);
        const updateData= await User.findByIdAndUpdate({_iduser_id},{$set:{password:secure_password,token:''}});
        res.redirect("/")
    }catch(error){
        console.log(error.message);
    }
}

//  send verification email ( post )
const sendVerification = async (req, res) => {
  try {
    const mailToVerify = req.body.email;
    const userData = await User.findOne({ email: mailToVerify });
    const mailContent = `<p>Hi ${userData.name}, please click here to <a href="${process.env.BASE_URL}/verify?id=${userData._id}">verify</a></p>`;

    if (userData) {
      emailHandler.sendVerifyMail(userData.email, mailContent);

      res.render("users/verification", { message: `Go check your email` });
    } else {
      res.render("users/verification", {
        message: `This mail is new to me..!`,
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};
//update edited profile data in the DB
const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const newData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            image: req.file.filename,
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
          },
        }
      );
    } else {
      const newData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
          },
        }
      );
    }
    res.redirect("/home");
  } catch (error) {
    console.error(Error.message);
  }
};

// Edit user profile in future (after login)
const editLoad = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });

    if (userData) {
      res.render("users/editUser", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    forgetLoad,
    forgetVerify,
    sendResetPasswordMail,
    forgetPasswordLoad,
    resetPassword,
    sendVerification,
    updateProfile,
    editLoad

}
