// refresh.js — обновление купонов из gdeslon.ru для GitHub Pages
// Токен берётся из env GDESLON_API_TOKEN (в репо он хранится как Actions secret).
// Вывод: coupons_data.json + sitemap.xml рядом с этим файлом.
'use strict';
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const token = process.env.GDESLON_API_TOKEN || '';
if (!token) { console.error('❌ Не задан GDESLON_API_TOKEN'); process.exit(1); }
const API_URL = `http://gdeslon.ru/api/coupons.csv?coupon_type=coupons&coupon_type=promo&api_token=${token}`;
const BASE = (process.env.PAGES_BASE || 'https://sanek25m-lgtm.github.io/kod-kupona').replace(/\/+$/, '');
const OUT_JSON = path.join(__dirname, 'coupons_data.json');
const OUT_SITEMAP = path.join(__dirname, 'sitemap.xml');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { timeout: 30000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(';');
    if (vals.length < headers.length) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (vals[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

(async () => {
  const now = new Date();
  const raw = await fetchUrl(API_URL);
  const rows = parseCSV(raw.toString('utf8'));
  if (rows.length < 10) { console.error(`⚠️ Мало данных (${rows.length}) — обновление пропущено`); process.exit(1); }

  let expired = 0;
  const output = rows
    .filter(r => {
      if (!r.name) return false;
      if (r.finish_at && r.finish_at.trim()) {
        const d = new Date(r.finish_at);
        if (!isNaN(d.getTime()) && d < now) { expired++; return false; }
      }
      return true;
    })
    .map(r => ({
      id: r.id || '',
      name: r.name || '',
      desc: (r.description || '').trim(),
      code: (r.code || '').trim(),
      merchant: (r.merchant || '').trim(),
      logo: (r.logo || '').trim(),
      url: (r.url || '').trim(),
      url_code: (r['url-with-code'] || '').trim(),
      finish: (r.finish_at || '').trim(),
    }));

  const tmp = OUT_JSON + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(output, null, 1), 'utf8');
  if (fs.existsSync(OUT_JSON)) fs.unlinkSync(OUT_JSON);
  fs.renameSync(tmp, OUT_JSON);

  const merchants = [...new Set(output.map(c => c.merchant).filter(Boolean))];
  let sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';
  sm += `  <url><loc>${BASE}/</loc><changefreq>hourly</changefreq></url>\n`;
  sm += `  <url><loc>${BASE}/top.html</loc><changefreq>daily</changefreq></url>\n`;
  sm += `  <url><loc>${BASE}/blog.html</loc><changefreq>weekly</changefreq></url>\n`;
  merchants.forEach(m => { sm += `  <url><loc>${BASE}/store.html?merchant=${encodeURIComponent(m)}</loc><changefreq>daily</changefreq></url>\n`; });
  sm += '</urlset>';
  fs.writeFileSync(OUT_SITEMAP, sm, 'utf8');

  console.log(`✅ ${output.length} активных купонов (удалено истёкших: ${expired}) → coupons_data.json + sitemap.xml (${merchants.length} магазинов)`);
})().catch(e => { console.error('❌ Ошибка обновления:', e.message); process.exit(1); });
