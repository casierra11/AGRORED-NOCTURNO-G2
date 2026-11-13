// =====================================================================
// PANTALLA DE PEDIDOS - AgroRed
// =====================================================================
const yo = exigirSesion();
let pedidos = [];

async function cargarPedidos(centro = '') {
  try {
    let ruta = '/pedidos';
    if (centro) ruta += `?centro_distribucion=${encodeURIComponent(centro)}`;
    
    pedidos = await api(ruta, {}, 'pedidos');
    pintarPedidos();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de pedidos.';
    mostrarError(error);
  }
}

function pintarPedidos() {
  document.getElementById('resumen').textContent = `${pedidos.length} pedidos registrados`;
  const tbody = document.getElementById('lista');
  
  if (pedidos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="vacio">No hay pedidos registrados. Usa el botón "Nuevo pedido" para agregar uno.</td></tr>`;
    return;
  }

  tbody.innerHTML = pedidos.map((p) => {
    // Si los microservicios de clientes o productos están apagados, muestra una advertencia en lugar de datos inventados
    const nombreCliente = p.cliente?.nombre || p.cliente_nombre || `Cliente ID: ${p.cliente_id} (Inicie ms-clientes)`;
    const nombreProducto = p.producto?.nombre || p.producto_nombre || `Producto ID: ${p.producto_id} (Inicie ms-productos)`;

    return `
      <tr>
        <td>#${p.id}</td>
        <td>${esc(nombreCliente)}</td>
        <td>${esc(nombreProducto)}</td>
        <td><strong>${p.cantidad}</strong></td>
        <td>${esc(p.centro_distribucion)}</td>
        <td><span class="sello sello-activo">${esc(p.estado)}</span></td>
        <td>${p.fecha ? p.fecha.split('T')[0] : ''}</td>
        <td class="acciones">
          <button class="boton boton-peligro" data-eliminar="${p.id}">Eliminar</button>
        </td>
      </tr>`;
  }).join('');
}

async function crearPedido() {
  const campos = [
    { nombre: 'cliente_id', etiqueta: 'ID de Cliente', tipo: 'text', ayuda: 'Ej. 1, 2, 3...' },
    { nombre: 'producto_id', etiqueta: 'ID de Producto', tipo: 'text', ayuda: 'Ej. 1, 2, 3...' },
    { nombre: 'cantidad', etiqueta: 'Cantidad', tipo: 'text', ayuda: 'Ej. 50' },
    { nombre: 'centro_distribucion', etiqueta: 'Centro de Distribución', tipo: 'text', ayuda: 'Ej. Cali' },
    { 
      nombre: 'estado', 
      etiqueta: 'Estado', 
      tipo: 'select', 
      opciones: [
        { valor: 'recibido', texto: 'Recibido' },
        { valor: 'despachado', texto: 'Despachado' },
        { valor: 'entregado', texto: 'Entregado' }
      ] 
    },
    { nombre: 'fecha', etiqueta: 'Fecha (YYYY-MM-DD)', tipo: 'text', ayuda: '2026-11-12' }
  ];

  const datos = await pedirDatos('Crear nuevo pedido', campos, { estado: 'recibido' }, 'Guardar pedido');
  if (!datos) return;

  try {
    await api('/pedidos', { 
      method: 'POST', 
      body: {
        cliente_id: Number(datos.cliente_id),
        producto_id: Number(datos.producto_id),
        cantidad: Number(datos.cantidad),
        centro_distribucion: datos.centro_distribucion,
        estado: datos.estado,
        fecha: datos.fecha
      } 
    }, 'pedidos');

    mostrarMensaje('¡Pedido creado y guardado en la base de datos con éxito!');
    cargarPedidos();
  } catch (error) { 
    mostrarError(error); 
  }
}

async function eliminarPedido(id) {
  if (!(await confirmar(`¿Eliminar el pedido #${id}?`, 'Eliminar pedido'))) return;
  try {
    await api(`/pedidos/${id}`, { method: 'DELETE' }, 'pedidos');
    mostrarMensaje(`Pedido #${id} eliminado con éxito`);
    cargarPedidos();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  
  // Vincula el botón Nuevo pedido con la función para abrir el formulario
  document.getElementById('nuevo').onclick = crearPedido;

  // Filtro por centro de distribución en tiempo real
  const inputBusqueda = document.getElementById('busqueda-centro');
  inputBusqueda.oninput = (e) => {
    cargarPedidos(e.target.value.trim());
  };

  document.getElementById('lista').onclick = (evento) => {
    const idEliminar = evento.target.dataset.eliminar;
    if (idEliminar) eliminarPedido(Number(idEliminar));
  };

  cargarPedidos();
}