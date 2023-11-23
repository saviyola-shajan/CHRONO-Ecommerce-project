const products = require("../../models/addProduct");
const Banner = require("../../models/banner")


module.exports.searchProducts = async (req, res) => {
    try {
      const loggedIn = req.cookies.loggedIn;
      const { search_product } = req.query;
      const page = req.query.page
      const no_of_docs_each_page = 6;
      const banners = await Banner.find({status:"Active"})
      const totalProducts = await products.countDocuments({
        status: "Available" 
      });
      const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
      const skip = (page - 1) * no_of_docs_each_page;
  
      const regex = new RegExp(search_product, "i");
      const product = await products
      .find({  name: regex,status:"Available"})
      .skip(skip)
      .limit(no_of_docs_each_page);
      if (product.length === 0) {
        res.render("home", { message: "No products found", product, loggedIn,page,totalPages,banners });
      } else {
        res.render("home", { product, loggedIn,page,totalPages,banners });
      }
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.filterCategory = async (req, res) => {
    try {
      const loggedIn = req.cookies.loggedIn;
      const categories = req.query.category;
      const page = req.query.page
      const no_of_docs_each_page = 6;
      const banners = await Banner.find({status:"Active"})
      const totalProducts = await products.countDocuments({
        status: "Available" 
      });
      const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
      const skip = (page - 1) * no_of_docs_each_page;
  
      const product = await products
      .find({ status:"Available",category: categories})
      .skip(skip)
      .limit(no_of_docs_each_page);
      if (product.length === 0) {
        res.render("home", {
          message: "No items found in specified category",
          product,
          loggedIn,
          page,
          totalPages,
          banners
        });
      } else {
        res.render("home", { product, loggedIn,page,totalPages,banners });
      }
    } catch (error) {
      console.log(error);
    }
  };

  module.exports.getFiterCheckbox = async(req,res)=>{
    try{
      const loggedIn = req.cookies.loggedIn;
      const selectedBrands = req.body.brand;
      const selectedMovements = req.body.Movement;
      const selectedStrapMaterials = req.body.StrapMaterial;
      const page = req.query.page ?? 1;
      const no_of_docs_each_page = 6;
      const banners = await Banner.find({status:"Active"})
      const totalProducts = await products.countDocuments({
        status: "Available" 
      });
      const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
      const skip = (page - 1) * no_of_docs_each_page;
  
      const query = { status:"Available"};
  
      if (selectedBrands && selectedBrands.length > 0) {
        query.brand = { $in: selectedBrands };
      }
      
      if (selectedMovements && selectedMovements.length > 0) {
        query.movement = { $in: selectedMovements };
      }
      
      if (selectedStrapMaterials && selectedStrapMaterials.length > 0) {
        query.strap_material = { $in: selectedStrapMaterials };
      }
  
      const product = await products
      .find(query)
      .skip(skip)
      .limit(no_of_docs_each_page);
      // const product = await products.find(query);
     res.render("home",{loggedIn,product,page,totalPages,banners})
    }catch(error){
      console.log(error)
      res.status(500).send('Internal Server Error');
    }
  }

  module.exports.filterByPrice = async (req, res) => {
    try {
      const loggedIn = req.cookies.loggedIn;
      const sortBy = req.query.sortBy || 'lowToHigh';
      const page = req.query.page ?? 1;
      const no_of_docs_each_page = 6;
      const skip = (page - 1) * no_of_docs_each_page;
      
      let product
      if (sortBy === 'lowToHigh') {
         product = await products
        .find({status: 'Available'})
        .sort({s_price: 1})
        .skip(skip)
        .limit(no_of_docs_each_page)
      } else if (sortBy === 'highToLow') {
        const anotherproduct = await products
        .find({status: 'Available'})
        .sort({s_price: -1})
        .skip(skip)
        .limit(no_of_docs_each_page)
        product = anotherproduct;
      }
      const banners = await Banner.find({status:"Active"})
      const totalProducts = await products.countDocuments({status: 'Available'});
      const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
      res.render('home', { loggedIn, product, page, totalPages, sortBy,banners });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  };