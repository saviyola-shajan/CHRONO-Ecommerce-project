const usercollecn = require("../../models/userlogin");
const wishlist = require("../../models/whishlist");
const cart = require("../../models/cartModel");
const mongoose = require("mongoose");


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