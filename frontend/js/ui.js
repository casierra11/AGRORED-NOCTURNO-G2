// =====================================================================
// AYUDAS DE INTERFAZ: mensajes y formulario en un cuadro de diálogo.
// =====================================================================

// Escapa texto antes de ponerlo en el HTML (evita inyectar etiquetas)
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mostrarMensaje(texto, tipo = 'ok') {
  const aviso = document.createElement('div');
  aviso.className = `mensaje mensaje-${tipo}`;
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.textContent = texto;
  document.getElementById('mensajes').appendChild(aviso);
  setTimeout(() => aviso.remove(), tipo === 'error' ? 6000 : 3000);
}

// Muestra el mensaje del microservicio (400, 403, 404, 409…)
function mostrarError(error) {
  const detalle = error.detalles.length ? `: ${error.detalles.join('; ')}` : '';
  mostrarMensaje(`${error.message}${detalle}`, 'error');
}

// Formulario en un cuadro de diálogo.
// campos: [{ nombre, etiqueta, tipo: 'text'|'email'|'password'|'select', opciones, opcional }]
// Devuelve una promesa con los datos escritos, o null si se cancela.
function pedirDatos(titulo, campos, valores = {}, textoBoton = 'Guardar') {
  const dialogo = document.getElementById('dialogo');
  const filas = campos.map((c) => {
    const valor = valores[c.nombre] ?? '';
    const control = c.tipo === 'select'
      ? `<select name="${c.nombre}">
           ${c.opciones.map((o) => `<option value="${esc(o.valor)}" ${String(o.valor) === String(valor) ? 'selected' : ''}>${esc(o.texto)}</option>`).join('')}
         </select>`
      : `<input name="${c.nombre}" type="${c.tipo || 'text'}" value="${esc(valor)}"
           ${c.opcional ? '' : 'required'} ${c.ayuda ? `placeholder="${esc(c.ayuda)}"` : ''}>`;
    return `<label class="campo"><span>${esc(c.etiqueta)}</span>${control}</label>`;
  }).join('');

  dialogo.innerHTML = `
    <form method="dialog" class="formulario">
      <h2>${esc(titulo)}</h2>
      ${filas}
      <div class="acciones-form">
        <button type="button" class="boton boton-suave" value="cancelar">Cancelar</button>
        <button type="submit" class="boton">${esc(textoBoton)}</button>
      </div>
    </form>`;

  return new Promise((resolver) => {
    const form = dialogo.querySelector('form');
    form.querySelector('[value="cancelar"]').onclick = () => { dialogo.close(); resolver(null); };
    form.onsubmit = (evento) => {
      evento.preventDefault();
      const datos = {};
      for (const c of campos) {
        const texto = form.elements[c.nombre].value.trim();
        if (c.opcional && texto === '') continue;      // campo opcional vacío: no se envía
        datos[c.nombre] = texto;
      }
      dialogo.close();
      resolver(datos);
    };
    dialogo.oncancel = () => resolver(null);
    dialogo.showModal();
    (form.querySelector('input, select') || form.querySelector('[type=submit]')).focus();
  });
}

async function confirmar(texto, textoBoton) {
  return (await pedirDatos(texto, [], {}, textoBoton)) !== null;
}
