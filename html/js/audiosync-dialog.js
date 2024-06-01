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

    const cssObj = {
      "#click-blocker": {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        "background-color": "rgba(0, 0, 0, 0.4)",
        "pointer-events": "all",
        "z-index": 3,
        'will-change': 'opacity',
        'transition': 'opacity 300ms cubic-bezier(.33,.17,.85,1.1)'
      },
      ".allow-clicks": {
        "pointer-events": "none",
        opacity:0
      },
      ".dialog": {
        position: "fixed",
        color: "#333333",
        padding: "24px",
        background: "#ffffff",
        "border-radius": "10px",
        "box-shadow": "0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)",
        "text-align": "center",
        "z-index": 4,
        'will-change': 'transform',
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        transform: "translate(-50%, -50%) scale3d(0,0,0)",
        "max-width": "650px",
        'min-width': '310px',
        overflow: 'hidden'
      },
      '.open': {
        transform: 'translate(-50%, -50%) scale3d(1,1,1)'
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    this.blocker = ce('div');
    this.blocker.id = 'click-blocker';
    this.blocker.classList.add('allow-clicks');
    this.blocker.style.display = 'none';

    this.dialog = ce('div');
    this.dialog.classList.add('dialog');
    this.dialog.appendChild(ce('slot'));
    this.dialog.addEventListener('transitionend', _ => this.toggleAttribute('open'))
    
    this.attachShadow({mode: "open"});
    [
      sheet,
      this.blocker,
      this.dialog
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  setOrigin(x,y) {
    this.dialog.style.transformOrigin = `${x}px ${y}px`;
  }

  /**
   * open the dialog
   */
  async open() {
    const otend = _ => {
      this.dialog.removeEventListener('transitionend', otend);
    };
    this.dialog.addEventListener('transitionend', otend);
    requestAnimationFrame(_ => {
      this.dialog.classList.add('open');
      this.blocker.classList.remove('allow-clicks');
      this.blocker.style.removeProperty('display');
    });
  }

  /**
   * close the dialog
   */
  async close() {
    const ctend = _ => {
      this.dialog.removeEventListener('transitionend', ctend);
      this.blocker.style.display = 'none';
    };
    this.dialog.addEventListener('transitionend', ctend);
    requestAnimationFrame(_ => {
      this.dialog.classList.remove('open');
      this.blocker.classList.add('allow-clicks');
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
      const styles = parseCSS(qs('style', this.shadowRoot).textContent);
      styles['.dialog'].padding = 0;
      qs('style', this.shadowRoot).textContent = objectToCSS(styles); 
    } else {
      const styles = parseCSS(qs('style', this.shadowRoot).textContent);
      styles['.dialog'].padding = '24px';
      qs('style', this.shadowRoot).textContent = objectToCSS(styles); 
    }
  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
