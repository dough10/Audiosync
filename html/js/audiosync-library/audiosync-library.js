import { appendElements, ce, elementWidth, qs, qsa } from "../helpers.js";

function calcCols() {
  const cols = window.innerWidth / 164;
  return Math.floor(cols);
}

class Library extends HTMLElement {
  static get observedAttributes() {
    return ['alt-css', 'view'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * element connected to DOM
   * @private
   * @function
   * 
   * @returns {void}
   */
  connectedCallback() {
    const altCss = this.getAttribute('alt-css');

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", altCss || "./js/audiosync-library/audiosync-library.css");

    this.container = ce('div'); 
    this.container.classList.add('container');
    this.container.setAttribute('view', this.getAttribute('view'));


    this.style.setProperty('--grid-col', `repeat(${calcCols()}, 1fr)`);

    window.addEventListener('resize', _ => {

      this.style.setProperty('--grid-col', `repeat(${calcCols()}, 1fr)`);
    });

    appendElements(this.shadowRoot, [
      elementStyles,
      this.container
    ]);
  }

  /**
   * attribute has changed 
   * @private
   * 
   * @param {String} name
   * @param {*} _
   * @param {String} newVal
   */
  attributeChangedCallback(name, _, newVal) {
    if (name === 'alt-css') {
      const linkEl = qs('link', this.shadowRoot);
      if (linkEl) linkEl.href = newVal;
    } else {
      this.container?.setAttribute(name, this.getAttribute(name));
    }
  }

  /**
   * gets data from python
   */
  async loadData(albumList) {
    // const view = this.getAttribute('view');

    this._usedChars = [
      '>'
    ];

    this.container.innerHTML = '';

    // const albumList = await pywebview.api.lib_data();
    this.libSize = albumList.lib_size || '0 b';
    delete albumList.lib_size;

    this._displayAlbums(albumList);
  }

  /**
   * album element was clicked
   * 
   * @param {Event} e 
   */
  _expandAlbum(e) {
    qsa('.album[expanded]', this.shadowRoot).forEach(el => el.removeAttribute('expanded'));
    e.target.toggleAttribute('expanded');
  }

  /**
   * push album data to DOM
   * 
   * @param {Object} albumList 
   */
  _displayAlbums(albumList) {
    for (const artist in albumList) {
      for (const album of albumList[artist]) { 

        const album = ce('div');
        album.classList.add('album');
        album.addEventListener('click', e => this._expandAlbum(e));
        appendElements(this.container, [
          album
        ])
      }
    }
  }
}
customElements.define('audiosync-library', Library);