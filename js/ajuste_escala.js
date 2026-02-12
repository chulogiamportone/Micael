
function ajustarEscala() {
    // 1. Detectamos si estamos en el Index buscando la clase específica
    const esIndex = document.body.classList.contains('es-home');
    
    // 2. Variables generales
    const anchoVentana = window.innerWidth;
    const anchoDiseno = 430;
    const anchoMaximo = 1080;

    // --- LÓGICA ESPECIAL PARA EL INDEX (Escritorio) ---
    // Si es el index Y la pantalla es grande (> 1024px)
    if (esIndex && anchoVentana > 1024) {
        document.body.style.zoom = "1"; // Quitamos el zoom
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-scaled');
        return; // Salimos de la función, no hacemos nada más
    }

    // --- LÓGICA ESTÁNDAR (Móvil en Index + Todas las otras vistas) ---
    // Si llegamos aquí, es porque:
    // a) No es el index (es una vista interna), O
    // b) Es el index pero estamos en móvil.
    
    document.body.classList.remove('desktop-view');
    document.body.classList.add('mobile-scaled');

    // Lógica de protección y cálculo
    const anchoParaCalculo = Math.min(anchoVentana, anchoMaximo);
    const escala = anchoParaCalculo / anchoDiseno;

    // Aplicamos el zoom
    document.body.style.zoom = escala;
}

// Ejecutar al cargar y al redimensionar
window.addEventListener('resize', ajustarEscala);
window.addEventListener('DOMContentLoaded', ajustarEscala);
// Ejecutamos la función al cargar y al mover la ventana
ajustarEscala();
window.addEventListener('resize', ajustarEscala);
