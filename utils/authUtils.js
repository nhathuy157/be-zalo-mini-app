const crypto = require('crypto');

// Tạo code_verifier ngẫu nhiên
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url'); // base64url là phiên bản Base64 không padding
}

// Tạo code_challenge từ code_verifier
function generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return hash; // Code challenge đã được mã hóa bằng SHA-256 và base64url
}

// Ví dụ sử dụng
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

console.log('Code Verifier:', codeVerifier);
console.log('Code Challenge:', codeChallenge);
