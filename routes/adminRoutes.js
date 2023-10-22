const express = require("express");
const app = express();
const adminRouter = express.Router();
const admincontroller = require("../controllers/adminController");
adminRouter.use(express.static("public/adminAssets/assets"));
const multer = require("multer");
const path = require("path");

adminRouter.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads//");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

adminRouter.get("", admincontroller.getAdminLogin);
adminRouter.post("/admin-dash", admincontroller.getAdminDashboard);
adminRouter.get(admincontroller.getAdminDashboard);
adminRouter.get("/users", admincontroller.getUsers);
adminRouter.get("/product-list", admincontroller.getProductsList);
adminRouter.get("/add-product", admincontroller.getAddProduct);
adminRouter.post(upload.array("photo"), admincontroller.postAddProduct);
adminRouter.post("/update-user-status/:userId", admincontroller.postUserStatus);
adminRouter.post("/update-product-status/:productId",admincontroller.postProductStatus)

module.exports = adminRouter;
