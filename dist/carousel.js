import { apiGet } from "../dist/api.js";
import { crearCard } from "../dist/card.js";

let offset = 1;     // Página actual
const limit = 4;    // Siempre 4 inmuebles

async function cargarDestacados(direccion = "right") {
    const contenedor = document.getElementById("destacados");

    // Animación de salida
    contenedor.classList.remove("slide-enter", "slide-enter-active");
    contenedor.classList.add("slide-exit");

    await new Promise(r => setTimeout(r, 50));

    contenedor.classList.add("slide-exit-active");

    await new Promise(r => setTimeout(r, 300));

    // Carga visual temporal
    contenedor.innerHTML = `
        <p style="text-align:center; font-size:1.2rem; padding:2rem;">
            Cargando inmuebles...
        </p>
    `;

    try {
        // ❗❗ ERROR FIX: la URL ahora está entre backticks
        const url = `ApiSimiweb/response/v21/inmueblesDestacados/total/${limit}/limite/${offset}`;

        const data = await apiGet(url);

        if (!data || Object.values(data).length === 0) {
            contenedor.innerHTML = `
                <p style="text-align:center; font-size:1rem; padding:2rem;">
                    No hay más inmuebles para mostrar.
                </p>
            `;
            return;
        }

        contenedor.innerHTML = "";

        Object.values(data).forEach(inmueble => {
            if (inmueble.Codigo_Inmueble) {
                contenedor.innerHTML += crearCard(inmueble);
            }
        });

        // Reset de animaciones de salida
        contenedor.classList.remove("slide-exit", "slide-exit-active");

        // Animación de entrada
        contenedor.classList.add("slide-enter");

        setTimeout(() => {
            contenedor.classList.add("slide-enter-active");
        }, 10);

    } catch (err) {
        console.error("Error cargando destacados:", err);
        contenedor.innerHTML = `
            <p style="text-align:center; padding:2rem; color:#c00;">
                Error cargando inmuebles.
            </p>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDestacados();

    document.getElementById("btn_next").addEventListener("click", () => {
        offset += 1;
        cargarDestacados("right");
    });

    document.getElementById("btn_prev").addEventListener("click", () => {
        if (offset > 1) {
            offset -= 1;
            cargarDestacados("left");
        }
    });
});
