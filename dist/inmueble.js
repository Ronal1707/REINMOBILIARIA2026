import { apiGet } from "/dist/api.js";

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
        // DIRECCIÓN
        // ----------------------------
        document.getElementById("direccion").textContent =
            data.Direccion || "Dirección no disponible";

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

    } catch (error) {
        console.log("ERROR:", error);
        alert("Error cargando el inmueble");
    }
}

function cargarImagenes(data) {
    const principal = document.getElementById("imagen-principal");
    const miniaturas = document.getElementById("miniaturas");

    if (!data.fotos || data.fotos.length === 0) {
        principal.src = "assets/img/no-image.jpg";
        return;
    }

    principal.src = data.fotos[0].foto;

    data.fotos.forEach(f => {
        const img = document.createElement("img");
        img.src = f.foto;
        img.addEventListener("click", () => {
            principal.src = f.foto;
        });
        miniaturas.appendChild(img);
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
