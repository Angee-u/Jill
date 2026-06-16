// Obriga

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']; // O token vem no header Authorization (ainda meio nublado)
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) {
    return res.status(401).json({error: 'Acesso negado'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({error: 'Token inválido ou expirado.'});
  }
};