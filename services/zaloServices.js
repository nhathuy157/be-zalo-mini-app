import request from 'request';
import config from  '../config/config.js';

const service = {};
const API_DOMAIN = 'https://graph.zalo.me';
const OPEN_API_DOMAIN = 'https://openapi.zalo.me'

// service.getZaloProfile = (accessToken) => {
//     return new Promise((resolve, reject) => {
//         request({
//             url: `${API_DOMAIN}/v2.0/me`,
//             method: 'GET',
//             qs: {
//                 access_token: accessToken,
//                 fields: 'id,name,birthday,email,picture'
//             },
//             json: true
//         }, (error, response, body) => {
//             if (error) return reject(error);
//             return resolve(body);
//         });
//     });
// }

// service.getZaloProfile = (accessToken) => {
//     return new Promise((resolve, reject) => {
//         request({
//             url: `${API_DOMAIN}/v2.0/me`,
//             method: 'GET',
//             headers: {
//                 Authorization: `Bearer ${accessToken}` // Đặt AccessToken trong header
//             },
//             qs: {
//                 fields: 'id,name,birthday,email,picture' // Chỉ truyền các tham số cần thiết
//             },
//             json: true
//         }, (error, response, body) => {
//             if (error) return reject(error);
//             return resolve(body);
//         });
//     });
// }

service.getZaloProfile = (accessToken) => {
    const proxyUrl = changeUrlToProxy("https://graph.zalo.me/v2.0/me");
    return new Promise((resolve, reject) => {
        // Kiểm tra accessToken
        if (!accessToken) {
            return reject({
                error: 1,
                message: 'Access token is required'
            });
        }

        // Cấu hình API request
        request({
            url: proxyUrl, // Endpoint API
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
                return reject({
                    error: 2,
                    message: 'Request failed',
                    detail: error
                });
            }

            if (response.statusCode !== 200) {
                // Xử lý lỗi từ API Zalo
                return reject({
                    error: body.error || 3,
                    message: body.message || 'Unexpected API error'
                });
            }

            // Trả về dữ liệu thành công
            resolve(body);
        });
    });
};


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