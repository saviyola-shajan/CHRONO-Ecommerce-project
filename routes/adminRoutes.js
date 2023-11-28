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
const adminBannerController = require("../controllers/admin/adminBannerController")
//login
adminRouter.get("", adminLoginContrller.getAdminLogin);
adminRouter.get("/getadmin-dash",adminLoginContrller.getAdminDashboard);
adminRouter.post("/admin-dash", adminLoginContrller.postAdminDashboard);
//users
adminRouter.get("/users",multerMiddleware.verifyAdmin,adminUsersController.getUsers);
adminRouter.post("/update-user-status/:userId",multerMiddleware.verifyAdmin, adminUsersController.postUserStatus);
//products
adminRouter.get("/product-list",multerMiddleware.verifyAdmin, adminProductController.getProductsList);
adminRouter.get("/add-product",multerMiddleware.verifyAdmin, adminProductController.getAddProduct);
adminRouter.post("/add-product",multerMiddleware.upload.array("photo"), adminProductController.postAddProduct);
adminRouter.post("/update-product-status/:productId",multerMiddleware.verifyAdmin,adminProductController.postProductStatus)
adminRouter.get("/edit-product",multerMiddleware.verifyAdmin,adminProductController.getEditProduct)
adminRouter.post('/submit-edited-product/:productId',multerMiddleware.upload.array("photo"),adminProductController.postEditedProduct)
//category
adminRouter.get("/categories",multerMiddleware.verifyAdmin,adminCategoryController.getCategory)
adminRouter.post("/create-category",multerMiddleware.verifyAdmin,adminCategoryController.postCreateCategory)
adminRouter.get("/editcategory/:categoryId",multerMiddleware.verifyAdmin,adminCategoryController.getEditCategory)
adminRouter.post("/submit-editcategory",multerMiddleware.verifyAdmin,adminCategoryController.postEditCategory)
adminRouter.get("/hidecategory/:categoryId",multerMiddleware.verifyAdmin,adminCategoryController.hideCategory)
adminRouter.get("/unhidecategory/:categoryId",multerMiddleware.verifyAdmin,adminCategoryController.unhideCategory)
//orders
adminRouter.get("/orderlist",multerMiddleware.verifyAdmin,adminOrdersController.getOrderList)
adminRouter.get("/editorderdetails/:id",multerMiddleware.verifyAdmin,adminOrdersController.getOrderdetails)
adminRouter.post("/editorderstatus",multerMiddleware.verifyAdmin,adminOrdersController.editOrderStatus)
//sales report
adminRouter.get("/excelsalesreport",multerMiddleware.verifyAdmin,adminSalesController.getExcelSalesReport)
adminRouter.get("/pdfsalesreport",multerMiddleware.verifyAdmin,adminSalesController.getPdfSalesReport)
adminRouter.get("/sale",multerMiddleware.verifyAdmin,adminSalesController.getSale)
adminRouter.post("/sales")
//coupon
adminRouter.get("/coupon",multerMiddleware.verifyAdmin,adminCouponController.getCoupon)
adminRouter.get("/addcoupon",multerMiddleware.verifyAdmin,adminCouponController.getAddCoupon)
adminRouter.post("/submitaddedcoupon",multerMiddleware.verifyAdmin,adminCouponController.postAddedCoupon)
adminRouter.get("/Unblock-coupon/:couponId",multerMiddleware.verifyAdmin,adminCouponController.unblockCoupon)
adminRouter.get("/block-coupon/:couponId",multerMiddleware.verifyAdmin,adminCouponController.blockCoupon)
adminRouter.get("/edit-coupon/:couponId",multerMiddleware.verifyAdmin,adminCouponController.editCoupon)
adminRouter.post("/submit-edit-coupon",multerMiddleware.verifyAdmin,adminCouponController.postEditcoupon)
//offers
adminRouter.get("/offers",multerMiddleware.verifyAdmin,adminOffersController.getOffers)
adminRouter.get("/addoffer",multerMiddleware.verifyAdmin,adminOffersController.getAddOffer)
adminRouter.post("/submitaddedoffer",multerMiddleware.verifyAdmin,adminOffersController.postAddedOffer)
adminRouter.get("/block-offer/:offerId",multerMiddleware.verifyAdmin,adminOffersController.blockOffers)
adminRouter.get("/unblock-offer/:offerId",multerMiddleware.verifyAdmin,adminOffersController.unblockOffer)
adminRouter.get("/edit-offer/:offerId",multerMiddleware.verifyAdmin,adminOffersController.getEditOffer)
adminRouter.post("/submit-edit-offer",multerMiddleware.verifyAdmin,adminOffersController.postEditedOffer)
//banner
adminRouter.get("/banner",multerMiddleware.verifyAdmin,adminBannerController.getBanner)
adminRouter.post("/postaddedbanner",multerMiddleware.upload.single("photo"),adminBannerController.postBanner)
adminRouter.get("/editbanner",multerMiddleware.verifyAdmin,adminBannerController.getEditBanner)
adminRouter.post("/posteditedbanner/:bannerId",multerMiddleware.upload.single("photo"),adminBannerController.postEditedBanner)
adminRouter.get("/unblockbanner/:bannerId",multerMiddleware.verifyAdmin,adminBannerController.unblockBanner)
adminRouter.get("/blockbanner/:bannerId",multerMiddleware.verifyAdmin,adminBannerController.blockBanner)
//logout
adminRouter.get("/logout",adminLoginContrller.getLogout)

module.exports = adminRouter;
