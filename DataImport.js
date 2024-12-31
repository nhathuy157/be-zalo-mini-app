import express from "express";
import asyncHandler from "express-async-handler";
import order from "./data/data.js";
import banners from "./data/banners.js";
import Orders from "./Models/ordersModel.js";
import Consultants from "./Models/consultantsModel.js";
import ProductOrders from "./Models/productOrdersModel.js";
import news from "./data/news.js";
import News from "./Models/newsModel.js";
import Customer from "./Models/customerModel.js";
import Category from "./Models/categoriesModel.js";
import Product from "./Models/productsModel.js";
import Banner  from "./Models/bannerModel.js";
import { scrapeAndDisplayCategories, scrapeAllProductData } from "./controllers/sitemapController.js";

const ImportData = express.Router();

// Xử lí data

const getProductIds = async (products) => {
  const productIds = await Promise.all(products.map(async (product) => {
    let existingProduct = await ProductOrders.findOne({
      productName: product.name,
      image: product.image // Sửa lại thành image
    });    

    if (!existingProduct) {
      console.warn(`Product not found: ${product.name}, ${product.image}`); // Cảnh báo thay vì ném lỗi
      return null; // Trả về null nếu không tìm thấy sản phẩm
    }

    return existingProduct._id;
  }));

  return productIds.filter(id => id !== null); // Lọc ra các giá trị null trước khi trả về
};
//Nhân viên phụ trách đơn
// const getConsultantIds = async (consultant) => {
//   const consultantIds = await Promise.all(consultant.map(async (consultant) => {
//     let existingConsultant = await Consultants.findOne({
//       name :consultant.name,
//       phone: consultant.phone,
//     });    

//     if (!existingProduct) {
//       console.warn(`Product not found: ${consultant.name}, ${consultant.phone}`); // Cảnh báo thay vì ném lỗi
//       return null; // Trả về null nếu không tìm thấy sản phẩm
//     }

//     return existingConsultant._id;
//   }));

//   return consultantIds.filter(id => id !== null); // Lọc ra các giá trị null trước khi trả về
// };



const formatOrders = async (orderData) => {
  // Xử lý từng đơn hàng trong danh sách
  const formattedOrders = await Promise.all(orderData.map(async (order) => {
    // Tìm kiếm hoặc tạo mới Customer
    let customer = await Customer.findOne({
      name_customer: order.customer?.name,
      phone: order.customer?.phone
    });

    let consultant = await Consultants.findOne({
      name_consultants: order.customer?.assign.first_name,
      phone: order.customer?.assign.phone
    });

    if (!consultant) {
      throw new Error(`Customer not found: ${order.customer?.assign.first_name}, ${order.customer?.assign.phone}`);
    }

    if (!customer) {
      throw new Error(`Customer not found: ${order.customer?.name}, ${order.customer?.phone}`);
    }

    // Gọi hàm getProductIds để lấy danh sách các ObjectId của sản phẩm
    const productsIds = await getProductIds(order.products);

 

    // Định dạng lại đơn hàng để chuẩn bị lưu vào MongoDB
    return {
      codeOrder: order.code || `Order_${Date.now()}`, // Mã đơn hàng mặc định nếu thiếu
      orderDate: order.accept_produce_at || Date.now(), // Ngày đặt hàng
      statusOrder: order.status?.text || "Đang xử lý", // Trạng thái mặc định
      totalAmount: order.totalMoney || 0, // Tổng tiền
      VAT: order.totalVAT || 0, //VAT
      totalAccountAll: order.totalAccountAll || 0, // tiền cọc
      consultant : consultant._id,
      customer: customer._id, // ObjectId của khách hàng
      products: productsIds // Danh sách ObjectId của sản phẩm
    };
  }));

  return formattedOrders; // Trả về danh sách đơn hàng đã được định dạng
};

