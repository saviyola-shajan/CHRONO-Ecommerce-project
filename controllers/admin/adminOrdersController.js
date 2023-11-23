const order = require("../../models/order");


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