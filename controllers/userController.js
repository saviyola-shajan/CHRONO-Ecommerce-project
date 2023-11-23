const mongoose = require("mongoose");
const usercollecn = require("../models/userlogin");
const cart = require("../models/cartModel");
const address = require("../models/address");
const order = require("../models/order");
const products = require("../models/addProduct");
const wishlist = require("../models/whishlist");
const coupon = require("../models/coupon")
const Wallet = require("../models/wallet")
const bcrypt = require('bcrypt');
const uuid = require("uuid")
const category = require("../models/category");
const Razorpay =require("razorpay")
const nodemailer = require("nodemailer");
require("dotenv").config();
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const keyId =process.env.YOUR_KEY_ID
const keySecret=process.env.YOUR_KEY_SECRET
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

//get user home page
module.exports.getHomePage = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const page = req.query.page ?? 1;
    const no_of_docs_each_page = 6;
    const totalProducts = await products.countDocuments({
      status: "Available" 
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;

    const product = await products
    .find({ status:"Available"})
    .skip(skip)
    .limit(no_of_docs_each_page);
    res.render("home", { product, loggedIn,page,totalPages });
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

//get user login
module.exports.getUserLogin = (req, res) => {
  if (req.cookies.loggedIn) {
    res.redirect("/");
  } else {
    res.render("page-login");
  }
};

//posting user deatils to database
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
        referelId:uuid.v4(),
        status: "Unblocked",
        isverified: 0,
      })
   const currUser = await usercollecn.findOne({email:req.body.email})
      await Wallet.create({
        userId: currUser._id, 
        amount:0,
      });
      res.render("page-login", { message: "User Sign in Successfully" });
    }
  } catch (error) {
    res.render("page-login", { error: "Error in sign-up" });
  }
};

//  check user login deatils and create session
module.exports.postUserLogin = async (req, res) => {
  const logindata = await usercollecn.findOne({ email: req.body.email });
  if (!logindata) {
    res.render("page-login", { subreddit: "This email is not registered" });
  }
    if (logindata.status == "Blocked") {
      res.render("page-login", { subreddit: "User is Blocked" });
    } 
      const passwordMatch = await bcrypt.compare(req.body.password, logindata.password);
      if(passwordMatch){
        {
          try {
            email = req.body.email;
            const token = jwt.sign(email, secretKey);
            res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });
            res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });
            const product = await products.find({ status: "Available" });
            res.redirect("/");
          } catch (error) {
            console.error(error);
            res.status(500).send("Error fetching products");
          } 
        }
      } else {
        res.redirect("/");
      }
    }

// for sending otp
module.exports.getSendOtp = async (req, res) => {
  try {
    console.log("hey");
    const phoneNumber = req.query.phoneNumber;
    console.log(phoneNumber);
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
module.exports.postVerifyOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    const otp = req.query.otp;
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

//to get single product page
module.exports.getSingleProduct = async (req, res) => {
  const loggedIn =req.cookies.loggedIn
  const productId = req.params.productId;
  try {
    const singleProduct = await products.findById(productId);
    if (!singleProduct) {
      return res.status(404).send("product not found");
    }
    res.render("single-product", { singleProduct,loggedIn });
  } catch (error) {
    console.error(error);
    res.status(500).send("error fetching product deatils");
  }
};

// for logout
module.exports.getlogout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("loggedIn");
  res.redirect("/get-login");
};

// get cart page
module.exports.getCart = async (req, res) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "products",
    });
    res.render("cart", { userCart,error:null});
  } catch (error) {
    console.log("error while loading cart", error);
  }
};

//add products to cart and save in DB
module.exports.goTOCart = async (req, res) => {
  try {
    const userid = req.user.email;
    const userData = await usercollecn.findOne({ email: req.user });
    const userId = userData._id;
    const { productId ,quantity} = req.query;
    const product = await products.findOne({_id:productId})
    if (product.stock <= 0) {
     return res.status(200).json({ error: "Product is out of stock",isProductAdded: false  });
    }
    
    let userCart = await cart.findOne({ userId });
    if (!userCart) {
      userCart = new cart({
        userId,
        products: [],
      });
    }

    const existingProductIndex = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (existingProductIndex !== -1) {
      userCart.products[existingProductIndex].quantity += 1;
    } else {
      userCart.products.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity: 1,
      });
    }

    await userCart.save();

    res.status(200).json({ message: "Product added to the cart",isProductAdded: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add the product to the cart", isProductAdded: false });
  }
};

