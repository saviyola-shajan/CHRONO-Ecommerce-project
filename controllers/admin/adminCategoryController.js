const category = require("../../models/category");


module.exports.getCategory = async (req, res) => {
    try {
      const dataCategory = await category.find();
      res.render("categories", { dataCategory, error: null });
    } catch (error) {
      console.error(error);
      res.redirect("/admin-dash");
    }
  };

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

  module.exports.getEditCategory = async(req,res)=>{
    try{
      const idcategory=req.params.categoryId
      const categoryData=await category.findById({_id:idcategory})
      res.render("edit-category",{categoryData,error:null})
    }catch(error){
      console,log(error)
    } 
  }

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