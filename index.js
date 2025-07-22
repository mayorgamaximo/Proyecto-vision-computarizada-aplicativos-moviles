// Funcionalidad para los botones del header

document.addEventListener('DOMContentLoaded', function() {
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

    btnSala.addEventListener('click', () => mostrarSolo(0));
    btnCocina.addEventListener('click', () => mostrarSolo(1));
    btnPedido.addEventListener('click', () => mostrarSolo(2));

    mostrarSolo(0);
});