ImportData.post(
  "/order",
  asyncHandler(async (req, res) => {
    await Orders.deleteMany({}); // Xóa hết dữ liệu cũ trong collection 'Orders'

    // Gọi hàm formatOrders để định dạng các đơn hàng
    const formattedOrders = await formatOrders(order);

    // Thêm dữ liệu đã định dạng vào collection Orders
    const importOrders = await Orders.insertMany(formattedOrders);

    res.send({ importOrders });
  })
);

ImportData.post(
  "/consultant",
  asyncHandler(async (req, res) => {
    await Consultants.deleteMany({}); // Xóa hết dữ liệu cũ trong collection 'Customer'
    const formattedConsultants = order.map(order => ({
      name_consultants: order.customer?.assign.first_name || `Customer_${Date.now()}`, // Nếu thiếu name_customer, dùng một giá trị mặc định
      email: order.customer?.assign.email || "email@default.com", // Nếu thiếu email, dùng giá trị mặc định
      phone: order.customer?.assign.phone || "0000000000", // Nếu thiếu phone, dùng giá trị mặc định
      // Nếu thiếu sex, dùng giá trị mặc định true (nam)
      facebook: order.customer?.assign.facebook || "https://www.facebook.com/" // Dùng ngày hiện tại nếu thiếu
      // Nếu thiếu, tạo một mã mặc định
    }));

    // Thêm dữ liệu đã định dạng vào collection Customers
    const importConsultants = await Consultants.insertMany(formattedConsultants);

    res.send({ importConsultants });
  })
);


//

ImportData.post(
  "/new",
  asyncHandler(async (req, res) => {
    await News.deleteMany({});
    const importNews = await News.insertMany(news);
    res.send({ importNews });
  })
);



// Import danh sách banner
ImportData.post(
  "/banner",
  asyncHandler(async (req, res) => {
    // Xóa toàn bộ banner cũ
    await Banner.deleteMany({});

    // Chuẩn bị dữ liệu và import
    const bannerData = banners.map((url) => ({ image: url }));
    const importedBanners = await Banner.insertMany(bannerData);

    res.status(201).json({ importedBanners });
  })
);




ImportData.post(
  "/productOrder",
  asyncHandler(async (req, res) => {
    try {
      // Xóa toàn bộ dữ liệu cũ trong collection 'ProductOrders'
      await ProductOrders.deleteMany({});

      // Duyệt qua các đơn hàng và xử lý sản phẩm
      const formattedProductOrders = [];

      order.forEach((order) => {
        // Kiểm tra xem order.products có tồn tại và là một mảng không
        if (Array.isArray(order.products)) {
          order.products.forEach((product) => {
            // Kiểm tra sự tồn tại của các thuộc tính cần thiết
            if (product && product.name && product.money !== undefined) {
              formattedProductOrders.push({
                productName: product.name || "Product name",
                price: product.money || 0,
                image: product.image || "No image",
                color: product.color || "No color",
                material: product.material?.name || "No material",
                quantity: product.number || 0,
              });
            } else {
              console.warn(`Sản phẩm không hợp lệ: ${JSON.stringify(product)}`);
            }
          });
        } else {
          console.warn(`Không có sản phẩm hợp lệ trong đơn hàng: ${JSON.stringify(order)}`);
        }
      });

      // Thêm dữ liệu đã định dạng vào collection 'ProductOrders'
      const importProductOrders = await ProductOrders.insertMany(formattedProductOrders);
      res.send({ importProductOrders });
    } catch (error) {
      console.error("Lỗi khi import ProductOrders:", error);
      res.status(500).send("Có lỗi xảy ra trong quá trình import sản phẩm.");
    }
  })
);

function generateRandomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

