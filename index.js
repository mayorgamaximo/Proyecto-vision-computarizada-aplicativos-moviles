// Funcionalidad para los botones del header

document.addEventListener('DOMContentLoaded', function() {
    // --- Navegación entre secciones ---
    const btnSala = document.getElementById('vista-sala');
    const btnCocina = document.getElementById('cocina');
    const btnPedido = document.getElementById('pedido');
    const botones = [btnSala, btnCocina, btnPedido];

    const divSala = document.getElementById('div-sala');
    const divCocina = document.getElementById('div-cocina');
    const divPedido = document.getElementById('div-pedido');
    const secciones = [divSala, divCocina, divPedido];

    function mostrarSolo(indice) {
        secciones.forEach((div, i) => {
            div.style.display = (i === indice) ? '' : 'none';
        });
        botones.forEach((btn, i) => {
            if (i === indice) {
                btn.classList.add('activo');
            } else {
                btn.classList.remove('activo');
            }
        });
    }

    btnSala.addEventListener('click', () => {
        mostrarSolo(0);
        renderizarPedidosSala();
    });
    btnCocina.addEventListener('click', () => mostrarSolo(1));
    btnPedido.addEventListener('click', () => mostrarSolo(2));

    mostrarSolo(0);
    renderizarPedidosSala();

    // --- Funcionalidad Tomar Pedido ---
    // Datos del menú
    const menu = [
        {
            categoria: 'Entrantes',
            productos: [
                { nombre: 'Gazpacho Andaluz', precio: 8.00 },
                { nombre: 'Jamón Ibérico', precio: 22.00 }
            ]
        },
        {
            categoria: 'Principales',
            productos: [
                { nombre: 'Paella Valenciana', precio: 18.50 },
                { nombre: 'Cordero Asado', precio: 24.00 }
            ]
        }
    ];

    // Estado del pedido actual
    let pedidoActual = {
        mesa: 'Mesa 1',
        productos: {}, // { 'Gazpacho Andaluz': { cantidad: 1, precio: 8.00 } }
        nota: ''
    };

    // Selección de mesa
    const mesaSelect = document.getElementById('mesa-select');
    const mesaResumen = document.querySelector('.mesa-nombre-resumen');
    if (mesaSelect && mesaResumen) {
        mesaSelect.addEventListener('change', function() {
            pedidoActual.mesa = mesaSelect.value;
            mesaResumen.textContent = mesaSelect.value;
        });
    }

    // Manejo de botones + y - para productos
    function actualizarCantidadBtns() {
        document.querySelectorAll('.producto-row').forEach(row => {
            const nombre = row.querySelector('.producto-nombre').textContent.trim();
            const precio = parseFloat(row.querySelector('.producto-precio').textContent.replace('€',''));
            const cantidadSpan = row.querySelector('.cantidad');
            const btnMas = row.querySelector('.btn-mas');
            const btnMenos = row.querySelector('.btn-menos');

            btnMas.onclick = function() {
                if (!pedidoActual.productos[nombre]) {
                    pedidoActual.productos[nombre] = { cantidad: 1, precio };
                } else {
                    pedidoActual.productos[nombre].cantidad++;
                }
                cantidadSpan.textContent = pedidoActual.productos[nombre].cantidad;
                actualizarResumenPedido();
            };
            btnMenos.onclick = function() {
                if (pedidoActual.productos[nombre] && pedidoActual.productos[nombre].cantidad > 0) {
                    pedidoActual.productos[nombre].cantidad--;
                    if (pedidoActual.productos[nombre].cantidad === 0) {
                        delete pedidoActual.productos[nombre];
                    }
                    cantidadSpan.textContent = pedidoActual.productos[nombre]?.cantidad || 0;
                    actualizarResumenPedido();
                }
            };
        });
    }
    actualizarCantidadBtns();

    // Actualizar resumen del pedido
    function actualizarResumenPedido() {
        const lista = document.getElementById('pedido-actual-lista');
        const totalSpan = document.getElementById('pedido-total');
        lista.innerHTML = '';
        let total = 0;
        Object.entries(pedidoActual.productos).forEach(([nombre, info]) => {
            if (info.cantidad > 0) {
                const row = document.createElement('div');
                row.className = 'pedido-actual-producto';
                row.innerHTML = `<span class="pedido-actual-producto-nombre">${nombre}</span>
                    <span class="pedido-actual-producto-cantidad">x${info.cantidad}</span>
                    <span class="pedido-actual-producto-precio">€${(info.precio * info.cantidad).toFixed(2)}</span>`;
                lista.appendChild(row);
                total += info.precio * info.cantidad;
            }
        });
        totalSpan.textContent = `€${total.toFixed(2)}`;
    }

    // Notas especiales
    const notaTextarea = document.getElementById('nota-pedido');
    if (notaTextarea) {
        notaTextarea.addEventListener('input', function() {
            pedidoActual.nota = notaTextarea.value;
        });
    }

    // --- Enviar pedido a cocina ---
    const btnEnviarCocina = document.getElementById('btn-enviar-cocina');
    if (btnEnviarCocina) {
        btnEnviarCocina.addEventListener('click', function() {
            if (Object.keys(pedidoActual.productos).length === 0) {
                alert('Agrega al menos un producto al pedido.');
                return;
            }
            const pedidoData = {
                mesa: pedidoActual.mesa,
                pedido: JSON.stringify(pedidoActual.productos),
                nota: pedidoActual.nota,
                hora: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedidoData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Limpiar pedido actual
                    Object.keys(pedidoActual.productos).forEach(k => delete pedidoActual.productos[k]);
                    actualizarCantidadBtns();
                    actualizarResumenPedido();
                    if (notaTextarea) notaTextarea.value = '';
                    pedidoActual.nota = '';
                    alert('¡Pedido enviado a la base de datos!');
                } else {
                    alert('Error al enviar pedido');
                }
            })
            .catch(() => alert('No se pudo conectar con el servidor'));
        });
    }

    // --- Renderizado de pedidos en sala ---
    function renderizarPedidosSala() {
        const grid = document.getElementById('pedidos-sala-grid');
        if (!grid) return;
        grid.innerHTML = '';
        fetch('http://localhost:3001/api/pedidos')
            .then(res => res.json())
            .then(pedidos => {
                pedidos.forEach((pedido) => {
                    let productos = {};
                    try { productos = JSON.parse(pedido.pedido); } catch (e) {}
                    const items = Object.entries(productos).map(([nombre, info]) => `<li>${nombre} <span style='color:#bbb;font-size:0.98em;'>x${info.cantidad}</span></li>`).join('');
                    const notaHTML = pedido.nota && pedido.nota.trim() !== '' ? `<div class="pedido-nota"><span class="nota-titulo"><i class="fa-regular fa-circle-exclamation"></i> Notas especiales:</span><div class="nota-texto">${pedido.nota}</div></div>` : '';
                    const card = document.createElement('div');
                    card.className = 'pedido-card sala';
                    card.innerHTML = `
                        <div class="pedido-card-header">
                            <span class="pedido-mesa">${pedido.mesa}</span>
                            <span class="pedido-tiempo"><i class="fa-regular fa-clock"></i> ${new Date(pedido.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div class="pedido-elementos-title">Elementos:</div>
                        <ul class="pedido-elementos">${items}</ul>
                        ${notaHTML}
                    `;
                    grid.appendChild(card);
                });
            });
    }

    // --- Renderizado de pedidos en cocina ---
    function renderizarPedidosCocina() {
        const grid = document.getElementById('pedidos-cocina-grid');
        const totalPendientes = document.querySelector('.total-pendientes-num');
        if (!grid) return;
        grid.innerHTML = '';
        if (!window.pedidosEnviados) window.pedidosEnviados = [];
        // Actualizar total de pendientes
        if (totalPendientes) {
            totalPendientes.textContent = window.pedidosEnviados.length;
        }
        const ahora = Date.now();
        window.pedidosEnviados.forEach((pedido, idx) => {
            // Calcular minutos transcurridos
            let t0 = pedido.timestamp || pedido.fechaEnvio || pedido.tiempoEnvio;
            if (!t0) {
                t0 = Date.now();
                pedido.timestamp = t0;
            }
            const minutos = Math.floor((ahora - t0) / 60000);
            // Prioridad según tiempo
            let prioridad = 'baja';
            if (minutos >= 20) prioridad = 'alta';
            else if (minutos >= 10) prioridad = 'media';
            // Badge
            const badge = prioridad === 'alta' ? '<span class="prioridad-badge alta">ALTA</span>' : prioridad === 'media' ? '<span class="prioridad-badge media">MEDIA</span>' : '<span class="prioridad-badge baja">BAJA</span>';
            // Mostrar tiempo
            let tiempoStr = 'Hace menos de 1 min';
            if (minutos === 1) tiempoStr = 'Hace 1 min';
            else if (minutos > 1) tiempoStr = `Hace ${minutos} min`;
            // Productos
            const items = Object.entries(pedido.productos).map(([nombre, info]) => `<li>${nombre} <span style='color:#bbb;font-size:0.98em;'>x${info.cantidad}</span></li>`).join('');
            // Nota
            const notaHTML = pedido.nota && pedido.nota.trim() !== '' ? `<div class="pedido-nota"><span class="nota-titulo"><i class="fa-regular fa-circle-exclamation"></i> Notas especiales:</span><div class="nota-texto">${pedido.nota}</div></div>` : '';
            const card = document.createElement('div');
            card.className = `pedido-card prioridad-${prioridad}`;
            card.innerHTML = `
                <div class="pedido-card-header">
                    <span class="pedido-mesa">${pedido.mesa}</span>
                    <span class="pedido-tiempo"><i class="fa-regular fa-clock"></i> ${tiempoStr}</span>
                    ${badge}
                </div>
                <div class="pedido-elementos-title">Elementos:</div>
                <ul class="pedido-elementos">${items}</ul>
                ${notaHTML}
                <button class="btn-listo"><i class="fa-solid fa-check"></i> Marcar como Listo</button>
            `;
            card.querySelector('.btn-listo').onclick = function() {
                fetch(`http://localhost:3001/api/pedidos/${pedido.id}/estado`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ estado: true })
                })
                .then(res => {
                    if (!res.ok) throw new Error('No se pudo actualizar el estado');
                    return fetch('http://localhost:3001/api/pedidos');
                })
                .then(res => res.json())
                .then(pedidos => {
                    window.pedidosEnviados = pedidos.filter(p => p.estado === 0 || p.estado === false).map(p => ({
                        ...p,
                        productos: typeof p.pedido === 'string' ? JSON.parse(p.pedido) : (p.productos || {})
                    }));
                    renderizarPedidosCocina();
                })
                .catch(e => {
                    alert('Error al marcar como listo.');
                    console.error(e);
                });
            };
            grid.appendChild(card);
        });
    }

    // Actualizar cocina al cambiar de sección
    
    if (btnCocina) {
        btnCocina.addEventListener('click', function() {
            fetch('http://localhost:3001/api/pedidos')
                .then(res => {
                    if (!res.ok) throw new Error('Respuesta HTTP no OK');
                    return res.json();
                })
                .then(pedidos => {
                    console.log('Pedidos recibidos:', pedidos);
                    // Parsear el campo 'pedido' de cada pedido y asignar a 'productos'
                    window.pedidosEnviados = pedidos.map(p => ({
                        ...p,
                        productos: typeof p.pedido === 'string' ? JSON.parse(p.pedido) : (p.productos || {})
                    }));
                    try {
                        renderizarPedidosCocina();
                    } catch (e) {
                        console.error('Error en renderizarPedidosCocina:', e);
                        alert('Error al mostrar los pedidos en pantalla. Revisa la consola.');
                    }
                })
                .catch(e => {
                    console.error('Error al obtener pedidos:', e);
                    alert('No se pudo obtener los pedidos de la cocina.');
                });
        });
    }

    // Inicializar resumen vacío y cocina
    actualizarResumenPedido();
    renderizarPedidosCocina();
});
