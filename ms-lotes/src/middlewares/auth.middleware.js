// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function verificarTokenAdmin(req, res, next) {
  // 1. Buscamos el token en la cabecera 'Authorization' de la petición
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Falla de autenticación: Token ausente o formato incorrecto.' });
  }

  // 2. Extraemos el token (le quitamos la palabra "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificamos que el token sea válido usando nuestra clave del .env
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Verificamos que el usuario tenga el rol requerido (administrador)
    if (payload.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso prohibido. Se requiere rol de administrador.' });
    }

    // 5. Si todo está bien, dejamos que la petición continúe hacia el controlador
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o ha expirado.' });
  }
}

module.exports = { verificarTokenAdmin };