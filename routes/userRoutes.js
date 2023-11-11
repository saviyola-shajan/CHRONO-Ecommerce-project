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
userRouter.post("/verify-otp", usercontroller.postVerifyOtp);
userRouter.get("/single-product/:productId", usercontroller.getSingleProduct);
userRouter.get("/cart",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getCart)
userRouter.post("/addToCart",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.goTOCart)
userRouter.post("/update-quantity",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.updateQuantity)
userRouter.get("/user-account",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getUserAccount)
userRouter.post("/changecurrpassword",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.changePasswordUserAccount)
userRouter.post("/remove-from-cart/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.removeFromCart)
userRouter.get("/checkout",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getCheckout)
userRouter.get("/getadd-address",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getAddAddress)
userRouter.post("/add-address",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.postAddAddress)
userRouter.get("/editaddress",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getEditAddress)
userRouter.post("/submit-editedaddress",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.postEditedAddress)
userRouter.get("/placeorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getPlaceOrder)
userRouter.post("/orders",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.postOrders)
userRouter.post("/onlinepayment",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.onlinePayment)
userRouter.post("/walletpayment",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.walletPayment)
userRouter.get("/onlinepaymentstatus",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.paymentStatus)
userRouter.get("/passwordResetPage",usercontroller.getPasswordResetPage)
userRouter.get("/passwordresetotp/sendOtp",usercontroller.getPasswordResetOtp)
userRouter.get("/passwordResetVerifyOtp/verifyOtp",usercontroller.getVerifyPasswordResetOtp)
userRouter.get("/changepassword",usercontroller.changePassword)
userRouter.post("/newpassword",usercontroller.postNewPassword) 
userRouter.get("/orderdetails/:orderId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.orderDeatils)
userRouter.get("/invoice/:orderId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getInvoice) 
userRouter.post("/cancelorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.productCancel)
userRouter.post("/returnorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.returnOrder)
userRouter.get("/search",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.searchProducts)
userRouter.get("/filtercategory",userMiddleware.verifyUser,usercontroller.filterCategory)
userRouter.get("/wishlist",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.getWishlist)
userRouter.post("/addtowishlist",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.goToWishlist)
userRouter.post("/removefromwishlist/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.removeFromWishlist)
userRouter.get("/wishlistTocart/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,usercontroller.wishlistToCart)



userRouter.get("/logout",userMiddleware.verifyUser,usercontroller.getlogout);
module.exports = userRouter;
