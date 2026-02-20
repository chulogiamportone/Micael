document.addEventListener("DOMContentLoaded", async () => {
    const API = "/api/profesional_get.php";
    const section = document.querySelector(".notas-body"); // Contenedor dinámico
    const section2 = document.querySelector(".navegacion_botones"); // Botones nav
    const banner = document.querySelector(".card-profesional"); // <--- TU SECCIÓN NUEVA

    if (!section) return;

    // 1. Obtenemos el ID de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // 2. LÓGICA DE VISIBILIDAD DEL BANNER
    // Si el banner existe en el HTML, decidimos si mostrarlo u ocultarlo
    if (banner) {
        if (id) {
            // Si hay ID (estamos en detalle), lo ocultamos
            banner.style.display = "none";
        } else {
            // Si no hay ID (estamos en lista), limpiamos el estilo inline 
            // para que tome el "display: flex" de tu archivo CSS
            banner.style.display = ""; 
        }
    }

    try {
        if (id) {
            // ------------------------------------------------
            // CASO A: VISTA DETALLE (Con ID)
            // ------------------------------------------------
            const res = await fetch(`${API}?id=${encodeURIComponent(id)}`);
            const prof = await res.json();

            if (!res.ok || prof.error) {
                section.innerHTML = `<p>${prof.error || "Error cargando el perfil"}</p>`;
                return;
            }

            // Renderizar el detalle del profesional
            section.innerHTML = `
          <div class="prof-detalle">
            <div class="prof-detalle__card">
              <div class="prof-detalle__avatar-wrapper">
                <img
                  class="prof-detalle__avatar"
                  src="${prof.imagen}"
                  alt="${escapeAttr(prof.nombre)}"
                />
              </div>
  
              <div class="prof-detalle__info">
                <h1 class="prof-detalle__nombre">
                  ${escapeHtml(prof.nombre)}
                </h1>
  
                <p class="prof-detalle__titulo">
                  ${escapeHtml(prof.titulo)}
                </p>
  
                <div class="prof-detalle__descripcion">
                  ${prof.descripcion_larga}
                </div>
              </div>
  
            </div>
          </div>
        `;

            // Renderizar botones de navegación
            section2.innerHTML = `
              <div class="botones-navegacion">
                  <button class="btn-anterior" disabled>
                      <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
                          <path d="M10.226 1.05296C10.0932 0.919055 9.93518 0.812773 9.76109 0.740243C9.587 0.667713 9.40027 0.630371 9.21167 0.630371C9.02307 0.630371 8.83634 0.667713 8.66225 0.740243C8.48816 0.812773 8.33015 0.919055 8.19734 1.05296L1.05418 8.19612C0.920275 8.32893 0.813993 8.48694 0.741464 8.66103C0.668934 8.83512 0.631592 9.02185 0.631592 9.21045C0.631592 9.39905 0.668934 9.58578 0.741464 9.75987C0.813993 9.93396 0.920275 10.092 1.05418 10.2248L8.19734 17.3679C8.33015 17.5018 8.48816 17.6081 8.66225 17.6807C8.83634 17.7532 9.02307 17.7905 9.21167 17.7905C9.40027 17.7905 9.587 17.7532 9.76109 17.6807C9.93518 17.6081 10.0932 17.5018 10.226 17.3679Z" fill="#824C91" />
                      </svg>
                      Anterior
                  </button>
  
                  <button class="btn-siguiente" disabled>
                      Siguiente
                      <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
                          <path d="M1.40559 1.05296C1.5384 0.919055 1.69641 0.812773 1.8705 0.740243C2.04459 0.667713 2.23133 0.630371 2.41992 0.630371C2.60852 0.630371 2.79525 0.667713 2.96934 0.740243C3.14343 0.812773 3.30144 0.919055 3.43425 1.05296L10.5774 8.19612C10.7113 8.32893 10.8176 8.48694 10.8901 8.66103C10.9627 8.83512 11 9.02185 11 9.21045C11 9.39905 10.9627 9.58578 10.8901 9.75987C10.8176 9.93396 10.7113 10.092 10.5774 10.2248L3.43425 17.3679Z" fill="#824C91" />
                      </svg>
                  </button>
              </div>
        `;

            // Inicializar lógica de botones Anterior / Siguiente
            inicializarNavegacion(API, id);

        } else {
            // ------------------------------------------------
            // CASO B: VISTA LISTA AGRUPADA (Sin ID)
            // ------------------------------------------------
            listarTodosLosProfesionales(section, API);
        }

    } catch (err) {
        console.error(err);
        section.innerHTML = `<p>Error de conexión</p>`;
    }
});

