import { apiGet } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");

    if (!codigo) {
        alert("No se encontró el código del inmueble");
        return;
    }

    cargarInmueble(codigo);
});

async function cargarInmueble(codigo) {
    try {
        const data = await apiGet(`ApiSimiweb/response/v2/inmueble/codInmueble/${codigo}`);

        console.log("DATA API:", data);
        // ----------------------------
        // TÍTULO: tipo de inmueble + barrio
        // ----------------------------
        const tipo = data.Tipo_Inmueble || data.Tipo || data.Titulo_Web || "Inmueble";
        const barrio = data.Barrio || data.barrio || "";
        document.getElementById("titulo").textContent =
            barrio ? `${tipo} - ${barrio}` : tipo;

        // ----------------------------
        // TIPO DE OPERACIÓN
        // ----------------------------
        const operacionEl = document.getElementById("operacion");

        let operacion = "Sin información";

        if (data.Gestion === "Arriendo") operacion = "Arriendo";
        if (data.Gestion === "Venta") operacion = "Venta";
        if (data.Gestion === "Arriendo/Venta") operacion = "Arriendo y Venta";

        operacionEl.textContent = operacion;

        // ----------------------------
        // PRECIO (según operación)
        // ----------------------------
        let precio = null;

        if (operacion === "Arriendo") precio = data.ValorCanon;
        else if (operacion === "Venta") precio = data.ValorVenta;
        else precio = data.ValorCanon || data.ValorVenta;

        document.getElementById("precio").textContent =
            precio ? `$${Number(precio).toLocaleString()}` : "Sin precio";

        // ----------------------------
        // DESCRIPCIÓN
        // ----------------------------
        document.getElementById("descripcion").textContent =
            data.descripcionlarga || data.Descripcion || "Sin descripción disponible";

        // ----------------------------
        // WHATSAPP
        // ----------------------------
        const mensaje = `Hola! vi el inmueble  ${data.Titulo_Web || ""} (código ${codigo}), quisiera saber mas`;

        document.getElementById("btn-whatsapp").href =
            `https://wa.me/57321377000?text=${encodeURIComponent(mensaje)}`;

        // ----------------------------
        // IMÁGENES
        // ----------------------------
        cargarImagenes(data);

        // ----------------------------
        // ESPECIFICACIONES
        // ----------------------------
        cargarEspecificaciones(data);

        // ----------------------------
        //MAPA
        // MAPA: insertar ubicación en el elemento con id "mapa"
        const mapaEl = document.getElementById("mapa");

        // Intentar obtener coordenadas desde varias propiedades posibles
        const latRaw = data.Latitud ?? data.Lat ?? data.latitud ?? data.lat;
        const lonRaw = data.Longitud ?? data.Lon ?? data.longitud ?? data.lon ?? data.Lng ?? data.lng;

        const lat = latRaw !== undefined ? Number(latRaw) : NaN;
        const lon = lonRaw !== undefined ? Number(lonRaw) : NaN;

        // Preparar dirección posible para mapa o direcciones
        const direccion = data.Direccion || data.direccion || [data.Barrio, data.Ciudad, data.Departamento].filter(Boolean).join(", ");

        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            // Usar embed de Google Maps con lat/lon
            mapaEl.innerHTML = `
                <iframe
                    width="100%"
                    height="350"
                    frameborder="0"
                    style="border:0"
                    src="https://www.google.com/maps?q=${lat},${lon}&z=16&output=embed"
                    allowfullscreen
                    loading="lazy">
                    margin:
                </iframe>
            `;
        } else {
            // Si no hay coordenadas, intentar con la dirección
            if (direccion) {
                mapaEl.innerHTML = `
                    <iframe
                        width="100%"
                        height="350"
                        frameborder="0"
                        style="border:0"
                        src="https://www.google.com/maps?q=${encodeURIComponent(direccion)}&z=14&output=embed"
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                `;
            } else {
                mapaEl.textContent = "Ubicación no disponible";
            }
        }

        // ----------------------------
        // BOTÓN "Cómo llegar" con id="btn"
        // ----------------------------
        // Buscar elemento existente o crear uno si no existe
        let btn = document.getElementById("btn-primary");
        const crearBoton = () => {
            const a = document.createElement("a");
            a.id = "btn";
            a.textContent = "Cómo llegar";
            a.style.display = "inline-block";
            a.style.marginTop = "8px";
            a.className = "btn-primary";
            return a;
        };
        if (!btn) {
            btn = crearBoton();
            // Insertar antes del mapa si es posible, sino al inicio del body
            if (mapaEl && mapaEl.parentNode) mapaEl.parentNode.insertBefore(btn, mapaEl);
            else document.body.insertBefore(btn, document.body.firstChild);
        }



        // Construir URL de direcciones: preferir lat/lon, sino dirección
        let directionsUrl = null;
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        } else if (direccion) {
            directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
        }

        if (directionsUrl) {
            btn.href = directionsUrl;
            btn.target = "_blank";
            btn.rel = "noopener noreferrer";
            // Si es un <a>, asegurar estilo de botón; si es otro tipo, asignar click
            if (btn.tagName.toLowerCase() !== "a") {
                btn.addEventListener("click", () => window.open(directionsUrl, "_blank", "noopener"));
            }
            btn.style.pointerEvents = "auto";
            btn.style.opacity = "1";
        } else {
            // No hay destino: deshabilitar el botón
            btn.removeAttribute("href");
            btn.style.pointerEvents = "none";
            btn.style.opacity = "0.6";
            btn.title = "Ubicación no disponible";
        }

    } catch (error) {
        console.log("ERROR:", error);
        alert("Error cargando el inmueble");
    }
}

