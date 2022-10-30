/**
 * A simple bookmarklet | 30-Oct-2022.
 */

const { location, open, URLSearchParams } = window;
const title = document.querySelector('title').textContent;
const url = location.href;
const TARGET = 'http://localhost:8081/notes-app/save.html?' + new URLSearchParams({ title, url });
const RES = open(TARGET);

console.debug('NN Bookmarklet:', TARGET, RES);

/* End. */
