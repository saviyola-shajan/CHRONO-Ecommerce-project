const express = require("express");
// const app = express();
const adminRouter = express.Router();
// const admincontroller = require("../controllers/adminController");
adminRouter.use(express.static("public/adminAssets/assets"));
const multer = require("multer");
const multerMiddleware = require("../middleware/admin/multerMiddlewares");
adminRouter.use("/uploads", express.static("uploads"));
const adminLoginContrller = require("../controllers/admin/adminLoginController")
const adminUsersController = require("../controllers/admin/adminUsersController")
const adminProductController =require("../controllers/admin/adminProductsController")
const adminCategoryController =require("../controllers/admin/adminCategoryController")
const adminOrdersController =require("../controllers/admin/adminOrdersController")
const adminSalesController = require("../controllers/admin/adminSalesController")
const adminCouponController = require("../controllers/admin/adminCouponController")
const adminOffersController =require("../controllers/admin/adminOffersController")
//login
adminRouter.get("", adminLoginContrller.getAdminLogin);
adminRouter.get("/getadmin-dash", adminLoginContrller.getAdminDashboard);
adminRouter.post("/admin-dash", adminLoginContrller.postAdminDashboard);
//users
adminRouter.get("/users", adminUsersController.getUsers);
adminRouter.post("/update-user-status/:userId", adminUsersController.postUserStatus);
//products
adminRouter.get("/product-list", adminProductController.getProductsList);
adminRouter.get("/add-product", adminProductController.getAddProduct);
adminRouter.post("/add-product",multerMiddleware.upload.array("photo"), adminProductController.postAddProduct);
adminRouter.post("/update-product-status/:productId",adminProductController.postProductStatus)
adminRouter.get("/edit-product",adminProductController.getEditProduct)
adminRouter.post('/submit-edited-product/:productId',multerMiddleware.upload.array("photo"),adminProductController.postEditedProduct)
//category
adminRouter.get("/categories",adminCategoryController.getCategory)
adminRouter.post("/create-category",adminCategoryController.postCreateCategory)
adminRouter.get("/editcategory/:categoryId",adminCategoryController.getEditCategory)
adminRouter.post("/submit-editcategory",adminCategoryController.postEditCategory)
adminRouter.get("/hidecategory/:categoryId",adminCategoryController.hideCategory)
adminRouter.get("/unhidecategory/:categoryId",adminCategoryController.unhideCategory)
//orders
adminRouter.get("/orderlist",adminOrdersController.getOrderList)
adminRouter.get("/editorderdetails/:id",adminOrdersController.getOrderdetails)
adminRouter.post("/editorderstatus",adminOrdersController.editOrderStatus)
//sales report
adminRouter.get("/excelsalesreport",adminSalesController.getExcelSalesReport)
adminRouter.get("/pdfsalesreport",adminSalesController.getPdfSalesReport)
adminRouter.get("/sale",adminSalesController.getSale)
//coupon
adminRouter.get("/coupon",adminCouponController.getCoupon)
adminRouter.get("/addcoupon",adminCouponController.getAddCoupon)
adminRouter.post("/submitaddedcoupon",adminCouponController.postAddedCoupon)
adminRouter.get("/Unblock-coupon/:couponId",adminCouponController.unblockCoupon)
adminRouter.get("/block-coupon/:couponId",adminCouponController.blockCoupon)
adminRouter.get("/edit-coupon/:couponId",adminCouponController.editCoupon)
adminRouter.post("/submit-edit-coupon",adminCouponController.postEditcoupon)
//offers
adminRouter.get("/offers",adminOffersController.getOffers)
adminRouter.get("/addoffer",adminOffersController.getAddOffer)
adminRouter.post("/submitaddedoffer",adminOffersController.postAddedOffer)
adminRouter.get("/block-offer/:offerId",adminOffersController.blockOffers)
adminRouter.get("/unblock-offer/:offerId",adminOffersController.unblockOffer)
adminRouter.get("/edit-offer/:offerId",adminOffersController.getEditOffer)
adminRouter.post("/submit-edit-offer",adminOffersController.postEditedOffer)


module.exports = adminRouter;