function cargarImagenes(data) {
    const principal = document.getElementById("imagen-principal");
    const miniaturas = document.getElementById("miniaturas");
    const btnPrev = document.querySelector(".galeria-btn.prev");
    const btnNext = document.querySelector(".galeria-btn.next");

    if (!data.fotos || data.fotos.length === 0) {
        principal.src = "assets/img/no-image.jpg";
        return;
    }

    const fotos = data.fotos.map(f => f.foto);
    let indiceActual = 0;
    let thumbs = [];

    const actualizarActiva = () => {
        thumbs.forEach((img, i) => {
            img.classList.toggle("activa", i === indiceActual);
        });

        const activa = thumbs[indiceActual];
        if (activa) centrarMiniatura(activa);
    };

    const cambiarImagen = (nuevoIndice, direccion = 1) => {
        if (nuevoIndice === indiceActual) return;

        const imgOld = document.createElement("img");
        imgOld.src = fotos[indiceActual];
        imgOld.className = "img-old";

        const imgNew = document.createElement("img");
        imgNew.src = fotos[nuevoIndice];
        imgNew.className = "img-anim";

        imgNew.style.transform = `translateX(${direccion * 100}%)`;
        imgNew.style.opacity = "1";

        principal.parentElement.append(imgOld, imgNew);

        requestAnimationFrame(() => {
            imgOld.style.opacity = "0";
            imgOld.style.filter = "blur(100px)";
            imgOld.style.transform = `translateX(${-direccion * 40}px)`;

            imgNew.style.transform = "translateX(0)";
        });

        setTimeout(() => {
            principal.src = fotos[nuevoIndice];
            imgOld.remove();
            imgNew.remove();

            indiceActual = nuevoIndice;
            actualizarActiva();
        }, 450);
    };

    // Imagen inicial
    principal.src = fotos[indiceActual];

    // Miniaturas
    fotos.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;

        img.addEventListener("click", () => {
            const dir = index > indiceActual ? 1 : -1;
            cambiarImagen(index, dir);
        });

        miniaturas.appendChild(img);
        thumbs.push(img);
    });

    actualizarActiva();

    // Botones
    btnPrev.addEventListener("click", () => {
        const nuevo = (indiceActual - 1 + fotos.length) % fotos.length;
        cambiarImagen(nuevo, -1);
    });

    btnNext.addEventListener("click", () => {
        const nuevo = (indiceActual + 1) % fotos.length;
        cambiarImagen(nuevo, 1);
    });

    // Centrar miniatura inicial
    setTimeout(() => actualizarActiva(), 150);
}


