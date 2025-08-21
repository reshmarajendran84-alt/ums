const express = require("express");
const user_route = express();
const bodyParser = require('body-parser');


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

user_route.get('/register',userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);
user_route.get('/verify',userController.verifyMail);
module.exports =user_route;