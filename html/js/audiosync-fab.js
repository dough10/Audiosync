import {qs, animateElement, createRipple, hexToRgba, getCSSVariableValue, convertToHex, getContrastColor, parseCSS, objectToCSS} from './helpers.js';

/**
 * pages
 */
class FloatingActionButton extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'disabled', 'noshadow'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    // color higherarchy 
    // color attribute > css '--main-color' variable > white
    const color = convertToHex(this.getAttribute('color') || getCSSVariableValue('--main-color') || '#ffffff');
    
    // contrasting text color 
    const contrast = getContrastColor(color);

    const styles = document.createElement('style');
    styles.textContent = `
      .fab {
        overflow: hidden;
        color: ${contrast};
        background: ${color};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-sizing: border-box;
        cursor: pointer;
        height: 56px;
        min-width: 0;
        outline: none;
        padding: 16px;
        width: 56px;
        -webkit-tap-highlight-color: transparent;
        box-shadow:0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.4);
        position:fixed;
        z-index: 2;
        bottom:20px;
        right:20px;
        transition: background-color 0.45s ease;
        transform: translate3d(0, 0, 0);
        margin:8px;
      }
      .fab > * {
        pointer-events: none;
      }
      .fab:after {
        display: inline-block;
        z-index: -1;
        width: 100%;
        height: 100%;
        opacity: 0;
        border-radius: 50%;
        transition: opacity 150ms cubic-bezier(.33,.17,.85,1.1);
        box-shadow: 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.4);
        content:' ';
        position: absolute;
        top: 0;
        left: 0;
      }
      .fab:hover:after {
        opacity: 1;
      }
      .fab:hover:active:after {
        opacity: 0;
      }
      .fab[disabled] {
        background: rgba(84, 84, 84, 0.4);
        color: #ffffff;
        box-shadow: none;
        cursor: none;
        pointer-events: none;
      }
      .fab[disabled]:active, .fab[disabled]:hover, .fab[disabled]:active:hover {
        box-shadow: none;
        background-color: rgba(0, 0, 0, 0.178)
      }
      .fab[noshadow], .fab[noshadow]:hover, .fab[noshadow]:hover:after, .fab[noshadow]:after {
        box-shadow: none;
      }
      .fab[noshadow]:active {
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
      }
    `;
    
    this.fab = document.createElement('div');
    this.fab.classList.add('fab');
    this.fab.style.transform = "translateY(88px)";
    this.fab.appendChild(document.createElement('slot'));
    this.fab.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
    
    [
      styles,
      this.fab
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * animate action button visable on screen
   */
  async onScreen() {
    await animateElement(this.fab, "translateY(0px)", 200);
    if (!this.hasAttribute('onscreen')) this.toggleAttribute('onScreen');
  }
  
  /**
   * animate action button off screen
   */
  async offScreen() {
    await animateElement(this.fab, "translateY(88px)", 200);
    this.removeAttribute('onScreen');
  }

  /**
   * attribute has changed
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  async attributeChangedCallback(name, oldVal, newVal) {
    if (['disabled','noshadow'].includes(name)) {
      // reflect attribute changes to the button element
      if (this.hasAttribute(name)) {
        this.fab.setAttribute(name, '');
      } else {
        this.fab.removeAttribute(name);
      }
    } else if (name === 'color') {
      if (newVal === null) return;
      
      // capture current styles and remove .new-color and .ripple-effect classes
      const currentStyle = parseCSS(qs('style', this.shadowRoot).textContent);
      
      // background-color in hex format
      const color = convertToHex(newVal);
      
      // text / ripple color
      const contrast = getContrastColor(color);
      
      // create the new style 
      currentStyle['.new-color'] = {
        'background-color': color, 
        'color': contrast
      };
      currentStyle['.ripple-effect'] = {
        'position': 'absolute', 
        'border-radius': '50%;',
        'background': hexToRgba(contrast),
        'animation': 'ripple-animation 0.7s linear'
      };
      
      // update styles
      qs('style', this.shadowRoot).textContent = objectToCSS(currentStyle);         
      
      // set the new class
      this.fab.classList.add('new-color');
    }
  }

  /**
   * add's an click event listener
   * 
   * @param {Function} cb callback function
   */
  onClick(cb) {
    this.fab.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      cb(e);
    });
  }

}
customElements.define('audiosync-fab', FloatingActionButton);
