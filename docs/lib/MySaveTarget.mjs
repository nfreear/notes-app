/**
 * Process the query and redirect to the bookmark form (index.html)
 *
 * @example https://www.bbc.co.uk/news/uk-63383958
 ?title=BBC+News%3A+Solar+eclipse%3A+Moon+blocks+part+of+the+Sun+over+the+UK&text=BBC+News+-+Solar+eclipse%3A+Moon+blocks+part+of+the+Sun+over+the+UK%0Ahttps%3A%2F/www.bbc.co.uk/news/uk-63383958
 *
 * @copyright © Nick Freear, 27-Oct-2022.
 */

import MyElement from '../../elements/src/MyElement.js';

const { location, URLSearchParams } = window;

const REDIRECT = true;
const DELAY_MS = 2200; // Was: 3000;

export class MySaveTarget extends MyElement {
  static getTag () {
    return 'my-save-target';
  }

  connectedCallback () {
    this._handleRedirect();
  }

  _handleRedirect () {
    const params = new URL(location.href).searchParams;
    const DATA = {
      act: 'save-bookmark',
      url: params.get('url') || null,
      title: params.get('title') || '',
      text: params.get('text') || ''
    };

    const newParams = this._parseUrlFromText(DATA);
    const redirectUrl = 'index.html?' + newParams.toString();

    if (DATA.url) {
      console.debug('MySaveTarget - Redirect:', REDIRECT, redirectUrl, DATA);

      this._status.textContent = 'Redirecting …';

      if (REDIRECT) {
        setTimeout(() => { window.location = redirectUrl; }, DELAY_MS);
      }
    } else {
      console.debug('MySaveTarget - No redirect:', DATA);

      this._status.textContent = location.href;
      this._status.dataset.state = 'url';
    }

    return redirectUrl;
  }

  // Extract any URL from the "text" parameter.
  _parseUrlFromText (DATA) {
    const MATCH = DATA.text ? DATA.text.match(/(https:\/\/.+)/) : null;

    if (!DATA.url && MATCH) {
      DATA.url = MATCH[1];
    }

    return new URLSearchParams(DATA);
  }

  get _status () {
    return this.querySelector('.status');
  }
}

MySaveTarget.define();
