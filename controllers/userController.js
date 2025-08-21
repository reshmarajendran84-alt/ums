const User = require("../models/userModel");
const bcrypt =require('bcrypt');
const nodemailer = require("nodemailer");

const securePassword = async(password)=>{
    try{
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message);
    }
};
// Load Register Page
//for sent mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
  service: "gmail",
            auth: {
                user: 'reshmarajendaranrajendran333@gmail.com',  
                pass: 'glmvdngjbcxddwgd'
            },
            });

        const mailOptions = {
            from: 'reshmarajendaranrajendran333@gmail.com',
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
            res.render('registration',{meaagse:"your registration has been successfully,please verify email"});
        }
        else{
            res.render('registration',{meaagse:"your registration has been  failed"});
        }
    }catch(error){
        console.log(error.message);
    
}}
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });

        console.log(updateInfo);
        res.render("email-verified");

    }
    catch(error){
        console.log(error.message);
    }
}
module.exports = {
    loadRegister,
    insertUser,
    verifyMail
}