ImportData.post(
  "/customer",
  asyncHandler(async (req, res) => {
    // Xóa hết dữ liệu cũ trong collection 'Customer'
    await Customer.deleteMany({});

    // Lấy dữ liệu từ `order` và định dạng lại
    const formattedCustomers = order.map(order => {
      const customer = order.customer || {}; // Nếu không có order.customer, gán giá trị mặc định là {}
      return {
        name_customer: customer.name || `Customer_${Date.now()}`, // Giá trị mặc định cho name_customer
        email: customer.email || "email@default.com", // Giá trị mặc định cho email
        phone: customer.phone || "0000000000", // Giá trị mặc định cho phone
        sex: customer.sex ?? true, // Nếu thiếu sex, mặc định là true (nam)
        registrationDate: customer.registrationDate || Date.now(), // Mặc định là ngày hiện tại
        customerCode: customer.customerCode || `CODE_${Date.now()}`, // Mã khách hàng mặc định
        zaloId: customer.zaloId || generateRandomId(8), // Giá trị mặc định cho zaloId
        picture: customer.picture || "", // Giá trị mặc định cho picture
        followerId: customer.followerId || generateRandomId(8), // Giá trị mặc định cho followerId
      };
    });

    // Lưu vào cơ sở dữ liệu
    await Customer.insertMany(formattedCustomers);

    // Trả về kết quả
    res.status(201).json({
      message: "Customer data imported successfully",
      count: formattedCustomers.length,
    });
  })
);










ImportData.post(
  "/categories",
  asyncHandler(async (req, res) => {
    // Lấy danh sách các danh mục từ hàm scrape
    const categories = await scrapeAndDisplayCategories();

    // Xóa toàn bộ danh mục cũ trong database trước khi import
    await Category.deleteMany({});

    // Tạo dữ liệu danh mục mới từ danh sách đã scrape
    const categoriesToImport = categories.map((categoryName) => ({
      categoryName,
    }));

    console.log(categoriesToImport);

    // Import danh mục vào MongoDB
    const importedCategories = await Category.insertMany(categoriesToImport);

    res.send({ importedCategories });
  })
);


// **Route mới** để scrape và import toàn bộ dữ liệu sản phẩm từ sitemap vào MongoDB
ImportData.post(
  "/products",
  asyncHandler(async (req, res) => {
    try {
      // 1. Scrape toàn bộ dữ liệu sản phẩm từ sitemap
      const scrapedProducts = await scrapeAllProductData();

      if (scrapedProducts.length === 0) {
        return res.status(400).send("Không có sản phẩm nào được scrape.");
      }

      // 2. Xóa toàn bộ dữ liệu sản phẩm cũ trong database
      await Product.deleteMany({});

      const productsToImport = [];

      // 3. Duyệt qua từng sản phẩm đã scrape để chuẩn bị dữ liệu
      for (const scrapedProduct of scrapedProducts) {
        const { productName, productDescription, imageProduct, productCategory } = scrapedProduct;

        // 4. Tìm `category` từ `productCategory` đã scrape
        const category = await Category.findOne({ categoryName: productCategory });

        if (!category) {
          console.log(`Category not found for product: ${productName}. Skipping...`);
          continue; // Nếu không tìm thấy category, bỏ qua sản phẩm này
        }

        // 5. Tạo đối tượng `Product` mới với schema yêu cầu
        const newProduct = {
          category: category._id, // Sử dụng `_id` của Category từ MongoDB
          productName,
          image: imageProduct.length > 0 ? imageProduct : "No image", // Lấy hình ảnh đầu tiên làm `image`
          description: productDescription,
        };

        productsToImport.push(newProduct);
      }

      // 6. Import toàn bộ sản phẩm vào MongoDB
      const importedProducts = await Product.insertMany(productsToImport);

      console.log("Sản phẩm đã được import thành công:", importedProducts);
      res.send({ importedProducts });
    } catch (error) {
      console.error("Lỗi khi scrape và import sản phẩm:", error);
      res.status(500).send("Có lỗi xảy ra trong quá trình import sản phẩm.");
    }
  })
);


export default ImportData;


