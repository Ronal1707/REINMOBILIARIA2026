import { obtenerInmuebles } from './api.js';

let pagina = 1;

document.addEventListener('DOMContentLoaded', () => {
  cargarInmuebles(pagina);

  document.getElementById('btnBuscar').addEventListener('click', () => {
    pagina = 1;
    cargarInmuebles(pagina);
  });

  document.getElementById('anterior').addEventListener('click', () => {
    if (pagina > 1) {
      pagina--;
      cargarInmuebles(pagina);
    }
  });

  document.getElementById('siguiente').addEventListener('click', () => {
    pagina++;
    cargarInmuebles(pagina);
  });
});

async function cargarInmuebles(pagina) {
  const contenedor = document.getElementById('contenedor-inmuebles');
  contenedor.innerHTML = '';

  const inmuebles = await obtenerInmuebles(pagina);

  console.log('Inmuebles cargados:', inmuebles);

  document.getElementById('pagina-actual').textContent = pagina;

  for (const inmueble of inmuebles) {
    const plantilla = await fetch('components/card-inmueble.html');
    let cardHtml = await plantilla.text();

    cardHtml = cardHtml
      .replace('{{foto1}}', inmueble.foto1)
      .replace('{{Tipo_Inmueble}}', inmueble.Tipo_Inmueble)
      .replace('{{Ciudad}}', inmueble.Ciudad)
      .replace('{{Alcobas}}', inmueble.Alcobas)
      .replace('{{banios}}', inmueble.banios)
      .replace('{{AreaConstruida}}', inmueble.AreaConstruida)
      .replace('{{Canon}}', inmueble.Canon ?? inmueble.Venta);

    contenedor.innerHTML += cardHtml;
  }
}
