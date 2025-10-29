// public/sw.js
let apiUrl = new URL(self.location).searchParams.get('apiUrl') || 'NO-URL';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control immediately
});



function shouldProxyUrl(url) {
  return [
    'places.googleapis.com', 
    'maps.googleapis.com'
  ].includes(url.hostname);
}

function createProxyUrl(rawUrl, addCacheBuster = true) {
  // from .env
  const finalURL = new URL(apiUrl + '/gmaps-proxy');

  finalURL.searchParams.set('url', rawUrl);
  if (addCacheBuster) finalURL.searchParams.set('_t', Date.now())
  
  // console.log("PROXY URL - MODIFIED URL from ", rawUrl, " to ", newUrl);
  return finalURL.toString();
}



self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Forward calls to Google APIs through proxy
  if (shouldProxyUrl(url)) {
    event.respondWith((async () => {

      // console.log("SW - Processing request", event.request);
      // console.log("SW - Request body", (await event.request.clone().text()));
      const proxyUrl = createProxyUrl(event.request.url);

      let fullOptions = {
        method: event.request.method,
        headers: event.request.headers,
      };

      if (!['GET', 'HEAD'].includes(event.request.method)) {
        const bodyContent = (await event.request.arrayBuffer()) ?? null;
        fullOptions = {
          ...fullOptions,
          body: bodyContent,
        };
      }

      return fetch(proxyUrl, fullOptions).catch(error => { 
        console.error('Proxy fetch failed:', error);
      });

    })());
    return;
  }

  // For all other requests, use normal fetch
  event.respondWith(fetch(event.request));
});