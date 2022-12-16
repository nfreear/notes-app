/**
 * A simple bookmarklet.
 *
 * @copyright © Nick Freear, 30-Oct-2022.
 */

/* eslint-env browser */

// const { location, open, URLSearchParams, getSelection } = window;

const title = document.querySelector('title').textContent;
const url = location.href;
const text = getSelection() + ''; // .toString();
const TARGET = '%{ORIGIN}/notes-app/save.html?' + new URLSearchParams({ title, url, text });
const RES = window.open(TARGET);

console.debug('NN Bookmarklet:', TARGET, RES);

/* End. */
