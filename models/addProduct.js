const mongoose = require("mongoose");
const addProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  s_price: {
    type: Number,
    required: true,
  },
  r_price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  strap_material: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  movement: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
  },
  stock: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Avaliable",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});
const products = mongoose.model("products", addProductSchema);
module.exports = products;
