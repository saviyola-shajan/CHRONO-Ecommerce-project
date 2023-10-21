const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
       
    
    },
    password:{
        type:String,
        required:true,
        
    },
    confirmpassword:{
        type:String,
        required:true,
        
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    email:{
        type: String,
        required:true,
       
    },
    otpInput:{
        type:Number,
        required:true,
    },
    status:{
        type:String
    },
    isverified:{
        type:Number
    },
});
const usercollecn = mongoose.model("usercollecn",userSchema)
module.exports=usercollecn