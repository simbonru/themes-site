// common helpers & initializers for all pages

// set years
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
document.getElementById('year2') && (document.getElementById('year2').textContent = new Date().getFullYear());
document.getElementById('year3') && (document.getElementById('year3').textContent = new Date().getFullYear());
document.getElementById('year4') && (document.getElementById('year4').textContent = new Date().getFullYear());

// BURGER MENU
(function(){
  const burger = document.querySelectorAll('#burger');
  const navs = document.querySelectorAll('#mainnav');
  burger.forEach(b => {
    b.addEventListener('click', () => {
      const nav = b.closest('.header-row').querySelector('#mainnav');
      const expanded = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('show');
    });
  });
})();

// MODALS (catalog)
(function(){
  const openBtns = document.querySelectorAll('.open-modal');
  const modals = document.querySelectorAll('#modals .modal');
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      const modal = document.getElementById(id);
      if(modal){
        modal.setAttribute('aria-hidden', 'false');
      }
    })
  });
  modals.forEach(m => {
    const close = m.querySelector('.close');
    close && close.addEventListener('click', () => m.setAttribute('aria-hidden','true'));
    m.addEventListener('click', (e) => {
      if(e.target === m) m.setAttribute('aria-hidden','true');
    });
  })
})();

// CS2 tournament form handler (demo)
function submitTourney(e){
  e.preventDefault();
  const f = e.target;
  const name = f.name.value || '—';
  const nick = f.nick.value || '—';
  alert(`Спасибо за запись!\nИмя: ${name}\nНик: ${nick}\n(Демо: регистрация не отправляется)`);
  f.reset();
  return false;
}

// Kaleidoscope fractal (draw to offscreen canvas and mirror)
(function(){
  const canvas = document.getElementById('fractal');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;

  // offscreen small canvas to compute fractal (lower res for perf)
  const off = document.createElement('canvas');
  const offCtx = off.getContext('2d');

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    // offscreen - quarter size (for kaleidoscope quality vs perf)
    off.width = Math.max(160, Math.floor(w/2));
    off.height = Math.max(160, Math.floor(h/2));
  }
  resize();
  addEventListener('resize', resize);

  function renderOff(){
    const img = offCtx.createImageData(off.width, off.height);
    const data = img.data;

    const t = Date.now() * 0.00012;
    const cx = -0.5 + Math.sin(t * 0.9) * 0.2;
    const cy = 0.0 + Math.cos(t * 0.6) * 0.2;
    const zoom = 1.2 + Math.sin(t * 0.3) * 0.45;
    const left = cx - (zoom * off.width / off.height);
    const right = cx + (zoom * off.width / off.height);
    const top = cy - zoom;
    const bottom = cy + zoom;
    const maxIter = 80 + Math.floor(30 * Math.abs(Math.sin(t*0.7)));

    for(let py=0; py<off.height; py++){
      const y0 = top + (py/off.height) * (bottom - top);
      for(let px=0; px<off.width; px++){
        const x0 = left + (px/off.width) * (right - left);
        let x = 0, y = 0, iter = 0;
        while (x*x + y*y <= 4 && iter < maxIter){
          const xt = x*x - y*y + x0;
          y = 2*x*y + y0;
          x = xt;
          iter++;
        }
        const idx = (py*off.width + px)*4;
        if(iter === maxIter){
          data[idx] = data[idx+1] = data[idx+2] = 6;
          data[idx+3] = 255;
        } else {
          const v = iter / maxIter;
          // green-blue kaleidoscope palette
          const r = Math.floor(Math.min(1, 4*(v-0.15)) * 90);
          const g = Math.floor(Math.min(1, 4*v) * 220);
          const b = Math.floor(Math.min(1, Math.max(0, 4*(v-0.4))) * 255);
          data[idx] = r;
          data[idx+1] = g;
          data[idx+2] = b;
          data[idx+3] = 255;
        }
      }
    }
    offCtx.putImageData(img, 0, 0);
  }

  function drawKaleido(){
    // clear main canvas
    ctx.clearRect(0,0,w,h);

    // positions to tile the offscreen canvas into four quadrants with mirroring
    const halfW = Math.ceil(w/2);
    const halfH = Math.ceil(h/2);

    // draw center scaled variants to create kaleidoscope feel
    // top-left
    ctx.save();
    ctx.translate(0,0);
    ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, halfW, halfH);
    ctx.restore();

    // top-right mirrored horizontally
    ctx.save();
    ctx.scale(-1,1);
    ctx.drawImage(off, 0, 0, off.width, off.height, -w, 0, halfW, halfH);
    ctx.restore();

    // bottom-left mirrored vertically
    ctx.save();
    ctx.scale(1,-1);
    ctx.drawImage(off, 0, 0, off.width, off.height, 0, -h, halfW, halfH);
    ctx.restore();

    // bottom-right mirrored both
    ctx.save();
    ctx.scale(-1,-1);
    ctx.drawImage(off, 0, 0, off.width, off.height, -w, -h, halfW, halfH);
    ctx.restore();

    // subtle overlay
    ctx.fillStyle = 'rgba(0,10,8,0.06)';
    ctx.fillRect(0,0,w,h);
  }

  // animate with throttling
  let raf = null;
  function loop(){
    renderOff();
    drawKaleido();
    raf = requestAnimationFrame(loop);
  }
  loop();
})();

