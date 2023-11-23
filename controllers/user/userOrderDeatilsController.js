const order = require("../../models/order");
const usercollecn = require("../../models/userlogin");
const products = require("../../models/addProduct");
const Wallet = require("../../models/wallet")



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