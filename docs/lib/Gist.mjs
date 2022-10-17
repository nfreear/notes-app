/*
*/

import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

export default class Gist {
  constructor (auth) {
    // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
    this.octokit = new Octokit({ auth });
  }

  async writeJson (data) {
    const DATE = data.time.replace(/[:.]/g, '-');
    const FILE_NAME = `bookmark-${DATE}.test.json`;

    const RESP = await this.octokit.request('POST /gists', {
      description: FILE_NAME, // 'Example of a gist',
      public: false,
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
