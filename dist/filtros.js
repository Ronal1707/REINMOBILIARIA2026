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



// ---------- FUNCION QUE CONSTRUYE EL ENDPOINT ----------
export function obtenerEndpointConFiltros() {

    const ciudad = document.getElementById("f_ciudad").value || 0;
    const tipo = document.getElementById("f_tipo").value || 0;
    const operacion = document.getElementById("f_operacion").value || 0;
    const min = document.getElementById("f_min").value || 0;
    const max = document.getElementById("f_max").value || 0;

    const habitaciones = habSlider.value || 0;
    const banos = banSlider.value || 0;

    const endpoint = `
        ApiSimiweb/response/v2.1.1/filtroInmueble/
        limite/1/
        total/40/
        departamento/0/
        ciudad/${ciudad}/
        zona/0/
        barrio/0/
        tipoInm/${tipo}/
        tipOper/${operacion}/
        areamin/0/
        areamax/0/
        valmin/${min}/
        valmax/${max}/
        campo/0/
        order/0/
        banios/${banos}/
        alcobas/${habitaciones}/
        garajes/0/
        sede/0/
        usuario/0
    `;

    return endpoint.replace(/\s+/g, "");
}