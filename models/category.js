const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // photo:{
  //   type:String,
  // },
  status: {
    type: String,
    default: "Unhide",
  },
});
const category = mongoose.model("category", categorySchema);
module.exports = category;
