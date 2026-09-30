/* =========================================================
   TISSU STUDIO — comportamento compartilhado (home + cursos)
   ========================================================= */

/* Links de compra: troque aqui e todos os botões com data-link são atualizados. */
const LINKS = {
  checkout: 'https://pay.hotmart.com/N107819938V?off=3g3c3yni&bid=179080069516' // Boneca Velvet (Hotmart)
};

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Links ---------- */
document.querySelectorAll('[data-link]').forEach((a) => {
  const url = LINKS[a.dataset.link];
  if (!url || url === '#') return;
  a.href = url;
  if (/^https?:\/\//.test(url)) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
});

/* ---------- Menu mobile ---------- */
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
  nav.classList.toggle('is-open', open);
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    toggle.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Entrada suave dos elementos ---------- */
const revealEls = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  // Pequeno escalonamento entre irmãos (listas, cards)
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (siblings.length > 1 && i > 0) el.style.transitionDelay = `${Math.min(i, 7) * 70}ms`;
    io.observe(el);
  });
}

/* ---------- Takes em vídeo: carregam e tocam só quando visíveis ---------- */
document.querySelectorAll('.take').forEach((wrap) => {
  const video = wrap.querySelector('video');
  const btn = wrap.querySelector('.take__toggle');
  if (!video) return;

  let userPaused = reduceMotion; // quem prefere menos movimento começa com o vídeo parado

  const load = () => {
    if (!video.getAttribute('src')) {
      video.preload = 'metadata';
      video.src = video.dataset.src;
    }
  };

  const sync = () => {
    if (!btn) return;
    btn.classList.toggle('is-paused', video.paused);
    btn.setAttribute('aria-label', video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        load();
        if (!userPaused) video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { rootMargin: '200px 0px' }).observe(wrap);
  } else {
    load();
  }

  btn?.addEventListener('click', () => {
    load();
    if (video.paused) {
      userPaused = false;
      video.play().catch(() => {});
    } else {
      userPaused = true;
      video.pause();
    }
  });

  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
});

/* ---------- Copiar cupom ---------- */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  const label = btn.querySelector('.coupon__action');
  const original = label ? label.textContent : '';
  btn.addEventListener('click', async () => {
    const code = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const tmp = document.createElement('textarea');
      tmp.value = code;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
    }
    btn.classList.add('is-copied');
    if (label) label.textContent = 'Copiado!';
    setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = original;
    }, 2200);
  });
});

/* ---------- Ano no rodapé ---------- */
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
