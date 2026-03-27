document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-busqueda");
  const selOperacion = document.getElementById("f_operacion");
  const selTipo = document.getElementById("f_tipo");

  if (!form || !selOperacion || !selTipo) {
    console.error("❌ Formulario o selects no encontrados");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const operacion = selOperacion.value;
    const tipo = selTipo.value;

    if (!operacion && !tipo) {
      alert("Selecciona al menos un filtro para continuar");
      return;
    }

    const params = new URLSearchParams();

    if (operacion) params.append("operacion", operacion);
    if (tipo) params.append("tipo", tipo);

    window.location.href = `buscar_inmuebles.html?${params.toString()}`;
  });

});
