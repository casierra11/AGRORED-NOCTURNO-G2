require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`ms-productos escuchando en http://127.0.0.1:${PORT}`);
});