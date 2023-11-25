const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require("date-fns");
const {
  getMonthlyDataArray,
  getDailyDataArray,
  getYearlyDataArray,
} = require("../../helpers/sales-chart");
const admincollecn = require("../../models/adminlogin");
const products = require("../../models/addProduct");
const category = require("../../models/category");
const order = require("../../models/order");

module.exports.getAdminLogin = (req, res) => {
  res.render("admin-login");
};

module.exports.getAdminDashboard = async (req, res) => {
  try {
    const orderCount = await order.countDocuments();
    const product = await products.countDocuments();
    const categories = await category.countDocuments();
    const sales = await order.find({ paymentStatus: "Success" });

    let revenue = 0;
    sales.forEach((sale) => {
      revenue += sale.totalAmount;
    });

    const currentMonth = new Date();
    const startOfMonthDate = startOfMonth(currentMonth);
    const endOfMonthDate = endOfMonth(currentMonth);

    const monthlySales = await order.find({
      paymentStatus: "Success",
      createdAt: {
        $gte: startOfMonthDate,
        $lte: endOfMonthDate,
      },
    });

    let monthlyearnings = 0;
    monthlySales.forEach((sale) => {
      monthlyearnings += sale.totalAmount;
    });

    const dailyDataArray = await getDailyDataArray();
    const monthlyDataArray = await getMonthlyDataArray();
    const yearlyDataArray = await getYearlyDataArray();

    res.render("admin-dashboard", {
      orderCount,
      product,
      categories,
      revenue,
      monthlyearnings,
      dailyDataArray,
      monthlyDataArray,
      yearlyDataArray,
    });
  } catch (error) {
    console.error("Error in getAdminDashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};

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
          res.redirect("/admin/getadmin-dash");
        }
      }
    } else {
      res.redirect("/admin");
    }
  }
};

module.exports.getLogout = async (req, res) => {
  res.redirect("/admin");
};
