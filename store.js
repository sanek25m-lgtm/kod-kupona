// Static content is the default; JavaScript enhances language and code controls.
let data = [];
let merchant = '';
const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function load() {
  const embedded = document.getElementById('page-coupons');
  if (embedded) data = JSON.parse(embedded.textContent);
  else {
    const res = await fetch(new URL('data/browser-coupons.json', couponSiteRoot));
    if (!res.ok) throw new Error('Could not load offers');
    data = await res.json();
  }
  data = data.filter(couponForSite);
  merchant = document.body.dataset.merchant || document.body.dataset.category || new URLSearchParams(location.search).get('merchant') || '';
  if (!merchant) { location.replace(new URL('catalog.html', couponSiteRoot)); return; }
  if (!embedded) {
    const route = (window.COUPON_ROUTES.stores || {})[merchant];
    if (route) { location.replace(new URL(route, couponSiteRoot)); return; }
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex'; document.head.appendChild(meta);
  }
  renderStore();
}

function renderStore() {
  const coupons = document.body.dataset.category ? data : data.filter(c => c.merchant === merchant);
  document.getElementById('store-info').textContent = couponOfferCount(coupons.length) + ' · Условия по данным партнёров';
  if (!document.body.dataset.staticPage) {
    document.title = 'Промокоды ' + merchant + ' — Код купона';
    document.getElementById('store-name').textContent = merchant;
  }
  const logoEl = document.getElementById('store-logo');
  if (coupons[0] && coupons[0].logo && logoEl) logoEl.innerHTML = '<img src="' + esc(coupons[0].logo) + '" width="64" height="64" alt="">';
  document.getElementById('card-grid').innerHTML = coupons.map(c => {
    const label = couponDiscountLabel(c), description = couponDescription(c);
    return '<article id="coupon-' + esc(c.id) + '" class="card"><div class="card-header"><a class="card-merchant" href="' + esc(merchantUrl(c.merchant)) + '">' + esc(c.merchant) + '</a>' + (label ? '<span class="discount-badge">' + esc(label) + '</span>' : '') + '</div><div class="card-body"><h3 class="card-title">' + esc(c.name) + '</h3>' + (description ? '<p class="card-desc">' + esc(description) + '</p>' : '') + couponTools(c) + '</div><div class="card-footer"><span class="expire">' + (c.finish ? 'до ' + esc(c.finish.slice(0,10)) : '') + '</span>' + couponAction(c) + '</div></article>';
  }).join('') || '<p>Предложения не найдены. <a href="catalog.html">Открыть каталог магазинов</a></p>';
}

document.addEventListener('langchange', () => { if(data.length) renderStore(); });
load().catch(() => { if (!document.querySelector('#card-grid .card')) document.getElementById('card-grid').textContent = 'Предложения временно недоступны.'; });
