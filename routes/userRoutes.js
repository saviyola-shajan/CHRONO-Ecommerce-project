const express = require("express");
const app = express();
const userRouter = express.Router();
const usercontroller = require("../controllers/userController");
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middleware/user/userAuth");
userRouter.use(cookieparser());

//  userRouter.get('/verify',usercontroller.verifymail)
userRouter.get("/", usercontroller.getHomePage);
userRouter.get("/page-login", usercontroller.getUserLogin);
userRouter.get("/signup", usercontroller.getUserSignup);
userRouter.post("/signupsubmit", usercontroller.postUserSignup);
userRouter.get("/sent-otp", usercontroller.getSendOtp);
userRouter.post("/verify-otp", usercontroller.getVerifyOtp);
userRouter.post("/home", usercontroller.getUserHomepage);
userRouter.get("/single-product/:productId", usercontroller.getSingleProduct);
userRouter.get("/logout", usercontroller.getlogout);

module.exports = userRouter;
