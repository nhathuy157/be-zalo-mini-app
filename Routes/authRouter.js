

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';


dotenv.config();

const authRouter = express.Router();

// Lấy các thông số ứng dụng từ biến môi trường
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL;


// Route để người dùng cho phép ứng dụng và lấy mã Authorization Code
authRouter.get('/zalo-auth-url', (req, res) => {
    
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

// Route xử lý lấy Access Token
authRouter.get('/access-token', async (req, res) => {
     console.log('Headers:', req.headers); // Log header để debug
     console.log('Request Body:', req.body); // Log body để kiểm tra request

    const { code, code_verifier } = req.body;

    if (!code || !code_verifier) {
        return res.status(400).json({ message: 'Thiếu code hoặc code_verifier!' });
    }

    try {
        // Gửi request tới Zalo API
        const tokenResponse = await axios({
            method: 'POST',
            url: 'https://oauth.zaloapp.com/v4/access_token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                secret_key: process.env.SECRET_KEY, // Lấy từ file .env
            },
            data: new URLSearchParams({
                code: code,
                app_id: process.env.APP_ID, // Lấy từ file .env
                grant_type: 'authorization_code',
                code_verifier: code_verifier,
            }).toString(),
        });

        // Log phản hồi của Zalo
        console.log('Token Response:', tokenResponse.data);

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        if (!access_token) {
            return res.status(400).json({ message: 'Không nhận được Access Token!' });
        }

        // Gửi phản hồi về client
        res.json({
            message: 'Lấy Access Token thành công!',
            access_token,
            refresh_token,
            expires_in,
        });
    } catch (error) {
        // Log lỗi nếu xảy ra
        console.error('Lỗi khi lấy Access Token:', error.response?.data || error.message);

        res.status(500).json({
            message: 'Có lỗi xảy ra khi lấy Access Token',
            error: error.response?.data || error.message,
        });
    }
   // console.log('Headers:', req.headers); // Log header để debug
});


export default authRouter;




