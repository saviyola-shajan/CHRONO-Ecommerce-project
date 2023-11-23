const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieparser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const MONGO_CNT = "mongodb://127.0.0.1:27017/chrono";
app.use(express.static(__dirname + "/public"));

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/uploads", express.static("uploads"));

const port = 3000;
app.listen(port, async () => {
  try {
    await mongoose.connect(MONGO_CNT);
    console.log(" SERVER CONNECTED");
    console.log(`http://localhost:${port}`);
    console.log("DB Connected Sucessuflly");
  } catch (err) {
    console.error(err);
  }
});