// --- FUNCIONES AUXILIARES ---

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
}

async function listarTodosLosProfesionales(section, API) {
    try {
        const res = await fetch(API);
        const profesionales = await res.json();

        if (!res.ok || !Array.isArray(profesionales)) {
            section.innerHTML = `<p>No se pudieron cargar los profesionales.</p>`;
            return;
        }

        if (profesionales.length === 0) {
            section.innerHTML = `<p>No hay profesionales cargados aún.</p>`;
            return;
        }

        // Ordenar por ID creciente
        profesionales.sort((a, b) => a.id - b.id);

        section.innerHTML = `
        <div class="lista-notas">
          ${profesionales.map(p => `
            <article class="nota-item">
              <div class="vector-divider">
                <svg width="352" height="2" viewBox="0 0 352 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L351 0.999969" stroke="#E8E4F1" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
              
              <div class="card-container">
                <div class="professional-card">
                  ${p.imagen ? `<img class="profile-image" src="${escapeAttr(p.imagen)}" alt="${escapeAttr(p.nombre)}" loading="lazy" />` : ""}
                  
                  <div class="card-info">
                    <div class="professional-name">
                      <h3>${escapeHtml(p.nombre)}</h3>
                    </div>
                    
                    ${p.descripcion_corta ? `
                    <div class="professional-specialties">
                      ${escapeHtml(p.descripcion_corta)}
                    </div>
                    ` : ""}
                    
                    <div class="button-container">
                      <button class="details-button" onclick="irAlDetalle('${encodeURIComponent(p.id)}')">
                        LEER MÁS DETALLES DE FORMACIÓN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      `;
    } catch (e) {
        console.error(e);
        section.innerHTML = `<p>Error de conexión al cargar la lista</p>`;
    }
}

// Agrega esta función al final de tu archivo JS (fuera de cualquier otra función)
function irAlDetalle(id) {
    // Esto obliga al navegador a ir a profesional.html sí o sí
    window.location.assign(`profesionales?id=${id}`);
}

async function inicializarNavegacion(API, idActual) {
    const btnAnterior = document.querySelector(".btn-anterior");
    const btnSiguiente = document.querySelector(".btn-siguiente");
    if (!btnAnterior || !btnSiguiente) return;

    try {
        const res = await fetch(API);
        const lista = await res.json();
        if (!Array.isArray(lista)) return;

        // Ordenar igual que en el listado para que la navegación sea coherente
        lista.sort((a, b) => (a.id || "").localeCompare(b.id || "", "es")); 

        const idx = lista.findIndex(n => String(n.id) === String(idActual));
        if (idx === -1) return;

        const anterior = idx > 0 ? lista[idx - 1] : null;
        const siguiente = idx < lista.length - 1 ? lista[idx + 1] : null;

        if (anterior) {
            btnAnterior.disabled = false;
            btnAnterior.addEventListener("click", () => {
                window.location.search = `?id=${encodeURIComponent(anterior.id)}`;
            });
        } else {
            btnAnterior.disabled = true;
        }

        if (siguiente) {
            btnSiguiente.disabled = false;
            btnSiguiente.addEventListener("click", () => {
                window.location.search = `?id=${encodeURIComponent(siguiente.id)}`;
            });
        } else {
            btnSiguiente.disabled = true;
        }
    } catch (e) {
        console.error(e);
    }
}