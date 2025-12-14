document.addEventListener("DOMContentLoaded", () => {
    const habSlider = document.getElementById("f_habitaciones");
    const banSlider = document.getElementById("f_banos");

    const habVal = document.getElementById("hab_val");
    const banVal = document.getElementById("ban_val");

    const sync = (slider, label) => {
        const value = slider.value;
        label.textContent = value === "0" ? "-" : value;
    };

    sync(habSlider, habVal);
    sync(banSlider, banVal);

    habSlider.addEventListener("input", () => sync(habSlider, habVal));
    banSlider.addEventListener("input", () => sync(banSlider, banVal));
});
