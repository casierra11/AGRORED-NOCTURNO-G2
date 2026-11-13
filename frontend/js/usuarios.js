// =====================================================================
// PANTALLA DE USUARIOS (solo administrador)
// Usa: GET /usuarios, POST /usuarios, PUT /usuarios/:id, DELETE /usuarios/:id
// =====================================================================
const yo = exigirSesion('administrador');
let usuarios = [];

const camposUsuario = (creando) => [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
  { nombre: 'rol', etiqueta: 'Rol', tipo: 'select',
    opciones: ROLES.map((rol) => ({ valor: rol, texto: rol })) },
  { nombre: 'activo', etiqueta: 'Estado', tipo: 'select',
    opciones: [{ valor: 'true', texto: 'Activo' }, { valor: 'false', texto: 'Inactivo' }] },
  { nombre: 'password', etiqueta: creando ? 'Contraseña' : 'Nueva contraseña (opcional)',
    tipo: 'password', opcional: !creando, ayuda: 'Mínimo 8 caracteres' },
];

// El formulario entrega texto; la API espera activo como booleano
const aCuerpo = (datos) => ({ ...datos, activo: datos.activo === 'true' });

function pintar() {
  const activos = usuarios.filter((u) => u.activo).length;
  document.getElementById('resumen').textContent = `${usuarios.length} usuarios, ${activos} activos`;
  document.getElementById('lista').innerHTML = usuarios.map((u) => `
    <tr>
      <td>${esc(u.nombre)}${u.id === yo.id ? ' <span class="sub">(usted)</span>' : ''}</td>
      <td>${esc(u.email)}</td>
      <td><span class="etiqueta-rol">${esc(u.rol)}</span></td>
      <td>${u.activo ? 'Activo' : '<span class="sub">Inactivo</span>'}</td>
      <td class="acciones">
        <button class="boton boton-suave" data-editar="${u.id}">Editar</button>
        ${u.id === yo.id ? '' : `<button class="boton boton-peligro" data-eliminar="${u.id}">Eliminar</button>`}
      </td>
    </tr>`).join('');
}

async function cargar() {
  try {
    usuarios = await api('/usuarios');
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de usuarios.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Crear usuario', camposUsuario(true),
    { rol: 'lector', activo: 'true' }, 'Crear usuario');
  if (!datos) return;
  try {
    await api('/usuarios', { method: 'POST', body: aCuerpo(datos) });
    mostrarMensaje(`Usuario creado: ${datos.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(u) {
  const datos = await pedirDatos('Editar usuario', camposUsuario(false),
    { ...u, activo: String(u.activo) });
  if (!datos) return;
  try {
    await api(`/usuarios/${u.id}`, { method: 'PUT', body: aCuerpo(datos) });
    mostrarMensaje('Cambios guardados');
    cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(u) {
  if (!(await confirmar(`¿Eliminar a ${u.nombre}?`, 'Eliminar usuario'))) return;
  try {
    await api(`/usuarios/${u.id}`, { method: 'DELETE' });
    mostrarMensaje(`Usuario eliminado: ${u.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  document.getElementById('nuevo').onclick = crear;
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const u = usuarios.find((x) => x.id === Number(idEditar || idEliminar));
    if (u && idEditar) editar(u);
    if (u && idEliminar) eliminar(u);
  };
  cargar();
}
