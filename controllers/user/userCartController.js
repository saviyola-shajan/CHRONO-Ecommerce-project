const cart = require("../../models/cartModel");
const usercollecn = require("../../models/userlogin");
const products = require("../../models/addProduct");
const mongoose = require("mongoose");




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