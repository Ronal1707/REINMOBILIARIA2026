// ---------- SLIDERS (solo una vez) ----------
const habSlider = document.getElementById("f_habitaciones");
const banSlider = document.getElementById("f_banos");

const habVal = document.getElementById("hab_val");
const banVal = document.getElementById("ban_val");

// Mostrar valores en tiempo real
habSlider.addEventListener("input", () => {
    habVal.textContent = habSlider.value === "10" ? "10+" : habSlider.value;
});

banSlider.addEventListener("input", () => {
    banVal.textContent = banSlider.value === "10" ? "10+" : banSlider.value;
});


// ---------- BOTÓN DE RESTABLECER ----------
const btnReset = document.getElementById("btn_reset");

btnReset.addEventListener("click", () => {
    // Selects
    document.getElementById("f_ciudad").value = 0;
    document.getElementById("f_tipo").value = 0;
    document.getElementById("f_operacion").value = 0;

    // Inputs
    document.getElementById("f_min").value = "";
    document.getElementById("f_max").value = "";

    // Sliders
    habSlider.value = 0;
    banSlider.value = 0;
    habVal.textContent = "0";
    banVal.textContent = "0";

    // Aviso visual opcional
    console.log("🔄 Filtros restablecidos");
});

export function obtenerEndpointConFiltros(cantidad) {
    let endpoint = `ApiSimiweb/response/v2.1.1/filtroInmueble/`;
    endpoint += `limite/1/total/${cantidad}/`;

    const add = (key, value) => {
        if (value && value !== "0") {
            endpoint += `${key}/${value}/`;
        }
    };

    add("ciudad", document.getElementById("f_ciudad")?.value);
    add("tipoInm", document.getElementById("f_tipo")?.value);
    add("tipOper", document.getElementById("f_operacion")?.value);
    add("valmin", document.getElementById("f_min")?.value);
    add("valmax", document.getElementById("f_max")?.value);
    add("alcobas", document.getElementById("f_habitaciones")?.value);
    add("banios", document.getElementById("f_banos")?.value);

    return endpoint;
}