(function () {
  let clientes = [];
  let editId = null;

  const listaEl = document.getElementById('lista');
  const resumenEl = document.getElementById('resumen');
  const filtroTipoEl = document.getElementById('filtro-tipo');
  const busquedaEl = document.getElementById('busqueda-cliente');
  const dialogoEl = document.getElementById('dialogo');
  const formEl = document.getElementById('form-cliente');
  const tituloDlgEl = document.getElementById('titulo-dialogo');

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

  async function reqClientes(path, options = {}) {
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

  function badgeTipo(tipo) {
    const esDist = tipo === 'distribuidor';
    const st = esDist
      ? 'background:#dbeafe;color:#1e40af;'
      : 'background:#f3e8ff;color:#6b21a8;';
    return `<span style="${st}padding:0.2rem 0.6rem;border-radius:999px;font-size:0.82rem;font-weight:600;text-transform:capitalize;">${tipo}</span>`;
  }

  async function cargarClientes() {
    try {
      const tipo = filtroTipoEl.value;
      const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
      clientes = await reqClientes(`/clientes${query}`);
      renderizar();
    } catch (err) {
      resumenEl.textContent = 'Error al cargar clientes';
      notificar(err.message, true);
    }
  }

  function renderizar() {
    const q = busquedaEl.value.trim().toLowerCase();
    const filtrados = q
      ? clientes.filter(
          (c) =>
            c.nombre.toLowerCase().includes(q) ||
            c.nit.toLowerCase().includes(q) ||
            c.ciudad.toLowerCase().includes(q)
        )
      : clientes;

    resumenEl.textContent = `${filtrados.length} cliente(s) registrado(s)`;
    listaEl.innerHTML = '';

    if (!filtrados.length) {
      listaEl.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:#64748b;">No hay clientes para mostrar.</td></tr>`;
      return;
    }

    for (const c of filtrados) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${c.id}</td>
        <td style="font-weight:600;">${c.nombre}</td>
        <td>${c.nit}</td>
        <td>${c.ciudad}</td>
        <td>${c.telefono}</td>
        <td>${badgeTipo(c.tipo)}</td>
        <td style="text-align:right; white-space:nowrap;">
          <button type="button" class="btn-editar" style="margin-right:0.4rem;padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">Editar</button>
          <button type="button" class="btn-eliminar" style="padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;cursor:pointer;">Eliminar</button>
        </td>
      `;
      tr.querySelector('.btn-editar').addEventListener('click', () => abrirModal(c));
      tr.querySelector('.btn-eliminar').addEventListener('click', () => eliminarCliente(c));
      listaEl.appendChild(tr);
    }
  }

  function abrirModal(cliente = null) {
    editId = cliente ? cliente.id : null;
    tituloDlgEl.textContent = cliente ? `Editar cliente #${cliente.id}` : 'Nuevo cliente';
    formEl.reset();
    if (cliente) {
      formEl.elements.nombre.value = cliente.nombre;
      formEl.elements.nit.value = cliente.nit;
      formEl.elements.ciudad.value = cliente.ciudad;
      formEl.elements.telefono.value = cliente.telefono;
      formEl.elements.tipo.value = cliente.tipo;
    }
    dialogoEl.showModal();
  }

  async function eliminarCliente(c) {
    if (!confirm(`¿Seguro que deseas eliminar al cliente "${c.nombre}"?`)) return;
    try {
      await reqClientes(`/clientes/${c.id}`, { method: 'DELETE' });
      notificar('Cliente eliminado');
      await cargarClientes();
    } catch (err) {
      notificar(err.message, true);
    }
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
      nombre: formEl.elements.nombre.value.trim(),
      nit: formEl.elements.nit.value.trim(),
      ciudad: formEl.elements.ciudad.value.trim(),
      telefono: formEl.elements.telefono.value.trim(),
      tipo: formEl.elements.tipo.value,
    };

    try {
      if (editId) {
        await reqClientes(`/clientes/${editId}`, { method: 'PUT', body: datos });
        notificar('Cliente actualizado');
      } else {
        await reqClientes('/clientes', { method: 'POST', body: datos });
        notificar('Cliente creado');
      }
      dialogoEl.close();
      await cargarClientes();
    } catch (err) {
      notificar(err.message, true);
    }
  });

  document.getElementById('nuevo').addEventListener('click', () => abrirModal());
  document.getElementById('btn-cancelar').addEventListener('click', () => dialogoEl.close());
  filtroTipoEl.addEventListener('change', cargarClientes);
  busquedaEl.addEventListener('input', renderizar);

  cargarClientes();
})();