function centrarMiniatura(img) {
    const contenedor = img.parentElement;

    const contenedorRect = contenedor.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const desplazamiento =
        imgRect.left - contenedorRect.left
        - (contenedorRect.width / 2)
        + (imgRect.width / 2);

    contenedor.scrollBy({
        left: desplazamiento,
        behavior: "smooth"
    });
}

function cargarEspecificaciones(data) {
    const specs = document.getElementById("especificaciones");

    const lista = [
        { label: "Área", value: data.AreaConstruida || data.area },
        { label: "Habitaciones", value: data.alcobas },
        { label: "Baños", value: data.banos },
        { label: "Garajes", value: data.garaje || data.garajes },
        { label: "Estrato", value: data.Estrato || data.estrato },
        { label: "Administración", value: data.Administracion || data.admonPrecio },
    ];

    lista.forEach(item => {
        // 🔥 No mostrar si es 0, null o vacío
        if (!item.value || item.value === 0 || item.value === "0") return;

        const div = document.createElement("div");
        div.textContent = `${item.label}: ${item.value}`;
        specs.appendChild(div);
    });

}


function cargarDetalles(data) {
    const cont = document.getElementById("detalles");

    const detalles = [
        { label: "Año de construcción", value: data.AnioConstruccion || data.anioConstruccion },
        { label: "Estado del inmueble", value: data.Estado || data.estado },
        { label: "Antigüedad", value: data.Antiguedad || data.antiguedad },
        { label: "Piso", value: data.piso },
        { label: "Área construida", value: data.AreaConstruida || data.area_construida },
        { label: "Área privada", value: data.AreaPrivada || data.area_privada },
        { label: " Administración", value: data.Administracion || data.admonPrecio },
        { label: "Portería", value: data.Porteria ? "Sí" : null },
        { label: "Ascensor", value: data.Ascensor ? "Sí" : null },
        { label: "Amoblado", value: data.Amoblado ? "Sí" : null },
        { label: "Gas Natural", value: data.GasNatural ? "Sí" : null },
        { label: "Balcón", value: data.Balcon ? "Sí" : null },
        { label: "Terraza", value: data.Terraza ? "Sí" : null },
        { label: "Patio", value: data.Patio ? "Sí" : null },
        { label: "Depósito", value: data.Deposito ? "Sí" : null },
        { label: "Garajes", value: data.Garaje || data.Garajes }
    ];

    detalles.forEach(item => {
        if (item.value && item.value !== 0 && item.value !== "0") {
            const div = document.createElement("div");
            div.textContent = `${item.label}: ${item.value}`;
            cont.appendChild(div);
        }
    });
}

function cargarComodidades(data) {
    const listaEl = document.getElementById("comodidades");

    const fuentes = [
        data.caracteristicas,
        data.caracteristicasInternas,
        data.caracteristicasExternas,
        data.Caracteristicas_Adicionales
    ];

    let comodidades = [];

    fuentes.forEach(f => {
        if (Array.isArray(f)) {
            f.forEach(item => {
                if (item.nombre) comodidades.push(item.nombre);
                if (item.Nombre) comodidades.push(item.Nombre);
            });
        }
    });

    // Eliminar repetidos
    comodidades = [...new Set(comodidades)];

    if (comodidades.length === 0) {
        listaEl.innerHTML = "<li>No hay información de comodidades disponible</li>";
        return;
    }

    comodidades.forEach(nombre => {
        const li = document.createElement("li");
        li.textContent = nombre;
        listaEl.appendChild(li);
    });
}



