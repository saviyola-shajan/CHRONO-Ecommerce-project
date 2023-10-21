const express=require("express");
const userRouter = express.Router();
const usercontroller = require("../controllers/userController");
 // userRouter.route('/verify')
// .get(usercontroller.verifymail)


userRouter.get('/',usercontroller.getHomePage)
userRouter.get('/page-login',usercontroller.getUserLogin)
userRouter.get('/signup',usercontroller.getUserSignup)
userRouter.post('/signupsubmit',usercontroller.postUserSignup)
userRouter.get('/sent-otp',usercontroller.getSendOtp)
userRouter.post('/verify-otp',usercontroller.getVerifyOtp)
userRouter.post('/home',usercontroller.getUserHomepage)
userRouter.get("/single-product/:productId",usercontroller.getSingleProduct)
userRouter.post('/update-user-status/:userId',usercontroller.postUserStatus)


module.exports=userRouter