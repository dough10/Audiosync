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
    const CSS_OBJECT = {
      'dialog': {
        color: 'var(--text-color)',
        padding: '24px',
        background: 'var(--main-color)',
        'border-radius': '10px',
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',
        'text-align': 'center',
        'max-width': '650px',
        'min-width': '310px',
        overflow: 'hidden',
        border: 'none',
        display: 'none',
        animation: 'close 300ms linear'
      },
      'dialog::backdrop': {
        background: 'rgba(0,0,0,0.2)'
      },
      'dialog[open]': {
        display: 'block',
        animation: 'open 300ms linear'
      },
      '@keyframes open': {
        from: {
          transform: 'scale3d(0,0,0)'
        }, 
        to: {
          transform: 'scale3d(1,1,1)'
        }
      },
      '@keyframes close': {
        from: {
          display:'block',
          transform: 'scale3d(1,1,1)'
        },
        to: {
          display:'none',
          transform: 'scale3d(0,0,0)'
        }
      }
    };
    this.toggleOpenState_ = this.toggleOpenState_.bind(this);
    this.clickCallback_ = this.clickCallback_.bind(this);
    this.close = this.close.bind(this);

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.dialog = ce('dialog');
    this.dialog.appendChild(ce('slot'));
    this.dialog.addEventListener('animationend', this.toggleOpenState_);
    this.dialog.addEventListener('click', this.clickCallback_);

    this.attachShadow({mode: 'open'});
    [
      ELEMENT_STYLES,
      this.dialog
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * click callback
   * 
   * @param {Event} event 
   */
  clickCallback_(event) {
    const ELEMENT_RECT = this.dialog.getBoundingClientRect();
    const CLICKED_IN_DIALOG = (ELEMENT_RECT.top <= event.clientY && event.clientY <= ELEMENT_RECT.top + ELEMENT_RECT.height &&
      ELEMENT_RECT.left <= event.clientX && event.clientX <= ELEMENT_RECT.left + ELEMENT_RECT.width);
    if (!CLICKED_IN_DIALOG) {
      this.dialog.close();
    }
  }

  /**
   * toggles "open" attribute
   */
  toggleOpenState_() {
    if (this.dialog.hasAttribute('open')) {
      this.toggleAttribute('open');
    } else  {
      this.removeAttribute('open');
    }
  }

  /**
   * open the dialog
  */
  open() {
    return new Promise(resolve => {
      let animationEnd = _ => {
        this.dialog.removeEventListener('animationend', animationEnd);
        resolve();
      };
      this.dialog.addEventListener('animationend', animationEnd);
      this.dialog.showModal();
    });
  }

  /**
   * close the dialog
   */
  close() {
    return new Promise(resolve => {
      let animationEnd = _ => {
        this.dialog.removeEventListener('animationend', animationEnd);
        if (this.hasAttribute('cleanup')) this.remove();
        resolve();
      };
      this.dialog.addEventListener('animationend', animationEnd);
      this.dialog.close();
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
    if (this.hasAttribute('nopad')) {
      const ELEMENT_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);
      ELEMENT_STYLES['dialog'].padding = 0;
      qs('style', this.shadowRoot).textContent = objectToCSS(ELEMENT_STYLES); 
    } else {
      const ELEMENT_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);
      ELEMENT_STYLES['dialog'].padding = '24px';
      qs('style', this.shadowRoot).textContent = objectToCSS(ELEMENT_STYLES); 
    }
  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
