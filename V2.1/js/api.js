
const TOKEN = '6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861';

// URL base del endpoint para obtener los inmuebles destacados.
// La URL está incompleta (el número final lo estás concatenando luego en la función).
const BASE_URL = 'http://www.simi-api.com';

// Creamos un objeto Headers para incluir la cabecera de autenticación.
const headers = new Headers();

// Establecemos la cabecera Authorization con el formato Basic Auth.
// El usuario está vacío (''), y solo se usa el token como contraseña.
// btoa convierte a Base64 el string `:TOKEN`.
headers.set('Authorization', 'Basic ' + btoa(':' + TOKEN));

/**
 * Función asincrónica para obtener inmuebles destacados desde la API.
 * @param {number} pagina - Número de página a consultar (por defecto es 1).
 * @returns {Promise<Array>} - Promesa que retorna un arreglo de inmuebles.
 */
export async function obtenerInmuebles(pagina = 1) {
  // Se construye la URL final agregando el número de página al final.
  const url = `${BASE_URL}${pagina}`;

  // Se realiza la solicitud HTTP GET a la API con las cabeceras definidas.
  const res = await fetch(url, { method: 'GET', headers });

  // Se espera la respuesta en formato JSON.
  const data = await res.json();

  // Se retorna únicamente el arreglo de inmuebles que viene dentro del objeto `data`.
  return data.Inmuebles;
}
