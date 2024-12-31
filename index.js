import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/mongodb.js";
import DataImport from "./DataImport.js";
import newsRouter from "./Routes/newRouter.js";
import categoriesRouter from "./Routes/categoriesRouter.js";
import productOrderRouter from "./Routes/productOrderRouter.js";
import productsRouter from "./Routes/productRouter.js";
import orderRouter from "./Routes/orderRouter.js";
import customerRouter from "./Routes/customerRouter.js";
import swaggerJSDoc from 'swagger-jsdoc';
import { notFound, errorHandler } from './Middleware/Errors.js';
import { scrapeAndDisplayCategories, scrapeAllProductData } from './controllers/sitemapController.js'
import { getOderInfo } from './controllers/apiController.js';
import bannerRouter from "./Routes/bannerRouter.js";
import crypto from 'crypto';




dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Zalo Mini App API",
        version: "1.0.0",
        description: 'This is a REST API application made with Express. It retrievews data from JSONPlace!',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
            name: 'JSONPlaceholder',
            url: 'https://jsonplaceholder.typicode.com',
        },
    },
    servers: [
        {
            url: "http://localhost:5000",
            description: 'Development server ',
        },
    ],
    paths: {
        path: {

        }
    },
    components: {},
    tags: [],
};

const options = {
    swaggerDefinition,
    basePath: '/api/v1',
    consumes: ['application/json'],
    produces: ['application/json'],
    apis: ['./Routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers',
        'X-Requested-With,Content-Type, Content-Length, Authorization, Accept, yourHeaderFeild');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)  
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/api/v1/zalo-auth-url', (req, res) => {
    const APP_ID = process.env.APP_ID; // Lấy APP_ID từ .env
    const CALLBACK_URL = process.env.CALLBACK_URL; // Lấy URL callback từ .env
    const STATE = crypto.randomBytes(16).toString('hex'); // Tạo state ngẫu nhiên

    // Tạo code_verifier ngẫu nhiên
    function generateCodeVerifier() {
        return crypto.randomBytes(32).toString('base64url'); // base64url là phiên bản Base64 không padding
    }

    // Tạo code_challenge từ code_verifier
    function generateCodeChallenge(codeVerifier) {
        const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
        return hash; // Code challenge đã được mã hóa bằng SHA-256 và base64url
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Tạo URL OAuth
    const url = `https://oauth.zaloapp.com/v4/permission?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&code_challenge=${codeChallenge}&state=${STATE}`;

    // Trả về URL OAuth cho client
    res.json({
        authorizationUrl: url,
        state: STATE, // Trả về state cho client lưu lại để đối chiếu
        codeVerifier: codeVerifier // Bạn có thể lưu trữ codeVerifier ở đâu đó an toàn để kiểm tra khi nhận mã ủy quyền
    });
});

app.post('/api/getOrderInfo', getOderInfo);


//API 
app.use("/api/v1/import", DataImport);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/productOrder", productOrderRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/consultant", productsRouter);




//ERROR HANDLER

app.use(notFound);
app.use(errorHandler);






// SCRAPE DATA từ SITEMAP nếu biến môi trường `SCRAPE_DATA` được bật
if (process.env.SCRAPE_DATA === 'true') {
    // Kết hợp scrape các danh mục và tất cả sản phẩm
    (async () => {
    //   console.log("Bắt đầu quá trình scrape dữ liệu...");
    //   await scrapeAndDisplayCategories();
    //   const allProductData = await scrapeAllProductData();  // Thêm quá trình scrape tất cả sản phẩm
    //   console.log('Quá trình scrape hoàn tất!');
    //   console.log('Tổng số sản phẩm đã scrape được:', allProductData.length);
    })();
  }
  
  // Khởi chạy server
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server đang chạy trong môi trường ${process.env.NODE_ENV || "development"} trên cổng ${PORT}`);
  });




