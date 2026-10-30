(() => {
  'use strict';
  const CLIENT_ID = '328376769637-rhohuq2moagbbshf7uaoetu0n4aakid1.apps.googleusercontent.com';
  const PROPERTY = '561594621';
  const SCOPES = 'https://www.googleapis.com/auth/analytics.readonly';
  let token = null, days = 6, generation = 0;
  const $ = id => document.getElementById(id);
  function status(text) { $('status').textContent = text; }
  function rows(id, data) {
    const el = $(id); el.replaceChildren();
    if (!data.rows || !data.rows.length) { const p=document.createElement('p');p.className='empty';p.textContent='Данных пока нет';el.append(p);return; }
    for (const row of data.rows) { const div=document.createElement('div');div.className='row'; const label=document.createElement('span');label.textContent=row.dimensionValues.map(v=>v.value).join(' / ');const value=document.createElement('strong');value.textContent=Number(row.metricValues[0].value).toLocaleString('ru-RU');div.append(label,value);el.append(div); }
  }
  async function report(dimensions, metrics, extra={}) {
    const body={dateRanges:[{startDate:days+'daysAgo',endDate:'today'}],dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),limit:'10',...extra};
    const res=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+PROPERTY+':runReport',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json(); if(!res.ok)throw new Error(data.error?.message||'Ошибка загрузки отчёта'); return data;
  }
  async function refresh() {
    if(!token)return; const run=++generation; status('Загружаем статистику…');
    ['users','sessions','views','clicks'].forEach(id=>$(id).textContent='—');
    ['sources','landing','pages','countries'].forEach(id=>$(id).replaceChildren());
    try {
      const [totals,sources,landing,pages,countries,clicks]=await Promise.all([
        report([],['totalUsers','sessions','screenPageViews']),
        report(['sessionSourceMedium'],['sessions'],{orderBys:[{metric:{metricName:'sessions'},desc:true}]}),
        report(['landingPagePlusQueryString'],['sessions'],{orderBys:[{metric:{metricName:'sessions'},desc:true}]}),
        report(['pagePath'],['screenPageViews'],{orderBys:[{metric:{metricName:'screenPageViews'},desc:true}]}),
        report(['country'],['totalUsers'],{orderBys:[{metric:{metricName:'totalUsers'},desc:true}]}),
        report([],['eventCount'],{dimensionFilter:{filter:{fieldName:'eventName',stringFilter:{value:'outbound_click',matchType:'EXACT'}}}})
      ]);
      if(run!==generation)return; const n=totals.rows?.[0]?.metricValues||[];
      ['users','sessions','views'].forEach((id,i)=>$(id).textContent=Number(n[i]?.value||0).toLocaleString('ru-RU'));
      $('clicks').textContent=Number(clicks.rows?.[0]?.metricValues?.[0]?.value||0).toLocaleString('ru-RU');
      rows('sources',sources);rows('landing',landing);rows('pages',pages);rows('countries',countries);status('');
    } catch(e) { if(run===generation)status('Не удалось загрузить данные: '+e.message); }
  }

  let admitadRows = [], visibleOffers = 20, feedGeneration = 0;
  function showOffers() {
    const q=$('admitad-search').value.trim().toLocaleLowerCase('ru-RU');
    const matched=admitadRows.filter(x=>((x.merchant||'')+' '+(x.name||'')).toLocaleLowerCase('ru-RU').includes(q));
    const container=$('admitad-offers');container.replaceChildren();
    if(!matched.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=q?'По вашему запросу ничего не найдено':'Опубликованных предложений пока нет';container.append(empty);}
    for(const item of matched.slice(0,visibleOffers)){
      const row=document.createElement('div');row.className='offer-row';
      const merchant=document.createElement('span');merchant.className='offer-merchant';merchant.textContent=item.merchant||'Магазин';
      const name=document.createElement('span');name.textContent=item.name||'Предложение';
      const finish=document.createElement('span');finish.className='offer-expiry';const end=item.finish&&new Date(item.finish);
      finish.textContent=end&&!Number.isNaN(end.getTime())?'До '+new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Yekaterinburg',day:'2-digit',month:'2-digit',year:'numeric'}).format(end):'Без даты окончания';
      row.append(merchant,name,finish);container.append(row);
    }
    $('admitad-more').hidden=visibleOffers>=matched.length;
    $('admitad-more').textContent='Показать ещё ('+Math.max(0,matched.length-visibleOffers).toLocaleString('ru-RU')+')';
  }
  async function loadAdmitad() {
    const run=++feedGeneration;
    $('admitad-status').textContent='Загружаем данные…';
    try {
      const [offersResponse,metadataResponse]=await Promise.all([
        fetch('/data/browser-coupons.json',{cache:'no-store'}),
        fetch('/data/admitad-status.json',{cache:'no-store'})
      ]);
      if(!offersResponse.ok) throw new Error('каталог недоступен');
      const all=await offersResponse.json();
      if(!Array.isArray(all))throw new Error('неверный формат каталога');
      const metadata=metadataResponse.ok?await metadataResponse.json():null;
      if(run!==feedGeneration||!token)return;
      admitadRows=all.filter(x=>x&&x.source==='admitad').sort((a,b)=>String(a.merchant||'').localeCompare(String(b.merchant||''),'ru')||String(a.name||'').localeCompare(String(b.name||''),'ru'));
      const codes=admitadRows.filter(x=>String(x.code||'').trim()).length;
      const merchants=new Set(admitadRows.map(x=>String(x.merchant||'').trim()).filter(Boolean));
      const number=n=>n.toLocaleString('ru-RU');
      $('admitad-total').textContent=number(admitadRows.length);
      $('admitad-codes').textContent=number(codes);
      $('admitad-deals').textContent=number(admitadRows.length-codes);
      $('admitad-merchants').textContent=number(merchants.size);
      const date=metadata?.fetched_at?new Date(metadata.fetched_at):null;
      $('admitad-updated').textContent=date&&!Number.isNaN(date.getTime())?'Последнее обновление: '+new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Yekaterinburg',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date)+' (Екатеринбург)':'Время обновления недоступно';
      $('admitad-status').textContent='Количество показано после удаления дублей; обновление фида — ежедневно.';
      visibleOffers=20;showOffers();
    } catch(e) {
      if(run===feedGeneration&&token){$('admitad-status').textContent='Не удалось загрузить данные Admitad: '+e.message;$('admitad-updated').textContent='Время обновления недоступно';}
    }
  }
  $('admitad-search').addEventListener('input',()=>{visibleOffers=20;showOffers();});
  $('admitad-more').addEventListener('click',()=>{visibleOffers+=20;showOffers();});

  $('login').addEventListener('click',()=>{
    if(!window.google?.accounts?.oauth2){alert('Google ещё загружается. Попробуйте снова.');return;}
    google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:async response=>{
      if(response.error){alert('Не удалось войти: '+response.error);return;}
      token=response.access_token;$('signin').hidden=true;$('dashboard').hidden=false;$('logout').hidden=false;refresh();loadAdmitad();
    }}).requestAccessToken();
  });
  $('logout').addEventListener('click',()=>{const old=token;token=null;generation++;feedGeneration++;admitadRows=[];$('admitad-search').value='';$('admitad-offers').replaceChildren();$('dashboard').hidden=true;$('signin').hidden=false;$('logout').hidden=true;if(old)google.accounts.oauth2.revoke(old,()=>{});});
  $('period').addEventListener('click',e=>{const b=e.target.closest('button[data-days]');if(!b)return;days=Number(b.dataset.days);document.querySelectorAll('#period button').forEach(x=>x.classList.toggle('active',x===b));refresh();});
})();
