/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 */

import SettingsForm from './SettingsForm.mjs';
import Gist from './Gist.mjs';

const NAMES = ['url', 'title', 'text'];

export class BookmarkForm {
  constructor (selector = '#bookmark-form') {
    this.form = document.querySelector(selector);
    this.elems = this.form.elements;
    this.status = this.form.querySelector('.status');

    // const settings = new Settings();
    // this.CFG = settings.data;
    SettingsForm.retrieveData().then(settings => { this.CFG = settings; });

    this.form.addEventListener('submit', ev => this._handleSubmit(ev));

    console.debug('Bookmark.ctor', this);
  }

  async _handleSubmit (event) {
    event.preventDefault();

    // Data from form.
    const bookmark = this._formData;

    bookmark.time = new Date().toISOString();

    try {
      const gist = new Gist(); // this.CFG.github);
      const resp = await gist.writeJson(bookmark);
      const { html_url } = resp.data; /* eslint-disable-line camelcase */

      this._showSuccess(`<a href="${html_url}">Gist created</a>`, { bookmark, resp }); /* eslint-disable-line camelcase */
    } catch (ex) {
      this._showError('problem creating Gist', { ex });
    }
    console.debug('Bookmark.submit:', bookmark, this.elems, event);
  }

  handleMessage (event) {
    const { bookmark } = event.data;

    console.debug('Bookmark form: message from SW:', bookmark, this.elems, event.data);

    if (bookmark) {
      this._formData = bookmark;
    }
  }

  // Data from form.
  get _formData () {
    const bookmark = {};
    NAMES.forEach(name => { bookmark[name] = this.elems[name].value; });

    bookmark.private = this.elems.private.checked;
    return bookmark;
  }

  // Data to form.
  set _formData (bookmark) {
    NAMES.forEach(name => { this.elems[name].value = bookmark[name]; });
  }

  _showSuccess (message, data) {
    const { resp } = data;
    console.debug(`Bookmark success (${resp.status}): '${message}'`, data);
    this.status.innerHTML = `${message} (${resp.status})`;
    this.status.dataset.state = 'success';
  }

  _showError (message, error) {
    const { ex } = error;
    console.error(`Bookmark error (${ex.status}): '${message}'`, error);
    this.status.textContent = `${message} (${ex.status})`;
    this.status.dataset.state = 'error';
  }
}
