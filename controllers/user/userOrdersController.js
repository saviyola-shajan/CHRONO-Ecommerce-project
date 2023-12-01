const usercollecn = require("../../models/userlogin");
const address = require("../../models/address");
const coupon = require("../../models/coupon");
const cart = require("../../models/cartModel");
const Wallet = require("../../models/wallet");
const products = require("../../models/addProduct");
const order = require("../../models/order");
const Razorpay = require("razorpay");
require("dotenv").config();
const keyId = process.env.YOUR_KEY_ID;
const keySecret = process.env.YOUR_KEY_SECRET;
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

module.exports.getCheckout = async (req, res, next) => {
  try {
    const userData = await usercollecn.findOne({ email: req.user });
    const addresses = await address.findOne({ userId: userData._id });
    const coupons = await coupon.find({});
    const userCart = await cart.findOne({ userId: userData._id }).populate({
      path: "products.productId",
      model: "products",
    });
    if(!userCart || userCart.length === 0){
      return res.redirect("/")
    }
    const outOfStockProducts = userCart.products.filter((product) => {
      return product.productId.stock < product.quantity;
    });
    if (outOfStockProducts.length > 0) {
      const outOfStockProductNames = outOfStockProducts.map(
        (product) => product.productId.name
      );
      return res.render("cart", {
        userCart,
        error: `Some products (${outOfStockProductNames.join(
          ", "
        )}) are out of stock. Please review your cart.`,
      });
    }
    res.render("checkout", { addresses, userCart, coupons });
  } catch (error) {
    console.log(error);
    next("Error in Loading Checkout");
  }
};

module.exports.getPlaceOrder = async(req, res, next) => {
  try {
    res.render("place-order");
  } catch (error) {
    console.log(error);
    next("Error in Loading Place order");
  }
};

module.exports.postOrdersCod = async (req, res, next) => {
  try {
    const UseraddressId = req.body.addressId;
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userdata._id });
    const userCoupon = await coupon.findOne({ redeemedUsers: userdata._id });
    const userCart = await cart.findOne({ userId: userdata._id }).populate({
      path: "products.productId",
      model: "products",
    });
     
    let amount = 0;
    let code = "";
    if (userCoupon) {
      amount = userCoupon.amount;
      code = userCoupon.couponCode;
    }

    let orderTotal = 0;
    let orderProducts = [];

    for (const item of userCart.products) {
        if (item.productId.stock < item.quantity) {
         return res.status(200).json({codOutOfStock:true})
        }
      const orderItem = {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.s_price,
      };
      await products.updateOne(
        { _id: orderItem.productId },
        { $inc: { stock: -orderItem.quantity } }
      );
      orderTotal += orderItem.price * orderItem.quantity;
      orderProducts.push(orderItem);
    }
    const grandtotal = orderTotal - amount;

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
      discount: amount,
      couponCode: code,
      paymentMethod: "Cash on delivery",
      address: delAddress,
    });

    await newOrder.save();
    await cart.deleteOne({ userId: userdata._id });
    res.status(200).json("order placed")
  } catch (error) {
    console.log(error);
    next("Error while Placing COD");
  }
};

module.exports.onlinePayment = async (req, res, next) => {
  try {
    const UseraddressId = req.query.addressId;
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userAddress = await address.findOne({ userId: userdata._id });
    const userCoupon = await coupon.findOne({ redeemedUsers: userdata._id });
    const userCart = await cart.findOne({ userId: userdata._id }).populate({
      path: "products.productId",
      model: "products",
    });

    let amount = 0;
    let code = "";
    if (userCoupon) {
      amount = userCoupon.amount;
      code = userCoupon.couponCode;
    }
    let orderTotal = 0;
    let orderProducts = [];
    for (const item of userCart.products) {
      if (item.productId.stock < item.quantity) {
        return res.status(200).json({codOutOfStock:true})
       }
      const orderItem = {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.s_price,
      };
      await products.updateOne(
        { _id: orderItem.productId },
        { $inc: { stock: -orderItem.quantity } }
      );
      orderTotal += orderItem.price * orderItem.quantity;
      orderProducts.push(orderItem);
    }

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

    const newTotal = orderTotal - amount;
    var options = {
      amount: newTotal * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    razorpay.orders.create(options, async function (err, razorOrder) {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        res
          .status(500)
          .json({ error: "An error occurred while placing the order." });
      } else {
        console.log(razorOrder);
        const newOrder = await order.create({
          userId: userdata._id,
          orderID: razorOrder.id,
          products: orderProducts,
          orderDate: new Date(),
          address: delAddress,
          totalAmount: newTotal,
          discount: amount,
          couponCode: code,
          paymentMethod: "online Payment",
        });
        await newOrder.save();
        res
          .status(200)
          .json({ message: "Order placed successfully.", razorOrder });
      }
    });
    await cart.deleteOne({ userId: userdata._id });
  } catch (error) {
    console.log(error);
    next("Error while Placing Online Payment");
  }
};

module.exports.walletPayment = async (req, res, next) => {
  try {
    const UseraddressId = req.body.addressId;
    const grandTotal = req.body.totalAmount;
    const userId = req.user;
    const userdata = await usercollecn.findOne({ email: req.user });
    const userCoupon = await coupon.findOne({ redeemedUsers: userdata._id });
    const wallet = await Wallet.findOne({ userId: userdata._id });
    if (wallet.amount >= grandTotal) {
      let totalAmount = 0;
      const walletAmount = wallet.amount;
      const finalWalletAmount = walletAmount - grandTotal;

      const userCart = await cart.findOne({ userId: userdata._id }).populate({
        path: "products.productId",
        model: "products",
      });
      const userAddress = await address.findOne({ userId: userdata._id });
      let orderTotal = 0;
      let orderProducts = [];
      for (const item of userCart.products) {
        if (item.productId.stock < item.quantity) {
          return res.status(200).json({codOutOfStock:true})
         }
        const orderItem = {
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.s_price,
        };
        await products.updateOne(
          { _id: orderItem.productId },
          { $inc: { stock: -orderItem.quantity } }
        );
        orderTotal += orderItem.price * orderItem.quantity;
        orderProducts.push(orderItem);
      }
      let amount = 0;
      let code = "";
      if (userCoupon) {
        amount = userCoupon.amount;
        code = userCoupon.couponCode;
      }
      const grandtotal = orderTotal - amount;
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
        discount: amount,
        couponCode: code,
        paymentStatus: "Success",
        paymentMethod: "Wallet",
        address: delAddress,
      });
      await cart.deleteOne({ userId: userdata._id });
      await Wallet.updateOne(
        { userId: userdata._id },
        {
          $set: {
            amount: finalWalletAmount,
          },
        }
      );
      res.status(200).json({ data: "order placed" });
    } else {
      res
        .status(200)
        .json({
          staus:true,
        });
    }
  } catch (error) {
    console.log(error);
    next("Error while Paying With Wallet");
  }
};

module.exports.paymentStatus = async (req, res, next) => {
  try {
    const orderStatus = req.query.status;
    const orderItem = await order.updateOne(
      { orderID: req.query.orderId },
      { $set: { paymentStatus: orderStatus } }
    );
    if (orderStatus == "Success") {
      res.redirect("/placeorder");
    }
  } catch (error) {
    console.log(error);
    next("Error while Updating payment Status");
  }
};
