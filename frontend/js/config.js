// =====================================================================
// CONFIGURACIÓN DEL FRONTEND - AgroRed
// =====================================================================
const API_USUARIOS = 'http://localhost:3001';
const API_PEDIDOS = 'http://localhost:3004';

// Página de inicio según el rol al hacer login
const PAGINA_POR_ROL = {
  administrador: 'pedidos.html',
  comercial: 'pedidos.html',
  produccion: 'pedidos.html',
};

const ROLES = ['administrador', 'comercial', 'produccion'];