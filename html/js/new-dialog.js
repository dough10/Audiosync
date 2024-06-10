import {qs, ce, objectToCSS, parseCSS} from './helpers.js';

/**
 * dialog box 
 */
class AudioSyncDialog extends HTMLElement {
  static get observedAttributes() {
    return ['nopad'];
  }
  constructor() {
    super();

    this.close = this.close.bind(this);

    const CSS_OBJECT = {
      'dialog': {
        position: 'fixed',
        color: 'var(--text-color)',
        padding: '24px',
        background: 'var(--main-color)',
        'border-radius': '10px',
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',
        'text-align': 'center',
        'z-index': 4,
        transform: 'scale3d(0,0,0)',
        'max-width': '650px',
        'min-width': '310px',
        overflow: 'hidden',
        border: 'none'
      },
      'dialog::backdrop': {
        background: 'rgba(0,0,0,0.2)'
      },
      'dialog[open]': {
        transform: 'scale3d(1,1,1)'
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.dialog = ce('dialog');
    this.dialog.appendChild(ce('slot'));
    this.dialog.addEventListener('transitionend', _ => this.toggleAttribute('open'));
    this.dialog.addEventListener('click', this.close);

    this.attachShadow({mode: 'open'});
    [
      ELEMENT_STYLES,
      this.dialog
    ].forEach(el => this.shadowRoot.appendChild(el));

}


  /**
   * open the dialog
  */
  async open() {
    this.dialog.showModal();
  }

  /**
   * close the dialog
   */
  async close() {
    this.dialog.close();
  }

  /**
   * attribute has changed 
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {

  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
