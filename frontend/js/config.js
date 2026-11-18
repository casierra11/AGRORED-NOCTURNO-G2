// =====================================================================
// CONFIGURACIÓN DEL FRONTEND - AgroRed
// =====================================================================
const API_USUARIOS = '/api';
const API_PEDIDOS = '/api';
// Página de inicio según el rol al hacer login
const PAGINA_POR_ROL = {
administrador: 'pedidos.html',
comercial: 'pedidos.html',
produccion: 'pedidos.html',
};
const ROLES = ['administrador', 'comercial', 'produccion'];
