// import expresss from 'express';
// import axios  from 'axios';
// import { generateCodeVerifier, generateCodeChallenge } from '../utils/authUtils';
// import Customer from '../Models/customersModel';

// const router = expresss.Router();

// const APP_ID = process.env.APP_ID;
// const SECRET_KEY = process.env.SECRET_KEY;
// const CALLBACK_URL = "https://be-zalo-mini-app.herokuapp.com/auth/callback";

// //Create code verifier and code challenge for PKCE
// const codeVerifier = generateCodeVerifier();
// const codeChallenge = generateCodeChallenge(codeVerifier);

// //Route get code from zalo

// router.get(
//     '/callback',
//     async (req, res) => {
//         const { code } = req.query;

//         if(!code) {
//             return res.status(400).send('Authorization code not found');
//         }
//         try {
//              // Gửi yêu cầu lấy Access Token từ Zalo
//     const tokenResponse = await axios({
//         method: 'POST',
//         url: 'https://oauth.zaloapp.com/v4/access_token',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           secret_key: SECRET_KEY,
//         },
//         data: new URLSearchParams({
//           code: code,
//           app_id: APP_ID,
//           grant_type: 'authorization_code',
//           code_verifier: codeVerifier,
//         }).toString(),
//       });
  
//       const { access_token, refresh_token, expires_in } = tokenResponse.data;
//       res.json({
//         message: 'Đăng nhập thành công!',
//         access_token,
//         refresh_token,
//         expires_in
//       });
//         }

//         catch (error) {
//             console.error('Lỗi khi lấy access token:', error.message);
//             res.status(500).send('Có lỗi xảy ra khi lấy access token');
//           }
//     }    
// );

// export default router;

import express from 'express';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/authUtils.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Lấy các thông số ứng dụng từ biến môi trường
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://be-zalo-mini-app.herokuapp.com/auth/callback'; // URL callback của bạn

// Khởi tạo code verifier và code challenge để dùng khi lấy access token
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// Route để người dùng cho phép ứng dụng và lấy mã Authorization Code
router.get('/get-code', (req, res) => {
  // Chuyển hướng người dùng đến trang cho phép của Zalo
  const state = 'random_state_string'; // Chuỗi ngẫu nhiên để bảo mật (CSRF protection)
  const authURL = `https://oauth.zaloapp.com/v4/permission?app_id=${APP_ID}&redirect_uri=${CALLBACK_URL}&code_challenge=${codeChallenge}&state=${state}`;
  
  // Chuyển hướng người dùng đến URL của Zalo để cho phép ứng dụng
  res.redirect(authURL);
});

// Route nhận `authorization code` từ Zalo sau khi người dùng cho phép
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code không tồn tại!');
  }

  try {
    // Gửi yêu cầu lấy Access Token từ Zalo
    const tokenResponse = await axios({
      method: 'POST',
      url: 'https://oauth.zaloapp.com/v4/access_token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: SECRET_KEY,
      },
      data: new URLSearchParams({
        code: code,
        app_id: APP_ID,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }).toString(),
    });

    // Lấy `access_token` và các thông tin từ phản hồi của Zalo
    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Trả về JSON chứa thông tin token cho người dùng
    res.json({
      message: 'Lấy Access Token thành công!',
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error) {
    console.error('Lỗi khi lấy Access Token:', error.message);
    res.status(500).send('Có lỗi xảy ra khi lấy Access Token');
  }
});

export default router;


