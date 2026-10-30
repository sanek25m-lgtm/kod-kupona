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
  $('login').addEventListener('click',()=>{
    if(!window.google?.accounts?.oauth2){alert('Google ещё загружается. Попробуйте снова.');return;}
    google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:async response=>{
      if(response.error){alert('Не удалось войти: '+response.error);return;}
      token=response.access_token;$('signin').hidden=true;$('dashboard').hidden=false;$('logout').hidden=false;refresh();
    }}).requestAccessToken();
  });
  $('logout').addEventListener('click',()=>{const old=token;token=null;generation++;$('dashboard').hidden=true;$('signin').hidden=false;$('logout').hidden=true;if(old)google.accounts.oauth2.revoke(old,()=>{});});
  $('period').addEventListener('click',e=>{const b=e.target.closest('button[data-days]');if(!b)return;days=Number(b.dataset.days);document.querySelectorAll('#period button').forEach(x=>x.classList.toggle('active',x===b));refresh();});
})();