//  module.exports.goTOCart = async (req, res) => {
//   try {
//     const userId = req.user.email;
//     const userData = await usercollecn.findOne({email:req.user})
//     const userid = userData._id;
//     const { productId } = req.body;
//     let userCart = await cart.findOne({ userId: userid });
//     if (!userCart) {
//       userCart = new cart({
//         userId: userid,
//         products: [],
//       });
//       console.log(userCart);
//     }
//     const existingProduct = userCart.products.find(
//       (product) => product.productId.toString() === productId
//     );

//     if (existingProduct) {
//       userCart.products[existingProduct].quantity += 1;
//     } else {
//       userCart.products.push({
//         productId:new mongoose.Types.ObjectId(productId),
//         quantity: 1,
//       });
//     }
//     console.log(userCart);
//     await userCart.save();

//     res.json({ message: "Product added to the cart" });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ error: "Failed to add the product to the cart" });
//   }
// };

module.exports.updateQuantity = async (req, res) => {
  try {
    const productId = req.body.productId;
    const newQuantity = req.body.quantity;
    const user = await usercollecn.findOne({ email: req.user });
    const result = await cart.findOne({ userId: user._id });
    for (const item of result.products) {
      if (item._id == productId) {
        await cart.updateOne(
          { userId: user._id, "products._id": productId },
          { $set: { "products.$.quantity": newQuantity } }
        );
      }
    }
    if (result) {
      res.json({ data: { productId, quantity: newQuantity } });
    } else {
      console.log("error");
    }
  } catch (error) {
    console.log("error in updating quantity", error);
  }
};

//get user account deatils
module.exports.getUserAccount = async (req, res) => {
  try {
    const userId = await usercollecn.findOne({ email: req.user });
    const useraddress = await address.findOne({ userId: userId._id });
    const listorders = await order.find({ userId: userId._id }).sort({orderDate:-1}).populate({
      path: "products.productId",
      model: "products",
    });
    const wallet = await Wallet.findOne({userId:userId._id})
    res.render("user-account", { userId, useraddress, listorders,wallet });
  } catch (error) {
    console.log(error);
  }
};

//change current password from user account
module.exports.changePasswordUserAccount = async(req,res)=>{
  try{
   const{name,email,password,npassword,cpassword} = req.body
   const user = await usercollecn.findOne({email:req.user})
   if (!user) {
    return res.status(404).json({ data: "User not found" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    const hashedNewPassword = await bcrypt.hash(npassword, 10);
    await usercollecn.updateOne(
      { _id: user._id },
      {
        $set: {
          username: name,
          email: email,
          password: hashedNewPassword,
        },
      }
    );
    return res.redirect("/user-account");
  } else {
    return res.status(401).json({ data: "Incorrect password" });
  }
  }catch(error){
console.log(error)
  }
}

//user referel offer
module.exports.applyReferelOffers = async (req, res) => {
  try {
    const referelcode = req.query.referel;
    const userId = req.user;
    const userData = await usercollecn.findOne({ email: userId });
    const usedReferel = await usercollecn.findOne({ referelId: referelcode });

    if (usedReferel) {
      if (usedReferel.redmmedreferels.includes(userData._id)) {
        res.status(400).send({data: "Offer already redeemed by the user" });
      } else {
        usedReferel.redmmedreferels.push(userData._id);
        await usedReferel.save();
        await usercollecn.updateOne({ _id: userData._id }, { $set: { appliedReferel: true } });

        const userWallet = await Wallet.findOne({ userId: userData._id });
        userWallet.amount += 100;
        await userWallet.save();

        const referedUserWallet = await Wallet.findOne({ userId: usedReferel._id });
        referedUserWallet.amount += 200;
        await referedUserWallet.save();

        res.status(200).send({ data: "Offer redeemed successfully" });
      }
    } else {
      res.status(500).send({ data: "Invalid referral code" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ data: "Internal Server Error" });
  }
};



//remove item from cart
module.exports.removeFromCart = async (req, res) => {
  try {
    const user = await usercollecn.findOne({ email: req.user });
    const productId = req.params.productId;
    const updateproduct = await cart.updateOne(
      { userId: user._id },
      {
        $pull: {
          products: {
            productId: productId,
          },
        },
      }
    );
    res.redirect("/cart");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//cart to checkout page
module.exports.getCheckout = async (req, res) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    const addresses = await address.findOne({ userId: userData._id });
    const coupons = await coupon.find({})
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "products",
    });
    
    const outOfStockProducts = userCart.products.filter(product => {
      return product.productId.stock < product.quantity;
    });
    if (outOfStockProducts.length > 0) {
      const outOfStockProductNames = outOfStockProducts.map(product => product.productId.name);
      return res.render("cart", {
        userCart,
        error: `Some products (${outOfStockProductNames.join(', ')}) are out of stock. Please review your cart.`
      });    
    }
    res.render("checkout", { addresses, userCart,coupons});
  } catch (error) {
    console.log("error while loading cart", error);
  }
};

//get address page
module.exports.getAddAddress = async (req, res) => {
  res.render("add-address");
};

//post address to DB
module.exports.postAddAddress = async (req, res) => {
  try {
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userdata._id });
    const {
      addressType,
      userName,
      city,
      landMark,
      state,
      pinCode,
      phoneNumber,
      altPhone,
    } = req.body;

    if (userAddress) {
      userAddress.address.push({
        addressType,
        userName,
        city,
        landMark,
        state,
        pinCode,
        phoneNumber,
        altPhone,
      });
      await userAddress.save();
    } else {
      const newUser = new address({
        userId: userdata._id,
        address: {
          addressType,
          userName,
          city,
          landMark,
          state,
          pinCode,
          phoneNumber,
          altPhone,
        },
      });
      await newUser.save();
    }
    res.redirect("/user-account");
  } catch (error) {
    console.log(error);
    res.render("user-account", { error: "Failed to add address" });
  }
};

