/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 */

import { MyFormElement } from '../../elements/src/components/MyFormElement.js';
import AppSettingsForm from './SettingsForm.mjs';
import Gist from './Gist.mjs';
import Pinboard from './Pinboard.mjs';

const { location, navigator, FormData } = window;
const { serviceWorker } = navigator;
// const NAMES = ['url', 'title', 'text'];
const DELAY_MS = 500; // Was: 1000;

export default class BookmarkForm extends MyFormElement {
  static getTag () {
    return 'bookmark-form';
  }

  async connectedCallback () {
    this._CFG = await AppSettingsForm._retrieveData();
    // AppSettingsForm.retrieveData().then(settings => { this.CFG = settings; });

    this._onsubmit = (ev) => this._handleSubmit(ev);

    serviceWorker.addEventListener('message', (ev) => this._handleMessage(ev));

    console.debug('BookmarkForm.connected:', this, this._handleUrl());
  }

  get _status () {
    return this.querySelector('.status');
  }

  _handleUrl () {
    const params = new URL(location.href).searchParams;
    const saveBookmark = params.get('act') === 'save-bookmark';
    const bookmark = {
      url: params.get('url') || null,
      title: params.get('title') || '',
      text: params.get('text') || ''
    };

    if (saveBookmark && bookmark.url) {
      this._formData = bookmark;
    }

    this._status.textContent = location.href;
    this._status.dataset.state = 'url';

    return bookmark;
  }

  async _handleSubmit (event) {
    this.dataset.working = true;

    // Data from form.
    const bookmark = this._formData;

    bookmark.tags = this._trimSplitTags(bookmark.tags);

    // bookmark.time = new Date().toISOString();

    try {
      const gist = new Gist(this._CFG.github);
      const resp = await gist.writeJson(bookmark, bookmark.private);
      const { html_url } = resp.data; /* eslint-disable-line camelcase */

      this._showSuccess(`<a href="${html_url}">Gist created</a>`, { bookmark, resp }); /* eslint-disable-line camelcase */
    } catch (ex) {
      this._showError('problem creating Gist', { ex });
    }

    this._pause();

    try {
      const PB = new Pinboard(this._CFG.pinboard);
      const respPB = await PB.postBookmark(bookmark);

      this._showSuccess('Bookmark created in Pinboard', { resp: respPB });
    } catch (ex) {
      this._showError('problem creating Pinboard BM', { ex });
    }

    console.debug('BookmarkForm.submit:', bookmark, this.elements, event);

    this.dataset.working = false;
  }

  _handleMessage (event) {
    const { bookmark } = event.data;

    console.debug('BookmarkForm: message from SW:', bookmark, event.data);

    if (bookmark) {
      this._formData = bookmark;
    }
  }

  _getFormDataAlt (formEl = null) {
    const formData = new FormData(formEl || this);
    const data = {};

    for (const KV of formData.entries()) {
      // console.log(`${pair[0]}, ${pair[1]}`);
      data[KV[0]] = KV[1];
    }
    return { data, formData };
  }

  // Data from form.
  get _formData () {
    const bookmark = super._formData;

    bookmark.private = this.elements.private.checked;
    bookmark.time = new Date().toISOString();
    return bookmark;
  }

  // Data to form.
  set _formData (bookmark) {
    super._formData = bookmark;
  }

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

  async _pause (delayMS = DELAY_MS) {
    return new Promise(resolve => setTimeout(() => resolve(), delayMS));
  }

  /** Trim whitespace and commas, then split.
   * @return array Array of tags.
   */
  _trimSplitTags (tagStr) {
    const tagsArray = tagStr.replace(/^\s+|[\s,]+$/g, '').split(/[, ]+/);
    return tagsArray;
  }
}

BookmarkForm.define();
