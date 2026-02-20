document.addEventListener("DOMContentLoaded", async () => {
    // --- CONFIGURACIÓN ---
    const API_NOTAS = "/api/nota_get.php";
    const URL_TRATAMIENTOS = '/data/tratamientos.json';
    
    // Contenedores
    const sectionNotas = document.querySelector(".notas-body_blog");
    const idSeccionDestacados = "seccion-destacados"; // ID del <section> vacío

    // 1. VERIFICAR SI HAY ID EN LA URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // --- LÓGICA DE RUTEO ---
    if (sectionNotas) {
        if (id) {
            // A) VISTA DETALLE: Cargar nota...
            await cargarNotaDetalle(sectionNotas, API_NOTAS, id);
            
            // ...Y Cargar tratamientos (Título + Cards)
            await initDestacados(URL_TRATAMIENTOS, idSeccionDestacados);
        } else {
            // B) VISTA LISTA: Listar todas
            await listarTodasLasNotas(sectionNotas, API_NOTAS);
            
            // Aseguramos que la sección de destacados esté vacía en la vista de lista
            const seccionDestacados = document.getElementById(idSeccionDestacados);
            if(seccionDestacados) seccionDestacados.innerHTML = "";
        }
    }
});

// ==========================================
// LÓGICA 1: CARGAR DETALLE DE NOTA
// ==========================================
async function cargarNotaDetalle(section, API, id) {
    try {
        const res = await fetch(`${API}?id=${encodeURIComponent(id)}`);
        const nota = await res.json();

        if (!res.ok || nota.error) {
            section.innerHTML = `<p>${nota.error || "Error cargando la nota"}</p>`;
            return;
        }

        let subsArr = [];
        try { subsArr = JSON.parse(nota.subsecciones || "[]"); } catch (e) { console.error("Error parseando subsecciones:", e); }

        const subsHtml = Array.isArray(subsArr)
            ? subsArr.map(sub => {
                const tituloSub = sub.titulo ? `<h3>${escapeHtml(sub.titulo)}</h3>` : "";
                let contenidoHtml = "";
                if (Array.isArray(sub.contenido)) {
                    contenidoHtml = sub.contenido.map(p => `<p>${formatearTextoPersonalizado(p)}</p>`).join("");
                } else if (typeof sub.contenido === "string") {
                    contenidoHtml = `<p>${formatearTextoPersonalizado(sub.contenido)}</p>`;
                }
                return `<div class="texto texto-2">${tituloSub}${contenidoHtml}</div>`;
            }).join("")
            : "";

        let parrafos = [];
        try { parrafos = JSON.parse(nota.texto); } catch (e) { parrafos = [nota.texto]; } 

        const entradaRaw = parrafos.length > 0 ? parrafos[0] : "";
        const cuerpoArray = parrafos.length > 1 ? parrafos.slice(1) : [];
        const entradaHtml = formatearTextoPersonalizado(entradaRaw);
        const cuerpoHtml = cuerpoArray.map(p => `<p>${formatearTextoPersonalizado(p)}</p>`).join('');

        section.innerHTML = `
            <article class="nota-detalle">
                <header class="nota-header">
                    <h1 class="nota-titulo">${escapeHtml(nota.titulo)}</h1>
                </header>
                ${entradaHtml ? `<div class="nota-entrada"><div class="texto"><p>${entradaHtml}</p></div></div>` : ''}
                ${nota.imagen ? `<figure class="nota-imagen-container"><img src="${escapeAttr(nota.imagen)}" alt="${escapeAttr(nota.titulo)}" class="nota-imagen"></figure>` : ""}
                <div class="nota-cuerpo">
                    ${cuerpoHtml}
                    ${cuerpoHtml && subsHtml ? '<br>' : ''}
                    ${subsHtml}
                </div>
                <div class="nota-footer">
                    <button onclick="window.location.href='https://wa.me/5492613330193'" class="btn-solicitar">Solicitar consulta</button>
                </div>
            </article>
        `;

        inicializarNavegacion(API, id);

    } catch (err) {
        console.error(err);
        section.innerHTML = `<p>Error de conexión</p>`;
    }
}

