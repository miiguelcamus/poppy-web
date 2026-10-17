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

// Badge "Abierto ahora" según el horario real (hora de Madrid)
(function(){
  const badges=document.querySelectorAll('[data-open-badge]');
  if(!badges.length)return;
  const hours={1:[570,810],2:[570,810],3:[570,810],4:[570,810],5:[570,810],6:[600,810]}; // minutos desde 0:00
  const fmt=m=>Math.floor(m/60)+':'+String(m%60).padStart(2,'0');
  const names=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function now(){
    const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const get=t=>p.find(x=>x.type===t).value;
    const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[get('weekday')];
    return {day,min:parseInt(get('hour'),10)*60+parseInt(get('minute'),10)};
  }
  function state(){
    const {day,min}=now(),h=hours[day];
    if(h&&min>=h[0]&&min<h[1])return {open:true,text:'Abierto ahora · hasta las '+fmt(h[1])};
    if(h&&min<h[0])return {open:false,text:'Cerrado ahora · abre hoy a las '+fmt(h[0])};
    for(let i=1;i<=7;i++){
      const d=(day+i)%7;
      if(hours[d])return {open:false,text:'Cerrado ahora · abre '+(i===1?'mañana':'el '+names[d])+' a las '+fmt(hours[d][0])};
    }
    return {open:false,text:'Cerrado ahora'};
  }
  function paint(){
    const s=state();
    badges.forEach(b=>{b.textContent=s.text;b.classList.toggle('is-open',s.open);b.classList.toggle('is-closed',!s.open);});
  }
  paint();setInterval(paint,60000);
})();
