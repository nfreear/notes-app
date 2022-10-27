/**
 * Nick’s Notes Web App | © Nick Freear.
 *
 * @see https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
 */

/* eslint-env worker */
const { clients, location } = self;

const VERSION = 'v1.0';
const CACHE_NAME = `nicks-notes-app-cache.${VERSION}`;

const PATH = location.pathname.replace(/\/[^/]+$/, '') + '/lib'; // '/docs/service-worker.js'

const FILES = [
  `${PATH}/app.mjs`,
  `${PATH}/BookmarkForm.mjs`,
  `${PATH}/Gist.mjs`,
  `${PATH}/MyAuthElement.mjs`,
  `${PATH}/Pinboard.mjs`,
  `${PATH}/SettingsForm.mjs`,
  '/elements/src/MyElement.js',
  '/elements/src/components/MyFormElement.js',
  // '/elements/src/components/MyIndieAuthElement.js',
  './index.html',
  './settings.html',
  './style/app.css',
  './style/icon.svg'
];

console.debug('Worker: location', PATH, location);

self.addEventListener('install', (event) => {
  console.warn('Worker.install:', CACHE_NAME, event);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const MOCK = /mock=1/.test(location.href);
  const mockGet = MOCK && event.request.method === 'GET';

  const IS_SAVE_BOOKMARK = /\?save-bookmark/.test(url);
  const IS_GET = event.request.method === 'GET';
  const parts = IS_GET ? new URL(url) : 'p';

  console.debug('Worker.fetch:', MOCK, url, parts, event);

  // Regular requests not related to Web Share Target.
  if (!IS_SAVE_BOOKMARK && !MOCK) { // event.request.method !== 'POST'
    event.respondWith(fetch(event.request));
    return;
  }

  if (/\/api.github.com/.test(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Requests related to Web Share Target.
  event.respondWith(
    (async () => {
      const formData = parts ? parts.searchParams : mockGet ? mockData() : await event.request.formData();
      const bookmark = {
        url: formData.get('url') || '',
        title: formData.get('title') || '',
        text: formData.get('text') || ''
      };

      // const link = formData.get("link") || "";
      // Instead of the original URL `/save-bookmark/`, redirect
      // the user to a URL returned by the `saveBookmark()`
      // function, for example, `/`.
      await postMessage(event, { bookmark });

      console.warn('>> Worker.save target:', bookmark);
      // return Response.redirect(responseUrl, 303);

      return fetch(event.request);
    })()
  ); // ev.respondWith;
});

async function postMessage (event, data) {
  // Get the client.
  const client = await clients.get(event.clientId);
  // Exit early if we don't get the client.
  // Eg, if it closed.
  if (!client) return;

  // Send a message to the client.
  client.postMessage(data);
  /* client.postMessage({
    msg: "Hey I just got a fetch from you!",
    url: event.request.url
  }); */
}

function mockData (key) {
  const M_DATA = {
    url: 'https://example.org',
    title: 'Mock',
    text: 'Example text ...'
  };
  return {
    get: (key) => M_DATA[key]
  };
}

// End.
