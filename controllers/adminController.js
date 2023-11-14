const admincollecn = require("../models/adminlogin");
const usercollecn = require("../models/userlogin");
const products = require("../models/addProduct");
const category = require("../models/category");
const cart = require("../models/cartModel");
const order = require("../models/order");
const excelJS = require("exceljs");
const multer = require("multer");
const path = require("path");
const fs = require("fs")
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');


module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login");
};

module.exports.getAdminDashboard = (req, res) => {
  res.render("admin-dashboard");
};

//chechking deatils aand login admin
module.exports.postAdminDashboard = async (req, res) => {
  const admindata = await admincollecn.findOne({ email: req.body.email });
  if (!admindata) {
    res.render("admin-login", { subreddit: "This email is not registered" });
  } else {
    if (admindata) {
      if (req.body.email !== admindata.email) {
        res.render("admin-login", { subreddit: "Incorrect Email" });
      } else if (req.body.password !== admindata.password) {
        res.render("admin-login", { subreddit: "Incorrect Password" });
      } else {
        if (
          req.body.email == admindata.email &&
          req.body.password == admindata.password
        ) {
          res.render("admin-dashboard");
        }
      }
    } else {
      res.redirect("/admin-login");
    }
  }
};

//get users list
module.exports.getUsers = async (req, res) => {
  try {
    const users = await usercollecn.find().sort({ createdOn: -1 });
    res.render("users-list", { users });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

//getting the product list
module.exports.getProductsList = async (req, res) => {
  try {
    const product = await products.find({}).sort({ createdOn: -1 });
    res.render("products-list", { product });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

// get add product
module.exports.getAddProduct = async (req, res) => {
  try {
    const categoryData = await category.find();
    const categories = Array.isArray(categoryData)
      ? categoryData
      : [categoryData];
    res.render("add-products", { categories });
  } catch (error) {
    console.log(error);
  }
};

//post the added product
module.exports.postAddProduct = (req, res) => {
  const {
    name,
    description,
    r_price,
    s_price,
    category,
    brand,
    movement,
    strap_material,
    stock,
    status,
  } = req.body;

  const photos = req.files;
  let arr = [];
  photos.forEach((element) => {
    arr.push({ name: element.filename, path: element.path });
  });

  if (
    !name ||
    !description ||
    !r_price ||
    !category ||
    !brand ||
    !stock ||
    !status ||
    !photos||
    !movement||
    !strap_material
  ) {
    return res.render("add-products", {
      error:
        "Please fill out all the required fields and upload at least one photo.",
    });
  }

  const photoIds = arr.map((photo) => photo.path);

  const newProduct = new products({
    name,
    description,
    r_price,
    s_price,
    category,
    brand,
    stock,
    status,
    movement,
    strap_material,
    photos: photoIds,
  });

  newProduct.save();
  res.redirect("/admin/product-list");
};

//updating user ststus
module.exports.postUserStatus = async (req, res) => {
  const userId = req.params.userId;
  const newStatus = req.body.status;

  try {
    const updatedUser = await usercollecn.findByIdAndUpdate(userId, {
      status: newStatus,
    });

    res.status(200).json({ status: updatedUser.status });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user status.");
  }
};

//updating product status
module.exports.postProductStatus = async (req, res) => {
  const productId = req.params.productId;
  const newStatus = req.body.status;
  try {
    const updateProduct = await products.findByIdAndUpdate(productId, {
      status: newStatus,
    });
    res.status(200).json({ status: updateProduct.status });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating Product status");
  }
};

//get edit product page
module.exports.getEditProduct = async (req, res) => {
  const editItem = req.query.productId;
  try {
    const productDeatils = await products.findById(editItem);
    const categorydata = await category.find({})
    res.render("edit-product", { productDeatils,categorydata });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in updatting product");
  }
};

//saving edited details into the db
module.exports.postEditedProduct = async (req, res) => {
  try {
    const editId = req.params.productId;
    const existingProduct = await products.findById(editId);
    const {
      name,
      description,
      r_price,
      s_price,
      category,
      brand,
      stock,
      movement,
      strap_material
    } = req.body;

    const photos = req.files;
    const newPhotos = photos.map((element) => ({
      name: element.filename,
      path: element.path,
    }));
    const picPaths = newPhotos.map((photo) => photo.path);

    const updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
      picPaths[index] ? picPaths[index] : oldPhoto
    );

    const updatedData = {
      name,
      description,
      r_price,
      s_price,
      category,
      brand,
      stock,
      movement,
      strap_material,
      status: existingProduct.status,
      photos: updatedPhotos,
    };

    const updatedProduct = await products.findByIdAndUpdate(
      editId,
      updatedData,
      { new: true }
    );
    updatedProduct.save();
    const successMessage = "Product updated successfully";

    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
    res.render("edit-product", {
      error: "An error occurred while updating the product, please try again",
    });
  }
};

//saving edited details into the db//
// module.exports.postEditProduct = async (req, res) => {
//   try {
//     const editId = req.params.productId;
//     const existingProduct = await products.findById(editId);

//     const {
//       name,
//       description,
//       regular_price,
//       selling_price,
//       category,
//       brand,
//       stock,
//     } = req.body;

//     const photos = req.files;
//     const newPhotos = photos.map((element) => ({ name: element.filename, path: element.path }));
//     const picPaths=newPhotos.map((photo) => photo.path);
//     const updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
//     picPaths[index] ? picPaths[index] : oldPhoto
//     );
//     const updatedData = {
//       name,
//       description,
//       regular_price,
//       selling_price,
//       category,
//       brand,
//       stock,
//       status: existingProduct.status,
//       photos: updatedPhotos,
//     };

//     const updatedProduct = await products.findByIdAndUpdate(editId, updatedData, { new: true });
//     const successMessage = "Product updated successfully";
//     res.redirect('/admin/product-list');
//   } catch (error) {
//     console.log(error);
//     res.render("admin-product-edit-page", { error: "An error occurred while updating the product, please try again" });
//   }
// };

//get category page
module.exports.getCategory = async (req, res) => {
  try {
    const dataCategory = await category.find();
    res.render("categories", { dataCategory, error: null });
  } catch (error) {
    console.error(error);
    res.redirect("/admin-dash");
  }
};

//save category deatils to the db
module.exports.postCreateCategory = async (req, res) => {
  const { name, description, status } = req.body;
  const dataCategory = await category.find();
  // const photoPath = req.file.path;
  if (!name || !description) {
    res.status(400).json({ error: "Name and Description is required." });
  }
  const categoryData = new category({
    name,
    description,
    status,
    // photo: photoPath,
  });
  try {
    await categoryData.save();
    res.redirect("/admin/categories");
  } catch (error) {
    console.error(error);
    res.render("categories", { dataCategory, error: "Name alreday exist" });
  }
};

//edit category
module.exports.getEditCategory = async(req,res)=>{
  try{
    const idcategory=req.params.categoryId
    const categoryData=await category.findById({_id:idcategory})
    res.render("edit-category",{categoryData,error:null})
  }catch(error){
    console,log(error)
  }
  
}

//update edited category
module.exports.postEditCategory = async (req,res)=>{
  try{
  const categoryid = req.body.editcategory
  const {
    name,
    description,
    status
  }=req.body
  const existingcategory = await category.findById({_id:categoryid})

  existingcategory.name=name;
  existingcategory.description=description;
  existingcategory.status=status

  await existingcategory.save()
  res.redirect("/admin/categories")
  }catch(error){
    console.log(error)
    res.render("page-404-admin",{ error: "Name alreday exist"})
  }
}

//hide category
module.exports.hideCategory = async(req,res)=>{
  try{
   const Idcategory = req.params.categoryId
   const newStatus = await category.findById({_id:Idcategory})
   const updatedResult = await category.updateOne({_id:Idcategory},{$set:{status:"Hide"}})
   res.redirect("/admin/categories")
  }catch(error){
    console.log(error)
  }
}

//Unhide category
module.exports.unhideCategory = async(req,res)=>{
try{
  const Idcategory = req.params.categoryId
  const newStatus = await category.findById({_id:Idcategory})
  const updatedResult = await category.updateOne({_id:Idcategory},{$set:{status:"Unhide"}})
res.redirect("/admin/categories")
}  catch(error){
  console.log(error)
}
}

//show orders list
module.exports.getOrderList = async (req, res) => {
  try {
    const orderList = await order.find({}).sort({orderDate:-1}).populate({
      path:"products.productId",
      model:"products",
    })
    res.render("order-lists", { orderList});
  } catch (error) {
    console.log(error);
  }
};

//get order deatils
module.exports.getOrderdetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await order.findById({ _id: orderId }).populate({
      path: "products.productId",
      model: "products",
    });
    res.render("admin-orderdetails", { orderDetails });
  } catch (error) {
    console.log(error);
  }
};

//edit order status
module.exports.editOrderStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const updatestatus = await order.findById({ _id: orderId });
    const status = await order.updateOne(
      { _id: req.body.orderId },
      { $set: { orderStatus: req.body.orderStatus } },
      { new: true }
    );
    res.redirect("/admin/orderlist");
  } catch (error) {
    console.log(error);
  }
};