// edit address
module.exports.getEditAddress = async(req,res)=>{
  try{
     const userdata = await usercollecn.findOne({email:req.user})
    const useraddress = await address.findOne({userId:userdata._id})
    let thataddress;
    useraddress.address.forEach((address)=>{
      if(address._id==req.query.addressId){
      thataddress=address
      }
    })
    res.render("edit-address",{thataddress})
    
  }catch(error){
 console.log(error)
  }
  
}
//post edited address
module.exports.postEditedAddress = async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const addressType = req.body.addressType;
    const userName = req.body.userName;
    const city = req.body.city;
    const landMark = req.body.landMark;
    const state = req.body.state;
    const pinCode = req.body.pinCode;
    const phoneNumber = req.body.phoneNumber;
    const altPhone = req.body.altPhone;
    const userData = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userData._id });

    const existingAddressIndex = userAddress.address.findIndex(
      (address) => address._id == addressId
    );

    if (existingAddressIndex !== -1) {
      userAddress.address[existingAddressIndex].addressType = addressType;
      userAddress.address[existingAddressIndex].userName = userName;
      userAddress.address[existingAddressIndex].city = city;
      userAddress.address[existingAddressIndex].landMark = landMark;
      userAddress.address[existingAddressIndex].state = state;
      userAddress.address[existingAddressIndex].pinCode = pinCode;
      userAddress.address[existingAddressIndex].phoneNumber = phoneNumber;
      userAddress.address[existingAddressIndex].altPhone = altPhone;
      userAddress.address[existingAddressIndex].userData = userData;

      await userAddress.save();

      res.redirect("/user-account");
    } else {
      res.status(404).send("Address not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};


module.exports.getPlaceOrder = (req,res)=>{
  res.render("place-order")
}


//save orders to the DB (COD)
module.exports.postOrdersCod = async (req, res) => {
  try {
    const UseraddressId = req.body.addressId;
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userdata._id });
    const userCoupon= await coupon.findOne({redeemedUsers:userdata._id})
    const userCart = await cart.findOne({ userId: userdata._id }).populate({
      path: "products.productId",
      model: "products",
    });
    let amount=0;
    let code='';
  if(userCoupon){
    let amount=userCoupon.amount
    let code=userCoupon.couponCode
  }

    let orderTotal = 0;
    let orderProducts = [];

    for (const item of userCart.products) {
      const orderItem = {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.s_price,
      };
      await products.updateOne({ _id: orderItem.productId }, { $inc: { stock: -orderItem.quantity } });
      orderTotal += orderItem.price * orderItem.quantity;
      orderProducts.push(orderItem);
    };
    const grandtotal =orderTotal-amount

    let delAddress;
    userAddress.address.forEach((addressId) => {
      if (UseraddressId == addressId._id.toString()) {
        delAddress = {
          addressType: addressId.addressType,
          userName: addressId.userName,
          city: addressId.city,
          landMark: addressId.landMark,
          state: addressId.state,
          pincode: addressId.pinCode,
          phoneNumber: addressId.phoneNumber,
          altPhone: addressId.altPhone,
        };
      }
    });

    const newOrder = await order.create({
      userId: userCart.userId._id,
      products: orderProducts,
      orderDate: new Date(),
      totalAmount: grandtotal,
      discount:amount,
      couponCode:code,
      paymentMethod: "Cash on delivery",
      address: delAddress,
    });

    await newOrder.save();
    await cart.deleteOne({ userId: userdata._id });
    res.redirect("/placeorder");
  } catch (error) {
    console.log(error);
  }
};

