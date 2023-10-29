const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
require("dotenv").config();

module.exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log(req.cookies);
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




