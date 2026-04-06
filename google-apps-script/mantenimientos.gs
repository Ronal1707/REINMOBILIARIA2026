/**
 * ══════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT - SISTEMA DE MANTENIMIENTOS
 * RE Inmobiliaria SAS
 * ══════════════════════════════════════════════════════════════
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Ve a https://script.google.com y crea un nuevo proyecto.
 * 2. Copia y pega todo este código en el editor.
 * 3. Crea una hoja de cálculo en Google Sheets con el nombre "Mantenimientos RE Inmobiliaria".
 * 4. En la hoja, crea los siguientes encabezados en la fila 1:
 *    A: ID | B: Fecha | C: Cédula firmante | D: Persona que notifica | E: Correo
 *    F: Tipo de mantenimiento | G: Descripción | H: Estado | I: Archivos | J: Observaciones
 *
 * 5. Reemplaza SPREADSHEET_ID con el ID de tu hoja de cálculo
 *    (el ID está en la URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
 *
 * 6. Reemplaza EMAIL_EMPRESA con el correo de la empresa (para notificaciones internas).
 *
 * 7. Despliega como aplicación web:
 *    - Menú "Implementar" → "Nueva implementación"
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo"
 *    - Acceso: "Cualquier persona"
 *    - Clic en "Implementar"
 *
 * 8. Copia la URL generada y pégala en mantenimientos.html
 *    en la variable APPS_SCRIPT_URL
 *
 * ══════════════════════════════════════════════════════════════
 */

// ── CONFIGURACIÓN ──
const SPREADSHEET_ID = '1EEe08j9XaQA6xRmU41HLPIeZYq40GyXIU7v7U9m3Hzg';
const SHEET_NAME = 'Mantenimientos';
const EMAIL_EMPRESA = 'redes@reinmobiliariasas.com';

/**
 * Maneja peticiones GET (búsqueda y JSONP)
 */
function doGet(e) {
  const params = e.parameter;
  const callback = params.callback;
  const action = params.action;

  let result;

  try {
    if (action === 'crear') {
      result = crearMantenimiento(params);
    } else if (action === 'buscar') {
      result = buscarMantenimiento(params.id);
    } else if (action === 'subir_archivos') {
      result = subirArchivos(params);
    } else {
      result = { success: false, error: 'Acción no válida.' };
    }
  } catch (error) {
    result = { success: false, error: 'Error interno: ' + error.message };
  }

  // Respuesta JSONP
  const jsonResponse = JSON.stringify(result);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + jsonResponse + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(jsonResponse)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Maneja peticiones POST
 */
function doPost(e) {
  let data;

  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Datos inválidos.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let result;

  if (data.action === 'crear') {
    result = crearMantenimiento(data);
  } else if (data.action === 'buscar') {
    result = buscarMantenimiento(data.id);
  } else if (data.action === 'subir_archivos') {
    result = subirArchivos(data);
  } else {
    result = { success: false, error: 'Acción no válida.' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Genera un ID de mantenimiento único
 * Formato: MNT-YYYY-XXXXX
 */
function generarId() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  const year = new Date().getFullYear();

  let consecutivo = 1;
  if (lastRow > 1) {
    // Buscar el último ID del año actual
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i][0].toString();
      if (id.includes('MNT-' + year)) {
        const num = parseInt(id.split('-')[2], 10);
        if (!isNaN(num)) {
          consecutivo = num + 1;
          break;
        }
      }
    }
  }

  return 'MNT-' + year + '-' + String(consecutivo).padStart(5, '0');
}

/**
 * Crea un nuevo registro de mantenimiento
 */
function crearMantenimiento(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const id = generarId();
  const fecha = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');

  // Agregar fila a la hoja (archivos llegarán en una segunda petición)
  sheet.appendRow([
    id,
    fecha,
    data.cedula_firmante || '',
    data.persona_notifica || '',
    data.correo || '',
    data.tipo_mantenimiento || '',
    data.descripcion || '',
    'Pendiente',
    '',
    ''
  ]);

  // Enviar correo de confirmación al solicitante
  if (data.correo) {
    enviarCorreoConfirmacion(data, id, fecha);
  }

  // Notificar a la empresa
  enviarNotificacionEmpresa(data, id, fecha);

  return { success: true, id: id };
}

/**
 * Busca un mantenimiento por ID
 */
function buscarMantenimiento(id) {
  if (!id) {
    return { success: false, error: 'Debe proporcionar un ID.' };
  }

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return { success: false, error: 'No se encontró la solicitud con ID: ' + id };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toString().toUpperCase() === id.toUpperCase()) {
      return {
        success: true,
        data: {
          id: data[i][0],
          fecha: data[i][1],
          cedula_firmante: data[i][2],
          persona_notifica: data[i][3],
          correo: data[i][4],
          tipo_mantenimiento: data[i][5],
          descripcion: data[i][6],
          estado: data[i][7],
          observaciones: data[i][9]
        }
      };
    }
  }

  return { success: false, error: 'No se encontró la solicitud con ID: ' + id };
}

