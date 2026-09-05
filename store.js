// ========== STORE.JS — Страница магазина ==========

let data = [];
let merchant = '';

async function load() {
  const res = await fetch('coupons_data.json');
  if (!res.ok) return;
  data = await res.json();

  // Читаем merchant из URL: /store.html?merchant=auchan.ru
  merchant = decodeURIComponent(new URLSearchParams(window.location.search).get('merchant') || '');
  if (!merchant) { window.location.href = 'index.html'; return; }

  renderStore();
}

function renderStore() {
  const coupons = data.filter(c => c.merchant === merchant);
  const logo = coupons[0]?.logo || '';

  // Заголовок страницы
  document.getElementById('page-title').textContent = `${merchant} — ${t('store_title_suffix')} | Код купона`;
  document.getElementById('store-name').textContent = merchant;
  document.getElementById('store-info').textContent = `${coupons.length} ${t('active_coupons')}`;
  document.getElementById('page-desc').setAttribute('content', `${t('store_all_codes')} ${merchant}. ${t('up_to_90_off')}`);

  // Логотип
  const logoEl = document.getElementById('store-logo');
  if (logo) {
    logoEl.innerHTML = `<img src="${logo}" alt="${merchant}" onerror="this.parentElement.innerHTML='<span class=no-logo>${(merchant[0]||'?').toUpperCase()}</span>'" />`;
  } else {
    logoEl.innerHTML = `<span class="no-logo">${(merchant[0]||'?').toUpperCase()}</span>`;
  }

  // Schema.org Organization + Offers
  const schema = document.getElementById('store-schema');
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": merchant,
    "url": coupons[0]?.url || '',
    "logo": logo,
    "sameAs": coupons[0]?.url || ''
  });

  // Карточки купонов
  const grid = document.getElementById('card-grid');
  if (!coupons.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:3rem;">${t('no_active_coupons')}</p>`;
    return;
  }

  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function getDiscount(n){const m=(n||'').match(/(\d+)\s*%/);return m?parseInt(m[1]):0}

  grid.innerHTML = coupons.map((c, i) => {
    const d = getDiscount(c.name);
    const badge = d > 0 ? `<span class="discount-badge ${d>=50?'':d>=25?'gold':'green'}">−${d}%</span>` : '';

    // Schema.org Offer для каждого купона
    return `
    <article class="card" itemscope itemtype="https://schema.org/Offer">
      <meta itemprop="priceCurrency" content="RUB" />
      <meta itemprop="availability" content="https://schema.org/InStock" />
      ${c.finish ? `<time itemprop="validThrough" datetime="${c.finish}"></time>` : ''}
      <div class="card-header">
        <div class="card-logo">${logo?`<img src="${esc(logo)}" alt="" loading="lazy"/>`:`<span class="no-logo">${(merchant[0]||'?').toUpperCase()}</span>`}</div>
        <span class="card-merchant">${esc(merchant)}</span>
        ${badge}
      </div>
      <div class="card-body">
        <h3 class="card-title" itemprop="name">${esc(c.name)}</h3>
        ${c.desc&&c.desc!==c.name?`<p class="card-desc" itemprop="description">${esc(c.desc)}</p>`:''}
      </div>
      <div class="card-footer">
        ${c.finish?`<span class="expire">${t('until_word')} ${c.finish.slice(0,10)}</span>`:'<span></span>'}
        <a href="${esc(c.url_code||c.url)}" target="_blank" rel="nofollow" class="cta-btn cta-primary" itemprop="url">${t('get_btn')}</a>
      </div>
    </article>`;
  }).join('');
}

// При смене языка перерисовать страницу магазина
document.addEventListener('langchange', () => { if (data.length && merchant) { try { renderStore(); } catch(e){} } });

load();