// RUNNING ANIMALS (chickens and mice) - create and animate DOM SVGs
(function(){
  const layer = document.getElementById('anim-layer');
  if(!layer) return;

  const CHICKEN_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g>
    <ellipse cx="30" cy="36" rx="16" ry="10" fill="#ffe7a8"/>
    <circle cx="42" cy="28" r="6" fill="#ffe7a8"/>
    <polygon points="46,24 50,20 44,20" fill="#ffb85c"/>
    <circle cx="44" cy="26" r="1.6" fill="#2b2b2b"/>
    <ellipse cx="22" cy="40" rx="3" ry="1.8" fill="#ffcc66"/>
  </g>
</svg>`;

  const MOUSE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g>
    <ellipse cx="34" cy="36" rx="14" ry="9" fill="#cfcfcf"/>
    <circle cx="24" cy="28" r="4" fill="#cfcfcf"/>
    <circle cx="26" cy="27" r="1.2" fill="#2b2b2b"/>
    <path d="M18 38 Q8 36 10 30" stroke="#b3b3b3" stroke-width="1.2" fill="none"/>
  </g>
</svg>`;

  function rand(min,max){ return Math.random()*(max-min)+min }

  function spawn(type){
    const el = document.createElement('div');
    el.className = 'animal';
    el.innerHTML = type === 'ch' ? CHICKEN_SVG : MOUSE_SVG;
    // random start position (off-screen left or right)
    const fromLeft = Math.random() > 0.5;
    const startY = rand(8, 85); // vh
    const size = rand(36, 68); // px
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.top = startY + 'vh';
    el.style.left = (fromLeft ? '-10vw' : '110vw');
    layer.appendChild(el);

    const duration = rand(6, 14); // seconds
    const delay = 0;
    const endX = (fromLeft ? 110 : -10);

    // animate with JS (translate) to have consistent perf across browsers
    const start = performance.now() + delay*1000;
    function animate(now){
      const t = (now - start) / (duration*1000);
      if(t >= 1){
        // fade out and remove
        el.style.opacity = 0;
        setTimeout(()=> el.remove(), 400);
        return;
      }
      // easing
      const ease = t<0.5 ? 2*t*t : -1 + (4-2*t)*t;
      const curX = (fromLeft ? (-10 + (endX+10)*ease) : (110 - (110+10)*ease));
      el.style.transform = `translateX(${curX}vw)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // periodically spawn animals
  setInterval(() => {
    spawn(Math.random()>0.6 ? 'ch' : 'm');
  }, 1200);

  // also spawn a few on load
  for(let i=0;i<3;i++) spawn(i%2? 'ch':'m');
})();