//post order to DB (online payment)
module.exports.onlinePayment =  async (req, res) => {
  try {
    const UseraddressId =req.query.addressId
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({userId:userdata._id})
    const userCoupon= await coupon.findOne({redeemedUsers:userdata._id})
    const userCart = await cart.findOne({ userId: userdata._id }).populate({
      path: "products.productId",
      model: "products",
    });
    let amount=0;
    let code='';
    if(userCoupon){
  let amount=userCoupon.amount
  let code = userCoupon.couponCode
    }  
    let orderTotal = 0;
    let orderProducts = [];
    for (const item of userCart.products) {
      const orderItem = {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.s_price,
      };
      await products.updateOne({ _id: orderItem.productId }, { $inc: { stock: -orderItem.quantity } });
      orderTotal += orderItem.price * orderItem.quantity;
      orderProducts.push(orderItem);
    };

    let delAddress;
    userAddress.address.forEach((addressId) => {
      if (UseraddressId == addressId._id.toString()) {
        delAddress = {
          addressType: addressId.addressType,
          userName: addressId.userName,
          city: addressId.city,
          landMark: addressId.landMark,
          state: addressId.state,
          pincode: addressId.pinCode,
          phoneNumber: addressId.phoneNumber,
          altPhone: addressId.altPhone,
        };
      }
    });

    const newTotal = orderTotal-amount
    var options = {
      amount: newTotal *100, 
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    razorpay.orders.create(options, async function (err, razorOrder) {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ error: "An error occurred while placing the order." });
      } else {
        console.log(razorOrder);
        const newOrder = await order.create({
          userId: userdata._id,
          orderID: razorOrder.id,
          products: orderProducts,
          orderDate: new Date(),
          address: delAddress,
          totalAmount: newTotal,
          discount:amount,
          couponCode:code,
          paymentMethod: "online Payment",
        });
        await newOrder.save(); 
        res.status(200).json({ message: "Order placed successfully.", razorOrder });
      }
    });
    await cart.deleteOne({ userId: userdata._id });
  } catch (error) {
    console.log(error);
  }
};

//wallet payment
module.exports.walletPayment = async(req,res)=>{
  try{
    const UseraddressId =req.body.addressId
    const grandTotal =req.body.totalAmount
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userCoupon= await coupon.findOne({redeemedUsers:userdata._id})
    const wallet = await Wallet.findOne({userId:userdata._id})
    if(wallet.amount>=grandTotal){
      let totalAmount =0;
      const walletAmount = wallet.amount
      const finalWalletAmount = walletAmount-grandTotal
    
    const userCart = await cart.findOne({ userId: userdata._id }).populate({
      path: "products.productId",
      model: "products",
    });
    const userAddress = await address.findOne({userId:userdata._id})
    let orderTotal=0
    let orderProducts = [];
    for (const item of userCart.products) {
      const orderItem = {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.s_price,
      };
      await products.updateOne({ _id: orderItem.productId }, { $inc: { stock: -orderItem.quantity } });
      orderTotal += orderItem.price * orderItem.quantity;
      orderProducts.push(orderItem);
    };
    let amount=0;
    let code='';
    if(userCoupon){
    let amount=userCoupon.amount
    let code = userCoupon.couponCode
    }
    const grandtotal=orderTotal-amount
    let delAddress;
    userAddress.address.forEach((addressId) => {
      if (UseraddressId == addressId._id.toString()) {
        delAddress = {
          addressType: addressId.addressType,
          userName: addressId.userName,
          city: addressId.city,
          landMark: addressId.landMark,
          state: addressId.state,
          pincode: addressId.pinCode,
          phoneNumber: addressId.phoneNumber,
          altPhone: addressId.altPhone,
        };
      }
    });

    const newOrder = await order.create({
      userId: userCart.userId._id,
      products: orderProducts,
      orderDate: new Date(),
      totalAmount: grandtotal,
      discount:amount,
      couponCode:code,
      paymentStatus:"Success",
      paymentMethod: "Wallet",
      address: delAddress,
    });
    await cart.deleteOne({ userId: userdata._id });
    await Wallet.updateOne({userId: userdata._id },{$set:{
      amount:finalWalletAmount
    }})
    res.status(200).json({data:"order placed"})
  }else{
    res.status(500).json({error:"Insufficient Balance in Wallet, Try with another payement method!"})
  }
}catch(error){
  console.log(error)
  }
}

