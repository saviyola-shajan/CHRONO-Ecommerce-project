const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique:true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  referelId:{
    type:String
  },
  redmmedreferels:{
    type:Array
  },
  status: {
    type: String,
  },
  isverified: {
    type: Number,
  },
  createdOn:{
      type: Date,
      default: Date.now,
  }
});
const usercollecn = mongoose.model("usercollecn", userSchema);
module.exports = usercollecn;
