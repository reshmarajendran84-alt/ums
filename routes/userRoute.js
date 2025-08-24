const express = require("express");
const user_route = express();
const session = require("express-session");
const bodyParser = require('body-parser');
const config = require("../config/config");
user_route.use(session({secret:config.sessionSecret}));
const auth = require("../middleware/auth");

// Middleware

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set('view engine','ejs');
user_route.set('views','./views/users');
const userController =require("../controllers/userController");

const multer = require("multer");
const path = require("path");

const storage =multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,path.join(__dirname,'../public/userimage'));

    },
    filename:function(req,file,cd){
const name = Date.now()+'-'+file.originalname;
cd(null,name);
    }
})
const upload = multer({storage:storage});

// Routes

user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);
user_route.get('/verify',userController.verifyMail);
user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
// user_route.post('/login',);

user_route.post('/login', userController.verifyLogin);
user_route.get('/home', auth.isLogin, userController.loadHome);
user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify);
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);


user_route.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
console.log("Auth:", auth);
console.log("UserController:", userController);


module.exports =user_route;