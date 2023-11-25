const products = require("../../models/addProduct");
const category = require("../../models/category");

module.exports.getProductsList = async (req, res) => {
  try {
    const product = await products.find({}).sort({ createdOn: -1 });
    res.render("products-list", { product });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving user data");
  }
};

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
    !photos ||
    !movement ||
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

module.exports.getEditProduct = async (req, res) => {
  const editItem = req.query.productId;
  try {
    const productDeatils = await products.findById(editItem);
    const categorydata = await category.find({});
    res.render("edit-product", { productDeatils, categorydata });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in updatting product");
  }
};

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
      strap_material,
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
