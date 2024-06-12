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
        color: "var(--text-color)",
        padding: "24px",
        background: "var(--main-color)",
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

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.blocker = ce('div');
    this.blocker.id = 'click-blocker';
    this.blocker.classList.add('allow-clicks');
    this.blocker.style.display = 'none';
    this.blocker.addEventListener('click', this.close);

    this.dialog = ce('div');
    this.dialog.classList.add('dialog');
    this.dialog.appendChild(ce('slot'));
    this.dialog.addEventListener('transitionend', _ => this.toggleAttribute('open'))
    
    this.attachShadow({mode: "open"});
    [
      ELEMENT_STYLES,
      this.blocker,
      this.dialog
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open the dialog
   */
  async open() {
    const OPEN_END = _ => {
      this.dialog.removeEventListener('transitionend', OPEN_END);
    };
    this.dialog.addEventListener('transitionend', OPEN_END);
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
    const CLOSE_END = async _ => {
      this.dialog.removeEventListener('transitionend', CLOSE_END);
      this.blocker.style.display = 'none';
      if (this.hasAttribute('cleanup')) this.remove();
    };
    this.dialog.addEventListener('transitionend', CLOSE_END);
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
      const ELEMENT_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);
      ELEMENT_STYLES['.dialog'].padding = 0;
      qs('style', this.shadowRoot).textContent = objectToCSS(ELEMENT_STYLES); 
    } else {
      const ELEMENT_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);
      ELEMENT_STYLES['.dialog'].padding = '24px';
      qs('style', this.shadowRoot).textContent = objectToCSS(ELEMENT_STYLES); 
    }
  }
}
customElements.define('audiosync-dialog', AudioSyncDialog);
