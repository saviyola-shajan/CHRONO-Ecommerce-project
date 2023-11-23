const usercollecn = require("../../models/userlogin");
const address = require("../../models/address");


module.exports.getAddAddress = async (req, res) => {
    res.render("add-address");
  };

  module.exports.postAddAddress = async (req, res) => {
    try {
      const userId = req.user;
      const userdata = await usercollecn.findOne({ email: req.user });
      const userAddress = await address.findOne({ userId: userdata._id });
      const {
        addressType,
        userName,
        city,
        landMark,
        state,
        pinCode,
        phoneNumber,
        altPhone,
      } = req.body;
  
      if (userAddress) {
        userAddress.address.push({
          addressType,
          userName,
          city,
          landMark,
          state,
          pinCode,
          phoneNumber,
          altPhone,
        });
        await userAddress.save();
      } else {
        const newUser = new address({
          userId: userdata._id,
          address: {
            addressType,
            userName,
            city,
            landMark,
            state,
            pinCode,
            phoneNumber,
            altPhone,
          },
        });
        await newUser.save();
      }
      res.redirect("/user-account");
    } catch (error) {
      console.log(error);
      res.render("user-account", { error: "Failed to add address" });
    }
  };

  module.exports.getEditAddress = async(req,res)=>{
    try{
       const userdata = await usercollecn.findOne({email:req.user})
      const useraddress = await address.findOne({userId:userdata._id})
      let thataddress;
      useraddress.address.forEach((address)=>{
        if(address._id==req.query.addressId){
        thataddress=address
        }
      })
      res.render("edit-address",{thataddress})
      
    }catch(error){
   console.log(error)
    }
    
  }

  module.exports.postEditedAddress = async (req, res) => {
    try {
      const addressId = req.body.addressId;
      const addressType = req.body.addressType;
      const userName = req.body.userName;
      const city = req.body.city;
      const landMark = req.body.landMark;
      const state = req.body.state;
      const pinCode = req.body.pinCode;
      const phoneNumber = req.body.phoneNumber;
      const altPhone = req.body.altPhone;
      const userData = await usercollecn.findOne({ email: req.user });
      const userAddress = await address.findOne({ userId: userData._id });
  
      const existingAddressIndex = userAddress.address.findIndex(
        (address) => address._id == addressId
      );
  
      if (existingAddressIndex !== -1) {
        userAddress.address[existingAddressIndex].addressType = addressType;
        userAddress.address[existingAddressIndex].userName = userName;
        userAddress.address[existingAddressIndex].city = city;
        userAddress.address[existingAddressIndex].landMark = landMark;
        userAddress.address[existingAddressIndex].state = state;
        userAddress.address[existingAddressIndex].pinCode = pinCode;
        userAddress.address[existingAddressIndex].phoneNumber = phoneNumber;
        userAddress.address[existingAddressIndex].altPhone = altPhone;
        userAddress.address[existingAddressIndex].userData = userData;
  
        await userAddress.save();
  
        res.redirect("/user-account");
      } else {
        res.status(404).send("Address not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  };