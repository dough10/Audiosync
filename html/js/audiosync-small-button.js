import {ce, qs, createRipple, hexToRgba, convertToHex, parseCSS, objectToCSS} from './helpers.js';

class SmallButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled','color'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const cssObj = {
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
        background: "rgba(51,51,51,0.4)",
        animation: "ripple-animation 0.7s linear"
      }
    };

    const style = ce('style');
    style.textContent = objectToCSS(cssObj);

    this.button = ce('div');
    this.button.classList.add('small-button');
    this.button.appendChild(ce('slot'));
    [
      style,
      this.button
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    const textColor = convertToHex(window.getComputedStyle(this.button).color); 
    this._color(textColor);
    this.button.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
  }

  /**
   * set the color of the icon and ripple animation
   * 
   * @param {String} color 
   */
  async _color(color) {
    //  capture styles
    const styles = parseCSS(qs('style', this.shadowRoot).textContent);

    // create / update css styles
    styles['.new-color'] = {
      'color': convertToHex(color)
    };
    styles['.ripple-effect'].background = hexToRgba(color);

    // apply styles
    qs('style', this.shadowRoot).textContent = objectToCSS(styles);
    this.button.classList.add('new-color');
  }

  /**
   * element clicked
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