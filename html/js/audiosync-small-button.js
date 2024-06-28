import {ce, qs, createRipple, hexToRgba, convertToHex, parseCSS, objectToCSS} from './helpers.js';

class SmallButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'color'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const CSS_OBJECT = {
      ".small-button": {
        padding: "8px",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        "border-radius": "50%",
        transform: "translate3d(0, 0, 0)"
      },
      ".small-button[disabled]": {
        color: "var(--disabled-color)",
        cursor: "default"
      },
      ".small-button > *": {
        "pointer-events": "none"
      },
      "@keyframes ripple-animation": {
        to: {
          transform: "scale(4)",
          opacity: 0
        }
      },
      ".ripple-effect": {
        position: "absolute",
        "border-radius": "50%",
        background: "rgba(var(--pop-rgb),0.4)",
        animation: "ripple-animation 0.7s linear"
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.button = ce('div');
    this.button.classList.add('small-button');
    this.button.appendChild(ce('slot'));
    [
      ELEMENT_STYLES,
      this.button
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    const ELEMENT_CLICKED = e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    };
    this.button.addEventListener('click', ELEMENT_CLICKED);
  }

  /**
   * element clicked
   * 
   * @param {Function} cb callback function
   */
  onClick(cb) {
    const CALLBACK = e => {
      if (this.hasAttribute('disabled')) return;
      cb(e);
    }
    this.button.addEventListener('click', CALLBACK);
  }

  /**
   * attribute has changed 
   * 
   * @param {String} name
   * @param {String} oldVal
   * @param {String} newVal  
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'color') {
      this.button.style.setProperty(name, newVal)
      return;
    }
    this.button.toggleAttribute(name);
  }
}
customElements.define('audiosync-small-button', SmallButton);