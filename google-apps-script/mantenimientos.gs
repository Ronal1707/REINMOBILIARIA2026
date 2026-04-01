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
 *    A: ID | B: Fecha | C: Persona que notifica | D: Dirección | E: Nombre arrendatario
 *    F: Documento arrendatario | G: Teléfono | H: Correo | I: Tipo de mantenimiento
 *    J: Descripción | K: Estado | L: Archivos | M: Observaciones
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
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
const SHEET_NAME = 'Mantenimientos';
const EMAIL_EMPRESA = 'info@reinmobiliariasas.com';

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

  // Guardar archivos en Google Drive (si los hay)
  let archivosUrls = '';
  if (data.archivos) {
    try {
      let archivos = typeof data.archivos === 'string' ? JSON.parse(data.archivos) : data.archivos;
      const folder = getOrCreateFolder('Mantenimientos_RE/' + id);
      const urls = [];

      archivos.forEach(function(archivo) {
        try {
          const blob = Utilities.newBlob(
            Utilities.base64Decode(archivo.data),
            archivo.type,
            archivo.name
          );
          const file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          urls.push(file.getUrl());
        } catch (e) {
          // Continuar si un archivo falla
        }
      });

      archivosUrls = urls.join(', ');
    } catch (e) {
      archivosUrls = 'Error al procesar archivos';
    }
  }

  // Agregar fila a la hoja
  sheet.appendRow([
    id,
    fecha,
    data.persona_notifica || '',
    data.direccion || '',
    data.nombre_arrendatario || '',
    data.documento_arrendatario || '',
    data.telefono || '',
    data.correo || '',
    data.tipo_mantenimiento || '',
    data.descripcion || '',
    'Pendiente',
    archivosUrls,
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

  const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toString().toUpperCase() === id.toUpperCase()) {
      return {
        success: true,
        data: {
          id: data[i][0],
          fecha: data[i][1],
          persona_notifica: data[i][2],
          direccion: data[i][3],
          nombre_arrendatario: data[i][4],
          documento_arrendatario: data[i][5],
          telefono: data[i][6],
          correo: data[i][7],
          tipo_mantenimiento: data[i][8],
          descripcion: data[i][9],
          estado: data[i][10],
          observaciones: data[i][12]
        }
      };
    }
  }

  return { success: false, error: 'No se encontró la solicitud con ID: ' + id };
}

/**
 * Obtiene o crea una carpeta en Google Drive
 */
function getOrCreateFolder(path) {
  const parts = path.split('/');
  let folder = DriveApp.getRootFolder();

  parts.forEach(function(name) {
    const folders = folder.getFoldersByName(name);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = folder.createFolder(name);
    }
  });

  return folder;
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

            <p>Guarde este ID para consultar el estado de su solicitud en cualquier momento desde nuestra página web.</p>

            <div class="detail">
              <span class="label">Estado:</span>
              <span class="value"><span class="status">Pendiente</span></span>
            </div>
            <div class="detail">
              <span class="label">Fecha:</span>
              <span class="value">${fecha}</span>
            </div>
            <div class="detail">
              <span class="label">Tipo:</span>
              <span class="value">${data.tipo_mantenimiento}</span>
            </div>
            <div class="detail">
              <span class="label">Dirección:</span>
              <span class="value">${data.direccion}</span>
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
 * Envía notificación interna a la empresa
 */
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
        <div class="detail"><span class="label">Persona que notifica:</span> ${data.persona_notifica}</div>
        <div class="detail"><span class="label">Arrendatario:</span> ${data.nombre_arrendatario}</div>
        <div class="detail"><span class="label">Documento:</span> ${data.documento_arrendatario}</div>
        <div class="detail"><span class="label">Dirección:</span> ${data.direccion}</div>
        <div class="detail"><span class="label">Teléfono:</span> ${data.telefono}</div>
        <div class="detail"><span class="label">Correo:</span> ${data.correo}</div>
        <div class="detail"><span class="label">Tipo:</span> ${data.tipo_mantenimiento}</div>
        <div class="detail"><span class="label">Descripción:</span> ${data.descripcion}</div>

        <p style="margin-top: 20px;">
          <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}"
             style="background: #e56d11; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver en Google Sheets
          </a>
        </p>
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
