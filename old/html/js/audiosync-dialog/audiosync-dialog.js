import {ce, qs, toggleAttribute} from '../helpers.js';



/**
 * UI dialog box w/ backdrop
 * @class
 * @extends HTMLElement
 * @this AudioSyncDialog
 * 
 */
class AudioSyncDialog extends HTMLElement {
  static get observedAttributes() {
    return ['nopad'];
  }

  /**
   * creates the dialog and backdrop elements
   * @constructor
   * 
   * @returns {Void}
   * 
   * @example
   * const dialog = document.createElement('audiosync-dialog');
   */
  constructor() {
    super();
    this.attachShadow({mode: "open"});
  }

  /**
   * element connected to DOM. defaults --animation-time to 0ms to prevent flash of content
   * @function
   * @private
   * 
   * @returns {Void}
   * 
   * @example
   * const dialog = document.createElement('audiosync-dialog');
   * document.querySelector('body').appendChild(dialog);
   */
  connectedCallback() {
    const altCss = this.getAttribute('alt-css');

    this.style.setProperty('--animation-time', '0ms');

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", altCss || "./js/audiosync-dialog/audiosync-dialog.css");
        
    this._backdrop = ce('div');
    this._backdrop.classList.add('backdrop');
    this._backdrop.addEventListener('click', this.close);

    const slot = ce('slot');

    this._dialog = ce('div');
    this._dialog.classList.add('dialog');
    this._dialog.appendChild(slot);
    
    [
      elementStyles,
      this._dialog,
      this._backdrop
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open the dialog element also displaying backdrop
   * @function
   * @public
   * 
   * @returns {Void}
   * 
   * @example
   * const dialog = document.createElement('audiosync-dialog');
   * document.querySelector('body').appendChild(dialog);
   * dialog.open();
   */
  open() {
    this.style.setProperty('--animation-time', '200ms');
    requestAnimationFrame(_ => toggleAttribute(this._dialog, 'open'));
  }

  /**
   * close the dialog and hide backdrop
   * @function
   * @public
   * 
   * @returns {Void}
   * 
   * @example
   * const dialog = document.querySelector('audiosync-dialog');
   * dialog.close();
   */
  close() {
    let t = 0;
    const closed = _ => {
      if (t) clearTimeout(t);
      this._dialog.removeEventListener('transitionend', closed);
      if (this.hasAttribute('cleanup')) this.remove();
    };
    t = setTimeout(closed, 2000);
    this._dialog.addEventListener('transitionend', closed);
    requestAnimationFrame( _ => this._dialog.removeAttribute('open'));
  }

  /**
   * attribute has changed 
   * @function
   * @private
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   * 
   * @returns {Void}
   * 
   * @example
   * const dialog = document.querySelector('audiosync-dialog');
   * dialog.toggleAttribue('nopad');
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'alt-css') {
      if (qs('link',this.shadowRoot)) qs('link',this.shadowRoot).href = newVal;
    }
    if (this.hasAttribute('nopad')) {
      this.style.setProperty('--dialog-padding', '0');      
    } else {
      this.style.setProperty('--dialog-padding', '24px');  
    }
  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
