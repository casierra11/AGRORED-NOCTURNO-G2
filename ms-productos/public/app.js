/* AgroRed · Front del microservicio ms-productos
 * Endpoints que consume:
 *   GET    /productos/health
 *   GET    /productos?categoria=fruta&ids=1,3,8
 *   POST   /productos
 *   PUT    /productos/:id
 *   DELETE /productos/:id
 */

const CATEGORIAS = ['fruta', 'hortaliza', 'procesado'];
const UNIDADES = ['kg', 'caja'];
const EMOJI = { fruta: '🍎', hortaliza: '🥬', procesado: '🫙' };

const LS_BASE = 'agrored.apiBase';
const LS_TOKEN = 'agrored.token';

const state = {
  productos: [],
  categoria: '',
  ids: '',
  q: '',
  editId: null,
  deleteId: null,
};

/* ---------- Utilidades ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const money = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2,
});

function defaultBase() {
  // Si el front lo sirve el mismo Express (puerto 3002/3003) usamos rutas relativas.
  const mismoServidor = location.protocol.startsWith('http') && ['3002', '3003'].includes(location.port);
  return mismoServidor ? '' : 'http://localhost:3002';
}
const getBase = () => {
  const guardada = localStorage.getItem(LS_BASE);
  return (guardada !== null ? guardada : defaultBase()).replace(/\/+$/, '');
};
const getToken = () => localStorage.getItem(LS_TOKEN) || '';

class ApiError extends Error {
  constructor(status, message, detalles = []) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(getBase() + path, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa que esté encendido y la URL en "Conexión".');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Error ${res.status}`, data?.detalles || []);
  }
  return data;
}

function toast(msg, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' is-error' : '');
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showBanner(msg, isError = true) {
  const b = $('#banner');
  b.textContent = msg;
  b.classList.toggle('is-error', isError);
  b.hidden = false;
}
const hideBanner = () => { $('#banner').hidden = true; };

function friendlyError(err) {
  if (err.status === 401) return 'Tu sesión no es válida o expiró (401). Revisa el token en "Conexión".';
  if (err.status === 403) return 'No tienes permisos para esta acción (403).';
  return err.message;
}

/* ---------- Estado del servicio ---------- */

async function checkHealth() {
  const el = $('#status');
  try {
    const data = await api('/productos/health');
    el.dataset.state = 'ok';
    $('#status-text').textContent = `${data.servicio} · ${data.estado}`;
  } catch {
    el.dataset.state = 'down';
    $('#status-text').textContent = 'Sin conexión';
  }
}

/* ---------- Carga y render ---------- */

async function cargarProductos() {
  $('#loading').hidden = false;
  $('#empty').hidden = true;
  hideBanner();

  const params = new URLSearchParams();
  if (state.categoria) params.set('categoria', state.categoria);
  if (state.ids) params.set('ids', state.ids);
  const qs = params.toString();

  try {
    state.productos = await api('/productos' + (qs ? `?${qs}` : ''));
  } catch (err) {
    state.productos = [];
    showBanner(friendlyError(err));
  } finally {
    $('#loading').hidden = true;
  }
  render();
}

function visibles() {
  const q = state.q.trim().toLowerCase();
  return q ? state.productos.filter((p) => p.nombre.toLowerCase().includes(q)) : state.productos;
}

function render() {
  const lista = visibles();
  const grid = $('#grid');
  grid.replaceChildren();

  for (const p of lista) grid.appendChild(card(p));
  $('#empty').hidden = lista.length > 0 || !$('#banner').hidden;

  // Estadísticas sobre lo que se está mostrando
  $('#stat-total').textContent = lista.length;
  if (lista.length) {
    const precios = lista.map((p) => Number(p.precio));
    $('#stat-avg').textContent = money.format(precios.reduce((a, b) => a + b, 0) / precios.length);
    $('#stat-max').textContent = money.format(Math.max(...precios));
  } else {
    $('#stat-avg').textContent = '—';
    $('#stat-max').textContent = '—';
  }
}

function card(p) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.cat = p.categoria;

  const top = document.createElement('div');
  top.className = 'card-top';
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = `${EMOJI[p.categoria] || ''} ${p.categoria}`;
  const pid = document.createElement('span');
  pid.className = 'pid';
  pid.textContent = `#${p.id}`;
  top.append(badge, pid);

  const name = document.createElement('h3');
  name.textContent = p.nombre;

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = money.format(Number(p.precio));
  const unit = document.createElement('small');
  unit.textContent = ` / ${p.unidad}`;
  price.appendChild(unit);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const edit = document.createElement('button');
  edit.className = 'btn btn-ghost';
  edit.type = 'button';
  edit.textContent = 'Editar';
  edit.addEventListener('click', () => abrirFormulario(p));
  const del = document.createElement('button');
  del.className = 'btn btn-ghost';
  del.type = 'button';
  del.textContent = 'Eliminar';
  del.addEventListener('click', () => pedirEliminar(p));
  actions.append(edit, del);

  el.append(top, name, price, actions);
  return el;
}

