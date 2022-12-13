/**
 * A simple bookmarklet
 * @author Nick Freear, 30-Oct-2022.
 */

/* eslint-env browser */

// const { location, open, URLSearchParams } = window;

const title = document.querySelector('title').textContent;
const url = location.href;
const TARGET = '%{ORIGIN}/notes-app/save.html?' + new URLSearchParams({ title, url });
const RES = window.open(TARGET);

console.debug('NN Bookmarklet:', TARGET, RES);

/* End. */
