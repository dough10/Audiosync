import {qs, createRipple, hexToRgba, convertToHex} from './helpers.js';

class SmallButton extends HTMLElement {
  static get observedAttributes() {
    return ['icon','disabled'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const style = document.createElement('style');
    style.textContent = `     
    .small-button {
      padding: 8px;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      border-radius: 50%;
      transform: translate3d(0, 0, 0);
    }
    .small-button[disabled] {
      color:grey;
      cursor: default;
    }
    .small-button > * {
      pointer-events: none;
    }
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(51,51,51,0.4);
      animation: ripple-animation 0.7s linear;
    }`;

    this.button = document.createElement('div');
    this.button.classList.add('small-button');
    this.button.appendChild(document.createElement('slot'));
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

    const styles = this._removeClass(qs('style', this.shadowRoot).textContent);

    const rippleColor = hexToRgba(textColor);
    console.log(rippleColor);
    const css = `    
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: ${rippleColor};
      animation: ripple-animation 0.7s linear;
    }`;

    qs('style', this.shadowRoot).textContent = styles + css;

    this.button.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
  }

  /**
   * find and remove .new-color and .ripple-effect css classes
   * 
   * @param {Regex} regex
   * @param {String} cssString
   * 
   * @returns {String} css without the class if found by given regex (not a great function)
   */
  _removeClass(cssString) {
    // Define a regular expression to match the entire block containing .new-color class and .ripple-effect class with their properties
    var regex = /\.ripple-effect\s*{[^}]*}/g;
    // Use replace method with the regular expression to remove the entire block
    return cssString.replace(regex, '');
  }

  /**
   * element clicked
   * 
   * @param {Function} cb 
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
      this.button.toggleAttribute(name);
    }
  }
}
customElements.define('audiosync-small-button', SmallButton);