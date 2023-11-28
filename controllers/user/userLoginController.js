const nodemailer = require("nodemailer");
const usercollecn = require("../../models/userlogin");
const products = require("../../models/addProduct");
const Wallet = require("../../models/wallet");
require("dotenv").config();
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

// const sendverifymail = async (name,email,user_id)=>{

//     try{
//         console.log("The verification mail has been send. Please check your inbox");
//      const transporter = nodemailer.createTransport({
//         host:'smtp.gmail.com',
//         port:587,
//         secure:false,
//         requireTLS:true,
//         auth:{
//             user:'saviyolashajan69@gmail.com',
//             pass:'bikd wkge uzas ojnt',
//         }
//       });
//       const mailOptions = {
//         from:'saviyolashajan69@gmil.com',
//         to:email,
//         subject:'verification of mail',
//         html:'<p>Hii' +name+',please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'">Verify</a>your mail.</p>'
//       }
//       transporter.sendMail(mailOptions,(error,info)=>{
//         if(error){
//             console.log(error);
//         }else{
//             console.log("Email has sent:-",info.response);
//         }
//       })
//     }catch(error){

//         console.log(error.message)
//     }
// }

// module.exports.verifymail = async(req,res)=>{

//     try{
//         const updateinfo = await usercollecn.updateOne({_id:req.query.id},{$set:{isverified:1}});
//         console.log(updateinfo);
//         res.render('page-login',{message:"Email has been verified. Please Login."});
//     }catch(error){
//         console.log(error.message)
//     }

// }

module.exports.postUserLogin = async (req, res) => {
  const logindata = await usercollecn.findOne({ email: req.body.email });
  if (!logindata) {
    res.render("page-login", { subreddit: "This email is not registered" });
  }
  if (logindata.status == "Blocked") {
    res.render("page-login", { subreddit: "User is Blocked" });
  }
  const passwordMatch = await bcrypt.compare(
    req.body.password,
    logindata.password
  );
  if (passwordMatch) {
    {
      try {
        email = req.body.email;
        const token = jwt.sign(email, secretKey);
        res.cookie("usertoken", token, { maxAge: 24 * 60 * 60 * 1000 });
        res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
        const product = await products.find({ status: "Available" });
        res.redirect("/");
      } catch (error) {
        console.error(error);
        next("Error");
      }
    }
  } else {
    res.redirect("/");
  }
};

module.exports.getUserLogin = (req, res) => {
  if (req.cookies.loggedIn) {
    res.redirect("/");
  } else {
    res.render("page-login");
  }
};

module.exports.getUserSignup = (req, res) => {
  res.render("page-signup");
};

module.exports.postUserSignup = async (req, res) => {
  try {
    const emailExists = await usercollecn.findOne({ email: req.body.email });
    const phoneExists = await usercollecn.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (emailExists) {
      res.render("page-signup", {
        error: "User with this email already exists. Try another email.",
      });
    } else if (phoneExists) {
      res.render("page-signup", {
        error:
          "User with this phone number already exists. Try another phone number.",
      });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await usercollecn.create({
        username: req.body.username,
        password: hashedPassword,
        confirmpassword: req.body.confirmpassword,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        otpInput: req.body.otpInput,
        referelId: uuid.v4(),
        status: "Unblocked",
        isverified: 0,
      });
      const currUser = await usercollecn.findOne({ email: req.body.email });
      await Wallet.create({
        userId: currUser._id,
        amount: 0,
      });
      res.render("page-login", { message: "User Sign in Successfully" });
    }
  } catch (error) {
    res.render("page-login", { error: "Error in sign-up" });
  }
};

module.exports.getSendOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2
      .services(process.env.TWILIO_SERVICES_ID)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: "sms",
      });
    setTimeout(() => {
      isOtpVerified = false;
    }, 60000);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

module.exports.postVerifyOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    const otp = req.query.otp;
    console.log(otp);
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number not provided" });
    }
    const verifyOTP = await twilio.verify.v2
      .services(process.env.TWILIO_SERVICES_ID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      res.status(200).json({ data: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports.getlogout = (req, res) => {
  res.clearCookie("usertoken");
  res.clearCookie("loggedIn");
  res.redirect("/get-login");
};
