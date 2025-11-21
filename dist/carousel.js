document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("carousel-btn")) return;

    const btn = e.target;
    const carousel = btn.closest(".carousel");
    const track = carousel.querySelector(".carousel-track");
    const images = track.querySelectorAll("img");

    const width = carousel.clientWidth;
    let index = Number(track.dataset.index || 0);

    if (btn.classList.contains("right")) {
        index = (index + 1) % images.length;
    } else {
        index = (index - 1 + images.length) % images.length;
    }

    track.dataset.index = index;
    track.style.transform = `translateX(-${index * width}px)`;
});
