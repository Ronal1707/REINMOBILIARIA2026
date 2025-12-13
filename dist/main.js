"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const scrollThreshold = 50; // px scrolled before shrinking
window.addEventListener("DOMContentLoaded", loadMainHeader);
function getRelativeRoot() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const depth = Math.max(0, segments.length - 1);
    return "../".repeat(depth);
}
function loadMainHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        let mainHeaderContainer = document.getElementById("main-header-container");
        if (!mainHeaderContainer) {
            console.error("Main header element not found.");
            return;
        }
        try {
            const res = yield fetch("component/main-header.html");
            if (!res.ok) {
                console.error("Failed to load header:", res.status, res.statusText);
                return;
            }
            mainHeaderContainer.innerHTML = yield res.text();
            const header = mainHeaderContainer.querySelector("#main-header");
            if (getRelativeRoot() != "") {
                header.classList.remove("index");
            }
            const logoLink = header.querySelector("a.logo");
            logoLink.href = getRelativeRoot() + "index.html";
        }
        catch (error) {
            console.error("Error loading main header:", error);
        }
    });
}
;
window.addEventListener('scroll', () => {
    let mainHeaderElement = document.getElementById("main-header");
    if (!mainHeaderElement)
        return;
    if (window.scrollY > scrollThreshold) {
        mainHeaderElement.classList.remove('unscrolled');
    }
    else {
        mainHeaderElement.classList.add('unscrolled');
    }
});
