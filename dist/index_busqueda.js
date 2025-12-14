document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOMContentLoaded - index_busqueda.js cargado");

    const btn = document.getElementById("btn_buscar");
    const selOperacion = document.getElementById("f_operacion");
    const selTipo = document.getElementById("f_tipo");

    console.log("🔍 Elementos encontrados:", {
        boton: !!btn,
        selectOperacion: !!selOperacion,
        selectTipo: !!selTipo
    });

    if (!btn) {
        console.error("❌ No se encontró #btn_buscar");
        return;
    }

    if (!selOperacion || !selTipo) {
        console.error("❌ No se encontraron los selects de filtros");
        return;
    }

    btn.addEventListener("click", (e) => {
        console.log("🖱️ Click en botón Buscar");

        // Prevenir comportamiento por defecto y propagación
        e.preventDefault();
        e.stopPropagation();

        const operacion = selOperacion.value;
        const tipo = selTipo.value;

        console.log("📌 Valores seleccionados:", {
            operacion,
            tipo
        });

        // Validar que al menos un filtro esté seleccionado
        if (operacion === "0" && tipo === "0") {
            console.warn("⚠️ No se seleccionaron filtros");
            alert("Por favor selecciona al menos un filtro para buscar");
            return;
        }

        // Construir URL con parámetros
        const params = new URLSearchParams();

        if (operacion !== "0") {
            params.append("operacion", operacion);
        }
        
        if (tipo !== "0") {
            params.append("tipo", tipo);
        }

        const url = `buscar_inmuebles.html?${params.toString()}`;

        console.log("➡️ Redirigiendo a:", url);
        console.log("📋 Parámetros:", params.toString());

        // Realizar la redirección
        window.location.href = url;
    });

    console.log("✅ Event listener registrado correctamente");
});