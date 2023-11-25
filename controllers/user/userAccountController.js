const usercollecn = require("../../models/userlogin");
const address = require("../../models/address");
const order = require("../../models/order");
const Wallet = require("../../models/wallet")
const bcrypt = require('bcrypt');


module.exports.getUserAccount = async (req, res,next) => {
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
      next("Error Fetching Products..!")
    }
  };

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

  module.exports.changePasswordUserAccount = async(req,res,next)=>{
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
  next("Error In Changing Password..!")
    }
  }