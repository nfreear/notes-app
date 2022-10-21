/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 *
 * Store and access App. settings.
 */

import { MyFormElement } from '../../elements/src/components/MyFormElement.js';
// import '../../elements/src/components/MyIndieAuthElement.js';

const { document, localStorage, navigator } = window;
const { clipboard } = navigator;

const KEY = 'nick-notes-app.settings';
// const NAMES = ['github', 'time'];

export default class AppSettingsForm extends MyFormElement {
  static getTag () {
    return 'app-settings-form';
  }

  static async storeData (data) {
    data.time = new Date().toISOString();
    const RES = localStorage.setItem(KEY, JSON.stringify(data));
    console.debug('AppSettingsForm.store:', RES, data);
    return RES;
  }

  static async retrieveData () {
    const RAW = localStorage.getItem(KEY);
    const DATA = RAW ? JSON.parse(RAW) : {};
    console.debug('AppSettingsForm.retrieve:', DATA);
    return DATA;
  }

  async connectedCallback () {
    this._formData = await this.constructor.retrieveData();

    this._onsubmit = async (ev) => {
      await this.constructor.storeData(this._formData);

      console.debug('AppSettingsForm.submit:', this._formData, ev);
    };

    this._handlePasteButton('#paste-button');

    console.debug('AppSettingsForm.connect:', this._formData, this);
  }

  /* async handleForm (selector) {
    const FORM = document.querySelector(selector);

    this.elems = FORM.elements;
    this._formData = await SettingsForm.retrieveData();

    console.debug('Settings.handleForm:', this.elems, FORM);

    FORM.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      await SettingsForm.storeData(this._formData);
      console.debug('Settings.submit:', this.elems, ev);
    });
  } */

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

/* if (/settings.html/.test(location.pathname)) {
  const settings = new SettingsForm();

  settings.handleForm('#settings-form');
  settings.handlePasteButton('#paste-button');
} */
