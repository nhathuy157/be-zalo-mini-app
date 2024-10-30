import crypto from "crypto";
import base64url from "base64url";

//create function random code verifier
export const generateCodeVerifier = () => { 
    return base64url(crypto.randomBytes(32));
}

//function create code challenge form code verifier
export const generateCodeChallenge = (codeVerifier) => {
    const sha256Hash = crypto.createHash("sha256").update(codeVerifier).digest();
    return base64url(sha256Hash);   
}