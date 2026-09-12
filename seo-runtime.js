/* Shared progressive enhancement. No synthetic ratings or server claims. */
(function () {
  'use strict';
  const root = new URL('.', document.currentScript.src);
  // Site identity stays the same when a mirror serves the repository at /.
  const project = 'kod-kupona';
  window.couponSiteRoot = root.href;
  window.merchantUrl = function (name) {
    const routes = window.COUPON_ROUTES && window.COUPON_ROUTES.stores || {};
    return new URL(routes[name] || ('store.html?merchant=' + encodeURIComponent(name)), root).href;
  };
  window.categoryUrl = function (name) {
    const routes = window.COUPON_ROUTES && window.COUPON_ROUTES.categories || {};
    return new URL(routes[name] || ('index.html?cat=' + encodeURIComponent(name)), root).href;
  };
  window.couponExpiry = function (value) {
    if (!value) return Infinity;
    let text = String(value);
    const day = text.slice(0,10);
    const calendar = new Date(day+'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0,10)!==day) return NaN;
    if (text.length===10) text+='T23:59:59.999Z';
    else {
      if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(text)) return NaN;
      text=text.replace(' ','T');
      if (!/(Z|[+-]\d{2}:?\d{2})$/.test(text)) text+='Z';
    }
    return Date.parse(text);
  };
  window.couponIsActive = function (c) {
    return window.couponExpiry(c.finish || c.end) >= Date.now();
  };
  window.couponForSite = function (c) {
    const hasCode = Boolean(String(c.code || '').trim());
    return window.couponIsActive(c) && hasCode === (project === 'kod-kupona');
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  window.couponOfferCount = function (count) {
    const n = Math.abs(count), last = n % 10, teen = n % 100;
    const noun = last === 1 && teen !== 11 ? 'предложение' : last >= 2 && last <= 4 && (teen < 12 || teen > 14) ? 'предложения' : 'предложений';
    return count + ' ' + noun;
  };
  function discountInfo(c) {
    if (/(?:к[еэ]шб[еэ]к|cash\s*back|бонус|балл|рассроч)/i.test(String(c.name || ''))) return { value: 0, capped: false };
    const match = String(c.name || '').match(/(\d{1,3})\s*%/);
    const value = match && +match[1] > 0 && +match[1] <= 100 ? +match[1] : 0;
    const capped = value && new RegExp('(?:до|up\\s+to)\\s*[−-]?\\s*' + value + '\\s*%', 'i').test(String(c.name || '') + ' ' + String(c.ins || ''));
    return { value, capped };
  }
  window.couponOfferKind = function (c) {
    if (/(?:бонус|балл)/i.test(String(c.name || '') + ' ' + String(c.desc || ''))) return 'бонусы';
    return String(c.code || '').trim() ? 'промокод' : 'предложение магазина';
  };
  window.couponDiscountLabel = function (c) {
    const info = discountInfo(c);
    return info.value ? (info.capped ? 'до ' : '−') + info.value + '%' : '';
  };
  window.couponDescription = function (c) {
    const text = String(c.desc || ''), info = discountInfo(c);
    if (!text || text === c.name) return '';
    if (info.capped && new RegExp('(^|[^0-9])' + info.value + '\\s*%').test(text)
        && !new RegExp('(?:до|up\\s+to)\\s*[−-]?\\s*' + info.value + '\\s*%', 'i').test(text)) return '';
    return text;
  };
  const revealed = new Map();
  const text = (key, fallback) => typeof window.t === 'function' && window.t(key) !== key ? window.t(key) : fallback;
  function validTarget(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? String(value) : '';
    } catch (_) { return ''; }
  }
  function couponTarget(c) { return validTarget(c.url_code) || validTarget(c.url); }
  window.couponAction = function (c) {
    const target = couponTarget(c);
    if (!target) return '<span class="coupon-unavailable">' + esc(text('coupon_unavailable', 'Предложение временно недоступно')) + '</span>';
    const code = String(c.code || '');
    return '<a class="cta-btn cta-primary" href="' + esc(target) + '" target="_blank" rel="sponsored nofollow noopener"' +
      (code.trim() ? ' data-reveal-code="' + esc(code) + '" data-coupon-id="' + esc(c.id) + '"' : '') + '>' +
      esc(code.trim() ? text('get_btn', 'Показать код и перейти в магазин →') : text('visit_store', 'В магазин →')) + '</a>';
  };
  window.couponTools = function (c) {
    const saved = revealed.get(String(c.id));
    const shown = saved && saved.code === String(c.code || '') && saved.target === couponTarget(c);
    return (c.ins ? '<details class="coupon-conditions"><summary>Условия предложения</summary><p>' + esc(c.ins) + '</p></details>' : '') +
      (String(c.code || '').trim() ? '<p class="coupon-reveal-note">' + esc(text('coupon_new_tab', 'Магазин откроется в новой вкладке.')) + '</p>' +
        '<div class="coupon-code" data-coupon-reveal aria-live="polite"' + (shown ? '' : ' hidden') + '><code>' + (shown ? esc(c.code) : '') + '</code> ' +
        '<button type="button" class="copy-code"' + (shown ? ' data-copy="' + esc(c.code) + '"' : ' disabled') + '>' + esc(text('copy_code', 'Скопировать код')) + '</button></div>' : '');
  };
  function announce(message) {
    let status = document.getElementById('copy-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'copy-status';
      status.setAttribute('role', 'status');
      status.className = 'copy-status';
      document.body.appendChild(status);
    }
    status.textContent = message;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => { status.textContent = ''; }, 4500);
  }
  async function copyCode(code) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      announce(text('coupon_copied', 'Промокод скопирован. Вставьте его в корзине магазина.'));
    } catch (_) {
      announce(text('coupon_copy_failed', 'Код показан на карточке. Скопируйте его вручную, если браузер запретил копирование.'));
    }
  }
  function activateCoupon(event) {
    const action = event.target.closest('a[data-reveal-code]');
    if (!action || event.defaultPrevented) return false;
    const target = validTarget(action.getAttribute('href'));
    const card = action.closest('.card');
    const panel = card && card.querySelector('[data-coupon-reveal]');
    const code = action.dataset.revealCode;
    if (!target || !code || !code.trim() || !panel) {
      event.preventDefault();
      announce(text('coupon_unavailable', 'Предложение временно недоступно'));
      return true;
    }
    revealed.set(String(action.dataset.couponId), { code, target });
    panel.querySelector('code').textContent = code;
    const copy = panel.querySelector('.copy-code');
    copy.dataset.copy = code;
    copy.disabled = false;
    panel.hidden = false;
    // Keep native link navigation in the same user gesture. Clipboard failure
    // must not cancel or replace the original affiliate URL.
    copyCode(code);
    return true;
  }
  document.addEventListener('click', function (event) {
    if (event.button && event.button !== 0) return;
    if (activateCoupon(event)) return;
    const button = event.target.closest('[data-copy]');
    const panel = button && button.closest('[data-coupon-reveal]');
    if (!button || button.disabled || !panel || panel.hidden || !button.dataset.copy) return;
    event.preventDefault();
    copyCode(button.dataset.copy);
  });
  document.addEventListener('auxclick', function (event) {
    if (event.button === 1) activateCoupon(event);
  });
  // Legacy info links are retained as navigation, not as duplicate content.
  if (/\/info\.html$/.test(location.pathname)) {
    const p = new URLSearchParams(location.search).get('p') || 'about';
    if (['about','contacts','privacy','terms','cookies'].includes(p)) {
      location.replace(new URL('info/' + p + '.html', root).href);
    }
  }
})();