/* ---------- Filtros ---------- */

$('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });

$('#chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
  state.categoria = chip.dataset.cat;
  cargarProductos();
});

$('#ids-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const valor = $('#ids').value.replace(/\s+/g, '');
  if (valor && !/^\d+(,\d+)*$/.test(valor)) {
    toast('Los IDs deben ser números separados por comas. Ej: 1,3,8', true);
    return;
  }
  state.ids = valor;
  $('#ids-clear').hidden = !valor;
  cargarProductos();
});

$('#ids-clear').addEventListener('click', () => {
  $('#ids').value = '';
  state.ids = '';
  $('#ids-clear').hidden = true;
  cargarProductos();
});

/* ---------- Crear / editar ---------- */

const dlgForm = $('#dlg-form');
const form = $('#form');

function limpiarErrores() {
  form.querySelectorAll('.err').forEach((s) => { s.textContent = ''; });
  form.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));
  $('#form-error').hidden = true;
}

function setError(campo, msg) {
  const small = form.querySelector(`.err[data-for="${campo}"]`);
  if (small) {
    small.textContent = msg;
    small.closest('.field').classList.add('has-error');
  }
}

function abrirFormulario(producto = null) {
  state.editId = producto ? producto.id : null;
  $('#form-title').textContent = producto ? `Editar producto #${producto.id}` : 'Nuevo producto';
  form.reset();
  limpiarErrores();
  if (producto) {
    form.elements.nombre.value = producto.nombre;
    form.elements.categoria.value = producto.categoria;
    form.elements.unidad.value = producto.unidad;
    form.elements.precio.value = producto.precio;
  }
  dlgForm.showModal();
  form.elements.nombre.focus();
}

// Misma validación que el backend (producto.model.js) para avisar antes de enviar
function validar(d) {
  const errores = {};
  if (!d.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!CATEGORIAS.includes(d.categoria)) errores.categoria = 'Elige una categoría';
  if (!UNIDADES.includes(d.unidad)) errores.unidad = 'Elige una unidad';
  if (!(typeof d.precio === 'number' && d.precio > 0)) errores.precio = 'El precio debe ser mayor a 0';
  return errores;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpiarErrores();

  const datos = {
    nombre: form.elements.nombre.value.trim(),
    categoria: form.elements.categoria.value,
    unidad: form.elements.unidad.value,
    precio: form.elements.precio.value === '' ? NaN : Number(form.elements.precio.value),
  };

  const errores = validar(datos);
  if (Object.keys(errores).length) {
    Object.entries(errores).forEach(([c, m]) => setError(c, m));
    return;
  }

  const btn = $('#form-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    if (state.editId) {
      await api(`/productos/${state.editId}`, { method: 'PUT', body: datos });
      toast('Producto actualizado');
    } else {
      await api('/productos', { method: 'POST', body: datos });
      toast('Producto creado');
    }
    dlgForm.close();
    cargarProductos();
  } catch (err) {
    const box = $('#form-error');
    box.textContent = friendlyError(err);
    if (err.detalles?.length) {
      const ul = document.createElement('ul');
      err.detalles.forEach((d) => { const li = document.createElement('li'); li.textContent = d; ul.appendChild(li); });
      box.appendChild(ul);
    }
    box.hidden = false;
    if (err.status === 409) setError('nombre', 'Ya existe un producto con ese nombre');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
});

$('#btn-new').addEventListener('click', () => abrirFormulario());

/* ---------- Eliminar ---------- */

const dlgDelete = $('#dlg-delete');

function pedirEliminar(p) {
  state.deleteId = p.id;
  $('#delete-text').textContent = `¿Seguro que quieres eliminar "${p.nombre}"? Esta acción no se puede deshacer.`;
  dlgDelete.showModal();
}

$('#delete-confirm').addEventListener('click', async () => {
  const btn = $('#delete-confirm');
  btn.disabled = true;
  try {
    await api(`/productos/${state.deleteId}`, { method: 'DELETE' });
    toast('Producto eliminado');
    cargarProductos();
  } catch (err) {
    toast(friendlyError(err), true);
  } finally {
    btn.disabled = false;
    dlgDelete.close();
  }
});

/* ---------- Conexión ---------- */

const dlgSettings = $('#dlg-settings');

$('#btn-settings').addEventListener('click', () => {
  $('#set-base').value = getBase();
  $('#set-token').value = getToken();
  dlgSettings.showModal();
});

$('#settings-form').addEventListener('submit', () => {
  localStorage.setItem(LS_BASE, $('#set-base').value.trim());
  localStorage.setItem(LS_TOKEN, $('#set-token').value.trim());
  toast('Conexión actualizada');
  checkHealth();
  cargarProductos();
});

/* ---------- Cerrar diálogos ---------- */

document.querySelectorAll('dialog').forEach((dlg) => {
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
  });
});

/* ---------- Arranque ---------- */

checkHealth();
cargarProductos();
setInterval(checkHealth, 30000);