//sales report excel
module.exports.getExcelSalesReport = async (req,res)=>{
  const orders = await order.find({orderStatus:"Delivered"}).populate({
    path:"products.productId",
    model:"products",
  })
  const workbook = new excelJS.Workbook();  
  const worksheet = workbook.addWorksheet("Sales Report");
let SerialNumber= 1;
  worksheet.columns = [
    { header: "UserID", key: "UserId", width: 10 }, 
    { header: 'Order Date', key: 'orderDate', width: 15, style: { numFmt: 'yyyy-mm-dd' } },
    { header: "Name", key: "Name", width: 10 },
    { header: "Product", key: "products", width: 25 },
    { header: "Quantity", key: "quantity", width: 5 },
    { header: "Total Amount", key: "totalAmount", width: 10 },
    { header: "Order status", key: "OrderStatus", width: 10 },
    { header: "Payment Method", key: "PaymentMethod", width: 10 },
    { header: "Address", key: "address", width: 55 },
];
worksheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});

orders.forEach((eachorder)=>{
  eachorder.products.forEach((product)=>{
    const fullAddress = `${eachorder.address.addressType}\n${eachorder.address.city}, ${eachorder.address.landMark},${eachorder.address.state},${eachorder.address.pincode},${eachorder.address.phonenumber}`;
    const salesData = {
      'Sno':SerialNumber++,
      userId:eachorder.userId,
      orderDate:eachorder.orderDate,
      Name:eachorder.address.userName,
      products: product.productId.name,
      quantity:product.quantity,
      totalAmount:eachorder.totalAmount,
      OrderStatus:eachorder.orderStatus,
      PaymentMethod:eachorder.paymentMethod,
      address:fullAddress,
    }
    worksheet.addRow(salesData)
  })
});


