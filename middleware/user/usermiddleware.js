const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const usercollecn = require("../../models/userlogin");
require("dotenv").config();

module.exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  const verifyToken = jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return res.redirect("/get-login");
      }

      req.user = decoded;

      next();
    }
  );
};

module.exports.IsUserBlocked= async(req, res, next)=>{
  user = req.user
  const currUser = await usercollecn.findOne({email:user})
  if(currUser.status =="Blocked"){
    res.clearCookie("token");
    res.clearCookie("loggedIn");
    res.redirect("/get-login");
  }
  next()

}




