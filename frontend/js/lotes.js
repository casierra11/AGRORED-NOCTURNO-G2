(function () {
  let lotes = [];
  let productosMap = {};
  let editId = null;

  const listaEl = document.getElementById('lista');
  const resumenEl = document.getElementById('resumen');
  const filtroCalidadEl = document.getElementById('filtro-calidad');
  const busquedaEl = document.getElementById('busqueda-codigo');
  const dialogoEl = document.getElementById('dialogo');
  const formEl = document.getElementById('form-lote');
  const tituloDlgEl = document.getElementById('titulo-dialogo');
  const selectProductoEl = document.getElementById('select-producto');
  const btnNuevoEl = document.getElementById('nuevo');

  // Inicializar cabecera de sesión (nombre, rol y botón cerrar sesión)
  if (typeof iniciarSesion === 'function') iniciarSesion();
  if (typeof pintarUsuario === 'function') pintarUsuario();
  if (typeof cargarUsuarioActual === 'function') cargarUsuarioActual();

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

  function obtenerUsuarioToken() {
    const tok = obtenerToken();
    if (!tok) return null;
    try {
      const base64 = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    } catch {
      return null;
    }
  }

  const usuarioSesion = obtenerUsuarioToken();
  const puedeEditar = ['administrador', 'produccion'].includes(usuarioSesion?.rol);

  // Ocultar botón de creación si el rol es de solo lectura (ej. comercial)
  if (btnNuevoEl && !puedeEditar) {
    btnNuevoEl.style.display = 'none';
  }

  // Cabecera de usuario y cierre de sesión
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

    if (!usuarioSesion) return;
    if (elNombre && (usuarioSesion.nombre || usuarioSesion.name || usuarioSesion.email)) {
      elNombre.textContent = usuarioSesion.nombre || usuarioSesion.name || usuarioSesion.email;
    }
    if (elRol && usuarioSesion.rol) {
      elRol.textContent = usuarioSesion.rol;
    }
  })();

  function notificar(texto, esError = false) {
    const box = document.getElementById('mensajes');
    if (!box) return alert(texto);
    const p = document.createElement('div');
    p.textContent = texto;
    p.style.cssText = `position:fixed;bottom:1rem;right:1rem;padding:0.75rem 1.1rem;border-radius:8px;color:#fff;font-weight:500;z-index:9999;background:${esError ? '#b91c1c' : '#166534'};`;
    box.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }

  function mostrarBannerAviso(textoAviso) {
    let banner = document.getElementById('banner-aviso-lotes');
    if (!textoAviso) {
      if (banner) banner.remove();
      return;
    }
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'banner-aviso-lotes';
      banner.setAttribute('role', 'status');
      banner.style.cssText =
        'background:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.92rem;font-weight:500;';
      const tabla = listaEl.closest('table') || listaEl.parentElement;
      tabla.parentElement.insertBefore(banner, tabla);
    }
    banner.textContent = `Aviso: No se pudieron cargar los detalles de productos (${textoAviso}). Se muestran los datos locales de los lotes.`;
  }

  async function reqApi(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body) headers['Content-Type'] = 'application/json';
    const token = obtenerToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_PEDIDOS}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'login.html';
      return null;
    }

    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detalle = Array.isArray(data.detalles) && data.detalles.length
        ? `: ${data.detalles.join(', ')}`
        : '';
      throw new Error((data.error || `Error ${res.status}`) + detalle);
    }
    return data;
  }

  function badgeCalidad(estado) {
    const estilos = {
      aprobado: 'background:#dcfce7;color:#166534;',
      pendiente: 'background:#fef9c3;color:#854d0e;',
      rechazado: 'background:#fee2e2;color:#991b1b;',
    };
    const st = estilos[estado] || 'background:#f1f5f9;color:#334155;';
    return `<span style="${st}padding:0.2rem 0.6rem;border-radius:999px;font-size:0.82rem;font-weight:600;text-transform:capitalize;">${estado}</span>`;
  }

  function formatearFecha(fechaStr) {
    if (!fechaStr) return '—';
    return String(fechaStr).slice(0, 10);
  }

  async function cargarCatalogoProductos() {
    if (!selectProductoEl) return;
    try {
      const lista = await reqApi('/productos');
      productosMap = {};
      selectProductoEl.innerHTML = '<option value="">Selecciona un producto…</option>';
      for (const p of lista) {
        productosMap[p.id] = p;
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `#${p.id} · ${p.nombre} (${p.unidad || p.categoria || ''})`;
        selectProductoEl.appendChild(opt);
      }
    } catch {
      selectProductoEl.innerHTML = '<option value="">Servicio de productos no disponible</option>';
    }
  }

  async function cargarLotes() {
    try {
      const calidad = filtroCalidadEl.value;
      const query = calidad ? `?resultado_calidad=${encodeURIComponent(calidad)}` : '';
      lotes = await reqApi(`/lotes${query}`);
      renderizar();
    } catch (err) {
      resumenEl.textContent = 'Error al cargar lotes';
      notificar(err.message, true);
    }
  }

  function renderizar() {
    const registroConAviso = lotes.find((l) => l.aviso);
    mostrarBannerAviso(registroConAviso ? registroConAviso.aviso : null);

    const q = busquedaEl.value.trim().toLowerCase();
    const filtrados = q
      ? lotes.filter((l) => l.codigo_lote.toLowerCase().includes(q))
      : lotes;

    resumenEl.textContent = `${filtrados.length} lote(s) registrado(s)`;
    listaEl.innerHTML = '';

    if (!filtrados.length) {
      listaEl.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:#64748b;">No hay lotes para mostrar.</td></tr>`;
      return;
    }

    for (const l of filtrados) {
      const prodNombre =
        l.producto?.nombre ||
        productosMap[l.producto_id]?.nombre ||
        `Producto #${l.producto_id} (sin detalle)`;
      const unidad =
        l.producto?.unidad ||
        productosMap[l.producto_id]?.unidad ||
        'unidades';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${l.id}</td>
        <td style="font-weight:600;">${l.codigo_lote}</td>
        <td>${prodNombre} <small style="color:#64748b;">(#${l.producto_id})</small></td>
        <td>${formatearFecha(l.fecha_produccion)}</td>
        <td>${l.cantidad} ${unidad}</td>
        <td>${badgeCalidad(l.resultado_calidad)}</td>
        <td style="text-align:right; white-space:nowrap;">
          ${
            puedeEditar
              ? `<button type="button" class="btn-editar" style="margin-right:0.4rem;padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">Editar</button>
                 <button type="button" class="btn-eliminar" style="padding:0.35rem 0.7rem;border-radius:6px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;cursor:pointer;">Eliminar</button>`
              : '<span style="color:#94a3b8;font-size:0.82rem;">Solo lectura</span>'
          }
        </td>
      `;
      if (puedeEditar) {
        tr.querySelector('.btn-editar').addEventListener('click', () => abrirModal(l));
        tr.querySelector('.btn-eliminar').addEventListener('click', () => eliminarLote(l));
      }
      listaEl.appendChild(tr);
    }
  }

  function abrirModal(lote = null) {
    if (!puedeEditar) return;
    editId = lote ? lote.id : null;
    tituloDlgEl.textContent = lote ? `Editar lote ${lote.codigo_lote}` : 'Nuevo lote';
    formEl.reset();
    if (lote) {
      formEl.elements.codigo_lote.value = lote.codigo_lote;
      formEl.elements.producto_id.value = lote.producto_id;
      formEl.elements.fecha_produccion.value = formatearFecha(lote.fecha_produccion);
      formEl.elements.cantidad.value = lote.cantidad;
      formEl.elements.resultado_calidad.value = lote.resultado_calidad;
    } else {
      formEl.elements.fecha_produccion.value = new Date().toISOString().slice(0, 10);
    }
    dialogoEl.showModal();
  }

  async function eliminarLote(l) {
    if (!confirm(`¿Seguro que deseas eliminar el lote "${l.codigo_lote}"?`)) return;
    try {
      await reqApi(`/lotes/${l.id}`, { method: 'DELETE' });
      notificar('Lote eliminado');
      await cargarLotes();
    } catch (err) {
      notificar(err.message, true);
    }
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
      codigo_lote: formEl.elements.codigo_lote.value.trim(),
      producto_id: Number(formEl.elements.producto_id.value),
      fecha_produccion: formEl.elements.fecha_produccion.value,
      cantidad: Number(formEl.elements.cantidad.value),
      resultado_calidad: formEl.elements.resultado_calidad.value,
    };

    try {
      if (editId) {
        await reqApi(`/lotes/${editId}`, { method: 'PUT', body: datos });
        notificar('Lote actualizado');
      } else {
        await reqApi('/lotes', { method: 'POST', body: datos });
        notificar('Lote creado');
      }
      dialogoEl.close();
      await cargarLotes();
    } catch (err) {
      notificar(err.message, true);
    }
  });

  if (btnNuevoEl) btnNuevoEl.addEventListener('click', () => abrirModal());
  document.getElementById('btn-cancelar').addEventListener('click', () => dialogoEl.close());
  filtroCalidadEl.addEventListener('change', cargarLotes);
  busquedaEl.addEventListener('input', renderizar);

  (async () => {
    await cargarCatalogoProductos();
    await cargarLotes();
  })();
})();