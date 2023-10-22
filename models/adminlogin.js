const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const admincollecn = mongoose.model("admincollecn", adminSchema);
module.exports = admincollecn;
