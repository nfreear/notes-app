/**
 * Nick’s Notes Web App | © Nick Freear, 08-Oct-2022.
 *
 * Store and access App. settings.
 */

const { document, localStorage, location, navigator } = window;
const { clipboard } = navigator;

const KEY = 'nick-notes-app.settings';
const NAMES = ['github', 'time'];

export default class SettingsForm {
  // constructor () {}

  static async storeData (data) {
    data.time = new Date().toISOString();
    const RES = localStorage.setItem(KEY, JSON.stringify(data));
    console.debug('Settings.store:', RES, data);
    return RES;
  }

  static async retrieveData () {
    const RAW = localStorage.getItem(KEY);
    const DATA = RAW ? JSON.parse(RAW) : {};
    console.debug('Settings.retrieve:', DATA);
    return DATA;
  }

  // Data from form.
  get _formData () {
    const DATA = {};
    NAMES.forEach(name => { DATA[name] = this.elems[name].value; });
    return DATA;
  }

  // Data to form.
  set _formData (data) {
    NAMES.forEach(name => { this.elems[name].value = data[name] || ''; });
  }

  async handleForm (selector) {
    const FORM = document.querySelector(selector);

    this.elems = FORM.elements;
    this._formData = await SettingsForm.retrieveData();

    console.debug('Settings.handleForm:', this.elems, FORM);

    FORM.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      await SettingsForm.storeData(this._formData);
      console.debug('Settings.submit:', this.elems, ev);
    });
  }

  /*
  github: gbp_aBc123
  pinboard: abcd1234
  */

  handlePasteButton (selector) {
    const BUTTON = document.querySelector(selector);

    BUTTON.addEventListener('click', async (ev) => {
      ev.preventDefault();

      const TEXT = await clipboard.readText();
      const MATCHES = TEXT ? TEXT.matchAll(/([\w]+):\s+([\w_-]+)/g) : null;
      const DATA = {};

      [...MATCHES].forEach(match => { // Was: [].map();
        const key = match[1].toLowerCase();
        if (NAMES.find(el => el === key)) {
          DATA[key] = match[2];
        }

        /* const LINE = {};
        LINE[match[1]] = match[2];
        return LINE; */
      });

      this._formData = DATA;

      console.debug('Settings.paste:', DATA, [...MATCHES]);
    });
  }
}

if (/settings.html/.test(location.pathname)) {
  const settings = new SettingsForm();

  settings.handleForm('#settings-form');
  settings.handlePasteButton('#paste-button');
}