/**
 * Obtiene o crea una carpeta en la raíz de Drive por nombre
 */
function getOrCreateFolderByName(name) {
  const iter = DriveApp.getRootFolder().getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return DriveApp.getRootFolder().createFolder(name);
}

/**
 * Obtiene o crea una subcarpeta dentro de una carpeta padre
 */
function getOrCreateSubFolder(parentFolder, name) {
  const iter = parentFolder.getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parentFolder.createFolder(name);
}

/**
 * Envía correo de confirmación al solicitante
 */
function enviarCorreoConfirmacion(data, id, fecha) {
  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #e56d11, #ff9000); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .body { padding: 30px; }
          .id-box { background: #fff5ec; border: 2px solid #e56d11; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .id-box .label { font-size: 14px; color: #666; margin-bottom: 5px; }
          .id-box .id { font-size: 28px; font-weight: 800; color: #e56d11; letter-spacing: 2px; }
          .detail { border-bottom: 1px solid #eee; padding: 12px 0; display: flex; }
          .detail .label { font-weight: 700; color: #555; min-width: 160px; }
          .detail .value { color: #333; }
          .footer { background: #1a1a1a; color: #aaa; padding: 20px; text-align: center; font-size: 13px; }
          .footer a { color: #ff9000; text-decoration: none; }
          .status { display: inline-block; background: #fff3cd; color: #856404; padding: 4px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RE Inmobiliaria SAS</h1>
            <p>Confirmación de solicitud de mantenimiento</p>
          </div>
          <div class="body">
            <p>Hola <strong>${data.persona_notifica}</strong>,</p>
            <p>Hemos recibido su solicitud de mantenimiento correctamente. A continuación, los detalles:</p>

            <div class="id-box">
              <div class="label">Su ID de mantenimiento</div>
              <div class="id">${id}</div>
            </div>

            <p>Use el botón a continuación para consultar el estado de su solicitud en cualquier momento:</p>

            <div style="text-align:center; margin: 24px 0;">
              <a href="https://reinmobiliariasas.com/mantenimientos.html?id=${id}"
                 style="display:inline-block; background:#e56d11; color:#ffffff; padding:14px 32px;
                        border-radius:10px; font-weight:700; font-size:16px; text-decoration:none;
                        letter-spacing:0.5px;">
                Consultar estado de mi solicitud
              </a>
            </div>

            <div class="detail">
              <span class="label">Estado:</span>
              <span class="value"><span class="status">Pendiente</span></span>
            </div>
            <div class="detail">
              <span class="label">Fecha:</span>
              <span class="value">${fecha}</span>
            </div>
            <div class="detail">
              <span class="label">Documento firmante:</span>
              <span class="value">${data.cedula_firmante}</span>
            </div>
            <div class="detail">
              <span class="label">Persona que notifica:</span>
              <span class="value">${data.persona_notifica}</span>
            </div>
            <div class="detail">
              <span class="label">Tipo de mantenimiento:</span>
              <span class="value">${data.tipo_mantenimiento}</span>
            </div>
            <div class="detail">
              <span class="label">Descripción:</span>
              <span class="value">${data.descripcion}</span>
            </div>

            <p style="margin-top: 25px;">Nuestro equipo revisará su solicitud y se pondrá en contacto con usted lo antes posible.</p>
            <p>Si tiene alguna urgencia, puede contactarnos por WhatsApp al <a href="https://wa.me/573213770000" style="color: #e56d11; text-decoration: none; font-weight: 700;">+57 321 377 0000</a>.</p>
          </div>
          <div class="footer">
            <p>RE Inmobiliaria SAS — Av Kr 50 # 8-31 sur, Bogotá</p>
            <p><a href="https://wa.me/573213770000">+57 321 377 0000</a> | <a href="mailto:info@reinmobiliariasas.com">info@reinmobiliariasas.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    MailApp.sendEmail({
      to: data.correo,
      subject: 'Solicitud de mantenimiento ' + id + ' — RE Inmobiliaria',
      htmlBody: htmlBody
    });
  } catch (e) {
    console.log('Error enviando correo de confirmación: ' + e.message);
  }
}

/**
 * Sube archivos a Drive y actualiza la fila en Sheets
 */
function subirArchivos(data) {
  try {
    const id = data.id;
    if (!id) return { success: false, error: 'ID requerido.' };

    let archivos = typeof data.archivos === 'string'
      ? JSON.parse(data.archivos) : data.archivos;
    if (!archivos || !archivos.length) return { success: true, archivos: 0 };

    const rootFolder = getOrCreateFolderByName('Mantenimientos');
    const folder = getOrCreateSubFolder(rootFolder, id);
    const folderUrl = folder.getUrl();
    const urls = [];

    archivos.forEach(function(archivo) {
      try {
        const mimeType = archivo.type || '';
        const ext = (archivo.name || '').split('.').pop().toLowerCase();
        const allowedExts = ['heic', 'heif', 'mov'];
        const validMime = mimeType.startsWith('image/') || mimeType.startsWith('video/');
        if (!validMime && !allowedExts.includes(ext)) return;

        const blob = Utilities.newBlob(
          Utilities.base64Decode(archivo.data),
          archivo.type,
          archivo.name
        );
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        urls.push(file.getUrl());
      } catch (e) {}
    });

    // Actualizar columna I (Archivos) en el Sheets
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0].toString().toUpperCase() === id.toUpperCase()) {
          sheet.getRange(i + 2, 9).setValue(urls.join(', '));
          break;
        }
      }
    }

    // Notificar a la empresa con el link a Drive
    enviarNotificacionArchivos(id, folderUrl, urls.length);

    return { success: true, archivos: urls.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Correo breve a redes@ cuando los archivos ya están en Drive
 */
function enviarNotificacionArchivos(id, folderUrl, total) {
  try {
    MailApp.sendEmail({
      to: EMAIL_EMPRESA,
      subject: '📁 Archivos disponibles — ' + id,
      htmlBody: `
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
          <div style="background:#fff3cd;border-left:5px solid #1a73e8;padding:15px 20px;border-radius:8px;margin-bottom:20px;">
            <strong>${total} archivo(s) subidos para la solicitud ${id}</strong>
          </div>
          <p>Los archivos enviados por el cliente ya están disponibles en Google Drive.</p>
          <a href="${folderUrl}"
             style="background:#1a73e8;color:white;padding:10px 20px;border-radius:8px;
                    text-decoration:none;font-weight:bold;display:inline-block;">
            📁 Ver carpeta en Drive
          </a>
        </body></html>
      `
    });
  } catch (e) {
    console.log('Error notificando archivos: ' + e.message);
  }
}

function enviarNotificacionEmpresa(data, id, fecha) {
  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .alert { background: #fff3cd; border-left: 5px solid #e56d11; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
          .detail { padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="alert">
          <strong>Nueva solicitud de mantenimiento: ${id}</strong>
        </div>

        <div class="detail"><span class="label">Fecha:</span> ${fecha}</div>
        <div class="detail"><span class="label">Documento firmante:</span> ${data.cedula_firmante}</div>
        <div class="detail"><span class="label">Persona que notifica:</span> ${data.persona_notifica}</div>
        <div class="detail"><span class="label">Correo:</span> ${data.correo}</div>
        <div class="detail"><span class="label">Tipo:</span> ${data.tipo_mantenimiento}</div>
        <div class="detail"><span class="label">Descripción:</span> ${data.descripcion}</div>

        <p style="margin-top: 24px; margin-bottom: 8px; font-weight: bold; color: #333;">Accesos rápidos:</p>
        <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"
           style="background:#e56d11; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
          📊 Ver en Google Sheets
        </a>
      </body>
      </html>
    `;

    MailApp.sendEmail({
      to: EMAIL_EMPRESA,
      subject: '🔧 Nueva solicitud de mantenimiento ' + id,
      htmlBody: htmlBody
    });
  } catch (e) {
    console.log('Error enviando notificación a la empresa: ' + e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// FUNCIONES DE DIAGNÓSTICO — Ejecútalas manualmente en el editor
// para verificar que todo funciona antes de redesplegar.
// ══════════════════════════════════════════════════════════════

/**
 * TEST 1: Verificar que los correos se envían correctamente.
 * Cambia 'tu_correo@gmail.com' por tu correo real antes de ejecutar.
 * Deberías recibir 2 correos: uno de confirmación al cliente y otro a redes@.
 */
function testCorreos() {
  const fakeData = {
    cedula_firmante: '12345678',
    persona_notifica: 'Usuario de Prueba',
    correo: 'tu_correo@gmail.com',  // ← CAMBIA ESTO por tu correo real
    tipo_mantenimiento: 'Plomería',
    descripcion: 'Prueba de diagnóstico — verificando que los correos llegan correctamente.'
  };
  const id = 'MNT-TEST-00000';
  const fecha = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');

  console.log('Enviando correo al cliente: ' + fakeData.correo);
  enviarCorreoConfirmacion(fakeData, id, fecha);
  console.log('Enviando correo a la empresa: ' + EMAIL_EMPRESA);
  enviarNotificacionEmpresa(fakeData, id, fecha);
  console.log('✅ Correos enviados. Revisa tu bandeja de entrada y la de redes@.');
}

/**
 * TEST 2: Verificar que el Sheets se puede leer y escribir.
 * Muestra en el log el número de filas existentes.
 */
function testSheets() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  console.log('✅ Sheets accesible. Filas totales: ' + lastRow);
  if (lastRow > 1) {
    const primerID = sheet.getRange(2, 1).getValue();
    console.log('Primer ID en Sheets: ' + primerID);
  }
}

/**
 * TEST 3: Verificar que Google Drive es accesible y crear carpeta de prueba.
 * Crea (o abre si ya existe) la carpeta "Mantenimientos/MNT-TEST-00000" en Drive.
 */
function testDrive() {
  const rootFolder = getOrCreateFolderByName('Mantenimientos');
  console.log('Carpeta raíz "Mantenimientos": ' + rootFolder.getUrl());
  const subFolder = getOrCreateSubFolder(rootFolder, 'MNT-TEST-00000');
  console.log('✅ Subcarpeta de prueba: ' + subFolder.getUrl());
}

/**
 * TEST 4: Simular recepción de un POST con archivos para una solicitud real.
 * Cambia 'MNT-2026-XXXXX' por un ID que exista en tu Sheets.
 * NO sube archivos reales (archivos vacío), pero prueba todo lo demás:
 * actualiza la columna I del Sheets con 'SIN ARCHIVOS' y envía correo a redes@.
 */
function testSubirArchivosReal() {
  const id = 'MNT-2026-00001';  // ← CAMBIA por un ID real que esté en Sheets

  // Crear carpeta en Drive para ese ID
  const rootFolder = getOrCreateFolderByName('Mantenimientos');
  const folder = getOrCreateSubFolder(rootFolder, id);
  const folderUrl = folder.getUrl();
  console.log('Carpeta creada/encontrada: ' + folderUrl);

  // Actualizar columna I en Sheets
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0].toString().toUpperCase() === id.toUpperCase()) {
        sheet.getRange(i + 2, 9).setValue('TEST: ' + folderUrl);
        console.log('✅ Columna Archivos actualizada en fila ' + (i + 2));
        break;
      }
    }
  }

  // Enviar correo de notificación de archivos
  enviarNotificacionArchivos(id, folderUrl, 0);
  console.log('✅ Correo enviado a ' + EMAIL_EMPRESA);
}

/**
 * TEST 5: Crear un mantenimiento de prueba completo (sin archivos).
 * Crea una fila en Sheets y envía los correos, igual que si llegara una petición real.
 * Cambia el correo por el tuyo para verificar que llega.
 */
function testCrearMantenimiento() {
  const fakeData = {
    cedula_firmante: '99999999',
    persona_notifica: 'Prueba Completa',
    correo: 'tu_correo@gmail.com',  // ← CAMBIA ESTO
    tipo_mantenimiento: 'Electricidad',
    descripcion: 'Mantenimiento de prueba completo — verificación del sistema.'
  };
  const resultado = crearMantenimiento(fakeData);
  console.log('Resultado: ' + JSON.stringify(resultado));
  if (resultado.success) {
    console.log('✅ ID generado: ' + resultado.id);
    console.log('Revisa Sheets y tu correo.');
  }
}
