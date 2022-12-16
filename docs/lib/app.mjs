/**
 * Nick’s Notes Web App.
 *
 * @see https://github.com/nfreear/notes-app
 * @copyright © Nick Freear, 08-Oct-2022.
 */

import './MyAuthElement.mjs';
import './MySaveTarget.mjs';
import './BookmarkForm.mjs';
import './SettingsForm.mjs';
import '../../elements/src/components/MyBookmarkletElement.js';
// import '../../elements/src/components/MyIndieAuthElement.js';

// document.body.addEventListener('click', ev => console.debug('>> Click:', ev.target, ev.target.nodeName, ev));

const { location, navigator } = window;
const { serviceWorker } = navigator;

if ('serviceWorker' in navigator) {
  // serviceWorker.addEventListener('message', (event) => FORM.handleMessage(event));

  const MOCK = /mock=1/.test(location.search);

  serviceWorker
    .register(`./service-worker.mjs${MOCK ? '?mock=1' : ''}`, { type: 'module' })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        // If updatefound is fired, it means that there's
        // a new service worker being installed.
        const installingWorker = registration.installing;
        console.debug(
          'App: new service worker is being installed:',
          installingWorker
        );

        // You can listen for changes to the installing service worker's
        // state via installingWorker.onstatechange
      });
    })
    .catch((error) => {
      console.error(`App: service worker registration failed: ${error}`);
    });
} else {
  console.error('App: service workers are not supported.');
}