const filePath = path.join(__dirname, 'sales_report.xlsx');
const exportPath = path.resolve(
  
  "Public",
  "sales_report",
  "sales-report.xlsx"
);

await workbook.xlsx.writeFile(exportPath)
    .then(async() => {
        res.download(exportPath, 'sales_report.xlsx', (err) => {
            if (err) {
                res.status(500).send('Error sending the file');
            }
        });
    })
    .catch((error) => {
        console.error('Error writing Excel file:', error);
        res.status(500).send('Error writing the file');
    })
  }

  //sales report in PDF
  module.exports.getPdfSalesReport = async(req,res)=>{
    try{
    const orders = await order.find({orderStatus:"Delivered"}).populate({
      path:"products.productId",
      model:"products"
    })
      res.render("salesreport_pdf",{orders})
    }catch(error){
  console.log(error)
    }
  }

  //gett full sale
module.exports.getSale = async (req, res) => {
    try {
      const allOrders = await order.find({
        orderStatus: "Delivered"
    }).populate({
        path: "products.productId",
        model: "products"
    });
        const reportType = req.query.type;
        let additionalData;

        switch (reportType) {
            case 'weekly':
                additionalData = await order.find({
                    orderStatus: "Delivered",
                    orderDate: { $gte: startOfWeek(new Date()), $lte: endOfWeek(new Date()) }
                }).populate({
                    path: "products.productId",
                    model: "products"
                });
                break;
            case 'monthly':
                additionalData = await order.find({
                    orderStatus: "Delivered",
                    orderDate: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) }
                }).populate({
                    path: "products.productId",
                    model: "products"
                });
                break;
            case 'yearly':
                additionalData = await order.find({
                    orderStatus: "Delivered",
                    orderDate: { $gte: startOfYear(new Date()), $lte: endOfYear(new Date()) }
                }).populate({
                    path: "products.productId",
                    model: "products"
                });
                break;
            default:
                additionalData = [];
                break;
        }

        const orders = [...allOrders, ...additionalData];

        res.render("sales-report-admin", { orders, reportType });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};





 
  