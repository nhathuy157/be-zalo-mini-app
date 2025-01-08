

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
import NodeCache from 'node-cache';

/** Bộ nhớ đệm để lưu codeVerifier và state */
const codeVerifierCache = new NodeCache({ stdTTL: 600 });


dotenv.config();

const authRouter = express.Router();

// Lấy các thông số ứng dụng từ biến môi trường
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL;




//Route để người dùng cho phép ứng dụng và lấy mã Authorization Code
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

    codeVerifierCache.set(STATE, codeVerifier);


    // Tạo URL OAuth
    const url = `https://oauth.zaloapp.com/v4/permission?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&code_challenge=${codeChallenge}&state=${STATE}`;

    // Trả về URL OAuth cho client
    res.json({
        authorizationUrl: url,
        state: STATE, // Trả về state cho client lưu lại để đối chiếu
        codeVerifier: codeVerifier // Bạn có thể lưu trữ codeVerifier ở đâu đó an toàn để kiểm tra khi nhận mã ủy quyền
    });


});


export function generateZaloAuthUrl(
    appId,
    callbackUrl,
    state,
    codeVerifierCache
) {
    // Tạo code_verifier ngẫu nhiên
    function generateCodeVerifier(){
        return crypto.randomBytes(32).toString('base64url'); // Base64 URL-safe không padding
    }

    // Tạo code_challenge từ code_verifier
    function generateCodeChallenge(codeVerifier) {
        const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url'); // Base64 URL-safe không padding
        return hash;
    }

    const codeVerifier = generateCodeVerifier(); // Tạo code_verifier
    const codeChallenge = generateCodeChallenge(codeVerifier); // Sinh code_challenge từ code_verifier

    // Lưu codeVerifier vào cache với key là state
    codeVerifierCache.set(state, codeVerifier);

    // Tạo URL OAuth
    const authorizationUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&code_challenge=${codeChallenge}&state=${state}`;

    return {
        authorizationUrl, // URL yêu cầu người dùng cấp quyền
        codeVerifier, // Trả về codeVerifier để sử dụng trong bước lấy access token
    };
}


authRouter.get('/zalo-auth', async (req, res) => {
    const state = crypto.randomBytes(16).toString('hex'); // Tạo state ngẫu nhiên

    try {
        // 1. Tạo URL Authorization
        const { authorizationUrl, codeVerifier } = generateZaloAuthUrl(APP_ID, CALLBACK_URL, state, codeVerifierCache);

        // 2. Lưu lại codeVerifier (nếu cần cho các bước tiếp theo)
        codeVerifierCache.set(state, codeVerifier);

        console.log('Step 1: Authorization URL:', authorizationUrl);

        // 3. Gửi yêu cầu GET đến URL Authorization
        const response = await axios.get(authorizationUrl, {
            maxRedirects: 0, // Không tự động theo dõi redirect
            validateStatus: (status) => status === 302 || status === 200, // Chỉ xử lý mã trạng thái 302 hoặc 200
        });

        if (response.status === 302) {
            // 4. Trích xuất URL từ phản hồi
            const nextUrl = response.headers.location; // `location` chứa URL tiếp theo
            console.log('Step 2: Redirect URL:', nextUrl);

            const nextUrl2 = nextUrl.headers.location;

            // Gửi lại URL tiếp theo cho client (hoặc tiếp tục xử lý nếu cần)
            return res.json({ nextUrl2 });
        }

        // Nếu không có redirect, trả về nội dung phản hồi
        return res.json({ message: 'Không có redirect', data: response.data });
    } catch (error) {
        console.error('Lỗi trong chuỗi yêu cầu:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra trong chuỗi yêu cầu', error: error.message });
    }
});

function getCodeVerifier(state) {
    return codeVerifierCache.get(state);
}

// Route xử lý lấy Access Token
authRouter.get('/access-token', async (req, res) => {
     console.log('Headers:', req.headers); // Log header để debug
     console.log('Request Body:', req.query); // Log body để kiểm tra request

    const { code, state } = req.query;

    

    if (!code || !state) {
        return res.status(400).json({ message: 'Thiếu code hoặc state!' });
    }

    const code_verifier = getCodeVerifier(state);

    if (!code_verifier) {
        return res.status(400).json({ message: 'Không nhận được Code Verifier!' });
    }

    try {
        // Gửi request tới Zalo API
        const tokenResponse = await axios({
            method: 'POST',
            url: 'https://oauth.zaloapp.com/v4/access_token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                secret_key: process.env.SECRET_KEY, 
            },
            data: new URLSearchParams({
                code: code,
                app_id: process.env.APP_ID, 
                grant_type: 'authorization_code',
                code_verifier: code_verifier,
            }).toString(),
        });

        
        console.log('Token Response:', tokenResponse.data);

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        if (!access_token) {
            return res.status(400).json({ message: 'Không nhận được Access Token!' });
        }

        
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




