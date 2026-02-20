// --- Lógica del Footer (Tal cual la tenías) ---
window.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  if (footer) document.body.appendChild(footer);
});

// --- Lógica de las Cards Refactorizada ---

async function fetchCardsData(jsonUrl) {
  try {
    const res = await fetch(jsonUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`No se pudo cargar el JSON: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function createCard(data) {
  const mainContainer = document.createElement('article');
  mainContainer.className = 'treatment-card';

  // --- NUEVO: Lógica para Cards Pares (Animación Invertida) ---
  // Si el ID es par (2, 4, 6...), agregamos la clase 'reverse-hover'
  if (data.id % 2 === 0) {
    mainContainer.classList.add('reverse-hover');
  }

  mainContainer.title = "Ver más sobre " + data.title;

  mainContainer.innerHTML = `
    <div class="t-card-image-bg">
      <img src="${data.image}" alt="${data.title}" loading="lazy">
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

  // --- LÓGICA DE REDIRECCIÓN ACTUALIZADA ---
  mainContainer.addEventListener('click', () => {
    // 1. Si existe 'link' en el JSON y no está vacío
    if (data.link && data.link.trim() !== "") {
      window.location.href = data.link;
    }
    // 2. Fallback: Generar slug automático
    else {
      const slug = data.title.toLowerCase().trim().replace(/\s+/g, '-');
      window.location.href = `/blog?id=`+data.id;
    }
  });

  return mainContainer; // Recuerda retornar el elemento si lo usas en un loop
}
function renderCards(cardsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Aseguramos que el contenedor tenga posición relativa para que los absolutos de adentro funcionen
  container.style.position = container.style.position || 'relative';

  // Limpiamos antes de renderizar por si se llama dos veces
  container.innerHTML = '';

  cardsArray.forEach(cardData => {
    const card = createCard(cardData);
    container.appendChild(card);
  });
}

// Inicializador principal
async function initCards({ jsonUrl, containerId = 'cards-container' }) {
  const data = await fetchCardsData(jsonUrl);
  if (data && data.length > 0) {
    renderCards(data, containerId);
  }
}

// Exponer init para usarlo desde el HTML
window.initCards = initCards;


// blog-latest.js
// Requiere: endpoint "/api/nota_get.php" que devuelve array de notas o detalle cuando se le pasa id.
// Este script inyecta las últimas 2 notas en .notas-body
document.addEventListener("DOMContentLoaded", () => {
  const API = "/api/nota_get.php";
  const container = document.querySelector(".notas-body_blog");
  if (!container) return;

  // Helpers seguros
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  // Renderiza lista (solo 2 últimas notas)
  async function renderLatestTwo() {
    try {
      const res = await fetch(API);
      const notas = await res.json();

      if (!res.ok || !Array.isArray(notas)) {
        container.innerHTML = `<p>No se pudieron cargar las notas.</p>`;
        return;
      }

      if (notas.length === 0) {
        container.innerHTML = `<p>No hay notas cargadas aún.</p>`;
        return;
      }

      // Asumimos que la API devuelve en orden cronológico (si no, podés ordenar por fecha)
      // Tomamos las 2 más recientes (últimas en el array o primeras según tu API)
      // Aquí tomamos las primeras 2; si tu API devuelve ascendente, usar .slice(-2)
      const latest = notas.slice(0, 2);

      container.innerHTML = latest.map(n => {
        const href = `/blog?id=${encodeURIComponent(n.id)}`;
        const imgHtml = n.imagen ? `<div class="card-note__media"><img loading="lazy" src="${escapeAttr(n.imagen)}" alt="${escapeAttr(n.titulo)}"></div>` : `<div class="card-note__media" aria-hidden="true"></div>`;
        const titulo = escapeHtml(n.titulo || "Sin título");

        return `
          <a class="card-note" href="${href}" aria-label="Leer nota: ${titulo}">
            ${imgHtml}
            <div class="card-note__overlay">
              <h3 class="card-note__title">${titulo}</h3>
            </div>
          </a>
        `;
      }).join("");

    } catch (err) {
      console.error("Error cargando notas:", err);
      container.innerHTML = `<p>Error de conexión</p>`;
    }
  }

  // Inicializar
  renderLatestTwo();
});