// online payment status
module.exports.paymentStatus = async (req,res)=>{
  try{
    const orderStatus = req.query.status
const orderItem = await order.updateOne({orderID:req.query.orderId},{$set:{paymentStatus:orderStatus}})
if(orderStatus=="Success"){
res.redirect("/placeorder") 
}   
  }catch(error){
    console.log(error)
  }
}

//get password reset page
module.exports.getPasswordResetPage = (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    res.render("forgotpassword", { loggedIn });
  } catch (error) {
    console.log(error);
  }
};

//get password reset otp
module.exports.getPasswordResetOtp = async (req, res) => {
  try {
    const userEmail = req.query.email;
    const user = await usercollecn.findOne({ email: userEmail });
    if (user) {
      await twilio.verify.v2
        .services(process.env.TWILIO_SERVICES_ID)
        .verifications.create({
          to: `+91${user.phoneNumber}`,
          channel: "sms",
        })
        .then(() => {
          res.status(200).json({ data: "send" });
        });
    } else {
      res.status(500).json({ data: "user with this Email don't exist" });
    }
  } catch (error) {
    console.log(error);
  }
};

//get verify password reset otp
module.exports.getVerifyPasswordResetOtp = async (req, res) => {
  try {
    const otp = req.query.otp;
    const email = req.query.email;
    const user = await usercollecn.findOne({ email: email });
    const verifyOTP = await twilio.verify.v2
      .services(process.env.TWILIO_SERVICES_ID)
      .verificationChecks.create({
        to: `+91${user.phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      
      res.status(200).json({ data: "verified" });
    } else {
      res.status(500).json({ data: "OTP incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};

//change password page
module.exports.changePassword = async (req, res) => {
  try {
    const Email = req.query.email;
    const loggedIn = req.cookies.loggedIn;
    res.render("changepassword", { Email, loggedIn });
  } catch (error) {
    console.log(error);
  }
};

//save new password to DB
module.exports.postNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedNewPassword = await bcrypt.hash(password, 10);
    await usercollecn.updateOne(
      { email: email },
      { $set: { password: hashedNewPassword } }
    );
    res.status(200).json({ data: "password Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "passwor updatiom failed" });
  }
};

// get order details page
module.exports.orderDeatils = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetails = await order.findById({ _id: orderId}).populate({
      path: "products.productId",
      model: "products",
    });
    res.render("orderdetails", { orderDetails });
  } catch (error) {
    console.log(error);
  }
};

// get invoice page
module.exports.getInvoice = async (req,res)=>{
  try{
    const orderid =req.params.orderId
  const orders = await order.findById({_id:orderid}).populate({
    path:"products.productId",
    model:"products"
  })
    res.render("invoice",{orders})
  }catch(error){
console.log(error)
  }
}


//handling cancels
module.exports.productCancel = async (req, res) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    let userCancel = await order.findOne({ userId: userData._id });
    const cancelledOrder = await order.findOne({ _id: req.body.orderID });
    await order.updateOne(
      { _id: req.body.orderID },
      { $set: { orderStatus: "Cancelled", cancelReason: req.body.reason } }
    );

    for (const item of cancelledOrder.products) {
      await products.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    }

    const newOrder = await order.findOne({_id:req.body.orderID})
    const userwallet = await Wallet.findOne({userId:userData._id})
    const walletAmount = userwallet.amount ?? 0;
    const totalOrderAmount = newOrder.totalAmount ?? 0
    const newWalletAmount = walletAmount+totalOrderAmount
    if(newOrder.paymentStatus == "Success"){
      await Wallet.updateOne({userId:userData._id},{$set:{
        amount:newWalletAmount
      }})
    }

    res.redirect("/user-account");
  } catch (error) {
    console.log("An error happened while processig return! :" + error);
  }
};

//handling returns
module.exports.returnOrder = async (req, res) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    let userReturn = await order.findOne({ userId: userData._id });
    const returnedOrder = await order.findOne({ _id: req.body.orderID });
    await order.updateOne(
      { _id: req.body.orderID },
      { $set: { orderStatus: "Returned", returnReason: req.body.reason } }
    );

    for (const item of returnedOrder.products) {
      await products.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    }

    const newOrder = await order.findOne({_id:req.body.orderID})
    const userwallet = await Wallet.findOne({userId:userData._id})
    const walletAmount = userwallet.amount ?? 0;
    const totalOrderAmount = newOrder.totalAmount ?? 0
    const newWalletAmount = walletAmount+totalOrderAmount
    if(newOrder.paymentStatus == "Success"){
      await Wallet.updateOne({userId:userData._id},{$set:{
        amount:newWalletAmount
      }})
    }
    res.redirect("/user-account");
  } catch (error) {
    console.log("An error happened while processig return! :" + error);
  }
};

//search in home page
module.exports.searchProducts = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const { search_product } = req.query;
    const page = req.query.page
    const no_of_docs_each_page = 6;
    const totalProducts = await products.countDocuments({
      status: "Available" 
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;

    const regex = new RegExp(search_product, "i");
    const product = await products
    .find({  name: regex,status:"Available"})
    .skip(skip)
    .limit(no_of_docs_each_page);
    if (product.length === 0) {
      res.render("home", { message: "No products found", product, loggedIn,page,totalPages });
    } else {
      res.render("home", { product, loggedIn,page,totalPages });
    }
  } catch (error) {
    console.log(error);
  }
};

//filter category
module.exports.filterCategory = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const categories = req.query.category;
    const page = req.query.page
    const no_of_docs_each_page = 6;
    const totalProducts = await products.countDocuments({
      status: "Available" 
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;

    const product = await products
    .find({ status:"Available",category: categories})
    .skip(skip)
    .limit(no_of_docs_each_page);
    if (product.length === 0) {
      res.render("home", {
        message: "No items found in specified category",
        product,
        loggedIn,
        page,
        totalPages
      });
    } else {
      res.render("home", { product, loggedIn,page,totalPages });
    }
  } catch (error) {
    console.log(error);
  }
};

//get filter checkbox sidebar
module.exports.getFiterCheckbox = async(req,res)=>{
  try{
    const loggedIn = req.cookies.loggedIn;
    const selectedBrands = req.body.brand;
    const selectedMovements = req.body.Movement;
    const selectedStrapMaterials = req.body.StrapMaterial;
    const page = req.query.page ?? 1;
    const no_of_docs_each_page = 6;
    const totalProducts = await products.countDocuments({
      status: "Available" 
    });
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    const skip = (page - 1) * no_of_docs_each_page;

    const query = { status:"Available"};

    if (selectedBrands && selectedBrands.length > 0) {
      query.brand = { $in: selectedBrands };
    }
    
    if (selectedMovements && selectedMovements.length > 0) {
      query.movement = { $in: selectedMovements };
    }
    
    if (selectedStrapMaterials && selectedStrapMaterials.length > 0) {
      query.strap_material = { $in: selectedStrapMaterials };
    }

    const product = await products
    .find(query)
    .skip(skip)
    .limit(no_of_docs_each_page);
    // const product = await products.find(query);
   res.render("home",{loggedIn,product,page,totalPages})
  }catch(error){
    console.log(error)
    res.status(500).send('Internal Server Error');
  }
}

// filter by price
module.exports.filterByPrice = async (req, res) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    const sortBy = req.query.sortBy || 'lowToHigh';
    const page = req.query.page ?? 1;
    const no_of_docs_each_page = 6;
    const skip = (page - 1) * no_of_docs_each_page;
    
    let product
    if (sortBy === 'lowToHigh') {
       product = await products
      .find({status: 'Available'})
      .sort({s_price: 1})
      .skip(skip)
      .limit(no_of_docs_each_page)
    } else if (sortBy === 'highToLow') {
      const anotherproduct = await products
      .find({status: 'Available'})
      .sort({s_price: -1})
      .skip(skip)
      .limit(no_of_docs_each_page)
      product = anotherproduct;
    }
    const totalProducts = await products.countDocuments({status: 'Available'});
    const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
    res.render('home', { loggedIn, product, page, totalPages, sortBy });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

 
// get wishlist
module.exports.getWishlist = async (req, res) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    const userWishlist = await wishlist
      .findOne({ userId: userData._id })
      .populate({
        path: "products.productId",
        model: "products",
      });
    res.render("wishlist", { userWishlist });
  } catch (error) {
    console.log("error while loading cart", error);
  }
};

//add products to wishlist
module.exports.goToWishlist = async (req, res) => {
  try {
    const userid = req.user.email;
    const userData = await usercollecn.findOne({ email: req.user });
    const userId = userData._id;
    const { productId } = req.query;

    const existingWishlist = await wishlist.findOne({ userId });
    if (existingWishlist) {
      const existingProduct = existingWishlist.products.find(
        (product) => product.productId.toString() === productId
      );

      if (existingProduct) {
        return res.status(500).json({ message: "Product already in the Wishlist" });
      }

      existingWishlist.products.push({
        productId: new mongoose.Types.ObjectId(productId),
      });

      await existingWishlist.save();
    } else {
      const newWishlist = new wishlist({
        userId,
        products: [{ productId }],
      });

      await newWishlist.save();
    }

    res.json({ message: "Product added to the Wishlist" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to add the product to the Wishlist" });
  }
};

//remove products from wishlist
module.exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await usercollecn.findOne({ email: req.user });
    const productId = req.params.productId;
    const updateproduct = await wishlist.updateOne(
      { userId: user._id },
      {
        $pull: {
          products: {
            productId: productId,
          },
        },
      }
    );
    res.redirect("/wishlist");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//add to cart from wishlist
module.exports.wishlistToCart = async (req, res) => {
  try {
    const userId = req.user;
    const userData = await usercollecn.findOne({ email: req.user });
    const productId = req.params.productId;
    const updateproduct = await wishlist.updateOne(
      { userId: userData._id },
      {
        $pull: {
          products: {
            productId: productId,
          },
        },
      }
    );
    const userCart = await cart.findOne({ userId: userData._id });
    if (!userCart) {
      const newCart = new cart({
        userId,
        products: [productId],
      });
      await newCart.save();
    } else {
      userCart.products.push({
        productId: productId,
        quantity: 1,
      });
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error);
  }
};

//coupon apply
module.exports.applyCoupon = async (req, res) => {
  try {
    const couponCode = req.query.couponCode;
    const totalAmount = parseFloat(req.query.grandTotal);
    const userId = req.user; 
    const userData = await usercollecn.findOne({ email: userId });

    const usedCoupon = await coupon.findOne({ couponCode: couponCode });
    const currentDate = new Date();

    if (usedCoupon) {
      if (usedCoupon.redeemedUsers.includes(userData._id)) {
        res.status(500).send({ message: "Coupon already redeemed by the user" })
      } else if (usedCoupon.minimumPurchase > totalAmount) {
        res.status(500).send({ message: "Minimum Purchase Amount is required" })
      } else if (usedCoupon.status === "Inactive") {
        res.status(500).send({ message: "Coupon is Inactive" })
      } else if (usedCoupon.expiryDate && usedCoupon.expiryDate.getTime() < currentDate.getTime()) {
        res.status(500).send({ message: "Coupon is Expired" })
      } else {
        usedCoupon.redeemedUsers.push(userData._id);
        await usedCoupon.save();

        const couponAmount = parseFloat(usedCoupon.amount);
        const updatedTotal = Math.max(totalAmount - couponAmount, 0);

        res.status(200).json({
          message: "Coupon redeemed successfully",
          couponAmount: couponAmount,
          updatedTotal: updatedTotal.toFixed(2),
        });
      }
    } else {
      res.status(404).send({ message: "Coupon not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

//remove coupon
module.exports.removeCoupon = async(req,res)=>{
  try{
    const couponCode = req.query.couponCode;
    const userId = req.user; 
    const userData = await usercollecn.findOne({ email: userId });
    const usedCoupon = await coupon.findOne({ couponCode: couponCode });
    if (usedCoupon) {
      const redeemedUserId = userData._id.toString();
      const removecoupon = await coupon.updateOne(
        { couponCode: couponCode },
        { $pull: { redeemedUsers: redeemedUserId } },
    );}
    res.redirect("/checkout")
  }catch(error){
    console.log(error)
  }
}
