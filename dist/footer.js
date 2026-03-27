document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("footer-container");
    if (!container) return;

    try {
        const res = await fetch("component/footer.html");
        if (!res.ok) throw new Error("No se pudo cargar el footer");
        container.innerHTML = await res.text();
    } catch (err) {
        console.error("Error cargando footer:", err);
    }
});
