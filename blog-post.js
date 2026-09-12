// Preserve existing article links; canonical articles are static HTML.
(function(){
  const id = new URLSearchParams(location.search).get('id');
  const routes = {"1":"blog/ekonomiya-na-ozon/","2":"blog/promokody-pyaterochka/","3":"blog/10-sovetov-po-kuponam/","4":"blog/sravnenie-wildberries-ozon/","5":"blog/proverka-promokoda/","6":"blog/kupony-dlya-puteshestviy/"};
  if(routes[id])location.replace(new URL(routes[id],couponSiteRoot));
  else location.replace(new URL('blog.html',couponSiteRoot));
})();
