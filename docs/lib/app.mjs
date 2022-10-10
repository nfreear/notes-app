/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 */

import { BookmarkForm } from './BookmarkForm.mjs';

const { location, navigator } = window;
const { serviceWorker } = navigator;

const FORM = new BookmarkForm();

if ('serviceWorker' in navigator) {
  serviceWorker.addEventListener('message', (event) => FORM.handleMessage(event));

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
