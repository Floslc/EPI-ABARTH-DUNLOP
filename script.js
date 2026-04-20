/* ─── State ──────────────────────────────────────────────────── */
let activeCat    = '';   // '' | 'securite' | 'travail'
let activeBrand  = '';   // '' | 'abarth'  | 'dunlop'
let activeType   = '';   // '' | 'montante'| 'basse'
let activeSize   = '';   // '' | '36'..'50'
let searchQuery  = '';
let currentIndex = 0;

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0ee"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="12" font-family="sans-serif"%3EImage manquante%3C/text%3E%3C/svg%3E';

/* ─── DOM ────────────────────────────────────────────────────── */
const grid          = document.getElementById('product-grid');
const countLabel    = document.getElementById('count-label');
const emptyState    = document.getElementById('empty-state');
const searchInput   = document.getElementById('search-input');
const sizeSelect    = document.getElementById('size-select');
const modalOverlay  = document.getElementById('modal-overlay');
const modal         = document.getElementById('modal');
const filterToggle  = document.getElementById('filter-toggle');
const filterBadge   = document.getElementById('filter-badge');
const activeChips   = document.getElementById('active-chips');
const drawer        = document.getElementById('filter-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');

/* ─── Filter logic ───────────────────────────────────────────── */
function matchesFilter(p) {
  if (activeCat === 'securite'  && p.category  !== 'Sécurité')  return false;
  if (activeCat === 'travail'   && p.category  !== 'Travail')    return false;
  if (activeBrand === 'abarth'  && p.brand     !== 'ABARTH')     return false;
  if (activeBrand === 'dunlop'  && p.brand     !== 'DUNLOP')     return false;
  if (activeType === 'montante' && p.shoe_type !== 'Montante')   return false;
  if (activeType === 'basse'    && p.shoe_type !== 'Basse')      return false;
  return true;
}

function matchesSearch(p) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return (
    p.name.toLowerCase().includes(q) ||
    p.ref.toLowerCase().includes(q)  ||
    p.family.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q)
  );
}

function matchesSize(p) {
  if (!activeSize) return true;
  const size = parseInt(activeSize, 10);
  const parts = p.sizes.split('-');
  if (parts.length !== 2) return false;
  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  return size >= min && size <= max;
}

function filtered() {
  return PRODUCTS.filter(p => matchesFilter(p) && matchesSearch(p) && matchesSize(p));
}

/* ─── Render ─────────────────────────────────────────────────── */
function badgeClass(category) {
  return category === 'Sécurité' ? 'badge-securite' : 'badge-travail';
}

