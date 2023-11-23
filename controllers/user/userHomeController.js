const products = require("../../models/addProduct");
const Banner = require('../../models/banner')

module.exports.getHomePage = async (req, res) => {
    try {
      const loggedIn = req.cookies.loggedIn;
      const page = req.query.page ?? 1;
      const no_of_docs_each_page = 6;
      const banners = await Banner.find({status:"Active"})
      const totalProducts = await products.countDocuments({
        status: "Available" 
      });
      const totalPages = Math.ceil(totalProducts / no_of_docs_each_page);
      const skip = (page - 1) * no_of_docs_each_page;
  
      const product = await products
      .find({ status:"Available"})
      .skip(skip)
      .limit(no_of_docs_each_page);
      res.render("home", { product, loggedIn,page,totalPages,banners });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching products");
    }
  };

  module.exports.getSingleProduct = async (req, res) => {
    const loggedIn =req.cookies.loggedIn
    const productId = req.params.productId;
    try {
      const singleProduct = await products.findById(productId);
      if (!singleProduct) {
        return res.status(404).send("product not found");
      }
      res.render("single-product", { singleProduct,loggedIn });
    } catch (error) {
      console.error(error);
      res.status(500).send("error fetching product deatils");
    }
  };