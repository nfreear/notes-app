/**
 * Authentication in the browser.
 *
 * @disclaimer Experimental - not for production. Use at your own risk!
 * @copyright © Nick Freear, 03- / 21-Oct-2022.
 */

import MyElement from '../../elements/src/MyElement.js';
import Pinboard from './Pinboard.mjs';

const { crypto, localStorage } = window; // Was: sessionStorage.

const TEMPLATE = `
<template>
<p role="alert" part="alert"></p>
<form>
  <h2 part="h2">Login</h2>
  <label for="login">Login</label>
  <input id="login" name="login" required minlength="4" X-pattern="\\w{3}:\\w{20}" part="input" />
  <button part="button" type="submit">Sign In</button>
  <input type="hidden" name="state" value="[todo]" />
</form>
<div id="wrap" hidden><slot><!-- Logged in content. --></slot></div>
</template>
`;

export class MyAuthElement extends MyElement {
  static getTag () {
    return 'my-auth';
  }

  async connectedCallback () {
    this.$$ = {};

    this._checkCSP();

    this._attachLocalTemplate(TEMPLATE);

    const FORM = this._initializeLoginForm();

    if (this._authenticated) {
      this._success('already');
    } else {
      FORM.addEventListener('submit', ev => this._onsubmit(ev));
    }
  }

  async _onsubmit (ev) {
    ev.preventDefault();

    const login = ev.target.elements.login.value;
    // const state = ev.target.elements.state.value;

    const pinboard = new Pinboard(login);
    try {
      const { data, resp } = await pinboard.login();
      const { ok, status } = resp;

      if (!ok) {
        return this._error(status, { msg: `Authentication error (${status} Unknown)` });
      }
      console.debug('my-auth - Submit:', login, data, resp, ev);

      this._storeAuth(status, login);
      this._success();
    } catch (ex) {
      console.error('my-auth - Exception:', ex);
    }
  }

  _initializeLoginForm () {
    this.$$.via = 'Pinboard';
    this.$$.rootElem = document.documentElement;
    this.$$.statusElem = this.shadowRoot.querySelector('[ role = alert ]');
    this.$$.wrapElem = this.shadowRoot.querySelector('#wrap');
    this.$$.innerElem = this.children[0]; // this.parentElement.querySelector('my-auth > *');
    const FORM = this.$$.formElem = this.shadowRoot.querySelector('form');
    const ELEMS = FORM.elements;

    ELEMS.state.value = crypto.randomUUID();

    console.debug('my-auth - Form:', ELEMS, this.$$, this);

    return FORM;
  }

  _success (already = false) {
    const AUTH = this._getAuth();
    const message = `${already ? 'Already a' : 'A'}uthenticated`;

    // this.dataset.login = AUTH.login;
    this.$$.rootElem.dataset.myAuthTime = AUTH.time;
    this.$$.formElem.hidden = true;
    this.$$.wrapElem.hidden = false;
    this.$$.statusElem.textContent = `✔️ ${message}.`;

    if (this.$$.innerElem) {
      this.$$.innerElem.hidden = false;
    }

    this._postMessage(AUTH, 'success');

    console.debug(`✔️ my-auth - ${message}.`, AUTH.me);
  }

  _error (httpStatus, error) {
    this.$$.rootElem.dataset.myAuthHttpStatus = httpStatus;
    this.$$.rootElem.dataset.myAuthError = true;
    this.$$.rootElem.dataset.myAuthenticated = false;
    this.$$.statusElem.textContent = '❌ Authentication Error.';

    this._postMessage(error, 'error');

    console.error('❌ my-auth - Error:', { error });
  }

  get _storage () {
    return localStorage;
  }

  _storeAuth (httpStatus, login) {
    this._setItem('auth', JSON.stringify({
      httpStatus,
      login,
      message: 'Authenticated',
      time: new Date().toISOString(),
      via: this.$$.via
    }));
  }

  get _authenticated () {
    return !!this._getItem('auth');
  }

  _getAuth () {
    const AUTH = this._getItem('auth');
    return AUTH ? JSON.parse(AUTH) : null;
  }

  _removeItems () {
    const KEYS = ['auth'];
    KEYS.forEach(key => this._storage.removeItem(`my-auth.${key}`));

    return this._setItem('logout', new Date().toISOString());
  }

  _setItem (key, value) {
    return this._storage.setItem(`my-auth.${key}`, value);
  }

  _getItem (key) {
    return this._storage.getItem(`my-auth.${key}`);
  }

  _checkCSP () {
    const CSP = document.querySelector('meta[http-equiv = Content-Security-Policy][content]');
    if (CSP) {
      console.debug('CSP:', CSP.content.split(/;\s*/), CSP);
    } else {
      console.warn('Add a `Content-Security-Policy` HTTP header or <meta> element.');
    }
  }
}

MyAuthElement.define();
