import {ce, getContrastColor, convertToHex} from '../helpers.js';

class AudioSyncButton extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'disabled', 'noshadow'];
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", "./js/audiosync-button/audiosync-button.css");

    this.button = ce('div');
    this.button.classList.add('button');
    this.button.appendChild(ce('slot'));
    
    [
      elementStyles,
      this.button
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    if (this.hasAttribute('disabled')) {
      if (!this.button.hasAttribute('disabled')) this.button.toggleAttribute('disabled');
    }
    if (this.hasAttribute('noshadow')) {
      if (!this.button.hasAttribute('noshadow')) this.button.toggleAttribute('noshadow');
    }
  }

  /**
   * add's an click event listener
   * 
   * @param {Function} cb callback function
   */
  onClick(cb) {
    this.button.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      cb(e);
    });
  }

  /**
   * attribute has changed 
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (['disabled','noshadow'].includes(name)) {
      // reflect attribute changes to the button element
      if (this.hasAttribute(name)) {
        if (!this.button.hasAttribute(name)) this.button.toggleAttribute(name);
      } else {
        this.button.removeAttribute(name);
      }
    } else if (name === 'color') {
      const color = convertToHex(newVal);
      const contrast = getContrastColor(color);
      this.style.setProperty('--pop-color', color);
      this.style.setProperty('--contrast-color', contrast);
    }
  }
}
customElements.define('audiosync-button', AudioSyncButton);
