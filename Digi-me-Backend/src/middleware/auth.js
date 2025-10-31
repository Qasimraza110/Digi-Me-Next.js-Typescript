// const jwt = require('jsonwebtoken');

// function authRequired(req, res, next) {
//   const header = req.headers.authorization || '';
//   const token = header.startsWith('Bearer ') ? header.slice(7) : null;
//   if (!token) return res.status(401).json({ message: 'Missing token' });
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
//     req.user = { id: payload.sub };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// }
   
// function issueToken(userId) {
//   const payload = { sub: userId };
//   const opts = { expiresIn: '7d' };
//   return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', opts);
// }

// module.exports = { authRequired, issueToken };

const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

// Middleware to verify token (either normal JWT or Google ID token)
async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    let payload;

    // 1️⃣ Try verifying your own JWT first
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
      req.user = { id: payload.sub };
      return next();
    } catch (err) {
      // Continue to try Google verification
    }

    // 2️⃣ Try verifying Google ID Token
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const googlePayload = ticket.getPayload();
      req.user = {
        id: googlePayload.sub,
        email: googlePayload.email,
        name: googlePayload.name,
        picture: googlePayload.picture,
        provider: "google",
      };

      return next();
    } catch (googleErr) {
      console.error("Google token verification failed:", googleErr.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("authRequired error:", err.message);
    res.status(500).json({ message: "Server error in authentication" });
  }
}

// Helper to issue your own JWT (for normal login/register)
function issueToken(userId) {
  const payload = { sub: userId };
  const opts = { expiresIn: "7d" };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", opts);
}

module.exports = { authRequired, issueToken };







  {/* Google Login */}
      {/* <div
        ref={googleButtonRef}
        onClick={isValidClientId ? handleGoogleClick : undefined}
        className={`flex items-center justify-center rounded-[12px] mx-auto transition backdrop-blur-sm ${isValidClientId ? "hover:bg-gray-50/10 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        style={{ width: "472px", height: "65px", gap: "10px", background: "transparent" }}
      >
        <Image src="/google.svg" alt="Google" width={42} height={42} />
        {!isValidClientId && <span className="ml-2 text-sm text-gray-500">(Not configured)</span>}
      </div> */}