/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 *
 * Store and access App. settings.
 */

import { MyFormElement } from '../../elements/src/components/MyFormElement.js';

const { document, localStorage, navigator } = window;
const { clipboard } = navigator;

const KEY = 'nick-notes-app.settings';

export default class AppSettingsForm extends MyFormElement {
  static getTag () {
    return 'app-settings-form';
  }

  static async _storeData (data) {
    data.time = new Date().toISOString();
    const RES = localStorage.setItem(KEY, JSON.stringify(data));
    console.debug('AppSettingsForm.store:', RES, data);
    return RES;
  }

  static async _retrieveData () {
    const RAW = localStorage.getItem(KEY);
    const DATA = RAW ? JSON.parse(RAW) : {};
    console.debug('AppSettingsForm.retrieve:', DATA);
    return DATA;
  }

  async connectedCallback () {
    this._formData = await this.constructor._retrieveData();

    this._onsubmit = async (ev) => {
      await this.constructor._storeData(this._formData);

      console.debug('AppSettingsForm.submit:', this._formData, ev);
    };

    this._handlePasteButton('#paste-button');

    console.debug('AppSettingsForm.connect:', this._formData, this);
  }

  /*
  github: gbp_aBc123
  pinboard: abcd1234
  */

  _handlePasteButton (selector) {
    const BUTTON = document.querySelector(selector);

    BUTTON.addEventListener('click', async (ev) => {
      ev.preventDefault();

      const TEXT = await clipboard.readText();
      const MATCHES = TEXT ? TEXT.matchAll(/([\w]+):\s+([\w_-]+)/g) : null;
      const DATA = {};

      [...MATCHES].forEach(match => { // Was: [].map();
        const key = match[1].toLowerCase();
        if (this._names.find(el => el === key)) {
          DATA[key] = match[2];
        }
      });

      this._formData = DATA;

      console.debug('AppSettingsForm.paste:', DATA, [...MATCHES]);
    });
  }
}

AppSettingsForm.define();
