const DESTINATARIO = 'miiguelcamus@gmail.com';

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    const required = ['Nombre del cliente', 'Email de contacto', 'Nombre del perro', 'Servicio solicitado', 'Consentimiento de contacto'];
    for (const field of required) {
      if (!p[field] || !String(p[field]).trim()) {
        return ContentService.createTextOutput('Faltan campos obligatorios.');
      }
    }
    if (p['Consentimiento de contacto'] !== 'Aceptado') {
      return ContentService.createTextOutput('No se ha aceptado el consentimiento de contacto.');
    }

    const subject = 'Nueva solicitud de cita — Puppy';
    const fields = [
      ['Nombre del cliente', 'Nombre del cliente'],
      ['Email de contacto', 'Correo del cliente'],
      ['Teléfono', 'Teléfono'],
      ['Nombre del perro', 'Nombre del perro'],
      ['Servicio solicitado', 'Servicio solicitado'],
      ['Tamaño del perro', 'Tamaño del perro'],
      ['Fecha preferida (orientativa)', 'Fecha preferida'],
      ['Franja horaria preferida', 'Franja horaria preferida'],
      ['Detalles adicionales', 'Detalles adicionales'],
      ['Consentimiento de contacto', 'Consentimiento de contacto']
    ];
    const body = 'Se ha recibido una nueva solicitud de cita desde la web de Puppy.\n\n' +
      fields.map(([key, label]) => label + ': ' + (p[key] || 'No indicado')).join('\n') +
      '\n\nLa fecha y la hora solicitadas son orientativas; la cita queda pendiente de confirmación.';

    MailApp.sendEmail({
      to: DESTINATARIO,
      subject: subject,
      body: body,
      replyTo: String(p['Email de contacto']).trim()
    });
    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('ERROR');
  }
}
