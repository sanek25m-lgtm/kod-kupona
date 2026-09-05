// ========== COMMON.JS — Тема + Язык (все страницы) ==========

// ===== THEME =====
let theme = localStorage.getItem('theme') || 'light';
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ===== I18N =====
const i18n = {
  ru: {
    nav_home: 'Главная', nav_top: 'Топ скидки', nav_faq: 'Как пользоваться', nav_blog: 'Блог',
    search_placeholder: 'Магазин или товар...', search_btn: 'Найти',
    get_btn: 'Получить →', load_more: 'Показать ещё',
    found: 'Найдено:', all_stores: '✕ Все магазины', coupons_word: 'купонов',
    hot_title: '🔥 Истекают', no_results: 'Ничего не найдено',
    footer_text: '© 2026 Код купона · Все права защищены',
    topbar_top: '🔥 Топ <strong>60</strong> самых выгодных скидок', top_hero_title: '🔥 Топ скидок<br><span class="highlight">до 90%</span>',
    top_hero_sub: 'Лучшие предложения от магазинов — отсортированы по размеру скидки', sort_by_discount: 'Сортировка: по размеру скидки ↓',
    footer_desc: 'Самый большой каталог промокодов и скидок',
    hero_title: 'Скидки до <span class="highlight">90%</span>',
    sidebar_title: 'Магазины А–Я', favorites: '❤️ Избранное',
    tg_text: '📲 Новые купоны — в Telegram', tg_btn: 'Подписаться',
    counter_text: '⚡ За сегодня активировано:',
    greeting_morning: 'Доброе утро! ☀️', greeting_day: 'Добрый день! 👋',
    greeting_evening: 'Добрый вечер! 🌆', greeting_night: 'Доброй ночи! 🌙',
    greet_tpl: '{g} Сейчас активно <strong>{a}</strong> {cp} от <strong>{m}</strong> {mp}',
    coupon_forms: 'купон,купона,купонов', shop_forms: 'магазин,магазина,магазинов',
    verified: '✅ Проверено сегодня', faq_title: '❓ Как пользоваться промокодами',
    faq_q1: 'Где вводить промокод?', faq_a1: 'На сайте магазина найдите поле «Промокод» или «Код скидки». Обычно оно на странице оформления заказа, рядом с итоговой суммой.',
    faq_q2: 'Почему код не работает?', faq_a2: 'Проверьте: 1) срок действия купона; 2) минимальную сумму заказа; 3) распространяется ли скидка на ваш товар. Если проблема — напишите нам в Telegram.',
    faq_q3: 'Сколько раз можно использовать один код?', faq_a3: 'Обычно 1 раз на одного покупателя. Некоторые коды работают многократно — это указано в описании купона.',
    faq_q4: 'Как узнать, что купон актуален?', faq_a4: 'Мы проверяем каждый купон вручную. Бейдж «✅ Проверено сегодня» означает, что код протестирован в течение 24 часов.',
    nothing_found: 'Нет магазинов',
    cat_all:'Все',cat_electronics:'💻 Электроника',cat_food:'🍔 Еда',cat_fashion:'👗 Мода',cat_travel:'✈️ Путешествия',cat_home:'🏠 Дом',cat_beauty:'💄 Красота',cat_kids:'👶 Дети',cat_sport:'⚽ Спорт',cat_fun:'🎮 Развлечения',
    until_word:'до', active_coupons:'активных купонов', no_active_coupons:'Нет активных купонов',
    store_title_suffix:'промокоды и скидки', store_all_codes:'Все актуальные промокоды', up_to_90_off:'Скидки до 90%.',
    report_title:'Купон не работает?', report_msg:'Спасибо! Купон «{name}» ({merchant}) отправлен на проверку.',
    feed_names:'Анна,Дмитрий,Мария,Иван,Ольга,Сергей,Екатерина,Алексей,Наталья,Павел',
    feed_act1:'{name}: экономия {sum}₽ в {m}', feed_act2:'{name}: скидка {pct}% в {m}', feed_act3:'{name}: купон активирован в {m}',
    blog_title: '📝 Блог', blog_read: 'Читать →',
    blog_1_title: 'Как сэкономить на Ozon в 2026: полное руководство', blog_1_desc: 'Разбираем все способы экономии: промокоды, кэшбэк, купоны на первый заказ и сезонные распродажи. Актуальные коды на сентябрь.',
    blog_2_title: 'Промокоды Пятёрочка: как получить скидку на продукты', blog_2_desc: 'Собрали рабочие промокоды для онлайн-заказа в Пятёрочке. Проверено: все коды активны и дают до 30% скидки.',
    blog_3_title: '10 лайфхаков для шопинга с купонами', blog_3_desc: 'Как комбинировать промокоды с распродажами, кэшбэком и бонусными программами. Реальные примеры экономии до 70%.',
    blog_4_title: 'Wildberries vs Ozon: где выгоднее в сентябре 2026', blog_4_desc: 'Сравнили цены на 50 товаров с учётом промокодов и доставки. Спойлер: разница до 40%.',
    blog_5_title: 'Как проверить, что промокод работает до оформления заказа', blog_5_desc: 'Пошаговая инструкция: где найти поле для кода, как избежать ошибок и что делать если скидка не применилась.',
    blog_6_title: 'Скидки на путешествия: промокоды для бронирования отелей и авиабилетов', blog_6_desc: 'Лучшие купоны на Ostrovok, Травелата, Авиасейлз. Как забронировать отпуск с экономией до 25%.',
  },
  en: {
    nav_home: 'Home', nav_top: 'Top Deals', nav_faq: 'How to Use', nav_blog: 'Blog',
    search_placeholder: 'Store or product...', search_btn: 'Search',
    get_btn: 'Get →', load_more: 'Load more',
    found: 'Found:', all_stores: '✕ All stores', coupons_word: 'coupons',
    hot_title: '🔥 Expiring', no_results: 'Nothing found',
    footer_text: '© 2026 Kodkupona · All rights reserved',
    topbar_top: '🔥 Top <strong>60</strong> best-value deals', top_hero_title: '🔥 Top deals<br><span class="highlight">up to 90% off</span>',
    top_hero_sub: 'Best offers from stores — sorted by discount size', sort_by_discount: 'Sorted by discount size ↓',
    footer_desc: 'The largest catalogue of promo codes and discounts',
    hero_title: 'Up to <span class="highlight">90%</span> Off',
    sidebar_title: 'Stores A–Z', favorites: '❤️ Favorites',
    tg_text: '📲 New coupons on Telegram', tg_btn: 'Subscribe',
    counter_text: '⚡ Activated today:',
    greeting_morning: 'Good morning! ☀️', greeting_day: 'Good afternoon! 👋',
    greeting_evening: 'Good evening! 🌆', greeting_night: 'Good night! 🌙',
    greet_tpl: '{g} Now active <strong>{a}</strong> {cp} from <strong>{m}</strong> {mp}',
    coupon_forms: 'coupon,coupons,coupons', shop_forms: 'store,stores,stores',
    verified: '✅ Verified today', faq_title: '❓ How to use promo codes',
    faq_q1: 'Where do I enter a promo code?', faq_a1: 'On the store website, look for a field called "Promo code" or "Discount code". It is usually on the checkout page near the order total.',
    faq_q2: "Why doesn't the code work?", faq_a2: 'Check: 1) coupon expiration date; 2) minimum order amount; 3) whether the discount applies to your item. If the issue persists — message us on Telegram.',
    faq_q3: 'How many times can I use one code?', faq_a3: 'Usually once per customer. Some codes work multiple times — this is noted in the coupon description.',
    faq_q4: 'How do I know a coupon is valid?', faq_a4: 'We check every coupon manually. The "✅ Verified today" badge means the code was tested within 24 hours.',
    nothing_found: 'No stores',
    cat_all:'All',cat_electronics:'💻 Electronics',cat_food:'🍔 Food',cat_fashion:'👗 Fashion',cat_travel:'✈️ Travel',cat_home:'🏠 Home',cat_beauty:'💄 Beauty',cat_kids:'👶 Kids',cat_sport:'⚽ Sport',cat_fun:'🎮 Fun',
    until_word:'until', active_coupons:'active coupons', no_active_coupons:'No active coupons yet',
    store_title_suffix:'promo codes & discounts', store_all_codes:'All current promo codes for', up_to_90_off:'Up to 90% off.',
    report_title:'Coupon not working?', report_msg:'Thank you! Coupon "{name}" ({merchant}) was sent for review.',
    feed_names:'Anna,Dmitry,Maria,Ivan,Olga,Sergey,Catherine,Alex,Natalia,Pavel',
    feed_act1:'{name}: saved {sum}₽ at {m}', feed_act2:'{name}: {pct}% off at {m}', feed_act3:'{name}: coupon activated at {m}',
    blog_title: '📝 Blog', blog_read: 'Read →',
    blog_1_title: 'How to Save on Ozon in 2026: Complete Guide', blog_1_desc: 'All ways to save: promo codes, cashback, first-order coupons and seasonal sales. Current codes for September.',
    blog_2_title: 'Pyaterochka Promo Codes: How to Get Discounts on Groceries', blog_2_desc: 'Working promo codes for online grocery orders at Pyaterochka. All codes verified and give up to 30% off.',
    blog_3_title: '10 Shopping Hacks with Coupons', blog_3_desc: 'How to combine promo codes with sales, cashback and loyalty programs. Real examples of saving up to 70%.',
    blog_4_title: 'Wildberries vs Ozon: Where Is Cheaper in September 2026', blog_4_desc: 'We compared prices on 50 items including promo codes and delivery. Spoiler: difference up to 40%.',
    blog_5_title: 'How to Check a Promo Code Works Before Checkout', blog_5_desc: 'Step-by-step guide: where to find the code field, how to avoid mistakes and what to do if discount is not applied.',
    blog_6_title: 'Travel Discounts: Promo Codes for Hotels and Flights', blog_6_desc: 'Best coupons for Ostrovok, Travellata, Aviasales. How to book a vacation with up to 25% savings.',
  },
  zh: {
    nav_home: '首页', nav_top: '热门折扣', nav_faq: '使用说明', nav_blog: '博客',
    search_placeholder: '商店或商品...', search_btn: '搜索',
    get_btn: '获取 →', load_more: '加载更多',
    found: '找到:', all_stores: '✕ 所有商店', coupons_word: '优惠券',
    hot_title: '🔥 即将过期', no_results: '未找到结果',
    footer_text: '© 2026 Kodkupona · 版权所有',
    topbar_top: '🔥 最划算的 <strong>60</strong> 大折扣', top_hero_title: '🔥 热门折扣<br><span class="highlight">最高90%</span>',
    top_hero_sub: '商家最佳优惠——按折扣力度排序', sort_by_discount: '按折扣力度排序 ↓',
    footer_desc: '最大的优惠码与折扣目录',
    hero_title: '最高 <span class="highlight">90%</span> 折扣',
    sidebar_title: '商店 A–Z', favorites: '❤️ 收藏',
    tg_text: '📲 Telegram获取新优惠券', tg_btn: '订阅',
    counter_text: '⚡ 今日已激活:',
    greeting_morning: '早上好！☀️', greeting_day: '下午好！👋',
    greeting_evening: '晚上好！🌆', greeting_night: '晚安！🌙',
    greet_tpl: '{g} 当前有效 <strong>{a}</strong> {cp}，覆盖 <strong>{m}</strong> {mp}',
    coupon_forms: '张优惠券', shop_forms: '家商店',
    verified: '✅ 今日验证', faq_title: '❓ 如何使用优惠码',
    faq_q1: '在哪里输入优惠码？', faq_a1: '在商店网站找到"优惠码"或"折扣码"字段，通常在结算页面订单总额旁边。',
    faq_q2: '为什么优惠码无效？', faq_a2: '请检查：1) 优惠券有效期；2) 最低消费金额；3) 是否适用于您的商品。如有问题请在Telegram联系我们。',
    faq_q3: '一个优惠码能用几次？', faq_a3: '通常每位顾客使用一次。部分优惠码可重复使用，详见优惠券说明。',
    faq_q4: '如何确认优惠券有效？', faq_a4: '我们人工检查每张优惠券。"✅ 今日验证"表示该码在24小时内测试通过。',
    nothing_found: '无商店',
    cat_all:'全部',cat_electronics:'💻 电子',cat_food:'🍔 美食',cat_fashion:'👗 时尚',cat_travel:'✈️ 旅行',cat_home:'🏠 家居',cat_beauty:'💄 美妆',cat_kids:'👶 儿童',cat_sport:'⚽ 运动',cat_fun:'🎮 娱乐',
    until_word:'有效期至', active_coupons:'张有效优惠券', no_active_coupons:'暂无有效优惠券',
    store_title_suffix:'优惠码和折扣', store_all_codes:'全部最新优惠码：', up_to_90_off:'最高90%折扣。',
    report_title:'优惠券无效？', report_msg:'谢谢！优惠券「{name}」({merchant})已提交审核。',
    feed_names:'小明,小红,阿强,小丽,小刚,小芳,伟杰,静磊,娟涛,敏娜',
    feed_act1:'{name}：在 {m} 省了 {sum}元', feed_act2:'{name}：在 {m} 获得 {pct}% 折扣', feed_act3:'{name}：在 {m} 启用了优惠券',
    blog_title: '📝 博客', blog_read: '阅读 →',
    blog_1_title: '2026年Ozon省钱完全指南', blog_1_desc: '所有省钱方式：优惠码、返现、首单优惠券和季节性促销。九月最新有效码。',
    blog_2_title: '五元素超市优惠码：如何获得食品折扣', blog_2_desc: '收集了五元素在线订单的有效优惠码，全部验证可用，最高30%折扣。',
    blog_3_title: '10个优惠券购物技巧', blog_3_desc: '如何将优惠码与促销、返现和积分计划结合使用。实际案例最高省70%。',
    blog_4_title: 'Wildberries vs Ozon：2026年9月哪里更便宜', blog_4_desc: '对比50种商品含优惠码和配送的价格。剧透：差价高达40%。',
    blog_5_title: '如何在结账前验证优惠码是否有效', blog_5_desc: '分步指南：在哪里找到输入框，如何避免错误，折扣未生效怎么办。',
    blog_6_title: '旅行折扣：酒店预订和机票优惠码', blog_6_desc: 'Ostrovok、Travellata、Aviasales最佳优惠券。如何预订假期省25%。',
  },
  uz: {
    nav_home: 'Bosh sahifa', nav_top: 'Eng yaxshi chegirmalar', nav_faq: 'Qanday ishlatish', nav_blog: 'Blog',
    search_placeholder: "Do'kon yoki mahsulot...", search_btn: 'Qidirish',
    get_btn: 'Olish →', load_more: "Yana ko'rsatish",
    found: 'Topildi:', all_stores: "✕ Barcha do'konlar", coupons_word: 'kuponlar',
    hot_title: '🔥 Tez orada tugaydi', no_results: 'Hech narsa topilmadi',
    footer_text: '© 2026 Kodkupona · Barcha huquqlar himoyalangan',
    topbar_top: '🔥 Eng foydali <strong>60</strong> chegirma', top_hero_title: '🔥 Eng yaxshi chegirmalar<br><span class="highlight">90% gacha</span>',
    top_hero_sub: "Do'konlarning eng yaxshi takliflari — chegirma bo'yicha saralangan", sort_by_discount: "Chegirma bo'yicha saralangan ↓",
    footer_desc: 'Promokod va chegirmalarning eng katta katalogi',
    hero_title: '<span class="highlight">90%</span> gacha chegirma',
    sidebar_title: "Do'konlar A–Z", favorites: '❤️ Saralangan',
    tg_text: '📲 Yangi kuponlar Telegramda', tg_btn: 'Obuna qilish',
    counter_text: '⚡ Bugun faollashtirilgan:',
    greeting_morning: 'Xayrli tong! ☀️', greeting_day: 'Xayrli kun! 👋',
    greeting_evening: 'Xayrli kech! 🌆', greeting_night: 'Xayrli tun! 🌙',
    greet_tpl: '{g} Hozir faol <strong>{a}</strong> {cp}, <strong>{m}</strong> {mp}',
    coupon_forms: 'ta kupon', shop_forms: 'doʻkondan',
    verified: '✅ Bugun tekshirildi', faq_title: '❓ Promokodni qanday ishlatish',
    faq_q1: 'Promokodni qayerga kiritish kerak?', faq_a1: "Do'kon saytida \"Promokod\" yoki \"Chegirma kodi\" maydonini toping. Odatda buyurtma sahifasida, summa yonida joylashgan.",
    faq_q2: 'Kod nega ishlamayapti?', faq_a2: "Tekshiring: 1) kupon muddati; 2) minimal buyurtma summasi; 3) chegirma mahsulotingizga tegishlimi. Muammo bo'lsa — Telegram orqali yozing.",
    faq_q3: 'Bitta kodni necha marta ishlatish mumkin?', faq_a3: "Odatda bir xaridor uchun 1 marta. Ba'zi kodlar ko'p marta ishlaydi — kupon tavsifida ko'rsatilgan.",
    faq_q4: 'Kupon amal qilishini qanday bilish mumkin?', faq_a4: "Har bir kupenni qo'lda tekshiramiz. \"✅ Bugun tekshirildi\" belgisi kod 24 soat ichida sinalgan degani.",
    nothing_found: "Do'konlar yo'q",
    cat_all:'Barchasi',cat_electronics:'💻 Elektronika',cat_food:'🍔 Ovqat',cat_fashion:'👗 Kiyim',cat_travel:'✈️ Sayohat',cat_home:'🏠 Uy',cat_beauty:'💄 Chiroylilik',cat_kids:'👶 Bolalar',cat_sport:'⚽ Sport',cat_fun:'🎮 Koʻngilochar',
    until_word:'muddati', active_coupons:'ta faol kupon', no_active_coupons:"Faol kuponlar yo'q",
    store_title_suffix:'promokodlari va chegirmalari', store_all_codes:'Barcha amaldagi promokodlar:', up_to_90_off:'90% gacha chegirma.',
    report_title:'Kupon ishlamayaptimi?', report_msg:'Rahmat! «{name}» kupon ({merchant}) tekshiruvga yuborildi.',
    feed_names:'Dilnoza,Jasur,Malika,Sardor,Feruza,Bekzod,Nigora,Rustam,Zilola,Shaxzod',
    feed_act1:"{name}: {m} do'konida {sum} ₽ tejaldi", feed_act2:"{name}: {m} do'konida {pct}% chegirma", feed_act3:"{name}: {m} do'konida kupon faollashtirildi",
    blog_title: '📝 Blog', blog_read: "O'qish →",
    blog_1_title: '2026 yilda Ozon-da qanday tejash mumkin: to‘liq qo‘llanma', blog_1_desc: "Barcha tejash usullari: promokodlar, kechbek, birinchi buyurtma kuponlari va mavsumiy chegirmalar. Sentyabr uchun amaldagi kodlar.",
    blog_2_title: 'Pyaterochka promokodlari: oziq-ovqatga chegirma olish', blog_2_desc: "Pyaterochka onlayn buyurtmasi uchun ishlaydigan promokodlar. Barcha kodlar tekshirilgan va 30% gacha chegirma beradi.",
    blog_3_title: 'Kuponlar bilan xarid qilishning 10 usuli', blog_3_desc: "Promokodlarni chegirmalar, kechbek va bonus dasturlari bilan qanday birlashtirish. 70% gacha tejash misollari.",
    blog_4_title: 'Wildberries vs Ozon: 2026 sentyabrda qayerda arzon', blog_4_desc: "50 ta mahsulot narxini promokod va yetkazib berish bilan solishtirdik. Farq 40% gacha.",
    blog_5_title: 'Buyurtma rasmiylashtirishdan oldin promokod ishlashini qanday tekshirish', blog_5_desc: "Qadam-baqam yo‘riqnoma: kod maydonini qayerda topish, xatolardan qanday saqlanish va chegirma qo‘llanilmasa nima qilish.",
    blog_6_title: 'Sayohat chegirmalari: mehmonxona va aviachipta promokodlari', blog_6_desc: "Ostrovok, Travellata, Aviasales uchun eng yaxshi kuponlar. Tatilni 25% gacha tejab band qilish.",
  }
};

