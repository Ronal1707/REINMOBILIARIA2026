import { apiGet } from "../dist/api.js";
import { crearCard } from "../dist/card.js";

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("destacados");
    if (!contenedor) return;

    // 🔹 Mensaje mientras carga
    contenedor.innerHTML = `
        <p style="text-align:center; font-size:1.2rem; padding:2rem;">
            Cargando inmuebles destacados...
        </p>
    `;

    try {
        const data = await apiGet("ApiSimiweb/response/v21/inmueblesDestacados/total/4/limite/1");

        // 🔹 Si no llegaron inmuebles
        if (!data || Object.values(data).length === 0) {
            contenedor.innerHTML = `
                <p style="text-align:center; font-size:1.2rem; padding:2rem;">
                    No hay inmuebles destacados disponibles en este momento.
                </p>
            `;
            return;
        }

        // 🔹 Si sí hay inmuebles → limpiar mensaje
        contenedor.innerHTML = "";

        Object.values(data).forEach(inmueble => {
            if (!inmueble.Codigo_Inmueble) return;
            contenedor.innerHTML += crearCard(inmueble);
        });

    } catch (err) {

        console.error("Error cargando destacados:", err);

        // 🔹 Detectar si es error de conexión
        const sinConexion =
            err.message.includes("Failed to fetch") ||
            navigator.onLine === false;

        if (sinConexion) {
            contenedor.innerHTML = `
                <p style="text-align:center; font-size:1.2rem; padding:2rem; color:#c00;">
                    Error: Sin conexión a internet.  
                    <br>Por favor revisa tu red e intenta de nuevo.
                </p>
            `;
        } else {
            contenedor.innerHTML = `
                <p style="text-align:center; font-size:1.2rem; padding:2rem; color:#c00;">
                    Ocurrió un error cargando los inmuebles destacados.
                </p>
            `;
        }
    }
});
