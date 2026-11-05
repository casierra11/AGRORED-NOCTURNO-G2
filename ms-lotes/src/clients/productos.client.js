// src/clients/productos.client.js

async function verificarProductoExiste(productoId, token) {
  try {
    // URL_MS_PRODUCTOS vendrá de tu .env (ej. http://localhost:3006/productos)
    const url = `${process.env.URL_MS_PRODUCTOS}/${productoId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token, // Reenviamos el token del usuario al ms-productos
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 404) {
      return false; // El producto no existe en la BD del compañero
    }
    
    if (!response.ok) {
      throw new Error(`Error HTTP al comunicarse con ms-productos: ${response.status}`);
    }
    
    return true; // El producto existe
  } catch (error) {
    console.error("Fallo de red en productos.client:", error.message);
    const err = new Error('El microservicio de productos no está disponible temporalmente.');
    err.status = 503;
    throw err;
  }
}

module.exports = { verificarProductoExiste };