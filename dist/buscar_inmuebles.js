import { apiGet } from "../dist/api.js";
import { crearCard } from "../dist/card.js";
import { obtenerEndpointConFiltros } from "../dist/filtros.js";

const contenedor = document.getElementById("buscar_inmuebles");
const estado = document.getElementById("estado_api");
const btn = document.getElementById("btn_filtrar");

let cantidadActual = 12;
const INCREMENTO = 12;
let totalInmuebles = 0;

function renderCargarMas() {
    const pag = document.getElementById("paginacion");
    pag.innerHTML = "";

    if (cantidadActual >= totalInmuebles) return;

    const btn = document.createElement("button");
    btn.textContent = "Cargar más";

    btn.onclick = () => {
        cantidadActual += INCREMENTO;
        cargarInmuebles();
    };

    pag.appendChild(btn);
}

async function cargarInmuebles(reset = false) {
    console.group("🔄 cargarInmuebles");

    try {
        estado.textContent = "⏳ Buscando inmuebles...";
        estado.style.color = "#555";

        const endpoint = obtenerEndpointConFiltros(cantidadActual);
        const data = await apiGet(endpoint);

        if (!data.Inmuebles || data.Inmuebles.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
            estado.textContent = "🟠 No se encontraron inmuebles";
            estado.style.color = "orange";
            return;
        }

        const inmuebles = data.Inmuebles ?? [];
        totalInmuebles = data.datosGrales?.totalInmuebles ?? 0;

        if (reset) contenedor.innerHTML = "";

        estado.textContent = "🟢 Resultados encontrados";
        estado.style.color = "green";

        contenedor.innerHTML = inmuebles
            .map(inm => crearCard(inm))
            .join("");

        renderCargarMas();

    } catch (err) {
        estado.textContent = "🔴 Error al buscar";
        estado.style.color = "red";

        contenedor.innerHTML = `<p>Error: ${err.message}</p>`;
    }

    console.groupEnd();
}

function aplicarParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    
    console.log("📥 Parámetros recibidos desde URL:", {
        operacion: params.get("operacion"),
        tipo: params.get("tipo")
    });

    // Aplicar operación si existe
    const operacion = params.get("operacion");
    if (operacion) {
        const selectOper = document.getElementById("f_operacion");
        if (selectOper) {
            selectOper.value = operacion;
            console.log("✅ Operación aplicada:", operacion);
        }
    }

    // Aplicar tipo si existe
    const tipo = params.get("tipo");
    if (tipo) {
        const selectTipo = document.getElementById("f_tipo");
        if (selectTipo) {
            selectTipo.value = tipo;
            console.log("✅ Tipo aplicado:", tipo);
        }
    }

    // Si hay parámetros, hacer búsqueda automática
    if (operacion || tipo) {
        console.log("🔍 Ejecutando búsqueda automática con parámetros");
        cargarInmuebles(true);
    } else {
        // Carga inicial sin filtros
        cargarInmuebles();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM cargado (buscar_inmuebles)");

    // 🆕 Primero aplicamos los parámetros de URL
    aplicarParametrosURL();

    // Botón de búsqueda manual
    const btn = document.getElementById("btn_filtrar");
    if (!btn) {
        console.warn("⚠️ Botón btn_filtrar no encontrado");
        return;
    }

    btn.addEventListener("click", () => {
        cantidadActual = 12;
        cargarInmuebles(true);
    });
});