/* ─── State ──────────────────────────────────────────────────── */
let activeFilter = 'tous';
let searchQuery  = '';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0ee"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="12" font-family="sans-serif"%3EImage manquante%3C/text%3E%3C/svg%3E';

/* ─── DOM ────────────────────────────────────────────────────── */
const grid          = document.getElementById('product-grid');
const countLabel    = document.getElementById('count-label');
const emptyState    = document.getElementById('empty-state');
const searchInput   = document.getElementById('search-input');
const modalOverlay  = document.getElementById('modal-overlay');
const modal         = document.getElementById('modal');
const filterBtns    = document.querySelectorAll('.filter-btn');

/* ─── Filter logic ───────────────────────────────────────────── */
function matchesFilter(p) {
  if (activeFilter === 'tous')     return true;
  if (activeFilter === 'securite') return p.category === 'Sécurité';
  if (activeFilter === 'travail')  return p.category === 'Travail';
  if (activeFilter === 'abarth')   return p.brand === 'ABARTH';
  if (activeFilter === 'dunlop')   return p.brand === 'DUNLOP';
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

function filtered() {
  return PRODUCTS.filter(p => matchesFilter(p) && matchesSearch(p));
}

/* ─── Render ─────────────────────────────────────────────────── */
function badgeClass(category) {
  return category === 'Sécurité' ? 'badge-securite' : 'badge-travail';
}

function renderCards() {
  const list = filtered();
  grid.innerHTML = '';

  if (list.length === 0) {
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

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
        <span class="card-category-badge ${badgeClass(p.category)}">${p.category}</span>
      </div>
      <div class="card-body">
        <div class="card-ref">${p.ref}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-meta">
          <div class="card-sizes"><strong>T.</strong> ${p.sizes}</div>
          <div class="card-price-ht">${p.price_ht}<span>HT</span></div>
        </div>
      </div>`;

    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(p); });
    grid.appendChild(card);
  });
}

/* ─── Modal ──────────────────────────────────────────────────── */
function getBrandLogo(brand) {
  if (brand === 'ABARTH') return '<img src="logo-abarth.svg" alt="Abarth" onerror="this.style.display=\'none\'">';
  if (brand === 'DUNLOP') return '<img src="logo-dunlop.svg" alt="Dunlop" onerror="this.style.display=\'none\'">';
  return '';
}

function openModal(p) {
  const ttc = p.price_ttc && p.price_ttc.trim() !== '' ? p.price_ttc : 'À renseigner';

  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-brand">
        ${getBrandLogo(p.brand)}
        <span class="modal-header-brand-name">${p.brand}</span>
      </div>
      <button class="modal-close" id="modal-close-btn" aria-label="Fermer">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
        </svg>
      </button>
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

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Events ─────────────────────────────────────────────────── */
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderCards();
  });
});

searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  renderCards();
});

document.getElementById('print-btn').addEventListener('click', () => window.print());

/* ─── Nav scroll ─────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });

/* ─── Init ───────────────────────────────────────────────────── */
renderCards();
