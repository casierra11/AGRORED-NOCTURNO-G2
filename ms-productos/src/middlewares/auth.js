const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  // IMPRIME ESTOS DOS VALORES EN CONSOLA:
  console.log('--- DEPURACIÓN JWT ---');
  console.log('Token recibido:', token);
  console.log('Secret utilizado:', process.env.JWT_SECRET || '123');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123');
    req.usuario = decoded;
    next();
  } catch (error) {
    console.log('Error de JWT:', error.message); // Imprime la causa exacta del fallo
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };