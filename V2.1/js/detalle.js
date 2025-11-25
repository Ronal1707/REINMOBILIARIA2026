const params = new URLSearchParams(window.location.search);
const codigo = params.get('codigo');

if (!codigo) {
  document.getElementById('detalle-inmueble').innerText = 'Código de inmueble no encontrado';
  throw new Error('Código de inmueble no proporcionado');
}

const url = `https://www.simi-api.com/ApiSimiweb/response/v2/inmueble/codInmueble/${codigo}`;
const headers = new Headers();
headers.set('Authorization', 'Basic ' + btoa(':' + '6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861'));

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
  
    mostrarDetalle(data);
  } catch (error) {
    console.error('Error al cargar el inmueble:', error);
    document.getElementById('detalle-inmueble').innerText = 'No se pudo cargar el inmueble';
  }
});

function mostrarDetalle(data) {
  const contenedor = document.getElementById('detalle-inmueble');
  const fotos = data.fotos;
  const internas = data.caracteristicasInternas.map(c => `<li>${c.Descripcion}</li>`).join('');
  const alrededores = data.caracteristicasAlrededores.map(c => `<li>${c.Descripcion}</li>`).join('');
  const asesor = data.asesor[0];

  contenedor.innerHTML = `
    <section class="info-principal">
      <h1>${data.Tipo_Inmueble} en ${data.barrio}, ${data.ciudad}</h1>
      <p class="precio">$${data.precio}</p>
      <p class="gestion">${data.Gestion}</p>
    </section>

    <section class="galeria">
      <div class="slider">
        <button class="prev">❮</button>
        <div class="slider-container">
          ${fotos.map((f, i) => `<img src="${f.foto}" class="slide ${i === 0 ? 'active' : ''}" />`).join('')}
        </div>
        <button class="next">❯</button>
      </div>
    </section>

    <section class="descripcion">
      <h2>Descripción del inmueble</h2>
      <p>${data.descripcionlarga}</p>
      <ul class="datos-basicos">
        <li><strong>Área:</strong> ${data.AreaConstruida} m²</li>
        <li><strong>Alcobas:</strong> ${data.alcobas}</li>
        <li><strong>Baños:</strong> ${data.banos}</li>
        <li><strong>Garaje:</strong> ${data.garaje}</li>
        <li><strong>Dirección:</strong> ${data.Direccion}</li>
        <li><strong>Estrato:</strong> ${data.Estrato}</li>
      </ul>
    </section>

    <section class="caracteristicas">
      <h2>Características</h2>
      <h3>Internas</h3>
      <ul>${internas}</ul>
      <h3>Alrededores</h3>
      <ul>${alrededores}</ul>
    </section>

    <section class="ubicacion">
      <h2>Ubicación</h2>
      <iframe 
        src="https://maps.google.com/maps?q=${data.latitud},${data.longitud}&z=17&output=embed" 
        width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen="">
      </iframe>
    </section>

    <section class="asesor">
      <h2>Contáctanos</h2>
      <div class="asesor-box">
        <img src="${asesor.FotoAsesor || 'https://via.placeholder.com/100'}" alt="Foto del asesor" width="100" />
        <p><strong>${asesor.ntercero}</strong></p>
        <p>📞 ${asesor.celular}</p>
        <p>📧 <a href="mailto:${asesor.correo}">${asesor.correo}</a></p>
        <a href="https://wa.me/57${asesor.celular.replace(/\s/g, '')}" target="_blank">Escríbele por WhatsApp</a>
      </div>
    </section>
  `;

  // ✅ Activamos el slider una vez el HTML ya existe
  inicializarSlider();
}

// 👉 Lógica del slider
function inicializarSlider() {
  let fotoIndex = 0;
  const slides = document.querySelectorAll('.slider-container img');
  const btnPrev = document.querySelector('.slider .prev');
  const btnNext = document.querySelector('.slider .next');

  function mostrarFoto(index) {
    slides.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  btnPrev.addEventListener('click', () => {
    fotoIndex = (fotoIndex - 1 + slides.length) % slides.length;
    mostrarFoto(fotoIndex);
  });

  btnNext.addEventListener('click', () => {
    fotoIndex = (fotoIndex + 1) % slides.length;
    mostrarFoto(fotoIndex);
  });
}
