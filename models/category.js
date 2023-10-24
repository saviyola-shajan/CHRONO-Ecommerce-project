const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  description: {
    type: String,
    required: true,
  },
  photo:{
    type:String,
  },
  status:{
    type:String,
    default:'Active'
  }
});
const category = mongoose.model("category", categorySchema);
module.exports = category;