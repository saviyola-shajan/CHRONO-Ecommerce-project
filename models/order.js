const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usercollecn",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["Order Placed", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Order Placed",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },
  paymentMethod: {
    type: String, 
    required: true, 
  },
  orderID:{
    type:String,
  },
  address:{
    type:Object,
    required:true,
  },
  cancelReason:{
    type:String,
  },
  returnReason:{
    type:String,
  },
  couponCode:{
      type:String
    },
   discount:{
    type:Number
   } 
},{timestamps:true}
);

const order = mongoose.model("order", orderSchema);
module.exports = order;