// ==========================================
// LÓGICA 2: LISTAR TODAS LAS NOTAS
// ==========================================
async function listarTodasLasNotas(section, API) {
    try {
        const res = await fetch(API);
        const notas = await res.json();

        if (!res.ok || !Array.isArray(notas)) {
            section.innerHTML = `<p>No se pudieron cargar las notas.</p>`;
            return;
        }
        if (notas.length === 0) {
            section.innerHTML = `<p>No hay notas cargadas aún.</p>`;
            return;
        }

        section.innerHTML = `
            <div class="lista-notas">
                ${notas.map(n => `
                    <a class="card-nota" href="?id=${encodeURIComponent(n.id)}" style="display: block; text-decoration: none;">
                        <div class="card-nota__media">
                            ${n.imagen ? `<img src="${escapeAttr(n.imagen)}" alt="${escapeAttr(n.titulo)}">` : ""}
                        </div>
                        <div class="card-nota__overlay">
                            <h3 class="card-nota__titulo">${escapeHtml(n.titulo)}</h3>
                        </div>
                    </a>
                `).join("")}
            </div>
        `;
    } catch (e) {
        console.error(e);
        section.innerHTML = `<p>Error de conexión</p>`;
    }
}

// ==========================================
// LÓGICA 3: TRATAMIENTOS DESTACADOS (CORREGIDA)
// ==========================================
async function initDestacados(url, sectionId) {
    // Buscamos la SECCIÓN PRINCIPAL (el wrapper vacío)
    const section = document.getElementById(sectionId);
    if (!section) return;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al cargar JSON de tratamientos");
        
        const data = await res.json();
        // Tomamos solo los 2 primeros
        const destacados = data.slice(0, 2);

        if (destacados.length === 0) return;

        // 1. INYECTAMOS LA ESTRUCTURA (Título + Contenedor vacío)
        // Usamos el ID "cards-destacados-container" para que el CSS (flex, gap) funcione.
        section.innerHTML = `
            <div class="destacados-titulo">
                <h2>TRATAMIENTOS DESTACADOS</h2>
            </div>
            <div id="cards-destacados-container"></div>
        `;

        // 2. OBTENEMOS EL CONTENEDOR RECIÉN CREADO
        const container = document.getElementById("cards-destacados-container");

        // 3. GENERAMOS Y AGREGAMOS LAS CARDS (CON EL EVENTO CLICK CORRECTO)
        destacados.forEach(item => {
            const cardElement = createCardElement(item);
            container.appendChild(cardElement);
        });

    } catch (error) {
        console.error("Error cargando destacados:", error);
        section.innerHTML = ""; // Limpiar si hay error
    }
}

// Helper para crear el ELEMENTO DOM de la card (con addEventListener)
function createCardElement(data) {
    const article = document.createElement('article');
    article.className = 'treatment-card';

    // Animación invertida para pares
    if (data.id % 2 === 0) {
        article.classList.add('reverse-hover');
    }

    article.innerHTML = `
        <div class="t-card-image-bg">
            <img src="${data.image}" alt="${data.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="t-card-info">
            <div class="t-card-title">${data.title}</div>
            <div class="t-card-desc">${data.description}</div>
            <div class="t-card-btn">
                <span>MÁS INFORMACIÓN</span>
                <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.02779 7.20699L2.37079 12.864L0.956787 11.45L5.90679 6.49999L0.956787 1.54999L2.37079 0.135986L8.02779 5.79299C8.21526 5.98051 8.32057 6.23482 8.32057 6.49999C8.32057 6.76515 8.21526 7.01946 8.02779 7.20699Z" fill="white"/>
                </svg>
            </div>
        </div>
    `;

    // --- LÓGICA DE REDIRECCIÓN (BASE ORIGINAL) ---
    article.addEventListener('click', () => {
        // 1. Si existe 'link' en el JSON y no está vacío, usa ese.
        if (data.link && data.link.trim() !== "") {
            window.location.href = data.link;
        } 
        // 2. Fallback: Generar slug automático si no hay link manual.
        else {
            const slug = data.title.toLowerCase().trim().replace(/\s+/g, '-');
            window.location.href = `/tratamientos/${slug}.html`;
        }
    });

    return article;
}