let lang = localStorage.getItem('lang') || 'ru';
function t(key) { return (i18n[lang] && i18n[lang][key]) || i18n.ru[key] || key; }

function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
  // Static elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  // Надписи с разметкой (напр. «Топ <strong>60</strong>») — через innerHTML
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  // Dynamic elements
  const sp = document.getElementById('search-input'); if (sp) sp.placeholder = t('search_placeholder');
  const sb = document.querySelector('.search-btn'); if (sb) sb.textContent = t('search_btn');
  const ht = document.querySelector('.hero-title-sm'); if (ht) ht.innerHTML = t('hero_title');
  const st = document.querySelector('.sidebar-title'); if (st) st.textContent = t('sidebar_title');
  const hots = document.getElementById('hot-section')?.querySelector('.section-title'); if (hots) hots.textContent = t('hot_title');
  const faqT = document.querySelector('#faq .section-title'); if (faqT) faqT.textContent = t('faq_title');
  const fb = document.querySelector('.footer-bottom p'); if (fb) fb.textContent = t('footer_text');
  // FAQ items
  const faqItems = document.querySelectorAll('.faq-list details');
  ['1','2','3','4'].forEach((n, i) => {
    if (faqItems[i]) {
      const s = faqItems[i].querySelector('summary'); if(s) s.textContent = t('faq_q'+n);
      const p = faqItems[i].querySelector('p'); if(p) p.textContent = t('faq_a'+n);
    }
  });
  // Сигнал страницам, что язык изменился: каждая страница сама перерисовывает динамический контент
  // (слушатели 'langchange' — в app.js, top.js, store.js, blog-post.js)
  try { document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } })); } catch(e){}
}

// ===== EVENT DELEGATION (theme + lang on all pages) =====
document.addEventListener('click', function(e) {
  if (e.target.closest('#theme-toggle')) { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('theme', theme); applyTheme(); return; }
  const langBtn = e.target.closest('[data-lang]');
  if (langBtn) { setLang(langBtn.dataset.lang); return; }
});

// ===== INIT =====
applyTheme();
if (lang !== 'ru') { try { setLang(lang); } catch(e){} } else { document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === 'ru')); }
