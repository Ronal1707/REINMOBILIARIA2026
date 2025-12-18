export function crearCard(inmueble) {

    // Obtener fotos
    const fotos = [];
    for (let i = 1; i <= 20; i++) {
        const key = "foto" + i;
        if (inmueble[key] && inmueble[key].trim() !== "") {
            fotos.push(inmueble[key]);
        }
    }

    if (fotos.length === 0) {
        fotos.push("assets/img/no-image.jpg");
    }

    const titulo = `${inmueble.Tipo_Inmueble} en ${inmueble.Gestion} - ${inmueble.Barrio}`;

    const gestion = inmueble.Gestion === "Venta"
        ? "Venta"
        : inmueble.Canon !== "0"
            ? "Arriendo"
            : "Venta";

    const precio = gestion === "Arriendo" ? inmueble.Canon : inmueble.Venta;

    const descripcion = inmueble.descripcionlarga || "";
    const descripcionCorta = descripcion.length > 120
        ? descripcion.slice(0, 120) + "..."
        : descripcion;

    let specs = "";
    if (inmueble.Alcobas !== "0") specs += `${inmueble.Alcobas}<img src="assets/icon/hab-icon.svg" class="icon" /> `;
    if (inmueble.banios !== "0") specs += `${inmueble.banios}<img src="assets/icon/banio2-icon.svg" class="icon" /> `;
    if (inmueble.AreaConstruida !== "0") specs += `${inmueble.AreaConstruida}<img src="assets/icon/area-icon.svg" class="icon" />`;

    return `
      <div class="card">

        <div class="carousel">

          <div class="carousel-track" data-index="0">
            ${fotos.map(f => `<img src="${f}" class="card__image">`).join("")}
          </div>

        </div>

        <div class="card__info">
          <span class="card__title">${titulo}</span>
          <p class="card__price">$${precio}</p>
          <p class="card__description">${descripcionCorta}</p>
          <div class="container__specs">
            <p class="card__inm__especs">${specs.trim()}</p>
          </div>
          <a href="inmueble.html?codigo=${inmueble.Codigo_Inmueble}" class="btn-primary">Ver más</a>
        </div>

      </div>
    `;
}
