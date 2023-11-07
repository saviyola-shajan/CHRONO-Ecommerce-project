const Razorpay =require("razorpay")
const keyId =process.env.YOUR_KEY_ID
const secretKey=process.env.YOUR_KEY_SECRET

const instance = new Razorpay({
    key_id: keyId,
    key_secret: secretKey,
  });