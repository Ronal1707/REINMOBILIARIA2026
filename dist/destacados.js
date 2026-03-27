import { apiGet } from "../dist/api.js";
import { crearCard } from "../dist/card.js";

let cardsData = [];        // Guarda todas las cards recibidas de la API
let currentIndex = 0;      // Card centrada
let totalCards = 0;

async function cargarDestacados() {
    const contenedor = document.getElementById("destacados");

    try {
        const url = `ApiSimiweb/response/v21/inmueblesDestacados/total/20/limite/1`;
        const data = await apiGet(url);

        cardsData = Object.values(data).filter(d => d.Codigo_Inmueble);
        totalCards = cardsData.length;

        contenedor.innerHTML = cardsData.map((inmueble, i) => {
            return `
                <div class="card-3d" data-index="${i}">
                    ${crearCard(inmueble)}
                </div>
            `;
        }).join("");

        actualizar3D();

    } catch (err) {
        console.error("Error cargando destacados:", err);
    }
}

function actualizar3D() {
    const cards = document.querySelectorAll(".card-3d");

    cards.forEach((card, i) => {
        const diff = i - currentIndex;

        // Centro
        if (diff === 0) {
            card.style.transform = `
                translateX(0px)
                scale(1)
                rotateY(0deg)
            `;
            card.style.zIndex = 10;
            card.style.opacity = 1;
        } else {
            // Posición lateral
            const offset = diff * 160; 
            const rotate = diff * -35;  
            
            card.style.transform = `
                translateX(${offset}px)
                scale(0.8)
                rotateY(${rotate}deg)
            `;
            card.style.zIndex = 10 - Math.abs(diff);
            card.style.opacity = 0.7;
        }
    });
}
