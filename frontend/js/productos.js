(function () {
  const money = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  let productos = [];
  let editId = null;

  const listaEl = document.getElementById('lista');
  const resumenEl = document.getElementById('resumen');
  const filtroCatEl = document.getElementById('filtro-categoria');
  const busquedaEl = document.getElementById('busqueda-nombre');
  const dialogoEl = document.getElementById('dialogo');
  const formEl = document.getElementById('form-producto');
  const tituloDlgEl = document.getElementById('titulo-dialogo');

  // Inicializar cabecera de sesión (nombre, rol y botón cerrar sesión)
  if (typeof iniciarSesion === 'function') iniciarSesion();
  if (typeof pintarUsuario === 'function') pintarUsuario();
  if (typeof cargarUsuarioActual === 'function') cargarUsuarioActual();

  // Respaldo directo leyendo el payload del JWT por si la función de ui.js tiene otro nombre
  (function mostrarDatosCabecera() {
    const elNombre = document.getElementById('nombre-usuario');
    const elRol = document.getElementById('rol-usuario');
    const btnSalir = document.getElementById('cerrar-sesion');

    if (btnSalir) {
      btnSalir.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
      });
    }

    const tok = obtenerToken();
    if (!tok) return;
    try {
      const base64 = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      if (elNombre && (payload.nombre || payload.name || payload.email)) {
        elNombre.textContent = payload.nombre || payload.name || payload.email;
      }
      if (elRol && payload.rol) {
        elRol.textContent = payload.rol;
      }
    } catch {}
  })();

  // Obtiene el token guardado por login.html / sesion.js
  function obtenerToken() {
    for (const store of [localStorage, sessionStorage]) {
      for (const key of ['token', 'agrored.token', 'jwt', 'authToken']) {
        const val = store.getItem(key);
        if (val) return val.replace(/^"|"$/g, '');
      }
      for (let i = 0; i < store.length; i++) {
        const val = store.getItem(store.key(i));
        if (val && val.startsWith('eyJ')) return val.replace(/^"|"$/g, '');
      }
    }
    return '';
  }

  function notificar(texto, esError = false) {
    const box = document.getElementById('mensajes');
    if (!box) return alert(texto);
    const p = document.createElement('div');
    p.textContent = texto;
    p.style.cssText = `position:fixed;bottom:1rem;right:1rem;padding:0.75rem 1.1rem;border-radius:8px;color:#fff;font-weight:500;z-index:9999;background:${esError ? '#b91c1c' : '#166534'};`;
    box.appendChild(p);
    setTimeout(() => p.remove(), 3500);
  }

  async function reqProductos(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body) headers['Content-Type'] = 'application/json';
    const token = obtenerToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_PEDIDOS}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
  }

  async function cargarProductos() {
    try {
      const cat = filtroCatEl.value;
      const query = cat ? `?categoria=${encodeURIComponent(cat)}` : '';
      productos = await reqProductos(`/productos${query}`);
      renderizar();
    } catch (err) {
      resumenEl.textContent = 'Error al cargar productos';
      notificar(err.message, true);
    }
  }

  function renderizar() {
    const q = busquedaEl.value.trim().toLowerCase();
    const filtrados = q
      ? productos.filter((p) => p.nombre.toLowerCase().includes(q))
      : productos;

    resumenEl.textContent = `${filtrados.length} producto(s) registrado(s)`;
    listaEl.innerHTML = '';

    if (!filtrados.length) {
      listaEl.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:1.5rem;color:#64748b;">No hay productos para mostrar.</td></tr>`;
      return;
    }

    for (const p of filtrados) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${p.id}</td>
        <td style="font-weight:600;">${p.nombre}</td>
        <td style="text-transform:capitalize;">${p.categoria}</td>
        <td>${p.unidad}</td>
        <td>${money.format(Number(p.precio))}</td>
        <td style="text-align:right; white-space:nowrap;">
          <button type="button" class="btn-editar" style="margin-right:0.4rem;padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">Editar</button>
          <button type="button" class="btn-eliminar" style="padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;cursor:pointer;">Eliminar</button>
        </td>
      `;
      tr.querySelector('.btn-editar').addEventListener('click', () => abrirModal(p));
      tr.querySelector('.btn-eliminar').addEventListener('click', () => eliminarProducto(p));
      listaEl.appendChild(tr);
    }
  }

  function abrirModal(producto = null) {
    editId = producto ? producto.id : null;
    tituloDlgEl.textContent = producto ? `Editar producto #${producto.id}` : 'Nuevo producto';
    formEl.reset();
    if (producto) {
      formEl.elements.nombre.value = producto.nombre;
      formEl.elements.categoria.value = producto.categoria;
      formEl.elements.unidad.value = producto.unidad;
      formEl.elements.precio.value = producto.precio;
    }
    dialogoEl.showModal();
  }

  async function eliminarProducto(p) {
    if (!confirm(`¿Seguro que deseas eliminar "${p.nombre}"?`)) return;
    try {
      await reqProductos(`/productos/${p.id}`, { method: 'DELETE' });
      notificar('Producto eliminado');
      await cargarProductos();
    } catch (err) {
      notificar(err.message, true);
    }
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
      nombre: formEl.elements.nombre.value.trim(),
      categoria: formEl.elements.categoria.value,
      unidad: formEl.elements.unidad.value,
      precio: Number(formEl.elements.precio.value),
    };

    try {
      if (editId) {
        await reqProductos(`/productos/${editId}`, { method: 'PUT', body: datos });
        notificar('Producto actualizado');
      } else {
        await reqProductos('/productos', { method: 'POST', body: datos });
        notificar('Producto creado');
      }
      dialogoEl.close();
      await cargarProductos();
    } catch (err) {
      notificar(err.message, true);
    }
  });

  document.getElementById('nuevo').addEventListener('click', () => abrirModal());
  document.getElementById('btn-cancelar').addEventListener('click', () => dialogoEl.close());
  filtroCatEl.addEventListener('change', cargarProductos);
  busquedaEl.addEventListener('input', renderizar);

  cargarProductos();
})();