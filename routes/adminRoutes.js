const express = require("express");
const app = express();
const adminRouter = express.Router();
const admincontroller = require("../controllers/adminController");
adminRouter.use(express.static("public/adminAssets/assets"));
const multer = require("multer");
const multerMiddleware = require("../middleware/admin/multerMiddlewares");
const path = require("path");
adminRouter.use("/uploads", express.static("uploads"));


adminRouter.get("", admincontroller.getAdminLogin);
adminRouter.get("/getadmin-dash", admincontroller.getAdminDashboard);
adminRouter.post("/admin-dash", admincontroller.postAdminDashboard);
adminRouter.get("/users", admincontroller.getUsers);
adminRouter.get("/product-list", admincontroller.getProductsList);
adminRouter.get("/add-product", admincontroller.getAddProduct);
adminRouter.post("/add-product",multerMiddleware.upload.array("photo"), admincontroller.postAddProduct);
adminRouter.post("/update-user-status/:userId", admincontroller.postUserStatus);
adminRouter.post("/update-product-status/:productId",admincontroller.postProductStatus)
adminRouter.get("/edit-product",admincontroller.getEditProduct)
adminRouter.post('/submit-edited-product/:productId',multerMiddleware.upload.array("photo"),admincontroller.postEditedProduct)
adminRouter.get("/categories",admincontroller.getCategory)
adminRouter.post("/create-category",admincontroller.postCreateCategory)
adminRouter.get("/editcategory/:categoryId",admincontroller.getEditCategory)
adminRouter.post("/submit-editcategory",admincontroller.postEditCategory)
adminRouter.get("/hidecategory/:categoryId",admincontroller.hideCategory)
adminRouter.get("/unhidecategory/:categoryId",admincontroller.unhideCategory)
adminRouter.get("/orderlist",admincontroller.getOrderList)
adminRouter.get("/editorderdetails/:id",admincontroller.getOrderdetails)
adminRouter.post("/editorderstatus",admincontroller.editOrderStatus)

module.exports = adminRouter;
