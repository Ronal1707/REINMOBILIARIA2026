import { apiGet } from "../dist/api.js";
import { crearCard } from "../dist/card.js";
import { obtenerEndpointConFiltros } from "../dist/filtros.js";

const contenedor = document.getElementById("buscar_inmuebles");
const estado = document.getElementById("estado_api");
const btn = document.getElementById("btn_filtrar");

async function cargarInmuebles() {
    try {
        estado.textContent = "⏳ Buscando inmuebles...";
        estado.style.color = "#555";

        contenedor.innerHTML = `<p class="loading">Cargando resultados...</p>`;

        const endpoint = obtenerEndpointConFiltros();
        const data = await apiGet(endpoint);

        if (!data.Inmuebles || data.Inmuebles.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
            estado.textContent = "🟠 No se encontraron inmuebles";
            estado.style.color = "orange";
            return;
        }

        estado.textContent = "🟢 Resultados encontrados";
        estado.style.color = "green";

        contenedor.innerHTML = data.Inmuebles
            .map(inm => crearCard(inm))
            .join("");

    } catch (err) {
        estado.textContent = "🔴 Error al buscar";
        estado.style.color = "red";

        contenedor.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarInmuebles);
btn.addEventListener("click", cargarInmuebles);
