const admincollecn=require("../models/adminlogin");
const usercollecn = require("../models/userlogin");
const products = require("../models/addProduct")
const multer = require('multer');



module.exports.getAdminLogin =(req,res)=>{
    res.render("admin-login");
}

//chechking deatils aand login admin
module.exports.getAdminDashboard = async (req,res)=>{
    const admindata = await admincollecn.findOne({email:req.body.email});
    if(!admindata){
       res.render('admin-login',{subreddit:"This email is not registered"});
    }else{
    if(admindata){
       if(req.body.email!== admindata.email){
           res.render('admin-login',{subreddit:"Incorrect Email"});
       }else if(req.body.password !== admindata.password){
           res.render('admin-login',{subreddit:"Incorrect Password"});
       }else{
           if(req.body.email == admindata.email && req.body.password == admindata.password){
               res.render("admin-dashboard")
           }
       }
    }else{
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
module.exports.getProductsList= async(req,res)=>{
    try {
        const product = await products.find({}); 
        res.render("products-list", { product });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving user data");
    }
};

// get add product
module.exports.getAddProduct=(req,res)=>{
    res.render("add-products")
}  
//post the added product
module.exports.postAddProduct = (req, res) => {
    const { name, description, r_price, s_price, category, brand, stock, status } = req.body;
  
    const photos = req.files;
    let arr=[];
    photos.forEach(element => {
        arr.push({name:element.filename,
        path:element.path})
        
    });
  
    if (!name || !description || !r_price || !category || !brand || !stock || !status || !photos) {
      return res.render('add-products', {
        error: 'Please fill out all the required fields and upload at least one photo.',
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
    res.redirect('/admin/product-list')
  };
