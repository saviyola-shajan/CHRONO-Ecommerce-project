const usercollecn = require("../../models/userlogin");
require("dotenv").config();
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const bcrypt = require("bcrypt");

module.exports.getPasswordResetPage = (req, res, next) => {
  try {
    const loggedIn = req.cookies.loggedIn;
    res.render("forgotpassword", { loggedIn });
  } catch (error) {
    console.log(error);
    next("Error while loading Forgotpassword");
  }
};

module.exports.getPasswordResetOtp = async (req, res, next) => {
  try {
    const userEmail = req.query.email;
    console.log(typeof(userEmail));
    const user = await usercollecn.findOne({ email: userEmail });
    console.log(typeof(user.phoneNumber));
    if (user == userEmail) {
      await twilio.verify.v2
        .services(process.env.TWILIO_SERVICES_ID)
        .verifications.create({
          to: `+91${user.phoneNumber}`,
          channel: "sms",
        })
        .then(() => {
          res.status(200).json({ data: "send" });
        });
    } else {
      res.status(200).json({ data: "user with this Email don't exist" });
    }
  } catch (error) {
    console.log(error);
    next("Error in sending OTP");
  }
};

module.exports.getVerifyPasswordResetOtp = async (req, res, next) => {
  try {
    const otp = req.query.otp;
    const email = req.query.email;
    const user = await usercollecn.findOne({ email: email });
    const verifyOTP = await twilio.verify.v2
      .services(process.env.TWILIO_SERVICES_ID)
      .verificationChecks.create({
        to: `+91${user.phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      res.status(200).json({ data: "verified" });
    } else {
      res.status(500).json({ data: "OTP incorrect" });
    }
  } catch (error) {
    console.log(error);
    next("Error in veriyfing OTP");
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const Email = req.query.email;
    const loggedIn = req.cookies.loggedIn;
    res.render("changepassword", { Email, loggedIn });
  } catch (error) {
    console.log(error);
    next("Error in Changing Password");
  }
};

module.exports.postNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedNewPassword = await bcrypt.hash(password, 10);
    await usercollecn.updateOne(
      { email: email },
      { $set: { password: hashedNewPassword } }
    );
    // res.redirect("get-login")
    res.status(200).json({ data: "password Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "passwor updatiom failed" });
  }
};
