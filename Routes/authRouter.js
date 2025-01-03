

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const authRouter = express.Router();

// Lấy các thông số ứng dụng từ biến môi trường
const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL;


// Route để người dùng cho phép ứng dụng và lấy mã Authorization Code
authRouter.get('/api/v1/zalo-auth-url', (req, res) => {
    
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

// Route nhận `authorization code` từ Zalo sau khi người dùng cho phép
authRouter.post('/access-token', async (req, res) => {
 // const { code, code_verifier } = req.body; // Lấy code và code_verifier từ body request

  if (!code || !code_verifier) {
      return res.status(400).json({ message: 'Thiếu code hoặc code_verifier!' });
  }

  try {
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
              code_verifier: code_verifier,
          }).toString(),
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      res.json({
          message: 'Lấy Access Token thành công!',
          access_token,
          refresh_token,
          expires_in,
      });
  } catch (error) {
      console.error('Lỗi khi lấy Access Token:', error.message);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy Access Token' });
  }
});

export default authRouter;


