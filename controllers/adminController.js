const admincollecn = require("../models/adminlogin");
const usercollecn = require("../models/userlogin");
const products = require("../models/addProduct");
const category = require("../models/category");
const cart = require("../models/cartModel");
const order = require("../models/order");
const multer = require("multer");
const path = require("path");

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
    !photos
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
    res.render("edit-product", { productDeatils });
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
    const orderList = await order.find({}).sort({ orderDate: -1 });
    let userData = [];
    for (const orderItem of orderList) {
      const userId = orderItem.userId;
      let userDoc = await usercollecn.findById({ _id: userId });
      userData.push(userDoc.username);
    }
    res.render("order-lists", { orderList, userData });
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
