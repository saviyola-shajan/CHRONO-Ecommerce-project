const order = require("../../models/order");
const path = require("path");
const excelJS = require("exceljs");
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');


module.exports.getExcelSalesReport = async (req,res)=>{
    const orders = await order.find({orderStatus:"Delivered"}).populate({
      path:"products.productId",
      model:"products",
    })
    const workbook = new excelJS.Workbook();  
    const worksheet = workbook.addWorksheet("Sales Report");
  let SerialNumber= 1;
    worksheet.columns = [
      { header: "UserID", key: "UserId", width: 10 }, 
      { header: 'Order Date', key: 'orderDate', width: 15, style: { numFmt: 'yyyy-mm-dd' } },
      { header: "Name", key: "Name", width: 10 },
      { header: "Product", key: "products", width: 25 },
      { header: "Quantity", key: "quantity", width: 5 },
      { header: "Total Amount", key: "totalAmount", width: 10 },
      { header: "Order status", key: "OrderStatus", width: 10 },
      { header: "Payment Method", key: "PaymentMethod", width: 10 },
      { header: "Address", key: "address", width: 55 },
  ];
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  
  orders.forEach((eachorder)=>{
    eachorder.products.forEach((product)=>{
      const fullAddress = `${eachorder.address.addressType}\n${eachorder.address.city}, ${eachorder.address.landMark},${eachorder.address.state},${eachorder.address.pincode},${eachorder.address.phonenumber}`;
      const salesData = {
        'Sno':SerialNumber++,
        userId:eachorder.userId,
        orderDate:eachorder.orderDate,
        Name:eachorder.address.userName,
        products: product.productId.name,
        quantity:product.quantity,
        totalAmount:eachorder.totalAmount,
        OrderStatus:eachorder.orderStatus,
        PaymentMethod:eachorder.paymentMethod,
        address:fullAddress,
      }
      worksheet.addRow(salesData)
    })
  });
  
  
  const filePath = path.join(__dirname, 'sales_report.xlsx');
  const exportPath = path.resolve(
    
    "Public",
    "sales_report",
    "sales-report.xlsx"
  );
  
  await workbook.xlsx.writeFile(exportPath)
      .then(async() => {
          res.download(exportPath, 'sales_report.xlsx', (err) => {
              if (err) {
                  res.status(500).send('Error sending the file');
              }
          });
      })
      .catch((error) => {
          console.error('Error writing Excel file:', error);
          res.status(500).send('Error writing the file');
      })
    }

    module.exports.getPdfSalesReport = async(req,res)=>{
        try{
        const orders = await order.find({orderStatus:"Delivered"}).populate({
          path:"products.productId",
          model:"products"
        })
          res.render("salesreport_pdf",{orders})
        }catch(error){
      console.log(error)
        }
      }

      module.exports.getSale = async (req, res) => {
        try {
          const allOrders = await order.find({
            orderStatus: "Delivered"
        }).populate({
            path: "products.productId",
            model: "products"
        });
            const reportType = req.query.type;
            let additionalData;
    
            switch (reportType) {
                case 'weekly':
                    additionalData = await order.find({
                        orderStatus: "Delivered",
                        orderDate: { $gte: startOfWeek(new Date()), $lte: endOfWeek(new Date()) }
                    }).populate({
                        path: "products.productId",
                        model: "products"
                    });
                    break;
                case 'monthly':
                    additionalData = await order.find({
                        orderStatus: "Delivered",
                        orderDate: { $gte: startOfMonth(new Date()), $lte: endOfMonth(new Date()) }
                    }).populate({
                        path: "products.productId",
                        model: "products"
                    });
                    break;
                case 'yearly':
                    additionalData = await order.find({
                        orderStatus: "Delivered",
                        orderDate: { $gte: startOfYear(new Date()), $lte: endOfYear(new Date()) }
                    }).populate({
                        path: "products.productId",
                        model: "products"
                    });
                    break;
                default:
                    additionalData = [];
                    break;
            }
    
            const orders = [...allOrders, ...additionalData];
    
            res.render("sales-report-admin", { orders, reportType });
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    };