const coupon =require("../../models/coupon")


module.exports.getCoupon = async(req,res)=>{
    try{
      const couponlist = await coupon.find({})
  res.render("admin-coupon",{couponlist})  
    }catch(error){
      console.log(error)
    }
  }

  module.exports.getAddCoupon = async(req,res)=>{
    try{
      res.render("add-coupon")
    }catch(error){
      console.log(error)
    }
  }

  module.exports.postAddedCoupon=async(req,res)=>{
    try{
     const {couponCode,couponType,description,amount,minimumPurchase,expiryDate,status}=req.body
  
     const newCoupon = new coupon({
      couponCode,couponType,description,amount,minimumPurchase,expiryDate,status
     })
     newCoupon.save()
     res.redirect('/admin/coupon')
    }catch(error){
      console.log(error)
    }
  }

  module.exports.unblockCoupon = async(req,res)=>{
    try{
  
       const couponid = req.params.couponId
       const newStatus = await coupon.findById({_id:couponid})
       const updatedResult = await coupon.updateOne({_id:couponid},{$set:{status:"Active"}})
       res.redirect('/admin/coupon')
    }catch(error){
      console.log(error)
    }
  }

  module.exports.blockCoupon = async(req,res)=>{
    try{
      const couponid = req.params.couponId
      const newStatus = await coupon.findById({_id:couponid})
      const updatedResult = await coupon.updateOne({_id:couponid},{$set:{status:"Inactive"}})
      res.redirect('/admin/coupon')
    }catch(error){
      console.log(error);
    }
  }

  module.exports.editCoupon = async(req,res)=>{
    try{
      const couponid = req.params.couponId
     const editCoupon =await coupon.findOne({_id:couponid})
     res.render("edit-coupon",{editCoupon})
    }catch(error){
      console.log(error);
    }
  }

  module.exports.postEditcoupon = async(req,res)=>{
    try{
    const couponid =req.body.editcoupon
    const{couponCode,couponType,description,amount,minimumPurchase,expiryDate}=req.body
    const existingCoupon = await coupon.findById({_id:couponid})
    
    existingCoupon.couponCode=couponCode,
    existingCoupon.couponType=couponType
    existingCoupon.description=description
    existingCoupon.amount=amount
    existingCoupon.minimumPurchase=minimumPurchase
    existingCoupon.expiryDate=expiryDate
    await existingCoupon.save()
    res.redirect("/admin/coupon")
    }catch(error){
      console.log(error)
    }
    }