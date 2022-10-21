/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 */

import { MyFormElement } from '../../elements/src/components/MyFormElement.js';
import AppSettingsForm from './SettingsForm.mjs';
import Gist from './Gist.mjs';

const { serviceWorker } = window.navigator;
// const NAMES = ['url', 'title', 'text'];

export default class BookmarkForm extends MyFormElement {
  static getTag () {
    return 'bookmark-form';
  }

  async connectedCallback () {
    this._CFG = await AppSettingsForm.retrieveData();
    // AppSettingsForm.retrieveData().then(settings => { this.CFG = settings; });

    this._onsubmit = (ev) => this._handleSubmit(ev);

    serviceWorker.addEventListener('message', (ev) => this._handleMessage(ev));

    console.debug('BookmarkForm.connected:', this);
  }

  get _status () {
    return this.querySelector('.status');
  }

  /* constructor (selector = '#bookmark-form') {
    this.form = document.querySelector(selector);
    this.elems = this.form.elements;
    this.status = this.form.querySelector('.status');

    // const settings = new Settings();
    // this.CFG = settings.data;
    SettingsForm.retrieveData().then(settings => { this.CFG = settings; });

    this.form.addEventListener('submit', ev => this._handleSubmit(ev));

    console.debug('Bookmark.ctor', this);
  } */

  async _handleSubmit (event) {
    // event.preventDefault();

    // Data from form.
    const bookmark = this._formData;

    // bookmark.time = new Date().toISOString();

    try {
      const gist = new Gist(); // this._CFG.github);
      const resp = await gist.writeJson(bookmark);
      const { html_url } = resp.data; /* eslint-disable-line camelcase */

      this._showSuccess(`<a href="${html_url}">Gist created</a>`, { bookmark, resp }); /* eslint-disable-line camelcase */
    } catch (ex) {
      this._showError('problem creating Gist', { ex });
    }
    console.debug('BookmarkForm.submit:', bookmark, this.elems, event);
  }

  _handleMessage (event) {
    const { bookmark } = event.data;

    console.debug('BookmarkForm: message from SW:', bookmark, this.elems, event.data);

    if (bookmark) {
      this._formData = bookmark;
    }
  }

  // Data from form.
  get _formData () {
    const bookmark = super._formData;
    // NAMES.forEach(name => { bookmark[name] = this.elems[name].value; });

    bookmark.private = this.elems.private.checked;
    bookmark.time = new Date().toISOString();
    return bookmark;
  }

  /* // Data to form.
  set _formData (bookmark) {
    NAMES.forEach(name => { this.elems[name].value = bookmark[name]; });
  } */

  _showSuccess (message, data) {
    const { resp } = data;
    console.debug(`Bookmark success (${resp.status}): '${message}'`, data);
    this._status.innerHTML = `${message} (${resp.status})`;
    this._status.dataset.state = 'success';
  }

  _showError (message, error) {
    const { ex } = error;
    console.error(`Bookmark error (${ex.status}): '${message}'`, error);
    this._status.textContent = `${message} (${ex.status})`;
    this._status.dataset.state = 'error';
  }
}

BookmarkForm.define();
