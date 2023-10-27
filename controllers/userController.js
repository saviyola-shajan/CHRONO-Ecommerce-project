const mongoose = require("mongoose");
const usercollecn = require("../models/userlogin");
const cart = require("../models/cartModel")
const address = require("../models/address")
const nodemailer = require("nodemailer");
require("dotenv").config();
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const products = require("../models/addProduct");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

let isOtpVerified = false;
let phoneNumber;

module.exports.getHomePage = async (req, res) => {
  try {
    const loggedIn = req.user?true:false
    const product = await products.find({status:"Avaliable"})
    res.render("home", { product,loggedIn });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching products");
  }
};

//for send mail
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

//get the user signup page
module.exports.getUserSignup = (req, res) => {
  res.render("page-signup");
};
module.exports.getUserLogin = (req, res) => {
  res.render("page-login");
};

//posting user deatils to database
module.exports.postUserSignup = async (req, res) => {
  const signupdata = await usercollecn.findOne({ email: req.body.email });
  if (signupdata) {
    res.render("page-signup", {
      error: "User with this email already exist...! Try another email. ",
    });
  } else {
    if (isOtpVerified) {
      await usercollecn.create({
        username: req.body.username,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        otpInput: req.body.otpInput,
        status: "Unblocked",
        isverified: 0,
      });
      // const userdata = await usercollecn.findOne({
      //     username:req.body.username,
      //     email:req.body.email,
      //     });
      //     if(userdata){
      //     sendverifymail(req.body.username,req.body.email,userdata._id);

      //     }

      res.render("page-login", { message: "User Sign in Successfully" });
    } else res.render("page-signup", { error: "OTP is incorrect" });
  }
};


//  getting user home page
module.exports.getUserHomepage = async (req, res) => {
  const logindata = await usercollecn.findOne({ email: req.body.email });
  console.log(logindata);
  if (!logindata) {
    res.render("page-login", { subreddit: "This email is not registered" });
  } else if (logindata) {
    if (logindata.status == "Blocked") {
      res.render("page-login", { subreddit: "User is Blocked" });
    } else if (req.body.password !== logindata.password) {
      res.render("page-login", { subreddit: "Incorrect Password" });
    } else {
      if (
        req.body.email == logindata.email &&
        req.body.password == logindata.password
          
      ) {
        {
          try {
            const loggedIn =true;
            email = req.body.email;
            const token = jwt.sign(email, secretKey);
            res.cookie("token", token);
            const product = await products.find({status:"Avaliable"});
            res.render("home", {
              product: product,
              loggedIn:loggedIn,
              message: "User Logged in Successfully",
            });
          } catch (error) {
            console.error(error);
            res.status(500).send("Error fetching products");
          }
        }
      } else {
        res.redirect("/");
      }
    }
  }
};
// for sending otp
module.exports.getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
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

//for veriyfing otp
module.exports.getVerifyOtp = async (req, res) => {
  try {
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
      isOtpVerified = true;
      res.json({ message: "OTP verified successfully" });
    } else {
      isOtpVerified = false;
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

//to get single product page
module.exports.getSingleProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    const singleProduct = await products.findById(productId);
    if (!singleProduct) {
      return res.status(404).send("product not found");
    }
    res.render("single-product", { singleProduct });
  } catch (error) {
    console.error(error);
    res.status(500).send("error fetching product deatils");
  }
};


module.exports.getlogout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/page-login");
};

module.exports.getCart= async(req,res)=>{
try{
  const userData = await usercollecn.findOne({email:req.user})
  const userCart = await cart.findOne({userId:userData._id}).populate({
    path:'products.productId',
    model:'products'
  });
  console.log(userCart)
  res.render("cart",{userCart})
  
}catch(error){
  console.log('error while loading cart',error)
}    
}



 //  add a product to the user's cart
 module.exports.goTOCart = async (req, res) => {
  try {
    const userId = req.user.email;
    const userData = await usercollecn.findOne({email:req.user}) 
    const userid = userData._id;
    const { productId } = req.body;
    let userCart = await cart.findOne({ userId: userid });
    if (!userCart) {
      userCart = new cart({
        userId: userid,
        products: [],
      });
    }
    const existingProduct = userCart.products.find(
      (product) => product.productId.toString() === productId
    );

    if (existingProduct) {
      console.log("The product is already inside the cart.")
    } else {
      userCart.products.push({
        productId:new mongoose.Types.ObjectId(productId),
        quantity: 1,
      });
    }
    await userCart.save();

    res.json({ message: "Product added to the cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add the product to the cart" });
  }
};

module.exports.updateQuantity = async (req,res)=>{
  try{
  const productId = req.body.productId;
  console.log(productId)
  const newQuantity = req.body.quantity;
  console.log(newQuantity)
  const user=await usercollecn.findOne({email:req.user})
   const result = await cart.findOne({userId:user._id})
  for (const item of result.products) {
    if (item._id == productId) {
      await cart.updateOne(
        { userId: user._id, 'products._id': productId },
        { $set: { 'products.$.quantity': newQuantity } }
      );
    }
  }
   if(result){
   res.json({data :{productId,quantity:newQuantity}})
   }else{
    console.log("error");
   }
  }catch(error){
    console.log("error in updating quantity",error);
  }
};

module.exports.getUserAccount=async(req,res)=>{
 res.render("user-account")
}




