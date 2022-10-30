/*!

  @author NDF, 15-Oct-2022.
  @see https://pinboard.in/api/#posts_add
  @see https://pinboard.in/api/v2/overview - NO!
*/

const { fetch, Request } = window;

const V1_API = 'https://api.pinboard.in/v1/';
const V2_API = 'https://api.pinboard.in/v2/';
const CORS_PROXY = 'https://corsproxy.io/?';
const APP_ID = 'ndf-notes-app+0.8-alpha';

export default class Pinboard {
  constructor (auth, appId = APP_ID, corsProxy = CORS_PROXY) {
    this.auth = auth;
    this.appId = appId;
    this.corsProxy = corsProxy || '';
    this.useProxy = !!corsProxy;

    console.debug('Pinboard:', this, auth);
  }

  /** v1 API - Get recent bookmarks to test the auth token.
  */
  async login () {
    return await this.getRecent(2, 'test');
  }

  _v1Request (path, params) {
    const { corsProxy, useProxy } = this;
    const uri = `${V1_API}${path}?${this._params(params)}`;
    // const uri = `${this.corsProxy}?${V1_API}${path}?${this._params(params)}`;
    return new Request(useProxy ? corsProxy + encodeURIComponent(uri) : uri, {
      // method: 'POST',
      mode: useProxy ? 'cors' : 'no-cors',
      headers: {
        Accept: 'application/json',
        // 'User-Agent': this.appId,
        'X-App-ID': this.appId
      }
    });
  }

  // v2 API - Not operational!
  async _v2Awesome () {
    const req = new Request(`${V2_API}awesome?auth_token=${this.auth}&app_id=${this.appId}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        Accept: 'application/json'
        // 'X-Auth-Token': this.auth,
        // 'X-App-ID': 'ndf-notes-app 0.8-alpha'
      }
    });
    const resp = await fetch(req);
    const data = resp.ok ? await resp.json() : null;

    return { data, resp, req };
  }

  async _v1LoginNotWorking (user, password) {
    const req = new Request(`${CORS_PROXY}https://${user}:${password}@api.pinboard.in/v1/user/api_token`, {
      // method: 'POST',
      // mode: 'no-cors',
      headers: {
        Accept: 'application/json'
      }
    });
    const resp = await fetch(req);
    const data = await resp.text();

    return { data, resp, req };
  }

  /** v1 - Get recent bookmarks.
  */
  async getRecent (count = 5, tag = '') {
    const req = this._v1Request('posts/recent', { count, tag });
    const resp = await fetch(req);
    const data = resp.ok ? (this.useProxy ? await resp.json() : await resp.text()) : null;

    return { data, resp, req };
  }

  /** v1 API - Post a bookmark.
  */
  async postBookmark (bookmark = {}) {
    const req = this._v1Request('posts/add', this._toDelicious(bookmark));
    const resp = await fetch(req);
    const data = resp.ok ? (this.useProxy ? await resp.json() : await resp.text()) : null;

    return { data, resp, req };
  }

  _toDelicious (bookmark) {
    const { url, title, text, tags } = bookmark;
    return {
      url,
      description: title,
      extended: text,
      tags: tags.join(','),
      shared: bookmark.private ? 'no' : 'yes'
    };
  }

  _params (bookmarkEtc = {}) {
    const DATA = Object.assign({
      app_id: APP_ID, // this.appId,
      auth_token: this.auth,
      format: 'json'
    },
    bookmarkEtc);

    const params = new URLSearchParams(DATA);

    console.debug('Params:', params, DATA);

    return params.toString();
  }

  get _mock () {
    return {
      url: 'https://example.org/x',
      description: 'Hello world 3'
    };
  }
}
