import request from 'request';
import config from  '../config/config.js';

const service = {};
const API_DOMAIN = 'https://graph.zalo.me';
const OPEN_API_DOMAIN = 'https://openapi.zalo.me'



service.getZaloProfile = (accessToken) => {
  //  const proxyUrl = changeUrlToProxy("https://graph.zalo.me/v2.0/me");
    return new Promise((resolve, reject) => {
        // Kiểm tra accessToken
        if (!accessToken) {
            return reject({
                error: 1,
                message: 'Access token is required'
            });
        }

        console.log("accessToken", accessToken);

        // Cấu hình API request
        request({
            url: "https://graph.zalo.me/v2.0/me", // Endpoint API
            method: 'GET', // Phương thức GET
            headers: {
                'access_token': accessToken // Đặt AccessToken trong header
            },
            qs: {
                fields: 'id,name,birthday,email,picture' // Các trường cần lấy
            },
            json: true // Tự động parse JSON response
        }, (error, response, body) => {
            if (error) {
                // Xử lý lỗi kết nối hoặc lỗi khác
                console.log("error", error);
                return reject({
                    error: 2,
                    message: 'Request failed',
                    detail: error
                });
            }

            

            if (response.statusCode !== 200) {
                // Xử lý lỗi từ API Zalo
                console.log("response.statusCode", response.statusCode);
                return reject({
                    error: body.error || 3,
                    message: body.message || 'Unexpected API error'
                });
            }

            console.log("body", body);  

            // Trả về dữ liệu thành công
            resolve(body);
        });
    });
};

// service.getZaloProfile = async (accessToken) => {
//     const proxyUrl = changeUrlToProxy("https://graph.zalo.me/v2.0/me");

//     // Kiểm tra accessToken
//     if (!accessToken) {
//         return Promise.reject({
//             error: 1,
//             message: "Access token is required",
//         });
//     }

//     try {
//         // Cấu hình headers
//         const headers = {
//             "access_token": accessToken, // Đặt AccessToken trong header
//         };

//         // Gửi request qua proxy
//         const response = await fetch(proxyUrl + "?fields=id,name,birthday,email,picture", {
//             method: "GET",
//             headers,
//         });

//         // Kiểm tra status code
//         if (!response.ok) {
//             const errorBody = await response.json();
//             return Promise.reject({
//                 error: errorBody.error || 3,
//                 message: errorBody.message || "Unexpected API error",
//             });
//         }

//         // Parse và trả về dữ liệu thành công
//         const data = await response.json();
//         return Promise.resolve(data);

//     } catch (error) {
//         // Xử lý lỗi kết nối hoặc lỗi khác
//         return Promise.reject({
//             error: 2,
//             message: "Request failed",
//             detail: error.message,
//         });
//     }
// };


service.sendMessage = (userId, text) => {
    return new Promise((resolve, reject) => {
        request({
            url: `${OPEN_API_DOMAIN}/v2.0/oa/message`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': config.OA_TOKEN
            },
            body: {
                recipient: {
                    user_id: userId
                },
                message: {
                    text
                }
            },
            json: true
        }, (error, response, body) => {
            if (error) return reject(error);
            return resolve(body);
        });
    });
}

export default service;