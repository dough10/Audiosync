import {ce, sleep} from '../helpers.js';

/**
 * dialog box 
 */
class AudioSyncDialog extends HTMLElement {
  static get observedAttributes() {
    return ['nopad'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.close = this.close.bind(this);

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", "./js/audiosync-dialog/audiosync-dialog.css");
        
    this.backdrop = ce('div');
    this.backdrop.classList.add('backdrop');
    this.backdrop.addEventListener('click', this.close);


    const slot = ce('slot');

    this.dialog = ce('div');
    this.dialog.classList.add('dialog');
    this.dialog.appendChild(slot);
    this.dialog.addEventListener('transitionend', _ => this.toggleAttribute('open'));
    
    [
      elementStyles,
      this.dialog,
      this.backdrop
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open the dialog
   */
  async open() {
    await sleep(100);
    requestAnimationFrame(_ => {
      if (!this.dialog.hasAttribute('open')) this.dialog.toggleAttribute('open');
    });
  }

  /**
   * close the dialog
   */
  async close() {
    const closed = async _ => {
      this.dialog.removeEventListener('transitionend', closed);
      console.log(this)
      if (this.hasAttribute('cleanup')) this.remove();
    };
    this.dialog.addEventListener('transitionend', closed);
    requestAnimationFrame( _ => this.dialog.removeAttribute('open'));
  }

  /**
   * attribute has changed 
   */
  attributeChangedCallback() {
    if (this.hasAttribute('nopad')) {
      this.style.setProperty('--dialog-padding', '0');      
    } else {
      this.style.setProperty('--dialog-padding', '24px');  
    }
  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
