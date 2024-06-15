import {ce, qs, createRipple, hexToRgba, convertToHex, parseCSS, objectToCSS} from './helpers.js';

class SmallButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled','color'];
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
    const TEXT_COLOR = convertToHex(window.getComputedStyle(this.button).color); 
    this._color(TEXT_COLOR);
    this.button.addEventListener('click', ELEMENT_CLICKED);
  }

  /**
   * set the color of the icon and ripple animation
   * 
   * @param {String} color 
   */
  async _color(color) {
    //  capture styles
    const ELEMENT_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);

    const HEX_COLOR = convertToHex(color);

    // create / update css styles
    ELEMENT_STYLES['.new-color'] = {
      'color': HEX_COLOR
    };
    // ELEMENT_STYLES['.ripple-effect'].background = hexToRgba(HEX_COLOR);

    // apply styles
    qs('style', this.shadowRoot).textContent = objectToCSS(ELEMENT_STYLES);
    this.button.classList.add('new-color');
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
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'disabled') {
      if (this.hasAttribute(name)) {
        this.button.setAttribute(name, '');
      } else {
        this.button.removeAttribute(name);
      }
    } else if (name === 'color') {
      this._color(newVal);
    }
  }
}
customElements.define('audiosync-small-button', SmallButton);