const admincollecn = require("../models/adminlogin");
const usercollecn = require("../models/userlogin");
const products = require("../models/addProduct");
const category = require("../models/category");
const multer = require("multer");
const path =require("path")

module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login");
};

//chechking deatils aand login admin
module.exports.getAdminDashboard = async (req, res) => {
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
    const users = await usercollecn.find();
    res.render("users-list", { users });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

//getting the product list
module.exports.getProductsList = async (req, res) => {
  try {
    const product = await products.find({});
    res.render("products-list", { product });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

// get add product
module.exports.getAddProduct = (req, res) => {
  res.render("add-products");
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

module.exports.postProductStatus =async(req,res)=>{
  const productId =req.params.productId;
  const newStatus=req.body.status
  try{
    const updateProduct =await products.findByIdAndUpdate(productId,{
     status:newStatus 
    });
    res.status(200).json({status:updateProduct.status});
  }catch(error){
    console.error(error);
    res.status(500).send("Error updating Product status")
  }
};

module.exports.getEditProduct = async(req,res)=>{
  const editItem = req.query.productId;
  try{
  const productDeatils = await products.findById(editItem)
  res.render("edit-product",{productDeatils})
  }catch(error){
    console.error(error);
    res.status(500).send("Error in updatting product")
  }
}

//saving edited details into the db
module.exports.postEditedProduct = async (req, res) => {
  try {
    const editId = req.params.productId;
    const existingProduct = await products.findById(editId);
    const {
      name,
      description,
      regular_price,
      selling_price,
      category,
      brand,
      stock,
    } = req.body;
    console.log(existingProduct)

    const photos = req.files;
    const newPhotos = photos.map((element) => ({ name: element.filename, path: element.path }));
    const picPaths=newPhotos.map((photo) => photo.path);
  
    const updatedPhotos = existingProduct.photos.map((oldPhoto, index) =>
    picPaths[index] ? picPaths[index] : oldPhoto
    );
    console.log(updatedPhotos)
  
    const updatedData = {
      name,
      description,
      regular_price,
      selling_price,
      category,
      brand,
      stock,
      status: existingProduct.status,
      photos: updatedPhotos,
    };

    const updatedProduct = await products.findByIdAndUpdate(editId, updatedData, { new: true });
    updatedProduct.save();
    const successMessage = "Product updated successfully";
   console.log(updatedProduct);
    res.redirect('/admin/product-list');
  } catch (error) {
    console.log(error);
    res.render("edit-product", { error: "An error occurred while updating the product, please try again" });
  }
};


//saving edited details into the db
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

//     // Get newly uploaded photos
//     const photos = req.files;
//     const newPhotos = photos.map((element) => ({ name: element.filename, path: element.path }));
//     const picPaths=newPhotos.map((photo) => photo.path);
//     // Include old photos that weren't edited
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
//     // console.log(updatedProduct);
//     res.redirect('/admin/product-list');
//   } catch (error) {
//     console.log(error);
//     res.render("admin-product-edit-page", { error: "An error occurred while updating the product, please try again" });
//   }
// };






module.exports.getCategory = async(req,res)=>{
  try{
  const dataCategory =await category.find();
  res.render("categories",{dataCategory});
}catch(error){
  console.error(error);
  res.redirect("/admin-dash");
}
}

module.exports.postCreateCategory = async(req,res)=>{
  const{
    name,
    description,
    status,
  }=req.body;
const photoPath =req.file.path
  if(!name || !description){
    res.status(400).json({error:"Name and Description is required."})
  }
  const categoryData = new category({
    name,
    description,
    status,
    photo:photoPath
  });
  try{
    await categoryData.save();
    res.redirect("/admin/categories")
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
