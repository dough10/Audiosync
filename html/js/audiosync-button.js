import {qs, createRipple, hexToRgba, removeClasses, convertToHex, getCSSVariableValue, getContrastColor} from './helpers.js';

class AudioSyncButton extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'disabled', 'noshadow'];
  }
  constructor() {
    super();
    // color higherarchy 
    // color attribute > css '--main-color' variable > white
    const color = convertToHex(this.getAttribute('color') || getCSSVariableValue('--main-color') || '#ffffff');
    
    // contrasting text color 
    const contrast = getContrastColor(color);

    this.button = document.createElement('div');
    this.button.classList.add('button');
    this.button.appendChild(document.createElement('slot'));
    
    const sheet = document.createElement('style');
    sheet.textContent = `
    .button {
      display: inline-flex;
      min-width: 5.14em;
      margin: 0.29em 0.29em;
      color: ${contrast};
      background-color: ${color};
      text-align: center;
      text-transform: uppercase;
      outline-width: 0;
      border-radius: 3px;
      padding: 0.7em 0.57em;
      cursor: pointer;
      position: relative;
      box-sizing:border-box;
      box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2);
      -webkit-user-select: none;
      user-select: none;
      pointer-events: all;
      justify-content: center;
      align-items: center;
      transition: background-color 0.45s ease;
      overflow: hidden;
      transform: translate3d(0, 0, 0);
    }
    .button > * {
      pointer-events: none;
    }
    .button:after {
      display: inline-block;
      width: 100%;
      height: 100%;
      border-radius: 3px;
      opacity: 0;
      transition: opacity 150ms cubic-bezier(.33,.17,.85,1.1);
      box-shadow: 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.4);
      content:' ';
      position: absolute;
      top: 0;
      left: 0;
    }
    .button:hover:after {
      opacity: 1;
    }
    .button:hover:active:after {
      opacity: 0;
    }
    .button[disabled] {
      background: rgba(84, 84, 84, 0.4);
      color: #ffffff;
      box-shadow: none;
      cursor: none;
      pointer-events: none;
    }
    .button[disabled]:active, .button[disabled]:hover, .button[disabled]:active:hover {
      box-shadow: none;
      background-color: rgba(0, 0, 0, 0.178)
    }
    .button[noshadow], .button[noshadow]:hover, .button[noshadow]:hover:after, .button[noshadow]:after {
      box-shadow: none;
    }
    .button[noshadow]:active {
      box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2);
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
      background: ${hexToRgba(contrast)};
      animation: ripple-animation 0.7s linear;
    }`;

    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
      this.button
    ].forEach(el => shadow.appendChild(el));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    if (this.hasAttribute('disabled')) {
      this.button.setAttribute('disabled', Number(this.getAttribute('disabled')));
    }
    if (this.hasAttribute('noshadow')) {
      this.button.setAttribute('noshadow', Number(this.getAttribute('noshadow')));
    }
    this.button.addEventListener('click', e => {
      // no ripple for disabled button
      if (this.button.hasAttribute('disabled')) return;
      createRipple(e) 
    });
    // css hax
    const styles = qs('style').textContent.trim();
    // fix to correct spacing for nested icon / text buttons
    const buttonFix = `    
    audiosync-button > div > :first-child {
      margin-right: 16px;
    }
    audiosync-button > div > :nth-child(2) {
      display: flex;
      align-items: center;
      margin-right:16px;
    }
    audiosync-button > div {
      display: flex;
      flex-direction: row;
    }`;
    if (styles.includes(buttonFix)) return;
    qs('style').textContent = styles + buttonFix;
  }

  /**
   * add's an click event listener
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
    if (name === 'color') {
      if (newVal === null) return;
      
      // capture current styles and remove .new-color and .ripple-effect classes
      const currentStyle = removeClasses(qs('style', this.shadowRoot).textContent).trim();
      
      // background-color in hex format
      const color = convertToHex(newVal);
      
      // text / ripple color
      const contrast = getContrastColor(color);
      
      // create the new style 
      const newClasses = `
      .new-color {
        background-color:${color}; 
        color:${contrast};
      }
      .ripple-effect {
        position: absolute; 
        border-radius: 50%; 
        background: ${hexToRgba(contrast)}; 
        animation: ripple-animation 0.7s linear;
      }`;
      
      // update styles
      qs('style', this.shadowRoot).textContent = currentStyle + newClasses;         
      
      // set the new class
      this.button.classList.add('new-color');

    } else if (['disabled','noshadow'].includes(name)) {
      // reflect attribute changes to the button element
      if (this.hasAttribute(name)) {
        this.button.setAttribute(name, '');
      } else {
        this.button.removeAttribute(name);
      }
    }
  }
}
customElements.define('audiosync-button', AudioSyncButton);
