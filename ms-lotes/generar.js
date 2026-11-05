const jwt = require('jsonwebtoken');

// IMPORTANTE: Si usaste otra clave en tu .env, cámbiala aquí.
const secreto = 'clave_secreta_agrored_2026'; 

const token = jwt.sign(
  { id: 1, nombre: 'Victor Salazar', rol: 'administrador' }, 
  secreto
);

console.log('\n--- COPIA TU TOKEN DE AQUÍ ABAJO ---\n');
console.log(token);
console.log('\n------------------------------------\n');