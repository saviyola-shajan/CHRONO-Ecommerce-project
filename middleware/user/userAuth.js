const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
require("dotenv").config();

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log(req.cookies);
  const verifyToken = jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return res.redirect("/page-login");
      }

      req.user = decoded;

      next();
    }
  );
};

module.exports = verifyUser;
