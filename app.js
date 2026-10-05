/* Solve — motion enhances a complete, readable document. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isReduced = () => systemMotion.matches;
const video = $('#hero-video');
const videoToggle = $('#video-toggle');
let userPausedVideo = false;
let videoVisible = true;
const syncVideoButton = () => {
  videoToggle.classList.toggle('is-paused', video.paused);
  videoToggle.setAttribute('aria-label', video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  $('.video-label', videoToggle).textContent = video.paused ? 'Ver filme' : 'Pausar filme';
};
const playVideo = () => video.play().catch(syncVideoButton);
video.addEventListener('play', syncVideoButton);
video.addEventListener('pause', syncVideoButton);
videoToggle.addEventListener('click', () => {
  if (video.paused) { userPausedVideo = false; playVideo(); }
  else { userPausedVideo = true; video.pause(); }
});
new IntersectionObserver(([entry]) => {
  videoVisible = entry.isIntersecting;
  if (!videoVisible) video.pause();
  else if (!userPausedVideo && !isReduced() && !document.hidden) playVideo();
}, { threshold: .05 }).observe($('.hero'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
  else if (videoVisible && !userPausedVideo && !isReduced()) playVideo();
});
syncVideoButton();

/* Navigation stays native; no scroll interception. */
const menuToggle = $('.menu-toggle');
const menu = $('.mobile-menu');
const setMenu = (open, restoreFocus = false) => {
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
  $('main').inert = open;
  if (restoreFocus) menuToggle.focus();
};
menuToggle.addEventListener('click', () => setMenu(menu.hidden));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
  if (e.key === 'Tab' && !menu.hidden) {
    const items = [menuToggle, ...$$('a', menu)];
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
  }
});
matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
let framePending = false;
const updatePageProgress = () => {
  const full = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress').style.transform = `scaleX(${full > 0 ? scrollY / full : 0})`;
  $('.site-header').classList.toggle('is-scrolled', scrollY > 150);
  framePending = false;
};
addEventListener('scroll', () => { if (!framePending) { framePending = true; requestAnimationFrame(updatePageProgress); } }, { passive: true });
updatePageProgress();

/* Accessible service disclosures, with a connected visual. */
const specialtyItems = $$('.specialty');
let imageTimer;
specialtyItems.forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  specialtyItems.forEach(other => { if (other !== item) other.open = false; });
  clearTimeout(imageTimer);
  const image = $('#specialty-image');
  const update = () => {
    image.src = item.dataset.image;
    image.alt = `${$('h3', item).textContent} — estrutura da Solve`;
    $('#specialty-caption').textContent = item.dataset.caption;
    image.style.opacity = '1';
  };
  if (isReduced()) update();
  else { image.style.opacity = '.35'; imageTimer = setTimeout(update, 160); }
}));

/* A real lightbox: native dialog handles focus and Escape. */
const gallery = [
  { src: 'assets/reception.webp', alt: 'Recepção ampla e iluminada da Solve', name: 'Recepção' },
  { src: 'assets/treatment.webp', alt: 'Consultório odontológico da Solve', name: 'Consultório' },
  { src: 'assets/lab-work.webp', alt: 'Laboratório próprio de próteses da Solve', name: 'Solve Digital Lab' }
];
const dialog = $('#gallery-dialog');
let galleryIndex = 0;
const renderGallery = () => {
  const item = gallery[galleryIndex];
  $('.dialog-image', dialog).src = item.src;
  $('.dialog-image', dialog).alt = item.alt;
  $('.gallery-status', dialog).textContent = `${galleryIndex + 1} de ${gallery.length} · ${item.name}`;
};
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  galleryIndex = Number(button.dataset.gallery); renderGallery();
  dialog.showModal(); document.body.style.overflow = 'hidden';
}));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
const shiftGallery = delta => { galleryIndex = (galleryIndex + delta + gallery.length) % gallery.length; renderGallery(); };
$('.gallery-prev').addEventListener('click', () => shiftGallery(-1));
$('.gallery-next').addEventListener('click', () => shiftGallery(1));
dialog.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); shiftGallery(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); shiftGallery(-1); } });

