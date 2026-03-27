"use strict";

const scrollThreshold = 50;

window.addEventListener("DOMContentLoaded", loadMainHeader);

/* =========================
   CARGAR HEADER
========================= */
async function loadMainHeader() {
    const container = document.getElementById("main-header-container");
    if (!container) return;

    try {
        const res = await fetch("component/main-header.html");
        if (!res.ok) throw new Error("No se pudo cargar el header");

        container.innerHTML = await res.text();

        configurarHeader(); // 🔥 activar interacciones
        ajustarLinksHeader();

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   LOGICA HEADER
========================= */
function configurarHeader() {
    const header = document.getElementById("main-header");
    const hamburger = header.querySelector("#hamburger");
    const nav = header.querySelector("#nav");
    const dropdownToggles = header.querySelectorAll(".dropdown-toggle");

    if (!hamburger || !nav) return;

    /* HAMBURGER */
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("open");
        hamburger.classList.toggle("active");
        document.body.style.overflow =
            nav.classList.contains("open") ? "hidden" : "";
    });

    /* DROPDOWN SOLO CLICK / TAP */
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const dropdown = toggle.closest(".dropdown");

            document.querySelectorAll(".dropdown.open")
                .forEach(d => d !== dropdown && d.classList.remove("open"));

            dropdown.classList.toggle("open");
        });
    });

    /* CERRAR AL CLIC FUERA */
    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown.open")
            .forEach(d => d.classList.remove("open"));

        if (nav.classList.contains("open")) {
            nav.classList.remove("open");
            hamburger.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    nav.addEventListener("click", e => e.stopPropagation());
}

/* =========================
   AJUSTAR LINKS RELATIVOS
========================= */
function ajustarLinksHeader() {
    const header = document.getElementById("main-header");
    if (!header) return;

    const root = getRelativeRoot();
    const logo = header.querySelector(".logo");

    if (logo) logo.href = root + "index.html";
}

function getRelativeRoot() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    return "../".repeat(Math.max(0, segments.length - 1));
}

/* =========================
   SCROLL HEADER
========================= */
window.addEventListener("scroll", () => {
    const header = document.getElementById("main-header");
    if (!header) return;

    header.classList.toggle("unscrolled", window.scrollY <= scrollThreshold);
});