// Helper para crear el string HTML de la card (en lugar de createElement)
// Esto es necesario para inyectarlo con innerHTML junto con el título
function createCardString(data) {
    // Determinamos si es par para la clase reverse-hover
    const reverseClass = (data.id % 2 === 0) ? 'reverse-hover' : '';
    
    // Determinamos el link
    let linkAttr = '';
    if (data.link && data.link.trim() !== "") {
        linkAttr = `onclick="window.location.href='${data.link}'"`;
    } else {
        const slug = data.title.toLowerCase().trim().replace(/\s+/g, '-');
        linkAttr = `onclick="window.location.href='/tratamientos/${slug}.html'"`;
    }

    return `
        <article class="treatment-card ${reverseClass}" ${linkAttr}>
            <div class="t-card-image-bg">
                <img src="${data.image}" alt="${data.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="t-card-info">
                <div class="t-card-title">${data.title}</div>
                <div class="t-card-desc">${data.description}</div>
                <div class="t-card-btn">
                    <span>MÁS INFORMACIÓN</span>
                    <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.02779 7.20699L2.37079 12.864L0.956787 11.45L5.90679 6.49999L0.956787 1.54999L2.37079 0.135986L8.02779 5.79299C8.21526 5.98051 8.32057 6.23482 8.32057 6.49999C8.32057 6.76515 8.21526 7.01946 8.02779 7.20699Z" fill="white"/>
                    </svg>
                </div>
            </div>
        </article>
    `;
}

// ==========================================
// HELPERS / UTILIDADES
// ==========================================

async function inicializarNavegacion(API, idActual) {
    const btnAnterior = document.querySelector(".btn-anterior");
    const btnSiguiente = document.querySelector(".btn-siguiente");
    if (!btnAnterior && !btnSiguiente) return;

    try {
        const res = await fetch(API);
        const lista = await res.json();
        if (!Array.isArray(lista)) return;
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));

        const idx = lista.findIndex(n => String(n.id) === String(idActual));
        if (idx === -1) return;

        if (btnAnterior) {
            btnAnterior.disabled = !(idx > 0);
            if (idx > 0) btnAnterior.onclick = () => window.location.search = `?id=${encodeURIComponent(lista[idx - 1].id)}`;
        }
        if (btnSiguiente) {
            btnSiguiente.disabled = !(idx < lista.length - 1);
            if (idx < lista.length - 1) btnSiguiente.onclick = () => window.location.search = `?id=${encodeURIComponent(lista[idx + 1].id)}`;
        }
    } catch (e) { console.error(e); }
}

function formatearTextoPersonalizado(textoRaw) {
    if (!textoRaw) return "";
    let texto = escapeHtml(textoRaw);
    const T_BOLD = "###TOKEN_BOLD###";
    const T_VIOLET = "###TOKEN_VIOLET###";
    const T_BR = "###TOKEN_BR###";

    texto = texto.replace(/\\r\\n|\r\n/g, T_BOLD).replace(/\\t|\t/g, T_VIOLET).replace(/\\n|\n/g, T_BR);
    const partesVioleta = texto.split(T_VIOLET);

    return partesVioleta.map((parte, index) => {
        let textoEstilizado = procesarEstilo(parte, T_BOLD, 'strong');
        textoEstilizado = textoEstilizado.split(T_BR).join('<br />');
        if (index % 2 === 1) {
            if (!textoEstilizado.trim()) return "";
            return `</p><p><h4 class="subtitulo-violeta">${textoEstilizado}</h4>`;
        }
        return textoEstilizado;
    }).join('');
}

function procesarEstilo(texto, token, etiqueta) {
    if (!texto.includes(token)) return texto;
    return texto.split(token).map((frag, i) => (i % 2 === 1) ? `<${etiqueta}>${frag}</${etiqueta}>` : frag).join('');
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str || "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
}