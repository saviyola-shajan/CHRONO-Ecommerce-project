const usercollecn=require("../models/userlogin")
const nodemailer = require("nodemailer");
const twilio = require('twilio')("ACd8863a0523ae02525d11b08b0a29caf3","4b76e44dd9a6b3e6b4e6527905d8fc52" );
const product =require("../models/addProduct");
const products = require("../models/addProduct");
const jwt =require("jsonwebtoken")

require("dotenv").config()
 let isOtpVerified=false; 
 let phoneNumber

 module.exports.getHomePage = async (req, res) => {
  try {
    const product = await products.find();
    res.render('home', { product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
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
module.exports.getUserSignup = (req,res)=>{
    res.render("page-signup")
}
module.exports.getUserLogin = (req,res)=>{
    res.render('page-login')
}

//posting user deatils to database
 module.exports.postUserSignup= async (req,res)=>{
   const signupdata = await usercollecn.findOne({email:req.body.email});
   if(signupdata){
    res.render("page-signup",{
        error:"User with this email already exist...! Try another email. "
    });
    }else{
      if(isOtpVerified){
    await usercollecn.create({
        username:req.body.username,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        otpInput:req.body.otpInput,
        status:"Unblocked",
        isverified:0
    });
    // const userdata = await usercollecn.findOne({
    //     username:req.body.username,
    //     email:req.body.email,
    //     });
    //     if(userdata){
    //     sendverifymail(req.body.username,req.body.email,userdata._id);

    //     }
  
    res.render("page-login")
   }  
   else
   res.render("page-signup",{error:"OTP is incorrect"})
    }
 };

//  getting user home page
module.exports.getUserHomepage= async(req,res)=>{
     const logindata = await usercollecn.findOne({email:req.body.email});
     if(!logindata){
        res.render('page-login',{subreddit:"This email is not registered"});
     }else
     if(logindata){
      if(logindata.status == "Blocked"){
        res.render('page-login',{subreddit:"User is Blocked"})
      }else if(req.body.password !== logindata.password){
            res.render('page-login',{subreddit:"Incorrect Password"});
        }else{
            if(req.body.email == logindata.email && 
              req.body.password == logindata.password){
                {
                  try{
                    email=req.body.email
                    const token = jwt.sign({email}, process.env.JWT_SECRET, { expiresIn: "1d" })
                    const verifyToken=jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
                      console.log(decoded);
                    })
                    const product= await products.find();
                    res.render('home',{product:product},{ message: "User Logged in Successfully", token });
                  }catch(error){
                    console.error(error);
                    res.status(500).send('Error fetching products');
                } }
     }else{
        res.redirect("/");
     } 
    } 
};
}
// for sending otp
 module.exports.getSendOtp = async (req, res) => {
    try {
      
      phoneNumber = req.query.phoneNumber;
      await twilio.verify.v2.services('VAeb37c55af123029f767a70dfc5d697db').verifications.create({
        to: `+91${phoneNumber}`,
        channel: "sms",
      });
    } catch (err) {
      console.error(err);
    }
  };

  //for veriyfing otp
  module.exports.getVerifyOtp = async (req, res) => {
    try {
      console.log(req.body)
      const otp = req.query.otp;
      console.log(otp)
      const verifyOTP = await twilio.verify.v2
        .services('VAeb37c55af123029f767a70dfc5d697db')
        .verificationChecks.create({
          to:`+91${phoneNumber}`,
          code: otp,
        });
        
      if (verifyOTP.valid) {
        isOtpVerified = true;
      } else {
        isOtpVerified = false;
      }
    } catch (err) {
      console.error(err);
    }
  };

  //to get single product page
  module.exports.getSingleProduct = async (req,res)=>{
    const productId = req.params.productId
    try{
      const singleProduct = await products.findById(productId)
      if(!singleProduct){
        return res.status(404).send("product not found")

      }
      res.render("single-product",{singleProduct})
    }catch(error){
      console.error(error)
      res.status(500).send("error fetching product deatils")
    }
    
}

//checking the user status
module.exports.postUserStatus = async (req, res) => {
  const userId = req.params.userId;
  const newStatus = req.body.status;

  try {
      const updatedUser = await usercollecn.findByIdAndUpdate(userId, { status: newStatus });

      res.status(200).json({ status: updatedUser.status });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user status.');
  }
};