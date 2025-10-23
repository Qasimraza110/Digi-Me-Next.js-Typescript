const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function issueToken(userId) {
  const payload = { sub: userId };
  const opts = { expiresIn: '7d' };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', opts);
}

module.exports = { authRequired, issueToken };


