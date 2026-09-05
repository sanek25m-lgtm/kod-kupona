// ========== APP.JS — Код купона v6 (theme+i18n in common.js) ==========

let data = [];
let currentCategory = '';
let currentLetter = '';
let currentMerchant = 'all';
let searchQuery = '';
let shownCount = 30;
const PAGE_SIZE = 30;
const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ===== CATEGORIES (подписи берутся из i18n, ключи — русские, см. detectCategory) =====
const CATEGORIES = [
  {key:'',i18nKey:'cat_all'},
  {key:'электроника',i18nKey:'cat_electronics'},{key:'еда',i18nKey:'cat_food'},
  {key:'мода',i18nKey:'cat_fashion'},{key:'путешествия',i18nKey:'cat_travel'},
  {key:'дом',i18nKey:'cat_home'},{key:'красота',i18nKey:'cat_beauty'},
  {key:'дети',i18nKey:'cat_kids'},{key:'спорт',i18nKey:'cat_sport'},{key:'развлечения',i18nKey:'cat_fun'},
];

function detectCategory(c) {
  const n = (c.name + ' ' + c.desc).toLowerCase();
  if(/электрон|телефон|ноутбук|гаджет|смартфон/.test(n)) return 'электроника';
  if(/еда|доставк|ресторан|кафе|продукт|супермаркет/.test(n)) return 'еда';
  if(/одежд|обувь|мод|стиль|бренд/.test(n)) return 'мода';
  if(/путешеств|отел|билет|авиа|тур|travel/.test(n)) return 'путешествия';
  if(/дом|сад|ремонт|мебел|интерер/.test(n)) return 'дом';
  if(/красот|косметик|парфюм|уход|салон/.test(n)) return 'красота';
  if(/дет|ребёнк|игрушк/.test(n)) return 'дети';
  if(/спорт|фитнес|бег|велосипед/.test(n)) return 'спорт';
  if(/развлеч|кино|игр|концерт/.test(n)) return 'развлечения';
  return '';
}

function renderCatChips() {
  const div = document.getElementById('cat-chips');
  if (!div) return;
  div.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-chip ${currentCategory===c.key?'active':''}" data-cat="${esc(c.key)}" aria-pressed="${currentCategory===c.key}">${t(c.i18nKey)}</button>`
  ).join('');
}

// ===== UTILS =====
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getParam(n) { try { return new URLSearchParams(window.location.search).get(n)||''; } catch(e){return '';} }
function getDiscount(name) { const m = (name||'').match(/(\d+)\s*%/); return m ? parseInt(m[1]) : 0; }
function badgeClass(d) { if (d >= 50) return ''; if (d >= 25) return 'gold'; return 'green'; }

// ===== STARS =====
function getStars(merchant) {
  if (!merchant) return '4.0';
  let h = 0; for (let i=0;i<merchant.length;i++) h=((h<<5)-h+merchant.charCodeAt(i))|0;
  const r = Math.min(5, Math.max(3, 3.5+(Math.abs(h)%15)/10));
  return isNaN(r)?'4.0':r.toFixed(1);
}
function starsHtml(r) { const f=Math.floor(r); const half=r-f>=0.5; return '★'.repeat(f)+(half?'½':'')+`<span style="color:#D1D5DB">${'★'.repeat(5-f-(half?1:0))}</span> ${r}`; }

// ===== VERIFIED =====
function isVerified(c) { if(!c.finish)return false; const d=new Date(c.finish); return d>new Date() && parseInt(c.id)%3===0; }

// ===== FAVORITES =====
function getFavs(){try{return JSON.parse(localStorage.getItem('fav_coupons')||'[]')}catch(e){return[]}}
function toggleFav(id){let f=getFavs();if(f.includes(id))f=f.filter(x=>x!==id);else f.push(id);localStorage.setItem('fav_coupons',JSON.stringify(f));renderCards();renderFavList();}
function renderFavList(){const favs=getFavs();const s=document.getElementById('fav-section');if(!s)return;if(!favs.length){s.style.display='none';return;}s.style.display='block';const l=document.getElementById('fav-list');l.innerHTML=favs.map(id=>{const c=data.find(d=>d.id===id);return c?`<button class="merchant-item" data-merchant="${esc(c.merchant)}">${esc(c.merchant)}</button>`:''}).join('')}

// ===== SHARE =====
function shareUrl(c){const base=new URL('.',location.href).href;return base+'?merchant='+encodeURIComponent(c.merchant)+'&coupon='+c.id}
function shareTg(id){const c=data.find(d=>d.id===id);if(c)window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl(c))}&text=${encodeURIComponent('🔥 '+c.name)}`,'_blank')}
function shareVk(id){const c=data.find(d=>d.id===id);if(c)window.open(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl(c))}&title=${encodeURIComponent(c.name)}`,'_blank')}
function shareWa(id){const c=data.find(d=>d.id===id);if(c)window.open(`https://wa.me/?text=${encodeURIComponent('🔥 '+c.name+' '+shareUrl(c))}`,'_blank')}

