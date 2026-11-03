/* Complete on-device translation of public copy. Codes, URLs and amounts are protected. */
(function () {
  'use strict';
  const languages = ['ru', 'en', 'zh', 'uz'];
  let current = 'ru';
  try { const saved = localStorage.getItem('lang'); if (languages.includes(saved)) current = saved; } catch (_) {}
  const originals = new WeakMap(), attributes = new WeakMap();
  const russian = /[А-Яа-яЁё]/;
  const cache = new Map();
  function translate(source, locale = current) {
    source = String(source == null ? '' : source);
    if (locale === 'ru' || !russian.test(source)) return source;
    const cacheKey = locale + '\n' + source;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const values = [];
    const template = source.replace(/\s+/g, ' ').trim().replace(/https?:\/\/[^\s<>]+|\b[A-Za-z0-9][A-Za-z0-9.-]*\.[a-z]{2,}\b|\d+(?:[ \u00a0]\d{3})*(?:[.,]\d+)?/g, value => '{' + (values.push(value) - 1) + '}');
    let result = template.split(/((?<=[.!?;])\s+|\s+—\s+|\s+·\s+|\s+\|\s+)/).map(piece => {
      if (!russian.test(piece)) return piece.replace(/\{(\d+)\}/g, (_, i) => values[+i]);
      const leading = piece.match(/^[ /:;.!?]*/)[0], trailing = piece.match(/[ /:;.!?]*$/)[0];
      const core = piece.slice(leading.length, trailing.length ? -trailing.length : undefined);
      const ids = [];
      const key = core.replace(/\{(\d+)\}/g, (_, i) => '{' + (ids.push(+i) - 1) + '}');
      const entry = window.COUPON_TRANSLATIONS && window.COUPON_TRANSLATIONS[key];
      const translated = entry && entry[languages.indexOf(locale) - 1];
      return leading + (translated ? translated.replace(/\{(\d+)\}/g, (_, i) => values[ids[+i]]) : core.replace(/\{(\d+)\}/g, (_, i) => values[+i])) + trailing;
    }).join('');
    if (locale === 'en') result = result.replace(/\b(\d+) offers?\b/g, (_, n) => n + (Number(n) === 1 ? ' offer' : ' offers'));
    result = (source.match(/^\s*/)[0]) + result + (source.match(/\s*$/)[0]);
    if (cache.size > 10000) cache.clear();
    cache.set(cacheKey, result);
    return result;
  }
  window.couponTranslate = translate;
  window.couponLocale = () => current;
  function excluded(el) {
    return !el || el.closest('script,style,code,noscript,[data-i18n],[data-i18n-html],.brand-text,[translate="no"]');
  }
  function textNode(node) {
    if (excluded(node.parentElement)) return;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const value = translate(originals.get(node));
    if (node.nodeValue !== value) node.nodeValue = value;
  }
  function element(el) {
    if (el.matches('script,style,code,noscript,[translate="no"]')) return;
    let saved = attributes.get(el);
    if (!saved) { saved = {}; attributes.set(el, saved); }
    for (const name of ['title', 'aria-label', 'placeholder', 'alt']) {
      if (!el.hasAttribute(name) || (el.id === 'search-input' && name === 'placeholder')) continue;
      if (!(name in saved)) saved[name] = el.getAttribute(name);
      const value = translate(saved[name]);
      if (el.getAttribute(name) !== value) el.setAttribute(name, value);
    }
  }
  function subtree(root) {
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) element(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === 3) textNode(node); else element(node);
    }
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    records.forEach(record => {
      if (record.type === 'childList') record.addedNodes.forEach(subtree);
      else if (record.type === 'characterData') {
        // An application updated an existing text node: this is new source copy.
        originals.delete(record.target); textNode(record.target);
      }
    });
    observe();
  });
  function observe() { observer.observe(document.body, {subtree:true, childList:true, characterData:true}); }
  const title = document.title;
  const metadata = [...document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')].map(el => [el, el.content]);
  window.applyPageLanguage = function (locale) {
    current = languages.includes(locale) ? locale : 'ru';
    observer.disconnect();
    document.documentElement.lang = current === 'zh' ? 'zh-CN' : current;
    document.documentElement.dir = 'ltr';
    document.title = translate(title);
    metadata.forEach(([el, source]) => { el.content = translate(source); });
    subtree(document.body);
    document.querySelectorAll('.brand-text').forEach(el => {
      const value = current === 'ru' ? 'Кодкупона' : 'Kodkupona';
      if (el.textContent !== value) el.textContent = value;
    });
    document.querySelectorAll('.lang-switch').forEach(el => { el.title = translate('Язык интерфейса'); });
    document.querySelectorAll('.lang-btn').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === current)));
    observe();
  };
})();
