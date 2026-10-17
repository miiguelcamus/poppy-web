const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.navlinks');
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');
  }));
}
const appointmentForm=document.querySelector('#appointment-form');
if(appointmentForm){
  const dateInput=appointmentForm.querySelector('input[type="date"]');
  if(dateInput){
    const today=new Date();
    const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
    dateInput.min=localToday;
  }
  appointmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const endpoint = appointmentForm.dataset.endpoint?.trim();
    const status = document.querySelector('#form-status');
    const submitButton = appointmentForm.querySelector('button[type="submit"]');
    if (!endpoint || endpoint.includes('PEGA_AQUI')) {
      status.textContent = 'Falta configurar el envío de correo. Sigue el archivo LEEME-CONFIGURACION-CORREO.txt incluido en la web.';
      status.classList.add('error');
      return;
    }
    if (!appointmentForm.reportValidity()) return;
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Enviando solicitud…</span>';
    status.textContent = 'Enviando tu solicitud…';
    status.classList.remove('error', 'success');
    try {
      // Apps Script recibe los campos como formulario y envía el correo desde Google.
      // no-cors evita bloqueos CORS; la confirmación se muestra tras completar la petición.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(appointmentForm))
      });
      status.textContent = 'Solicitud enviada. Gracias; contactaremos contigo para confirmar la cita.';
      status.classList.add('success');
      appointmentForm.reset();
      if (dateInput) {
        const today = new Date();
        dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      }
    } catch (error) {
      status.textContent = 'No se ha podido enviar. Comprueba tu conexión e inténtalo de nuevo o contacta directamente con el negocio.';
      status.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
}