// ===== REPORT =====
function reportCoupon(id) { const c = data.find(d => d.id === id); if(!c)return; alert(t('report_msg').replace('{name}', c.name).replace('{merchant}', c.merchant)); }

// ===== LOAD DATA =====
async function loadData() {
  const res = await fetch('coupons_data.json');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  data = await res.json();
  const urlMerchant = getParam('merchant');
  if (urlMerchant) currentMerchant = decodeURIComponent(urlMerchant);
  renderAll();
}

function renderAll() {
  try{renderCatChips()}catch(e){console.error(e)}
  try{renderAlphabet()}catch(e){console.error(e)}
  try{renderMerchants()}catch(e){console.error(e)}
  try{renderHot()}catch(e){console.error(e)}
  try{renderCards()}catch(e){console.error(e)}
}

// ===== SIDEBAR: ALPHABET =====
function getAllMerchants(){return[...new Set(data.map(c=>c.merchant).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'))}

function renderAlphabet() {
  const merchants = getAllMerchants();
  const usedLetters = new Set(merchants.map(m => m[0].toUpperCase()));
  const div = document.getElementById('alphabet');
  if (!div) return;
  let html = `<button class="alpha-btn ${!currentLetter?'active':''}" data-letter="">Все</button>`;
  ALPHABET.filter(l=>usedLetters.has(l.toUpperCase())).forEach(l=>{
    html+=`<button class="alpha-btn ${currentLetter===l?'active':''}" data-letter="${esc(l)}">${l}</button>`;
  });
  div.innerHTML = html;
}

// ===== SIDEBAR: MERCHANTS =====
function renderMerchants() {
  const merchants = getAllMerchants().filter(m=>!currentLetter||m[0].toUpperCase()===currentLetter.toUpperCase());
  const div = document.getElementById('merchant-list');
  if (!div) return;
  if(!merchants.length){div.innerHTML=`<p style="font-size:.8rem;color:var(--text-secondary);padding:8px;">${t('nothing_found')}</p>`;return;}
  let html='';
  merchants.forEach(m=>{const count=data.filter(c=>c.merchant===m).length;html+=`<button class="merchant-item ${currentMerchant===m?'active':''}" data-merchant="${esc(m)}">${esc(m)} <span style="color:var(--text-secondary);font-size:.75rem;">(${count})</span></button>`});
  div.innerHTML=html;
}

// ===== HOT COUPONS (right sidebar) =====
function renderHot() {
  const now=new Date();
  const soon=data.filter(c=>{if(!c.finish)return false;const d=new Date(c.finish);if(isNaN(d.getTime()))return false;const diff=(d-now)/(1000*60*60*24);return diff>0&&diff<=7}).slice(0,8);
  const section=document.getElementById('hot-section');
  if(!section||!soon.length){if(section)section.style.display='none';return;}
  section.style.display='block';
  const grid=document.getElementById('hot-grid');if(!grid)return;
  grid.innerHTML=soon.map(c=>`<a href="${esc(c.url_code||c.url)}" target="_blank" rel="nofollow" class="hot-item"><h4>${esc(c.name)}</h4><div class="hot-meta"><span>${esc(c.merchant)}</span><span class="hot-expire">⏰ ${c.finish.slice(5,10)}</span></div></a>`).join('');
}

// ===== FILTER =====
function getFiltered(){return data.filter(item=>{if(searchQuery){const q=searchQuery.toLowerCase();return item.name.toLowerCase().includes(q)||item.desc.toLowerCase().includes(q)||item.merchant.toLowerCase().includes(q)}const catMatch=!currentCategory||detectCategory(item)===currentCategory;const mMatch=currentMerchant==='all'||item.merchant===currentMerchant;const lMatch=!currentLetter||(item.merchant&&item.merchant[0].toUpperCase()===currentLetter.toUpperCase());return catMatch&&mMatch&&lMatch})}

// ===== RENDER CARDS =====
function renderCards() {
  const items = getFiltered();
  const grid = document.getElementById('card-grid');
  const countEl = document.getElementById('count');
  const loadMore = document.getElementById('load-more');
  if (!grid) return;
  const favs = getFavs();

  if (countEl) {
    if(currentMerchant!=='all'){countEl.innerHTML=`<a href="index.html" class="filter-tag">${t('all_stores')}</a> · <strong>${esc(currentMerchant)}</strong> — ${items.length} ${plural(items.length,'coupon_forms')}`}
    else{countEl.textContent=`${t('found')} ${items.length}`}
  }
  if(loadMore)loadMore.style.display=items.length>shownCount?'block':'none';

  if(!items.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:3rem;"><p style="font-size:2.5rem;">🔍</p><p style="margin-top:8px;font-weight:600;">${t('no_results')}</p></div>`;return;}

  const shown=items.slice(0,shownCount);
  let html='';
  shown.forEach((c,i)=>{
    const d=getDiscount(c.name);
    const badge=d>0?`<span class="discount-badge ${badgeClass(d)}">−${d}%</span>`:'';
    const verified=isVerified(c)?`<span class="verified-badge">${t('verified')}</span>`:'';
    const stars=`<span class="stars">${starsHtml(getStars(c.merchant))}</span>`;
    const favActive=favs.includes(c.id);

    html+=`
    <article class="card" style="animation:fadeIn .25s ease ${Math.min(i,8)*.03}s backwards">
      <button class="fav-btn ${favActive?'active':''}" data-fav="${esc(c.id)}">${favActive?'❤️':'🤍'}</button>
      <div class="card-header">
        <div class="card-logo">${c.logo?`<img src="${esc(c.logo)}" alt="" loading="lazy" onerror="this.style.display='none'" />`:`<span class="no-logo">${(c.merchant||'?')[0].toUpperCase()}</span>`}</div>
        <a href="store.html?merchant=${encodeURIComponent(c.merchant)}" class="card-merchant card-merchant-link">${esc(c.merchant)}</a>
        ${badge}
      </div>
      <div style="padding:4px 14px 0;display:flex;gap:8px;align-items:center;">${verified}${stars}</div>
      <div class="card-body">
        <h3 class="card-title">${esc(c.name)}</h3>
        ${c.desc&&c.desc!==c.name?`<p class="card-desc">${esc(c.desc)}</p>`:''}
      </div>
      <div class="share-row">
        <button class="share-btn share-tg" data-share="tg" data-id="${esc(c.id)}" title="Telegram"><svg width="16" height="16" viewBox="0 0 24 24" fill="#2563EB"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1 0 .321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.418-1.21.27-1.91.184-.19 3.56-3.26 3.612-3.54z"/></svg></button>
        <button class="share-btn share-vk" data-share="vk" data-id="${esc(c.id)}" title="ВКонтакте"><svg width="16" height="16" viewBox="0 0 24 24" fill="#0077FF"><path d="M21.17 6.1c.25-.52.08-.9-.72-.88l-2.36.15c-.59.04-.89.31-1.04.67 0 0-1.02 2.49-2.46 4.11-1.17 1.31-1.65 1.69-2.54 1.58-.62-.07-.61-.72-.61-1.8v-.35c0-1.04-.03-1.99-.75-2.67-.36-.35-1.01-.5-1.4-.5-2.7.16-3.76 1.88-3.76 3.87 0 1.53.73 3.23 3.4 3.81 1 .25 1.9.2 2.56-.04.79-.28 1.4-.8 1.4-.8s-.52.28-1.12.8c-.28.28-.34.6-.12.8.2.2.72.2 1.28-.04 1.12-.4 1.92-1.6 1.92-1.6s.52 1.2 1.6 1.6c.56.2 1.08.2 1.28 0 .2-.2.12-.52-.12-.8-.6-.52-1.12-.8-1.12-.8s.72.04 1.4-.4c.56-.36.96-.8.96-.8z"/></svg></button>
        <button class="share-btn share-wa" data-share="wa" data-id="${esc(c.id)}" title="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.07.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></button>
      </div>
      <div class="card-footer">
        ${c.finish?`<span class="expire">${t('until_word')} ${c.finish.slice(0,10)}</span>`:'<span></span>'}
        <button class="report-btn" data-report="${esc(c.id)}" title="${t('report_title')}">⚠️</button>
        <button class="cta-btn cta-primary" data-goto="${esc(c.id)}">${t('get_btn')}</button>
      </div>
    </article>`;
  });
  grid.innerHTML=html;
}

// ===== EVENT DELEGATION (page-specific) =====
document.addEventListener('click', function(e) {
  const alphaBtn=e.target.closest('.alpha-btn');
  if(alphaBtn){currentLetter=alphaBtn.dataset.letter||'';currentMerchant='all';shownCount=PAGE_SIZE;renderAlphabet();renderMerchants();renderCards();return;}

  const merchBtn=e.target.closest('.merchant-item');
  if(merchBtn){const m=merchBtn.dataset.merchant||'';currentMerchant=(currentMerchant===m)?'all':m;shownCount=PAGE_SIZE;renderMerchants();renderCards();return;}

  const gotoBtn=e.target.closest('[data-goto]');
  if(gotoBtn){const c=data.find(d=>d.id===gotoBtn.dataset.goto);if(c)window.open(c.url_code||c.url,'_blank');return;}

  const favBtn=e.target.closest('[data-fav]');
  if(favBtn){toggleFav(favBtn.dataset.fav);return;}

  const shareBtn=e.target.closest('[data-share]');
  if(shareBtn){const type=shareBtn.dataset.share;const id=shareBtn.dataset.id;if(type==='tg')shareTg(id);else if(type==='vk')shareVk(id);else if(type==='wa')shareWa(id);return;}

  const catChip=e.target.closest('.cat-chip');
  if(catChip){currentCategory=catChip.dataset.cat||'';shownCount=PAGE_SIZE;renderCatChips();renderCards();return;}

  const reportBtn=e.target.closest('[data-report]');
  if(reportBtn){reportCoupon(reportBtn.dataset.report);return;}

  if(e.target.closest('.btn-secondary')){shownCount+=PAGE_SIZE;renderCards();}
});

// ===== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ПРИ СМЕНЕ ЯЗЫКА (чипы категорий, карточки, приветствие) =====
document.addEventListener('langchange', () => {
  renderAll();
  try{setGreeting()}catch(e){console.error(e)}
  try{renderFavList()}catch(e){console.error(e)}
});

// ===== SEARCH =====
const searchInput=document.getElementById('search-input');
if(searchInput){searchInput.addEventListener('input',function(){searchQuery=this.value.toLowerCase().trim();shownCount=PAGE_SIZE;renderCards()})}

// ===== СКЛОНЕНИЕ ЧИСЛИТЕЛЬНЫХ (ru — 1 купон / 2 купона / 5 купонов) =====
function plural(n, key) {
  const f = String(t(key) || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!f.length) return '';
  if (f.length === 1) return f[0];
  let i = f.length - 1;
  if (lang === 'ru') {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) i = 0;
    else if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) i = 1;
  } else if (n === 1) i = 0;
  return f[i] || f[f.length - 1];
}

// ===== GREETING =====
function setGreeting(){const h=new Date().getHours();let g=t('greeting_night');if(h>=5&&h<12)g=t('greeting_morning');else if(h>=12&&h<18)g=t('greeting_day');else if(h>=18&&h<23)g=t('greeting_evening');const now=new Date();const active=data.filter(c=>{if(!c.finish)return true;const d=new Date(c.finish);return isNaN(d.getTime())||d>now}).length;const merchants=new Set(data.map(c=>c.merchant).filter(Boolean)).size;const el=document.getElementById('greeting');if(el)el.innerHTML=t('greet_tpl').replace('{g}',g).replace('{a}',active).replace('{cp}',plural(active,'coupon_forms')).replace('{m}',merchants).replace('{mp}',plural(merchants,'shop_forms'))}

// ===== LIVE FEED (имена и фразы — из i18n текущего языка) =====
function startFeed(){const el=document.getElementById('feed-text');if(!el)return;function tick(){if(!data.length)return;const names=(t('feed_names')||'').split(',').filter(Boolean);const name=names[Math.floor(Math.random()*names.length)]||'';const tpl=t('feed_act'+(Math.floor(Math.random()*3)+1));const m=data[Math.floor(Math.random()*data.length)].merchant;el.textContent=tpl.replace('{name}',name).replace('{sum}',Math.floor(Math.random()*2000+100)).replace('{pct}',Math.floor(Math.random()*40+5)).replace('{m}',m)}tick();setInterval(tick,4000);document.addEventListener('langchange',tick)}

// ===== COUNTER =====
function numLocale(){return {ru:'ru-RU',en:'en-US',zh:'zh-CN',uz:'uz-UZ'}[lang]||'ru-RU'}
function startCounter(){const base=Math.floor(Math.random()*5000+12000);const el=document.getElementById('counter-num');if(!el)return;let val=base;const fmt=()=>el.textContent=val.toLocaleString(numLocale());fmt();document.addEventListener('langchange',fmt);setInterval(()=>{val+=Math.floor(Math.random()*3+1);fmt()},5000)}

// ===== START =====
loadData().then(()=>{
  try{setGreeting()}catch(e){console.error(e)}
  try{startFeed()}catch(e){console.error(e)}
  try{startCounter()}catch(e){console.error(e)}
  try{renderFavList()}catch(e){console.error(e)}
}).catch(e=>{
  console.error('Load failed:',e);
  const grid=document.getElementById('card-grid');
  if(grid)grid.innerHTML='<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#DC2626;">Ошибка загрузки. Обновите страницу.</p>';
});
