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
        return res.redirect("/page-login");
      }

      req.user = decoded;

      next();
    }
  );
};

module.exports.isUserAuthentic=async(req, res, next) => {
  const token = req.cookies.token || req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication failed. Token is missing." });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid token." });
    }
    req.user = decoded;
    next();
  });
};


