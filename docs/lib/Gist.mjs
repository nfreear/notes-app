/*
*/

const OCTOKIT_VIA_CDN = 'https://cdn.skypack.dev/@octokit/core';
// import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

export default class Gist {
  constructor (auth) {
    this._auth = auth;
    // this._initialize(auth);
  }

  async _initialize (auth) {
    const { Octokit } = await import(OCTOKIT_VIA_CDN);
    // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
    this.octokit = new Octokit({ auth });
  }

  async writeJson (data, isPrivate = true) {
    await this._initialize(this._auth);
    const DATE = data.time.replace(/[:.]/g, '-');
    const FILE_NAME = `bookmark-${DATE}.test.json`;

    const RESP = await this.octokit.request('POST /gists', {
      description: FILE_NAME,
      public: !isPrivate,
      files: {
        'my-bookmark.test.json': {
        // `${FILE_NAME}`: {
          content: JSON.stringify(data, null, 2)
        }
      }
    });

    const { html_url } = RESP.data; /* eslint-disable-line camelcase */ // id.

    console.debug('Gist created:', RESP.status, html_url, RESP);

    return RESP;
  }
}