function renderCards() {
  const list = filtered();
  // Remove only cards, keep emptyState out of the way
  Array.from(grid.children).forEach(c => { if (c !== emptyState) c.remove(); });

  if (list.length === 0) {
    grid.appendChild(emptyState);
    emptyState.style.display = 'block';
    countLabel.innerHTML = '<strong>0</strong> produit';
    return;
  }
  emptyState.style.display = 'none';
  countLabel.innerHTML = `<strong>${list.length}</strong> produit${list.length > 1 ? 's' : ''}`;

  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', p.name);
    card.style.animationDelay = `${i * 0.03}s`;

    const brandLogoFile = `logo-${p.brand.toLowerCase()}.png`;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img class="card-product-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
        <span class="card-category-badge ${badgeClass(p.category)}">${p.category}</span>
        <div class="card-brand-logo">
          <img src="${brandLogoFile}" alt="${p.brand}" onerror="this.parentElement.style.display='none'">
        </div>
      </div>
      <div class="card-body">
        <div class="card-ref">${p.ref}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-meta">
          <div class="card-sizes"><strong>T.</strong> ${p.sizes}</div>
          <div class="card-price-ht">${p.price_ht}<span>HT</span></div>
        </div>
      </div>`;

    card.addEventListener('click', () => openModal(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(i); });
    grid.appendChild(card);
  });
}

/* ─── Modal ──────────────────────────────────────────────────── */
function getBrandLogo(brand) {
  if (brand === 'ABARTH') return '<img src="logo-abarth.png" alt="Abarth" onerror="this.style.display=\'none\'">';
  if (brand === 'DUNLOP') return '<img src="logo-dunlop.png" alt="Dunlop" onerror="this.style.display=\'none\'">';
  return '';
}

function renderModal(idx) {
  const list = filtered();
  if (!list.length) return;
  currentIndex = Math.max(0, Math.min(idx, list.length - 1));
  const p   = list[currentIndex];
  const ttc = p.price_ttc && p.price_ttc.trim() !== '' ? p.price_ttc : 'À renseigner';
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < list.length - 1;

  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-brand">
        ${getBrandLogo(p.brand)}
        <span class="modal-header-brand-name">${p.brand}</span>
      </div>
      <div class="modal-header-right">
        <div class="modal-nav">
          <button class="modal-nav-btn" id="modal-prev" aria-label="Précédent" ${hasPrev ? '' : 'disabled'}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7.5,2 3.5,6 7.5,10"/>
            </svg>
          </button>
          <span class="modal-nav-count">${currentIndex + 1} / ${list.length}</span>
          <button class="modal-nav-btn" id="modal-next" aria-label="Suivant" ${hasNext ? '' : 'disabled'}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4.5,2 8.5,6 4.5,10"/>
            </svg>
          </button>
        </div>
        <button class="modal-close" id="modal-close-btn" aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-img-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='${FALLBACK_IMG}'">
      </div>
      <div class="modal-info">
        <div>
          <div class="modal-name">${p.name}</div>
          <div class="modal-ref">${p.ref}</div>
        </div>
        <div class="modal-tags">
          <span class="modal-tag">${p.brand}</span>
          <span class="modal-tag">${p.family}</span>
          <span class="modal-tag">${p.category}</span>
        </div>
        <div class="modal-specs">
          <div class="modal-spec-row">
            <div class="modal-spec-label">Référence</div>
            <div class="modal-spec-value ref-val">${p.ref}</div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Pointures</div>
            <div class="modal-spec-value">${p.sizes}</div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Prix HT</div>
            <div class="modal-spec-value price">${p.price_ht}<span class="price-note">HT</span></div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Prix TTC</div>
            <div class="modal-spec-value price-ttc">${ttc}</div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Marque</div>
            <div class="modal-spec-value">${p.brand}</div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Famille</div>
            <div class="modal-spec-value">${p.family}</div>
          </div>
          <div class="modal-spec-row">
            <div class="modal-spec-label">Catégorie</div>
            <div class="modal-spec-value">${p.category}</div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-prev').addEventListener('click', () => renderModal(currentIndex - 1));
  document.getElementById('modal-next').addEventListener('click', () => renderModal(currentIndex + 1));
}

/* Swipe tactile — attaché une seule fois sur l'overlay */
let _touchStartX = 0;
modalOverlay.addEventListener('touchstart', e => {
  _touchStartX = e.touches[0].clientX;
}, { passive: true });
modalOverlay.addEventListener('touchend', e => {
  if (!modalOverlay.classList.contains('open')) return;
  const dx = e.changedTouches[0].clientX - _touchStartX;
  if (Math.abs(dx) < 44) return;
  const list = filtered();
  if (dx < 0 && currentIndex < list.length - 1) renderModal(currentIndex + 1);
  if (dx > 0 && currentIndex > 0)               renderModal(currentIndex - 1);
}, { passive: true });

function openModal(idx) {
  renderModal(idx);
  modalOverlay.classList.add('open');
  lockScroll();
}

function closeModal() {
  const m = document.getElementById('modal');
  if (m) m.classList.add('closing');
  modalOverlay.classList.add('closing');
  setTimeout(() => {
    modalOverlay.classList.remove('open', 'closing');
    if (m) m.classList.remove('closing');
    unlockScroll();
  }, 270);
}

/* ─── Chips & badge ─────────────────────────────────────────── */
const CHIP_LABELS = {
  cat:   { securite: 'Sécurité', travail: 'Travail' },
  brand: { abarth: 'ABARTH', dunlop: 'DUNLOP' },
  type:  { montante: 'Montantes', basse: 'Basses' }
};

function updateChips() {
  const active = [
    activeCat   ? { group: 'cat',   value: activeCat,   label: CHIP_LABELS.cat[activeCat] }   : null,
    activeBrand ? { group: 'brand', value: activeBrand, label: CHIP_LABELS.brand[activeBrand] } : null,
    activeType  ? { group: 'type',  value: activeType,  label: CHIP_LABELS.type[activeType] }  : null,
  ].filter(Boolean);

  const count = active.length;
  filterBadge.textContent = count;
  filterBadge.hidden = count === 0;
  filterToggle.classList.toggle('has-active', count > 0);

  activeChips.innerHTML = active.map(c => `
    <span class="chip">
      ${c.label}
      <button class="chip-remove" data-group="${c.group}" aria-label="Retirer ${c.label}">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
        </svg>
      </button>
    </span>`).join('');

  activeChips.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.dataset.group;
      if (g === 'cat')   activeCat   = '';
      if (g === 'brand') activeBrand = '';
      if (g === 'type')  activeType  = '';
      syncDrawerButtons();
      updateChips();
      renderCards();
    });
  });
}

/* ─── Scroll lock (iOS-compatible) ───────────────────────────── */
let _scrollLockCount = 0;
let _savedScrollY = 0;

function lockScroll() {
  if (_scrollLockCount === 0) {
    _savedScrollY = window.scrollY;
    document.body.style.overflow  = 'hidden';
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${_savedScrollY}px`;
    document.body.style.width     = '100%';
  }
  _scrollLockCount++;
}
function unlockScroll() {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount === 0) {
    document.body.style.overflow  = '';
    document.body.style.position  = '';
    document.body.style.top       = '';
    document.body.style.width     = '';
    window.scrollTo(0, _savedScrollY);
  }
}

