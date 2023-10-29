const express = require("express");
const app = express();
const userRouter = express.Router();
const usercontroller = require("../controllers/userController");
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middleware/user/usermiddleware");
userRouter.use(cookieparser());

//  userRouter.get('/verify',usercontroller.verifymail)
userRouter.get("/", usercontroller.getHomePage);
userRouter.post("/post-login",usercontroller.postUserLogin);
userRouter.get("/get-login", usercontroller.getUserLogin);



userRouter.get("/signup", usercontroller.getUserSignup);
userRouter.post("/signupsubmit", usercontroller.postUserSignup);
userRouter.get("/sent-otp", usercontroller.getSendOtp);
userRouter.post("/verify-otp", usercontroller.getVerifyOtp);
userRouter.get("/single-product/:productId", usercontroller.getSingleProduct);
userRouter.get("/cart",userMiddleware.verifyUser,usercontroller.getCart)
userRouter.post("/addToCart",userMiddleware.verifyUser,usercontroller.goTOCart)
userRouter.post("/update-quantity",userMiddleware.verifyUser,usercontroller.updateQuantity)
userRouter.get("/user-account",userMiddleware.verifyUser,usercontroller.getUserAccount)
userRouter.post("/remove-from-cart/:productId",userMiddleware.verifyUser,usercontroller.removeFromCart)
userRouter.get("/checkout",userMiddleware.verifyUser,usercontroller.getCheckout)
userRouter.get("/getadd-address",userMiddleware.verifyUser,usercontroller.getAddAddress)
userRouter.post("/add-address",userMiddleware.verifyUser,usercontroller.postAddAddress)
userRouter.get("/cod",usercontroller.getCOD)



userRouter.get("/logout",userMiddleware.verifyUser,usercontroller.getlogout);
module.exports = userRouter;
