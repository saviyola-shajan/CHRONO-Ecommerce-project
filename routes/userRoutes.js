const express = require("express");
const app = express();
const userRouter = express.Router();
// const usercontroller = require("../controllers/userController");
const cookieparser = require("cookie-parser");
// const jwt = require("jsonwebtoken");
const userMiddleware = require("../middleware/user/usermiddleware");
userRouter.use(cookieparser());
const userLoginController = require("../controllers/user/userLoginController")
const userHomeController =require("../controllers/user/userHomeController")
const userCartController = require("../controllers/user/userCartController")
const userAccountController = require("../controllers/user/userAccountController")
const userAddressController = require("../controllers/user/userAddressController")
const userOrdersController = require("../controllers/user/userOrdersController")
const userPasswordController = require("../controllers/user/userPasswordController")
const userOrderDeatilsController = require("../controllers/user/userOrderDeatilsController")
const userFiltersController = require("../controllers/user/userFiltersController")
const userWishlistController = require("../controllers/user/userWishlistController")
const userCouponController = require("../controllers/user/userCouponController");
const { errorMiddleware } = require("../middleware/user/errorMiddleware");

//login
// userRouter.get('/verify',userLoginController.verifymail)
userRouter.post("/post-login",userLoginController.postUserLogin);
userRouter.get("/get-login", userLoginController.getUserLogin);
userRouter.get("/signup", userLoginController.getUserSignup);
userRouter.post("/signupsubmit", userLoginController.postUserSignup);
userRouter.get("/sent-otp", userLoginController.getSendOtp);
userRouter.post("/verify-otp", userLoginController.postVerifyOtp);
//Homepage
userRouter.get("/", userHomeController.getHomePage);
userRouter.get("/single-product/:productId", userHomeController.getSingleProduct);
//cart
userRouter.get("/cart",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCartController.getCart)
userRouter.get("/addToCart",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCartController.goTOCart)
userRouter.post("/update-quantity",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCartController.updateQuantity)
userRouter.post("/remove-from-cart/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCartController.removeFromCart)
//user account
userRouter.get("/user-account",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAccountController.getUserAccount)
userRouter.post("/applyreferel",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAccountController.applyReferelOffers)
userRouter.post("/changecurrpassword",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAccountController.changePasswordUserAccount)
//address
userRouter.get("/getadd-address",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAddressController.getAddAddress)
userRouter.post("/add-address",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAddressController.postAddAddress)
userRouter.get("/editaddress",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAddressController.getEditAddress)
userRouter.post("/submit-editedaddress",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userAddressController.postEditedAddress)
//orders
userRouter.get("/checkout",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.getCheckout)
userRouter.get("/placeorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.getPlaceOrder)
userRouter.post("/orders",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.postOrdersCod)
userRouter.post("/onlinepayment",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.onlinePayment)
userRouter.post("/walletpayment",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.walletPayment)
userRouter.get("/onlinepaymentstatus",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrdersController.paymentStatus)
//password reset
userRouter.get("/passwordResetPage",userPasswordController.getPasswordResetPage)
userRouter.get("/passwordresetotp/sendOtp",userPasswordController.getPasswordResetOtp)
userRouter.get("/passwordResetVerifyOtp/verifyOtp",userPasswordController.getVerifyPasswordResetOtp)
userRouter.get("/changepassword",userPasswordController.changePassword)
userRouter.post("/newpassword",userPasswordController.postNewPassword)
//order Deatils
userRouter.get("/orderdetails/:orderId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrderDeatilsController.orderDeatils)
userRouter.get("/invoice/:orderId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrderDeatilsController.getInvoice) 
userRouter.post("/cancelorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrderDeatilsController.productCancel)
userRouter.post("/returnorder",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userOrderDeatilsController.returnOrder)
//filters
userRouter.get("/search",userFiltersController.searchProducts)
userRouter.get("/filtercategory",userFiltersController.filterCategory)
userRouter.post("/filtercheckbox",userFiltersController.getFiterCheckbox)
userRouter.get("/filterprice",userFiltersController.filterByPrice)
//wishlist
userRouter.get("/wishlist",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userWishlistController.getWishlist)
userRouter.get("/addtowishlist",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userWishlistController.goToWishlist)
userRouter.post("/removefromwishlist/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userWishlistController.removeFromWishlist)
userRouter.get("/wishlistTocart/:productId",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userWishlistController.wishlistToCart)
//coupon
userRouter.post("/applycoupon",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCouponController.applyCoupon)
userRouter.get("/removecoupon",userMiddleware.verifyUser,userMiddleware.IsUserBlocked,userCouponController.removeCoupon)
//logout
userRouter.get("/logout",userMiddleware.verifyUser,userLoginController.getlogout);

userRouter.use(errorMiddleware)
module.exports = userRouter;
