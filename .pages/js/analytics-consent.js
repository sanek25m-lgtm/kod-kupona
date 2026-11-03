(() => {
  'use strict';
  const key = 'kodkupona_analytics_consent_v1';
  const id = 'G-BWV4WZ4F4P';
  const texts = {
    ru: ['Аналитические cookies', 'С вашего согласия Google Analytics помогает считать посещения, источники переходов и клики по ссылкам. Вы можете изменить выбор в любой момент.', 'Разрешить', 'Отклонить', 'Настройки cookies', 'Данные и настройки'],
    en: ['Analytics cookies', 'With your consent, Google Analytics measures visits, traffic sources and link clicks. You can change your choice at any time.', 'Allow', 'Decline', 'Cookie settings', 'Privacy and settings'],
    kk: ['Аналитикалық cookie файлдары', 'Келісіміңізбен Google Analytics кірулерді, трафик көздерін және сілтеме басуларын санайды. Таңдауыңызды кез келген уақытта өзгерте аласыз.', 'Рұқсат ету', 'Бас тарту', 'Cookie баптаулары', 'Деректер және баптаулар'],
    tt: ['Аналитик cookie файллары', 'Ризалыгыгыз белән Google Analytics керүләрне, трафик чыганакларын һәм сылтамаларга басуларны саный. Сайлауны теләсә кайчан үзгәртеп була.', 'Рөхсәт итү', 'Баш тарту', 'Cookie көйләүләре', 'Мәгълүмат һәм көйләүләр'],
    uz: ['Tahliliy cookie fayllari', 'Roziligingiz bilan Google Analytics tashriflar, trafik manbalari va havola bosishlarini hisoblaydi. Tanlovni istalgan vaqtda o‘zgartirishingiz mumkin.', 'Ruxsat berish', 'Rad etish', 'Cookie sozlamalari', 'Ma’lumotlar va sozlamalar'],
    zh: ['分析 Cookie', '经您同意，Google Analytics 会统计访问量、流量来源和链接点击。您可随时更改选择。', '允许', '拒绝', 'Cookie 设置', '数据与设置']
  };
  const lang = (document.documentElement.lang || 'ru').split('-')[0];
  const t = texts[lang] || texts.ru;
  let choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  let loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id, {page_location: location.origin + location.pathname, page_referrer: document.referrer ? document.referrer.split('?')[0].split('#')[0] : ''});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
    document.addEventListener('click', e => {
      const link = e.target.closest && e.target.closest('a[href]');
      if (!link || link.origin === location.origin || !/^https?:$/.test(link.protocol)) return;
      const card = link.closest('[data-id], article, .card');
      const merchant = card && card.querySelector('.card-merchant, .merchant-name');
      gtag('event', 'outbound_click', {destination_host: link.hostname, merchant: merchant ? merchant.textContent.trim().slice(0, 100) : '', transport_type: 'beacon'});
    }, true);
  }
  function save(value) {
    try { localStorage.setItem(key, value); } catch (_) {}
    if (value === 'no') {
      document.cookie.split(';').forEach(part => {
        const name = part.split('=')[0].trim();
        if (/^_ga(?:_|$)/.test(name)) {
          document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
          document.cookie = name + '=; Max-Age=0; path=/; domain=.kodkupona.art; SameSite=Lax';
        }
      });
    }
    location.reload();
  }
  function show() {
    if (document.getElementById('kk-consent')) return;
    const box = document.createElement('section'); box.id = 'kk-consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', t[0]);
    box.style.cssText = 'position:fixed;z-index:2147483647;bottom:1rem;left:1rem;right:1rem;max-width:540px;padding:20px;background:#fff;color:#172033;border:1px solid #cbd5e1;border-radius:14px;box-shadow:0 8px 32px #0003;font:16px/1.5 system-ui,sans-serif';
    const title = document.createElement('strong'); title.textContent = t[0];
    const p = document.createElement('p'); p.textContent = t[1];
    const link = document.createElement('a'); link.href = '/' + (lang !== 'ru' && texts[lang] ? lang + '/' : '') + 'info/privacy.html'; link.textContent = t[5]; link.style.cssText = 'color:#1649ab;display:inline-block;margin:0 12px 12px 0';
    const yes = document.createElement('button'); yes.type = 'button'; yes.textContent = t[2]; yes.style.cssText = 'padding:10px 16px;border:0;border-radius:8px;background:#1554c0;color:white;cursor:pointer;margin:0 8px 0 0'; yes.onclick = () => save('yes');
    const no = document.createElement('button'); no.type = 'button'; no.textContent = t[3]; no.style.cssText = 'padding:10px 16px;border:1px solid #64748b;border-radius:8px;background:white;color:#172033;cursor:pointer'; no.onclick = () => save('no');
    box.append(title, p, link, document.createElement('br'), yes, no); document.body.appendChild(box);
  }
  function start() {
    if (/\/info\/privacy\.html$/.test(location.pathname)) {
      const main = document.querySelector('main');
      if (main) { const notice = document.createElement('p'); notice.textContent = t[1]; main.appendChild(notice); }
    }
    const footer = document.querySelector('footer') || document.body;
    const settings = document.createElement('button'); settings.type = 'button'; settings.textContent = t[4]; settings.style.cssText = 'display:block;margin:12px auto;padding:8px;color:inherit;background:transparent;border:1px solid currentColor;border-radius:6px;cursor:pointer'; settings.onclick = show; footer.appendChild(settings);
    if (choice === 'yes') loadAnalytics(); else if (choice !== 'no') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
