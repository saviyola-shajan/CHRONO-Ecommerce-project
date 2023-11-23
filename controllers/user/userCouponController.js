const coupon = require("../../models/coupon")
const usercollecn = require("../../models/userlogin");


module.exports.applyCoupon = async (req, res) => {
    try {
      const couponCode = req.query.couponCode;
      console.log(couponCode);
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
  