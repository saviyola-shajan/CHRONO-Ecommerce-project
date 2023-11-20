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
adminRouter.get("/excelsalesreport",admincontroller.getExcelSalesReport)
adminRouter.get("/pdfsalesreport",admincontroller.getPdfSalesReport)
adminRouter.get("/sale",admincontroller.getSale)
adminRouter.get("/coupon",admincontroller.getCoupon)
adminRouter.get("/addcoupon",admincontroller.getAddCoupon)
adminRouter.post("/submitaddedcoupon",admincontroller.postAddedCoupon)
adminRouter.get("/Unblock-coupon/:couponId",admincontroller.unblockCoupon)
adminRouter.get("/block-coupon/:couponId",admincontroller.blockCoupon)
adminRouter.get("/edit-coupon/:couponId",admincontroller.editCoupon)
adminRouter.post("/submit-edit-coupon",admincontroller.postEditcoupon)
adminRouter.get("/offers",admincontroller.getOffers)
adminRouter.get("/addoffer",admincontroller.getAddOffer)
adminRouter.post("/submitaddedoffer",admincontroller.postAddedOffer)
adminRouter.get("/block-offer/:offerId",admincontroller.blockOffers)
adminRouter.get("/unblock-offer/:offerId",admincontroller.unblockOffer)
adminRouter.get("/edit-offer/:offerId",admincontroller.getEditOffer)
adminRouter.post("/submit-edit-offer",admincontroller.postEditedProduct)


module.exports = adminRouter;