/* ─── Drawer ─────────────────────────────────────────────────── */
function openDrawer() {
  syncDrawerButtons();             // always in sync when opening
  drawer.classList.add('open');
  drawerOverlay.classList.add('open');
  lockScroll();
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  unlockScroll();
}

function syncDrawerButtons() {
  drawer.querySelectorAll('.drawer-opt').forEach(btn => {
    const g = btn.dataset.group, v = btn.dataset.value;
    const state = g === 'cat' ? activeCat : g === 'brand' ? activeBrand : activeType;
    btn.classList.toggle('active', v === state);
  });
}

filterToggle.addEventListener('click', openDrawer);

// close on overlay — handle both click and touchend for iOS reliability
function overlayClose(e) {
  e.preventDefault();
  closeDrawer();
}
drawerOverlay.addEventListener('click', overlayClose);
drawerOverlay.addEventListener('touchend', overlayClose, { passive: false });

document.getElementById('drawer-close').addEventListener('click', closeDrawer);

document.getElementById('drawer-reset').addEventListener('click', () => {
  activeCat = ''; activeBrand = ''; activeType = '';
  syncDrawerButtons();
  updateChips();
  renderCards();
});

drawer.querySelectorAll('.drawer-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const g = btn.dataset.group, v = btn.dataset.value;
    if (g === 'cat')   activeCat   = v;
    if (g === 'brand') activeBrand = v;
    if (g === 'type')  activeType  = v;
    syncDrawerButtons();
    updateChips();
    renderCards();
  });
});

/* ─── Events ─────────────────────────────────────────────────── */
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (drawer.classList.contains('open')) { closeDrawer(); return; }
    closeModal();
    return;
  }
  if (!modalOverlay.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  renderModal(currentIndex - 1);
  if (e.key === 'ArrowRight') renderModal(currentIndex + 1);
});

searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  renderCards();
});

sizeSelect.addEventListener('change', e => {
  activeSize = e.target.value;
  sizeSelect.classList.toggle('active', activeSize !== '');
  renderCards();
});

document.getElementById('print-btn').addEventListener('click', () => window.print());

/* ─── Loader ─────────────────────────────────────────────────── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.classList.add('loading');

  function dismissLoader() {
    loader.classList.add('hide');
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), 650);
  }

  // Dismiss after animations complete (~1.8s) or on window load, whichever is later
  const minDelay = 1800;
  const start = Date.now();

  function onReady() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDelay - elapsed);
    setTimeout(dismissLoader, remaining);
  }

  if (document.readyState === 'complete') {
    onReady();
  } else {
    window.addEventListener('load', onReady, { once: true });
    // Safety fallback
    setTimeout(dismissLoader, 4000);
  }
})();

/* ─── Nav scroll ─────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });

/* ─── Init ───────────────────────────────────────────────────── */
updateChips();
renderCards();
