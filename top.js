// ========== TOP.JS — Топ скидок v3 ==========

let data = [];
let searchQuery = '';

async function loadData() {
  const res = await fetch('coupons_data.json');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  data = await res.json();
  renderCards();
}

function getDiscount(name) { const m = (name||'').match(/(\d+)\s*%/); return m ? parseInt(m[1]) : 0; }
function badgeClass(d) { if (d >= 50) return ''; if (d >= 25) return 'gold'; return 'green'; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function getSorted() {
  const filtered = data.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.merchant.toLowerCase().includes(q);
  });
  return filtered.sort((a, b) => getDiscount(b.name) - getDiscount(a.name));
}

function renderCards() {
  searchQuery = (document.getElementById('search-input')||{}).value ? document.getElementById('search-input').value.trim() : '';
  const items = getSorted().slice(0, 60);
  const grid = document.getElementById('card-grid');
  const count = document.getElementById('count');
  if (!grid) return;
  if (count) count.textContent = `${t('found')} ${items.length}`;

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;"><p style="font-size:2.5rem;">🔍</p><p style="margin-top:8px;font-weight:600;">${t('no_results')}</p></div>`;
    return;
  }

  let html = '';
  items.forEach((c, i) => {
    const d = getDiscount(c.name);
    const badge = d > 0 ? `<span class="discount-badge ${badgeClass(d)}">−${d}%</span>` : '';
    const delay = Math.min(i,8)*.03;

    html += `
    <article class="card" style="animation:fadeIn .25s ease ${delay}s backwards">
      <div class="card-header">
        <div class="card-logo">${c.logo ? `<img src="${esc(c.logo)}" alt="" loading="lazy" onerror="this.style.display='none'" />` : `<span class="no-logo">${(c.merchant||'?')[0].toUpperCase()}</span>`}</div>
        <a href="index.html?merchant=${encodeURIComponent(c.merchant)}" class="card-merchant card-merchant-link">${esc(c.merchant)}</a>
        ${badge}
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(c.name)}</h3>
        ${c.desc && c.desc !== c.name ? `<p class="card-desc">${esc(c.desc)}</p>` : ''}
      </div>
      <div class="card-footer">
        ${c.finish ? `<span class="expire">${t('until_word')} ${c.finish.slice(0,10)}</span>` : '<span></span>'}
        <button class="cta-btn cta-primary" data-goto="${esc(c.id)}">${t('get_btn')}</button>
      </div>
    </article>`;
  });
  grid.innerHTML = html;
}

// Event delegation for "Получить" buttons
document.addEventListener('click', function(e) {
  const gotoBtn = e.target.closest('[data-goto]');
  if (gotoBtn) {
    const id = gotoBtn.dataset.goto;
    const c = data.find(d => d.id === id);
    if (c) window.open(c.url_code || c.url, '_blank');
  }
});

// Search
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', renderCards);
}

// При смене языка перерисовать карточки
document.addEventListener('langchange', () => { if (data.length) { try { renderCards(); } catch(e){} } });

loadData().catch(e => console.error('top load:', e));
