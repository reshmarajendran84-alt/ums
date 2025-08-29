const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{type:String,
        require:true
    },
    mobile:{
        type:String,
        require:true

    },
    image:
    {
        type:String,
        require:true
    },
    password:
    {
        type:String,
        require:true
    },
    is_admin:{
        type:Number,
        require:true
    },
    is_varified:{
        type:Number,
        default:0
    },    token:{
        type:String,
        default:''
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }



});

// module.exports = mongoose.model('User',userSchema);
// Check if the model exists before creating it
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;