/* Scrollcraft: cinematic reveal, staggered text and three spatial planes. */
let motionContext;
let motionMedia;
const prepareWords = element => {
  if (element.dataset.split) return;
  element.dataset.split = 'true';
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part.trim()) fragment.append(document.createTextNode(part));
      else { const span = document.createElement('span'); span.className = 'reveal-word'; span.textContent = part; fragment.append(span); }
    });
    node.replaceWith(fragment);
  });
};
const setupMotion = () => {
  if (motionMedia) { motionMedia.revert(); motionMedia = null; }
  if (motionContext) { motionContext.revert(); motionContext = null; }
  document.documentElement.classList.toggle('motion-reduced', isReduced());
  document.documentElement.classList.remove('lab-motion');
  if (isReduced()) { video.pause(); syncVideoButton(); return; }
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  motionContext = gsap.context(() => {
    if (scrollY < 100) gsap.from('.hero-content > *', { y: 25, opacity: 0, duration: 1.2, stagger: .15, ease: 'power3.out', clearProps: 'opacity,transform' });
    $$('.reveal').forEach(el => gsap.from(el, { y: 34, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 93%', once: true }, clearProps: 'opacity,transform' }));
    $$('.statement, .manifesto-text').forEach(el => {
      prepareWords(el);
      gsap.fromTo($$('.reveal-word', el), { opacity: .22 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 83%', end: 'bottom 52%', scrub: .6 } });
    });
    $$('.image-reveal').forEach(el => gsap.from(el, { clipPath: 'inset(10% 4% 10% 4%)', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', end: 'center 55%', scrub: 1 } }));
  });
  motionMedia = gsap.matchMedia();
  motionMedia.add('(min-width: 761px)', () => {
    document.documentElement.classList.add('lab-motion');
    gsap.to('.hero-media video', { yPercent: 12, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
    $$('[data-parallax]').forEach(el => gsap.fromTo(el, { y: 35 }, { y: Number(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: '.intro-composition', start: 'top bottom', end: 'bottom top', scrub: .8 } }));
    gsap.fromTo('.gallery-small', { y: 65 }, { y: -25, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'center top', scrub: 1 } });
    const cards = $$('.lab-card');
    gsap.set(cards[1], { yPercent: 135, rotate: 8, scale: .96 });
    gsap.set(cards[2], { yPercent: 145, rotate: -7, scale: .96 });
    const timeline = gsap.timeline({ scrollTrigger: {
      trigger: '.lab-scroll', start: 'top top', end: 'bottom bottom', scrub: 1,
      onUpdate: self => {
        const active = self.progress < .34 ? 0 : self.progress < .77 ? 1 : 2;
        $$('.lab-step').forEach((step, i) => step.classList.toggle('active', i === active));
      }
    }});
    timeline.to({}, { duration: .25 })
      .to(cards[0], { scale: .92, rotate: -4, y: -18, duration: 1, ease: 'none' }, .25)
      .to(cards[1], { yPercent: 0, rotate: 0, scale: 1, duration: 1, ease: 'none' }, .25)
      .to(cards[0], { scale: .86, rotate: -7, y: -38, duration: 1, ease: 'none' }, 1.5)
      .to(cards[1], { scale: .94, rotate: 4, y: -19, duration: 1, ease: 'none' }, 1.5)
      .to(cards[2], { yPercent: 0, rotate: 0, scale: 1, duration: 1, ease: 'none' }, 1.5)
      .to({}, { duration: .3 });
    gsap.to('.lab-progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.lab-scroll', start: 'top top', end: 'bottom bottom', scrub: true } });
    return () => document.documentElement.classList.remove('lab-motion');
  });
  ScrollTrigger.refresh();
};
systemMotion.addEventListener('change', setupMotion);
setupMotion();
if (document.fonts) document.fonts.ready.then(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); updatePageProgress(); });

/* Fine pointer accent preserves the system cursor and hit targets. */
const halo = $('.cursor-halo');
if (matchMedia('(pointer: fine)').matches) {
  halo.classList.add('cursor-active');
  document.addEventListener('pointermove', e => {
    if (isReduced()) return;
    const target = e.target.closest('a,button,summary');
    const galleryTarget = e.target.closest('.gallery-button');
    halo.classList.toggle('over-interactive', !!target);
    halo.classList.toggle('over-gallery', !!galleryTarget);
    halo.style.opacity = '1';
    halo.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { halo.style.opacity = '0'; });
}
