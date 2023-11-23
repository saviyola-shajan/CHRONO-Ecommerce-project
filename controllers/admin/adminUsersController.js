const usercollecn = require("../../models/userlogin");


module.exports.getUsers = async (req, res) => {
    try {
      const users = await usercollecn.find().sort({ createdOn: -1 });
      res.render("users-list", { users });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error retrieving user data");
    }
  };

  module.exports.postUserStatus = async (req, res) => {
    const userId = req.params.userId;
    const newStatus = req.body.status;
  
    try {
      const updatedUser = await usercollecn.findByIdAndUpdate(userId, {
        status: newStatus,
      });
  
      res.status(200).json({ status: updatedUser.status });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating user status.");
    }
  };